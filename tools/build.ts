#!/usr/bin/env bun
/**
 * bun run build — 本地构建（先 hexo clean 再 hexo generate，避免已删除文章的残留页面）。
 * 产物在 public/ 目录。先跑 bun run sync 确保笔记已导入。
 */
import { $ } from "bun";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`bun run build — 本地构建博客\n\n用法:\n  bun run build\n\n产物输出到 public/。构建前建议先跑 bun run sync 导入最新笔记。`);
  process.exit(0);
}

$.cwd(ROOT);
await $`bunx hexo clean`;
await $`bunx hexo generate`;
console.log("\n构建完成 → public/");
