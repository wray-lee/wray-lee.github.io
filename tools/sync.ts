#!/usr/bin/env bun
/**
 * bun run sync — 从 OneDrive 笔记目录增量导入笔记为 Hexo 文章。
 *
 * 用法:
 *   bun run sync                 全量/增量同步（只处理新增或修改过的笔记）
 *   bun run sync --dry-run       只列出将要导入的笔记，不写文件
 *   bun run sync --help          显示帮助
 *
 * 环境变量:
 *   BLOG_NOTES_DIR   笔记根目录（默认 C:\Users\Wray\OneDrive\教程）
 *
 * 规则:
 * - 扫描 .md / .txt / .docx（docx 需要 pandoc，没有则记入跳过清单）
 * - 文章 date 取文件 LastWriteTime，title 取文件名（清理非法字符）
 * - tags 取笔记所在的一级目录名（如 devops / web / linux）
 * - 笔记里引用的本地图片会拷贝到文章资源目录并改写链接
 * - 同目录下的 pdf/pptx/xlsx 等附件会拷贝到文章资源目录并在文末列出
 * - 进度记录在 tools/.sync-manifest.json，下次只处理新增/修改
 * - 文件名黑名单 SKIP_FILE_NAMES：含密钥等绝不能发布的笔记，永久排除（2026-10-11 起：alist 篇）
 */
import { readdir, stat, readFile, writeFile, mkdir, copyFile, rm } from "node:fs/promises";
import { join, relative, basename, dirname, extname, resolve } from "node:path";
import { existsSync } from "node:fs";

const NOTES_DIR = process.env.BLOG_NOTES_DIR ?? "C:\\Users\\Wray\\OneDrive\\教程";
const ROOT = join(import.meta.dir, "..");
const POSTS_DIR = join(ROOT, "source", "_posts");
const MANIFEST = join(import.meta.dir, ".sync-manifest.json");

const NOTE_EXTS = new Set([".md", ".txt", ".docx"]);
const IMG_EXTS = new Set([".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg", ".ico"]);
const ATTACH_EXTS = new Set([".pdf", ".pptx", ".ppt", ".xlsx", ".xls", ".zip", ".7z", ".csv"]);
// 这些目录明显不是笔记，直接跳过（构建产物、二进制、字体等）
const SKIP_DIRS = new Set([
  "node_modules", ".git", "fonts(used_in_shell)", "sentry_db_lghub_agent",
  "Firmware", ".vs", ".gradle", "build", "dist", "target", "__pycache__",
]);
// 路径片段黑名单：第三方库自带文档（如 imgui 的 README/CHANGELOG）不是 wray 的笔记
// code/cheat/Cheat.md 是他自己的笔记，用白名单放行
const SKIP_PATH_CONTAINS = ["\\cheat\\"];
const KEEP_PATH_CONTAINS = ["\\cheat\\Cheat.md"];
// 文件名黑名单：含密钥等绝不能发布的笔记，永久排除（wray 2026-10-11 要求删除 alist 篇）
// 按 basename 精确匹配（小写），与笔记原名和生成的文章名都对上，防止改名绕过
const SKIP_FILE_NAMES = new Set(["alist.md", "2023-05-23-alist.md"]);

function isSkippedPath(rel: string): boolean {
  const low = "\\" + rel.toLowerCase();
  if (KEEP_PATH_CONTAINS.some((k) => low.endsWith(k.toLowerCase()))) return false;
  return SKIP_PATH_CONTAINS.some((k) => low.includes(k.toLowerCase()));
}

interface ManifestEntry { mtimeMs: number; post: string }
interface Manifest { files: Record<string, ManifestEntry> }

function usage(): void {
  console.log(`bun run sync — 从 OneDrive 笔记目录增量导入为 Hexo 文章

用法:
  bun run sync [--dry-run] [--notes-dir <目录>]

选项:
  --dry-run            只列出将要导入的笔记，不写文件
  --notes-dir <目录>   覆盖笔记根目录（默认 ${NOTES_DIR}）
  --help               显示本帮助

导入规则见文件头注释。进度记录在 tools/.sync-manifest.json。`);
}

