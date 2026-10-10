#!/usr/bin/env bun
/**
 * bun run migrate-legacy — 把旧站（nexmoe 主题构建产物）的文章转回 Markdown。
 * 一次性脚本：旧 35 篇（2019/2023/2024）已迁完就不需要再跑。
 *
 * 用法:
 *   bun run migrate-legacy --from <旧站目录(main分支检出)> --to source/_posts [--dry-run]
 *   bun run migrate-legacy --help
 *
 * 转换: 抽 <article> 内容，去掉封面/meta 块，HTML→Markdown（含代码块/prism 还原）。
 * date 取 URL 路径里的年月日，tags 取路径中间段。
 */
import { readdir, readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { join, basename, dirname, relative } from "node:path";
import { existsSync } from "node:fs";

// ---------------- 极简 HTML 解析器 ----------------
interface Node { tag: string; attrs: Record<string, string>; children: (Node | string)[] }
const VOID = new Set(["br", "hr", "img", "input", "meta", "link", "source"]);

function parseHtml(html: string): Node {
  const root: Node = { tag: "root", attrs: {}, children: [] };
  const stack: Node[] = [root];
  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*?)(\/?)>/g;
  let last = 0, m: RegExpExecArray | null;
  const pushText = (t: string) => {
    if (t) stack[stack.length - 1].children.push(t);
  };
  while ((m = re.exec(html)) !== null) {
    pushText(html.slice(last, m.index));
    last = re.lastIndex;
    if (m[0].startsWith("<!--")) continue;
    const [, closing, tag, attrStr, selfClose] = m;
    const tagName = tag.toLowerCase();
    if (closing) {
      while (stack.length > 1 && stack[stack.length - 1].tag !== tagName) stack.pop();
      if (stack.length > 1) stack.pop();
      continue;
    }
    if (tagName === "script" || tagName === "style") {
      const end = html.indexOf(`</${tagName}`, re.lastIndex);
      if (end >= 0) { re.lastIndex = html.indexOf(">", end) + 1; last = re.lastIndex; }
      continue;
    }
    const attrs: Record<string, string> = {};
    const are = /([a-zA-Z_:][a-zA-Z0-9:._-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    let am: RegExpExecArray | null;
    while ((am = are.exec(attrStr)) !== null) attrs[am[1].toLowerCase()] = am[2] ?? am[3] ?? am[4] ?? "";
    const node: Node = { tag: tagName, attrs, children: [] };
    stack[stack.length - 1].children.push(node);
    if (!VOID.has(tagName) && !selfClose) stack.push(node);
  }
  pushText(html.slice(last));
  return root;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function textOf(n: Node | string): string {
  if (typeof n === "string") return n;
  if (n.tag === "br") return "\n";
  return n.children.map(textOf).join("");
}

function findFirst(n: Node, pred: (x: Node) => boolean): Node | null {
  if (pred(n)) return n;
  for (const c of n.children) {
    if (typeof c !== "string") {
      const r = findFirst(c, pred);
      if (r) return r;
    }
  }
  return null;
}

// ---------------- HTML → Markdown ----------------
function toMd(n: Node | string): string {
  if (typeof n === "string") return decodeEntities(n);
  const cls = n.attrs.class ?? "";
  const kids = n.children.map(toMd).join("");
  switch (n.tag) {
    case "h1": case "h2": case "h3": case "h4": case "h5": case "h6": {
      const lv = +n.tag[1];
      const t = textOf(n).replace(/\s+/g, " ").trim();
      return t ? `\n\n${"#".repeat(lv)} ${t}\n\n` : "";
    }
    case "p": {
      const t = kids.replace(/\s+\n/g, "\n").trim();
      return t ? `\n\n${t}\n\n` : "";
    }
    case "br": return "\n";
    case "hr": return "\n\n---\n\n";
    case "strong": case "b": return `**${kids.trim()}**`;
    case "em": case "i": return `*${kids.trim()}*`;
    case "del": case "s": case "strike": return `~~${kids.trim()}~~`;
    case "code": {
      // prism 行号等：直接取纯文本
      const t = decodeEntities(textOf(n)).replace(/\n+$/, "");
      return t.includes("\n") ? `\n\n\`\`\`\n${t}\n\`\`\`\n\n` : `\`${t}\``;
    }
    case "pre": {
      const code = findFirst(n, (x) => x.tag === "code");
      const langM = /language-([\w+-]+)/.exec((code?.attrs.class ?? "") + " " + cls);
      const t = decodeEntities(textOf(code ?? n)).replace(/^\n+|\n+$/g, "");
      return `\n\n\`\`\`${langM?.[1] ?? ""}\n${t}\n\`\`\`\n\n`;
    }
    case "ul": return `\n\n${n.children.filter((c) => typeof c !== "string" && c.tag === "li").map((li) => `- ${toMd(li).trim()}`).join("\n")}\n\n`;
    case "ol": {
      let i = 0;
      return `\n\n${n.children.filter((c) => typeof c !== "string" && c.tag === "li").map((li) => `${++i}. ${toMd(li).trim()}`).join("\n")}\n\n`;
    }
    case "li": return kids;
    case "a": {
      if (cls.includes("headerlink")) return "";
      const href = n.attrs.href ?? "";
      const t = kids.trim();
      if (!href || !t || href.startsWith("#")) return t;
      return `[${t}](${href})`;
    }
    case "img": {
      const src = n.attrs.src ?? "";
      if (!src) return "";
      return `![${n.attrs.alt ?? ""}](${src})`;
    }
    case "blockquote": {
      const t = kids.trim().split("\n").map((l) => `> ${l}`).join("\n");
      return `\n\n${t}\n\n`;
    }
    case "table": {
      const rows: string[][] = [];
      const walkTr = (x: Node) => {
        if (x.tag === "tr") rows.push(x.children.filter((c) => typeof c !== "string" && (c.tag === "td" || c.tag === "th")).map((c) => textOf(c as Node).replace(/\s+/g, " ").trim()));
        else x.children.forEach((c) => { if (typeof c !== "string") walkTr(c); });
      };
      walkTr(n);
      if (!rows.length) return "";
      const head = `| ${rows[0].join(" | ")} |`;
      const sep = `| ${rows[0].map(() => "---").join(" | ")} |`;
      const body = rows.slice(1).map((r) => `| ${r.join(" | ")} |`).join("\n");
      return `\n\n${head}\n${sep}\n${body}\n\n`;
    }
    case "figure": case "div": case "span": case "section": case "article":
    case "header": case "footer": case "main": case "root":
      return kids;
    default: return kids;
  }
}

function cleanMd(s: string): string {
  return s
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\n+/, "")
    .trim() + "\n";
}

function cleanName(s: string): string {
  return s.replace(/[<>:"/\\|?*\x00-\x1f]/g, "").replace(/\s+/g, " ").trim().replace(/[. ]+$/, "");
}

// ---------------- 主流程 ----------------
async function collect(dir: string, out: string[] = []): Promise<string[]> {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) await collect(full, out);
    else if (e.isFile() && e.name === "index.html") out.push(full);
  }
  return out;
}

function usage(): void {
  console.log(`bun run migrate-legacy — 旧站 HTML 文章转回 Markdown

用法:
  bun run migrate-legacy --from <旧站目录> --to <posts目录> [--dry-run]

示例:
  bun run migrate-legacy --from .legacy-site --to source/_posts`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) { usage(); return; }
  const gi = (k: string) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
  const from = gi("--from"), to = gi("--to"), dryRun = args.includes("--dry-run");
  if (!from || !to) { usage(); process.exit(1); }
  if (!existsSync(from)) { console.error(`旧站目录不存在: ${from}`); process.exit(1); }

  const files = (await collect(from)).filter((f) => {
    const r = relative(from, f);
    return /^(2019|2023|2024)[\\/]/.test(r);
  });

  let ok = 0;
  const seen = new Set<string>();
  for (const f of files) {
    const rel = relative(from, f);
    const parts = rel.split(/[\\/]/).slice(0, -1); // [2019,11,30,hello-world] / [2023,09,05,Network,...,Docker]
    const [yy, mm, dd, ...rest] = parts;
    if (!/^\d{4}$/.test(yy)) continue;
    const titleRaw = rest[rest.length - 1] ?? "untitled";
    const title = cleanName(titleRaw) || "untitled";
    const tags = rest.slice(0, -1).map(cleanName).filter(Boolean);

    const html = await readFile(f, "utf-8");
    const root = parseHtml(html);
    const article = findFirst(root, (x) => x.tag === "article");
    if (!article) { console.log(`  ! 无 <article>: ${rel}`); continue; }
    // 去掉封面与 meta 块
    article.children = article.children.filter((c) => {
      if (typeof c === "string") return true;
      const c2 = (c as Node).attrs.class ?? "";
      return !(c2.includes("nexmoe-post-cover") || c2.includes("nexmoe-post-meta"));
    });
    // 去掉与标题重复的首个 h1
    const firstH = article.children.find((c) => typeof c !== "string" && /^h[1-6]$/.test((c as Node).tag)) as Node | undefined;
    if (firstH && textOf(firstH).trim() === title) {
      article.children = article.children.filter((c) => c !== firstH);
    }
    const md = cleanMd(toMd(article));
    if (md.length < 20) { console.log(`  ! 内容过短跳过: ${rel}`); continue; }

    const day = `${yy}-${mm}-${dd}`;
    let base = `${day}-${title}`.slice(0, 120);
    let i = 2, key = base.toLowerCase();
    while (seen.has(key)) { base = `${day}-${title}-${i}`.slice(0, 120); key = base.toLowerCase(); i++; }
    seen.add(key);

    const front = `---\ntitle: "${title.replace(/"/g, "'")}"\ndate: ${day} 00:00:00\ntags: [${tags.map((t) => `"${t.replace(/"/g, "'")}"`).join(", ")}]\n---\n\n`;
    if (!dryRun) {
      await mkdir(to, { recursive: true });
      await writeFile(join(to, base + ".md"), front + md, "utf-8");
    }
    ok++;
    console.log(`  + [${day}] ${title}`);
  }
  console.log(`\n迁移完成: ${ok}/${files.length}${dryRun ? " (dry-run)" : ""}`);
}

main();
