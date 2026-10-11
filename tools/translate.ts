#!/usr/bin/env bun
/**
 * tools/translate.ts -- 增量 AI 翻译博客文章（中文 -> 英文 / 日文）
 *
 * 用法:
 *   bun run translate                 增量翻译（只处理新增/变更的文章）
 *   bun run translate -- --all        全量重翻（忽略 manifest）
 *   bun run translate -- --dry-run   只列出待翻译文章，不调用 API
 *   bun run translate -- --limit 5    限制处理篇数（PoC 用）
 *   bun run translate -- --lang en    只翻英文（默认 en,ja）
 *
 * 配置（环境变量；bun 自动加载仓库根目录 .env）:
 *   LLM_BASE_URL   OpenAI 兼容接口地址（必填）
 *   LLM_API_KEY    API 密钥（必填）
 *   MODEL          模型名（必填；兼容 LLM_MODEL 作为 fallback）
 *
 * 状态文件: tools/.translate-manifest.json（增量，断点续传）
 * 输出: source/_posts/<原文件名>.en.md / .ja.md
 *   front-matter 复制原文，仅替换 title、追加 lang 与显式 slug（Hexo 实际按文件名取 :title、忽略 slug；permalink 配对由 scripts/fix-i18n-permalink.js 去掉 .en/.ja 后缀实现）
 *   正文顶部加机器翻译声明；tags/categories 不翻译
 *   代码块/行内代码/Hexo 标签/URL/HTML 标签用占位符保护，绝不翻译
 */

import { createHash } from "crypto";
import { readdir, readFile, writeFile } from "fs/promises";
import { join, basename } from "path";

const args = process.argv.slice(2);
function hasFlag(name: string): boolean {
  return args.indexOf(name) >= 0;
}
function getOpt(name: string): string {
  const i = args.indexOf(name);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : "";
}

const optAll = hasFlag("--all");
const optDryRun = hasFlag("--dry-run");
const optLimit = parseInt(getOpt("--limit") || "0", 10) || 0;
const optLangs = (getOpt("--lang") || "en,ja")
  .split(",")
  .map(function (s: string): string { return s.trim(); })
  .filter(function (s: string): boolean { return s.length > 0; });

if (hasFlag("--help") || hasFlag("-h")) {
  console.log(
    [
      "bun run translate -- 增量 AI 翻译（中文 -> 英文/日文）",
      "",
      "  bun run translate               增量翻译（只处理新增/变更）",
      "  bun run translate -- --all      全量重翻（忽略 manifest）",
      "  bun run translate -- --dry-run  只列出待翻译，不调用 API",
      "  bun run translate -- --limit 5  限制处理篇数（PoC 用）",
      "  bun run translate -- --lang en  只翻英文（默认 en,ja）",
      "",
      "配置：在 .env 中设置 LLM_BASE_URL / LLM_API_KEY / MODEL",
      "状态：tools/.translate-manifest.json（增量，断点续传）",
    ].join("\n")
  );
  process.exit(0);
}

const BASE_URL = (process.env.LLM_BASE_URL || "").replace(/\/+$/, "");
const API_KEY = process.env.LLM_API_KEY || "";
const MODEL = process.env.MODEL || process.env.LLM_MODEL || "";
if (!BASE_URL || !API_KEY || !MODEL) {
  console.error("缺失配置：请在 .env 中设置 LLM_BASE_URL / LLM_API_KEY / MODEL");
  process.exit(1);
}

const ROOT = join(import.meta.dir, "..");
const POSTS_DIR = join(ROOT, "source", "_posts");
const MANIFEST_PATH = join(ROOT, "tools", ".translate-manifest.json");
const CONCURRENCY = 8;
const LANG_NAMES: Record<string, string> = { en: "English", ja: "Japanese" };
const NOTICE: Record<string, string> = {
  en: "> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.\n\n",
  ja: "> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。\n\n",
};function sha256(s: string): string {
  return createHash("sha256").update(s, "utf8").digest("hex");
}

