#!/usr/bin/env bun
/**
 * bun run deploy — 构建 + 提交 + 推送一条龙。
 *
 * 流程:
 *   1. hexo generate 构建到 public/
 *   2. 提交源码分支（当前分支）的改动
 *   3. 用 git worktree 把 public/ 同步到 main 分支（GitHub Pages serving 分支）
 *   4. 推送 main（网站上线）和源码分支
 *
 * 推送前会先 git ls-remote 探测远端连通性；全程 GIT_TERMINAL_PROMPT=0，
 * 绝不弹交互式密码框 —— 推不上去就如实报错，不卡死。
 * 所有外部命令都用 Bun.spawn 数组传参，无 shell 引号问题。
 */
import { join } from "node:path";
import { existsSync, readdirSync, rmSync } from "node:fs";

const ROOT = join(import.meta.dir, "..");
const PUBLIC = join(ROOT, "public");
const WORKTREE = join(ROOT, ".deploy-main");
const ENV = { ...process.env, GIT_TERMINAL_PROMPT: "0" } as Record<string, string>;

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`bun run deploy — 构建 + 提交 + 推送一条龙

用法:
  bun run deploy [--skip-push] [--message "提交信息"]

选项:
  --skip-push          只构建+本地提交，不推送
  --message <文本>     自定义提交信息（默认 "Site updated: <时间>"）
  --help               显示本帮助

注意: 推送需要 git 远端可免密访问（ssh key / gh auth / credential helper）。
若推送失败，脚本会如实报错退出，不会挂起等输入。`);
  process.exit(0);
}

const args = process.argv.slice(2);
const skipPush = args.includes("--skip-push");
const mi = args.indexOf("--message");
const msg = mi >= 0 && args[mi + 1]
  ? args[mi + 1]
  : `Site updated: ${new Date().toISOString().replace("T", " ").slice(0, 19)}`;

async function run(cmd: string[], cwd = ROOT): Promise<string> {
  const p = Bun.spawn(cmd, { cwd, env: ENV, stdout: "pipe", stderr: "pipe" });
  const [out, err, code] = await Promise.all([
    new Response(p.stdout).text(),
    new Response(p.stderr).text(),
    p.exited,
  ]);
  if (code !== 0) {
    throw new Error(`命令失败 (exit ${code}): ${cmd.join(" ")}\n${err.slice(0, 600)}`);
  }
  return out.trim();
}

/** 允许失败的命令，返回 {code,out} */
async function tryRun(cmd: string[], cwd = ROOT): Promise<{ code: number; out: string; err: string }> {
  const p = Bun.spawn(cmd, { cwd, env: ENV, stdout: "pipe", stderr: "pipe" });
  const [out, err, code] = await Promise.all([
    new Response(p.stdout).text(),
    new Response(p.stderr).text(),
    p.exited,
  ]);
  return { code, out: out.trim(), err: err.trim() };
}

async function main(): Promise<void> {
  // 0. 远端探测（推送的前提）
  if (!skipPush) {
    console.log("探测远端...");
    await run(["git", "ls-remote", "origin"]);
    console.log("远端可达。");
  }

  // 1. 构建（先 clean，避免已删除文章的残留页面被同步到 main）
  console.log("构建中...");
  await run(["node", "./node_modules/hexo/bin/hexo", "clean"]);
  await run(["node", "./node_modules/hexo/bin/hexo", "generate"]);
  if (!existsSync(join(PUBLIC, "index.html"))) throw new Error("构建产物缺失 public/index.html，中止。");
  console.log("构建完成。");

  // 2. 提交源码分支
  const branch = await run(["git", "rev-parse", "--abbrev-ref", "HEAD"]);
  const srcStatus = await run(["git", "status", "--porcelain"]);
  if (srcStatus) {
    await run(["git", "add", "-A"]);
    await run(["git", "commit", "-m", msg]);
    console.log(`源码分支 ${branch} 已提交。`);
  } else {
    console.log(`源码分支 ${branch} 无改动，跳过提交。`);
  }

  // 3. worktree 同步 main
  // 注意：git worktree list 输出用正斜杠，Windows 上 WORKTREE 是反斜杠，需归一化再比对
  const norm = (p: string) => p.replace(/\\/g, "/").toLowerCase();
  const wtList = await run(["git", "worktree", "list", "--porcelain"]);
  if (!norm(wtList).includes(norm(WORKTREE))) {
    if (existsSync(WORKTREE)) rmSync(WORKTREE, { recursive: true, force: true });
    await run(["git", "worktree", "add", WORKTREE, "main"]);
  }
  for (const e of readdirSync(WORKTREE)) {
    if (e === ".git") continue;
    rmSync(join(WORKTREE, e), { recursive: true, force: true });
  }
  if (process.platform === "win32") {
    await run(["xcopy", PUBLIC, WORKTREE, "/E", "/I", "/Y", "/Q"]);
  } else {
    await run(["cp", "-r", PUBLIC + "/.", WORKTREE + "/"]);
  }

  const mainStatus = await run(["git", "status", "--porcelain"], WORKTREE);
  if (mainStatus) {
    await run(["git", "add", "-A"], WORKTREE);
    await run(["git", "commit", "-m", msg], WORKTREE);
    console.log("main 分支（网站）已提交。");
  } else {
    console.log("main 分支无改动，跳过提交。");
  }

  // 4. 推送
  if (skipPush) {
    console.log("--skip-push：未推送。稍后可手动 git push。");
    return;
  }
  console.log("推送 main...");
  const pushMain = await tryRun(["git", "push", "origin", "main"], WORKTREE);
  if (pushMain.code !== 0) {
    throw new Error(
      `推送 main 失败 (exit ${pushMain.code}):\n${pushMain.err.slice(0, 800)}\n请检查 git 凭证（ssh key / gh auth），稍后手动 git push。`
    );
  }
  console.log("推送源码分支...");
  const pushSrc = await tryRun(["git", "push", "origin", branch]);
  if (pushSrc.code !== 0) {
    console.log(`注意: 源码分支推送失败 (exit ${pushSrc.code})，网站(main)已上线。稍后手动 git push 即可。`);
  }
  console.log("\n部署完成 → https://blog.wray7.top");
}

main().catch((e) => {
  console.error("\n部署中止: " + (e as Error).message);
  process.exit(1);
});