async function loadManifest(): Promise<Manifest> {
  try {
    // 去掉 BOM：PowerShell Set-Content -Encoding UTF8 会写 BOM，JSON.parse 会炸
    const raw = (await readFile(MANIFEST, "utf-8")).replace(/^﻿/, "");
    return JSON.parse(raw);
  } catch {
    return { files: {} };
  }
}

async function walk(dir: string, out: string[] = []): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) await walk(full, out);
    } else if (e.isFile()) {
      out.push(full);
    }
  }
  return out;
}

/** 清理为合法的文件名/标题 */
function cleanName(s: string): string {
  return s
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/, "");
}

function fmtDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
function fmtDay(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

async function readTextSmart(path: string): Promise<string> {
  const buf = await readFile(path);
  const utf8 = new TextDecoder("utf-8", { fatal: false }).decode(buf);
  // 如果出现大量替换字符，尝试 GBK（中文 Windows 记事本默认编码）
  const bad = (utf8.match(/�/g) || []).length;
  if (bad > utf8.length / 200 && bad > 3) {
    try {
      return new TextDecoder("gbk").decode(buf);
    } catch {
      /* fall through */
    }
  }
  // 去掉 BOM
  return utf8.replace(/^﻿/, "");
}

async function hasPandoc(): Promise<boolean> {
  try {
    const p = Bun.spawnSync(["pandoc", "--version"]);
    return p.exitCode === 0;
  } catch {
    return false;
  }
}

async function docxToMd(path: string): Promise<string | null> {
  const p = Bun.spawnSync(["pandoc", "-f", "docx", "-t", "gfm", path], {
    stdout: "pipe",
    stderr: "pipe",
  });
  if (p.exitCode !== 0) return null;
  return new TextDecoder().decode(p.stdout);
}

function uniquePostPath(day: string, title: string): string {
  let base = cleanName(`${day}-${title}`).slice(0, 120) || `${day}-untitled`;
  let file = join(POSTS_DIR, base + ".md");
  let i = 2;
  while (existsSync(file)) {
    file = join(POSTS_DIR, `${base}-${i}.md`);
    i++;
  }
  return file;
}

function slugOf(postPath: string): string {
  return basename(postPath, ".md");
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    usage();
    return;
  }
  const dryRun = args.includes("--dry-run");
  const ndi = args.indexOf("--notes-dir");
  const notesDir = ndi >= 0 && args[ndi + 1] ? resolve(args[ndi + 1]) : resolve(NOTES_DIR);

  if (!existsSync(notesDir)) {
    console.error(`笔记目录不存在: ${notesDir}`);
    process.exit(1);
  }

  const manifest = await loadManifest();
  const pandocOk = await hasPandoc();
  const all = await walk(notesDir);
  const notes = all.filter(
    (f) => NOTE_EXTS.has(extname(f).toLowerCase()) && !isSkippedPath(relative(notesDir, f)) && !SKIP_FILE_NAMES.has(basename(f).toLowerCase())
  );

  let imported = 0, skipped = 0;
  const skippedNoPandoc: string[] = [];
  const readFailed: string[] = [];
  const importedList: string[] = [];

  for (const notePath of notes) {
    const st = await stat(notePath);
    const prev = manifest.files[notePath];
    if (prev && prev.mtimeMs === st.mtimeMs && existsSync(join(ROOT, prev.post))) {
      skipped++;
      continue;
    }

    const ext = extname(notePath).toLowerCase();
    const rawTitle = cleanName(basename(notePath, ext)) || "untitled";
    const mtime = new Date(st.mtimeMs);
    const day = fmtDay(mtime);

    // 旧版本：删掉重建，保证附件/图片不重复堆积
    if (prev) {
      const oldPost = join(ROOT, prev.post);
      const oldAsset = join(POSTS_DIR, slugOf(oldPost));
      try { await rm(oldPost, { force: true }); } catch {}
      try { await rm(oldAsset, { recursive: true, force: true }); } catch {}
    }

    let body: string | null;
    try {
      if (ext === ".docx") {
        if (!pandocOk) {
          skippedNoPandoc.push(notePath);
          continue;
        }
        body = await docxToMd(notePath);
        if (body === null) {
          skippedNoPandoc.push(notePath + " (pandoc 转换失败)");
          continue;
        }
      } else {
        body = await readTextSmart(notePath);
      }
    } catch (e) {
      // 云文件未下载等读取失败：记录并跳过，不中断整批
      readFailed.push(`${notePath} (${(e as Error).message.slice(0, 60)})`);
      continue;
    }
    if (!body.trim()) {
      skipped++;
      continue;
    }

    const relDir = dirname(relative(notesDir, notePath));
    const tag = relDir === "." ? "笔记" : relDir.split(/[\\/]/)[0];
    const tags = [cleanName(tag) || "笔记"];

    const postPath = uniquePostPath(day, rawTitle);
    const slug = slugOf(postPath);
    const assetDir = join(POSTS_DIR, slug);

    // 图片：把笔记引用的本地图片拷进资源目录并改写链接
    const imgRe = /!\[[^\]]*\]\(([^)\s]+)\)/g;
    let m: RegExpExecArray | null;
    const copiedImgs = new Map<string, string>();
    let newBody = body;
    const noteDir = dirname(notePath);
    while ((m = imgRe.exec(body)) !== null) {
      const src = decodeURIComponent(m[1]);
      if (/^(https?:|data:|\/)/i.test(src)) continue;
      const abs = resolve(noteDir, src);
      if (!IMG_EXTS.has(extname(abs).toLowerCase()) || !existsSync(abs)) continue;
      if (!copiedImgs.has(abs)) {
        const name = cleanName(basename(abs)) || basename(abs);
        if (!dryRun) {
          await mkdir(assetDir, { recursive: true });
          await copyFile(abs, join(assetDir, name));
        }
        copiedImgs.set(abs, name);
      }
      newBody = newBody.split(m[1]).join(encodeURI(copiedImgs.get(abs)!));
    }

    // 附件：同目录下的 pdf/ppt 等拷进资源目录，文末列出
    let attachSection = "";
    let sibs: string[] = [];
    try {
      sibs = (await readdir(noteDir)).map((n) => join(noteDir, n));
    } catch {}
    const attachNames: string[] = [];
    for (const s of sibs) {
      if (s === notePath) continue;
      if (!ATTACH_EXTS.has(extname(s).toLowerCase())) continue;
      const name = cleanName(basename(s)) || basename(s);
      if (!dryRun) {
        await mkdir(assetDir, { recursive: true });
        await copyFile(s, join(assetDir, name));
      }
      attachNames.push(name);
    }
    if (attachNames.length > 0) {
      attachSection = "\n\n## 附件\n\n" + attachNames.map((n) => `- [${n}](${encodeURI(n)})`).join("\n") + "\n";
    }

    const front = `---\ntitle: "${rawTitle.replace(/"/g, "'")}"\ndate: ${fmtDate(mtime)}\ntags: [${tags.map((t) => `"${t}"`).join(", ")}]\n---\n\n`;
    let core = newBody.replace(/\s+$/, "");
    // 笔记里若有 {{ }} / {% %}（如 Jinja/SSTI 语法），Hexo 会误当模板标签解析致构建失败
    if (/\{\{|\{%|\{#/.test(core)) core = `{% raw %}\n${core}\n{% endraw %}`;
    const final = front + core + attachSection;

    if (!dryRun) {
      await mkdir(POSTS_DIR, { recursive: true });
      await writeFile(postPath, final, "utf-8");
      manifest.files[notePath] = { mtimeMs: st.mtimeMs, post: relative(ROOT, postPath) };
    }
    imported++;
    importedList.push(`${day}  ${rawTitle}`);
  }

  if (!dryRun) await writeFile(MANIFEST, JSON.stringify(manifest, null, 2), "utf-8");

  console.log(`扫描笔记: ${notes.length}，本次导入: ${imported}，跳过(未变更/空): ${skipped}`);
  for (const l of importedList.slice(0, 30)) console.log("  + " + l);
  if (importedList.length > 30) console.log(`  ... 还有 ${importedList.length - 30} 篇`);
  if (skippedNoPandoc.length > 0) {
    console.log(`\n缺少 pandoc，跳过 ${skippedNoPandoc.length} 个 docx:`);
    for (const s of skippedNoPandoc) console.log("  ! " + s);
  }
  if (readFailed.length > 0) {
    console.log(`\n读取失败，跳过 ${readFailed.length} 个文件:`);
    for (const s of readFailed) console.log("  ! " + s);
  }
  if (dryRun) console.log("\n(dry-run，未写入任何文件)");
}

main();