function yamlQuote(s: string): string {
  if (s === "" || /[:#\[\]{},&*!|>"%@]/.test(s) || /^\s|\s$/.test(s)) {
    return "\"" + s.replace(/\\/g, "\\\\").replace(/"/g, "\\\"") + "\"";
  }
  return s;
}

function splitFrontMatter(content: string): { fm: string; body: string } | null {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return null;
  return { fm: m[1], body: m[2] };
}

function getFmValue(fm: string, key: string): string {
  const re = new RegExp("^" + key + ":\\s*(.+)$", "m");
  const m = fm.match(re);
  if (!m) return "";
  let v = m[1].trim();
  const first = v.charCodeAt(0);
  const last = v.charCodeAt(v.length - 1);
  if (v.length >= 2 && ((first === 34 && last === 34) || (first === 39 && last === 39))) {
    v = v.slice(1, -1);
  }
  return v;
}

function getSlug(fm: string, filename: string): string {
  const s = getFmValue(fm, "slug");
  if (s) return s;
  const base = basename(filename);
  const m = base.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/);
  if (m) return m[4];
  return base.replace(/\.md$/, "");
}

// ---------------- 内容保护 ----------------
const BT = String.fromCharCode(96);

function protectSegments(text: string): { text: string; protected: string[] } {
  const kept: string[] = [];
  function ph(s: string): string {
    kept.push(s);
    return "__PH_" + (kept.length - 1) + "__";
  }
  // 只保护 raw/endraw 标签本身：不少文章整篇包在 raw 里，整段保护会导致全文不翻译
  text = text.replace(/{%\s*(?:end)?raw\s*%}/g, ph);
  const fenceRe = new RegExp(BT + BT + BT + "[\\s\\S]*?" + BT + BT + BT, "g");
  text = text.replace(fenceRe, ph);
  text = text.replace(/{%[\s\S]*?%}/g, ph);
  text = text.replace(/{{[\s\S]*?}}/g, ph);
  const inlineRe = new RegExp(BT + "[^" + BT + "\\n]+" + BT, "g");
  text = text.replace(inlineRe, ph);
  // URL 止于空白、括号、引号和中日文字符：中文没有空格，\S+ 会把 [x](url) 后面的整段正文吞进占位符
  text = text.replace(/https?:\/\/[^\s()<>"'　-ヿ一-鿿＀-￯]+/g, ph);
  text = text.replace(/<[^>]+>/g, ph);
  return { text: text, protected: kept };
}

// 后一轮保护会把前一轮的占位符包进去（如 URL 紧跟 __PH_n__、<__PH_n__>），需反复还原直到不再变化
function restoreSegments(text: string, kept: string[]): string {
  let prev: string;
  do {
    prev = text;
    text = text.replace(/__PH_(\d+)__/g, function (_m: string, n: string): string {
      const v = kept[parseInt(n, 10)];
      return v !== undefined ? v : _m;
    });
  } while (text !== prev);
  return text;
}// ---------------- LLM 调用 ----------------
// 注意：绝不打印 API_KEY。错误信息只截取响应前 300 字符（不含密钥）。
async function callLLM(system: string, user: string): Promise<string> {
  let res: Response;
  try {
    const apiPath = BASE_URL.endsWith("/v1") ? "/chat/completions" : "/v1/chat/completions";
    res = await fetch(BASE_URL + apiPath, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.3,
        stream: true,
      }),
      // 流卡住时不至于永远挂起（覆盖整个请求含读流）
      signal: AbortSignal.timeout(10 * 60 * 1000),
    });
  } catch (e) {
    throw new Error("网络请求失败: " + (e as Error).message);
  }
  if (!res.ok) {
    const t = await res.text().catch(function () { return ""; });
    throw new Error("LLM API " + res.status + ": " + t.slice(0, 300));
  }
  // 流式读取 SSE，拼 delta.content（部分中转站对非流式请求支持不好）
  const reader = res.body?.getReader();
  if (!reader) throw new Error("LLM 无响应体");
  const decoder = new TextDecoder();
  let content = "";
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() || "";
    for (const line of lines) {
      const l = line.trim();
      if (!l.startsWith("data:")) continue;
      const data = l.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const j = JSON.parse(data);
        const delta = j && j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content;
        if (typeof delta === "string") content += delta;
      } catch {
        /* 跳过坏块 */
      }
    }
  }
  try {
    reader.releaseLock();
  } catch {
    /* ignore */
  }
  if (!content.trim()) {
    throw new Error("LLM 返回为空");
  }
  return content;
}

