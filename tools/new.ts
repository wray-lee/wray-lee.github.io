#!/usr/bin/env bun
/**
 * bun run new "标题" — 手动新建一篇文章骨架。
 *
 * 用法:
 *   bun run new "我的新文章"
 *   bun run new "我的新文章" --tags 技术,折腾
 *   bun run new --help
 *
 * 会在 source/_posts/ 下生成 YYYY-MM-DD-<标题>.md，front matter 已填好当天日期。
 * 建完直接用编辑器写正文，然后 bun run sync(可选) / bun run build / bun run deploy。
 */
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";

const ROOT = join(import.meta.dir, "..");
const POSTS_DIR = join(ROOT, "source", "_posts");

function usage(): void {
  console.log(`bun run new "标题" — 新建文章骨架

用法:
  bun run new "我的新文章" [--tags 技术,折腾]

选项:
  --tags <a,b>   文章标签（逗号分隔）
  --help         显示本帮助

示例:
  bun run new "群晖硬盘扩容记录" --tags 群晖,折腾`);
}

function cleanName(s: string): string {
  return s.replace(/[<>:"/\\|?*\x00-\x1f]/g, "").replace(/\s+/g, " ").trim().replace(/[. ]+$/, "");
}

function fmtDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h") || args.length === 0) {
    usage();
    if (args.length === 0) process.exit(1);
    return;
  }
  const ti = args.indexOf("--tags");
  const tags = ti >= 0 && args[ti + 1] ? args[ti + 1].split(",").map((t) => cleanName(t)).filter(Boolean) : [];
  const title = cleanName(args.filter((a) => !a.startsWith("--") && a !== args[ti + 1]).join(" "));
  if (!title) {
    console.error("标题不能为空");
    process.exit(1);
  }

  const now = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const day = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
  let base = `${day}-${title}`.slice(0, 120);
  let file = join(POSTS_DIR, base + ".md");
  let i = 2;
  while (existsSync(file)) {
    file = join(POSTS_DIR, `${base}-${i}.md`);
    i++;
  }

  const front = `---\ntitle: "${title.replace(/"/g, "'")}"\ndate: ${fmtDate(now)}\ntags: [${tags.map((t) => `"${t}"`).join(", ")}]\n---\n\n写正文...\n`;
  await mkdir(POSTS_DIR, { recursive: true });
  await writeFile(file, front, "utf-8");
  console.log(`已创建: ${file}`);
  console.log("下一步: 写正文 → bun run build 预览 → bun run deploy 发布");
}

main();
