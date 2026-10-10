#!/usr/bin/env bun
/**
 * bun run server — 本地预览（hexo server，默认 http://localhost:4000）。
 */
import { $ } from "bun";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`bun run server — 本地预览\n\n用法:\n  bun run server [--port 4000]\n\n启动后浏览器打开 http://localhost:4000 预览。Ctrl+C 退出。`);
  process.exit(0);
}

const pi = process.argv.indexOf("--port");
const port = pi >= 0 && process.argv[pi + 1] ? process.argv[pi + 1] : "4000";

$.cwd(ROOT);
await $`node ./node_modules/hexo/bin/hexo server -p ${port}`;