async function withRetry<T>(fn: () => Promise<T>, retries: number): Promise<T> {
  let lastErr: unknown = null;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < retries) {
        await new Promise(function (r) { setTimeout(r, 2000 * (i + 1)); });
      }
    }
  }
  throw lastErr;
}

function buildSystemPrompt(lang: string): string {
  const langName = LANG_NAMES[lang] || lang;
  return [
    "You are a precise technical translator. Translate the following Chinese text to " + langName + ".",
    "Rules:",
    "1. Tokens like __PH_0__ are placeholders for code, URLs or markup. Keep them EXACTLY as-is, in their original positions. Do not translate, modify, or drop them.",
    "2. Preserve all Markdown formatting (headings, lists, links, emphasis, tables).",
    "3. Output ONLY the translation, no explanations or extra text.",
    "4. Translate ALL Chinese prose, including headings, list items, table cells and link text. Leave no Chinese sentences untranslated.",
  ].join("\n");
}

// 系统提示词泄漏检测（OmniRoute output style 偶发泄漏到译文）
const LEAKAGE_MARKERS = [
  "OmniRoute Output Styles",
  "出力スタイル",
  "ポニーテール",
];
function hasLeakage(text: string): boolean {
  return LEAKAGE_MARKERS.some((m) => text.includes(m));
}

async function translateChunk(text: string, lang: string): Promise<string> {
  const seg = protectSegments(text);
  const raw = await withRetry(function () {
    return callLLM(buildSystemPrompt(lang), seg.text);
  }, 2);
  const out = restoreSegments(raw.trim(), seg.protected);
  const leftover = out.match(/__PH_\d+__/g);
  if (leftover) {
    throw new Error("占位符未完全还原: " + leftover.slice(0, 3).join(","));
  }
  if (hasLeakage(out)) {
    throw new Error("检测到系统提示词泄漏，触发重试");
  }
  return out;
}

// 超长正文按段落切块（>80KB），避免单次请求过大
function chunkBody(body: string, maxLen: number): string[] {
  if (body.length <= maxLen) return [body];
  const paras = body.split(/\n\n+/);
  const chunks: string[] = [];
  let cur = "";
  for (const p of paras) {
    const candidate = cur ? cur + "\n\n" + p : p;
    if (candidate.length > maxLen && cur) {
      chunks.push(cur);
      cur = p;
    } else {
      cur = candidate;
    }
  }
  if (cur) chunks.push(cur);
  return chunks.length > 0 ? chunks : [body];
}

// 标题校验：过滤模型偶发的系统提示词泄漏/胡言（标题应为单行、长度合理）
// PoC 实测曾出现标题被模型输出的系统提示词污染，body 正常
function isValidTitle(trTitle: string, origTitle: string): boolean {
  const t = trTitle.trim();
  if (!t) return false;
  if (t.includes("\n")) return false;
  if (t.length > Math.max(120, origTitle.length * 5)) return false;
  return true;
}

async function translatePost(
  title: string,
  body: string,
  lang: string
): Promise<{ title: string; body: string }> {
  let trTitle = await translateChunk(title, lang);
  if (!isValidTitle(trTitle, title)) {
    trTitle = await translateChunk(title, lang); // 重试一次
    if (!isValidTitle(trTitle, title)) {
      trTitle = title; // 仍失败则保留原文标题，胜过垃圾标题
    }
  }
  const chunks = chunkBody(body, 80000);
  const outChunks: string[] = [];
  for (const c of chunks) {
    outChunks.push(await translateChunk(c, lang));
  }
  return { title: trTitle.trim(), body: outChunks.join("\n\n") };
}// ---------------- 任务处理 ----------------
type Manifest = Record<string, Record<string, { hash: string; at: string }>>;

async function loadManifest(): Promise<Manifest> {
  try {
    const t = await readFile(MANIFEST_PATH, "utf-8");
    return JSON.parse(t) as Manifest;
  } catch {
    return {};
  }
}

interface Task {
  file: string;
  rel: string;
  lang: string;
  hash: string;
  content: string;
}

async function processTask(t: Task, manifest: Manifest): Promise<void> {
  const parsed = splitFrontMatter(t.content);
  if (!parsed) throw new Error("无法解析 front-matter");
  const origTitle = getFmValue(parsed.fm, "title") || basename(t.file).replace(/\.md$/, "");
  const slug = getSlug(parsed.fm, t.file);

  const tr = await translatePost(origTitle, parsed.body, t.lang);

  let fm = parsed.fm;
  if (/^title:/m.test(fm)) {
    fm = fm.replace(/^title:.*$/m, "title: " + yamlQuote(tr.title));
  } else {
    fm = "title: " + yamlQuote(tr.title) + "\n" + fm;
  }
  if (/^lang:/m.test(fm)) {
    fm = fm.replace(/^lang:.*$/m, "lang: " + t.lang);
  } else {
    fm = fm + "\nlang: " + t.lang;
  }
  if (!/^slug:/m.test(fm)) {
    fm = fm + "\nslug: " + slug;
  }

  const notice = NOTICE[t.lang] || "";
  const out = "---\n" + fm + "\n---\n\n" + notice + tr.body;
  const outName = t.rel.replace(/\.md$/, "." + t.lang + ".md");
  await writeFile(join(POSTS_DIR, outName), out, "utf-8");

  if (!manifest[t.rel]) manifest[t.rel] = {};
  manifest[t.rel][t.lang] = { hash: t.hash, at: new Date().toISOString() };
}

async function main(): Promise<void> {
  const files = (await readdir(POSTS_DIR))
    .filter(function (f: string): boolean {
      return f.endsWith(".md") && !/\.en\.md$/.test(f) && !/\.ja\.md$/.test(f);
    })
    .sort();
  const manifest = await loadManifest();

  const tasks: Task[] = [];
  for (const file of files) {
    const full = join(POSTS_DIR, file);
    const content = await readFile(full, "utf-8");
    const hash = sha256(content);
    const entry = manifest[file] || {};
    for (const lang of optLangs) {
      if (!optAll && entry[lang] && entry[lang].hash === hash) continue;
      tasks.push({ file: full, rel: file, lang: lang, hash: hash, content: content });
    }
  }

  let queue = tasks;
  if (optLimit > 0) queue = queue.slice(0, optLimit);

  if (optDryRun) {
    console.log("待翻译任务数: " + queue.length);
    const byLang: Record<string, number> = {};
    for (const q of queue) {
      byLang[q.lang] = (byLang[q.lang] || 0) + 1;
    }
    console.log("按语言: " + JSON.stringify(byLang));
    const show = queue.slice(0, 20);
    for (const q of show) console.log("  " + q.rel + " -> " + q.lang);
    if (queue.length > 20) console.log("  ...（仅显示前 20）");
    return;
  }

  if (queue.length === 0) {
    console.log("没有需要翻译的文章（全部已是最新）。");
    return;
  }

  console.log("开始翻译 " + queue.length + " 个任务 [" + optLangs.join(",") + "]，并发 " + CONCURRENCY);
  let done = 0;
  let failed = 0;
  const failures: string[] = [];
  let idx = 0;

  async function worker(): Promise<void> {
    while (idx < queue.length) {
      const t = queue[idx++];
      try {
        await processTask(t, manifest);
        done++;
        if (done % 10 === 0 || done === queue.length) {
          console.log("  进度: " + done + "/" + queue.length);
        }
      } catch (e) {
        failed++;
        const msg = (e as Error).message || String(e);
        failures.push(t.rel + " -> " + t.lang + ": " + msg);
        console.error("  [失败] " + t.rel + " -> " + t.lang + ": " + msg);
      }
    }
  }

  const workers: Promise<void>[] = [];
  for (let i = 0; i < CONCURRENCY; i++) workers.push(worker());
  await Promise.all(workers);

  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n", "utf-8");

  console.log("完成: " + done + " 成功, " + failed + " 失败");
  if (failures.length > 0) {
    console.log("失败列表（前 20）:");
    for (const f of failures.slice(0, 20)) console.log("  " + f);
    process.exit(1);
  }
}

main().catch(function (e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  console.error("致命错误: " + msg);
  process.exit(1);
});