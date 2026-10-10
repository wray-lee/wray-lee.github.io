# Wray的Blog

Hexo 7 + NexT 主题，源码在 `hexo` 分支，构建产物发布到 `main` 分支
（GitHub Pages 直接 serving `main`，域名 https://blog.wray7.top）。

所有运维脚本都用 **bun** 写，放在 `tools/`。

## 手动加文章（三步）

```bash
cd C:\Users\Wray\blog          # 先切到 hexo 分支：git switch hexo

# 1. 新建文章骨架（自动填好当天日期）
bun run new "文章标题" --tags 标签1,标签2

# 2. 用编辑器写正文，本地预览确认
bun run build     # 或 bun run server 然后浏览器看 http://localhost:4000

# 3. 发布（构建→提交→推送一条龙）
bun run deploy
```

就这么简单。`bun run new --help` / `bun run deploy --help` 看更多选项。

## 从 OneDrive 笔记同步

笔记放在 `C:\Users\Wray\OneDrive\教程`（可通过环境变量 `BLOG_NOTES_DIR` 覆盖）：

```bash
bun run sync              # 增量导入：只处理新增/修改过的 .md / .txt / .docx
bun run sync --dry-run    # 先看会导入哪些，不写文件
```

规则：`date` 取文件修改时间，`title` 取文件名，`tags` 取一级目录名；
笔记引用的本地图片和同目录附件（pdf/pptx 等）会自动拷进文章资源目录。
`.docx` 需要 pandoc（没有会自动跳过并列出清单）。进度记在
`tools/.sync-manifest.json`，删笔记不会删文章（避免误伤）。

注意：笔记里如果出现 `{{ }}` / `{% %}`（如 Jinja2/SSTI 语法），导入时会自动用
`{% raw %}...{% endraw %}` 包裹，防止 Hexo 把它们当模板标签解析导致构建失败。
手动写的文章若有同样内容，自己包一层 `{% raw %}` 即可。

安全提醒：笔记里如果写过密钥 / token / 密码，公开发布前务必打码
（2026-10-11 就有一篇 alist 笔记带 Google OAuth 密钥被 GitHub push protection 拦下）。
`bun run deploy` 推送被拦时不会瞎猜，会把 GitHub 指出的文件和位置原样报出来。

## 常用命令

| 命令 | 说明 |
|---|---|
| `bun run sync` | 增量同步 OneDrive 笔记 |
| `bun run new "标题"` | 新建文章骨架 |
| `bun run build` | 本地构建到 `public/` |
| `bun run server` | 本地预览 http://localhost:4000 |
| `bun run deploy` | 构建→提交→推送，一条龙发布 |
| `bun run migrate-legacy` | 一次性：旧站 HTML 转回 Markdown（已用过） |

## 目录结构

```
_config.yml          Hexo 主配置
_config.next.yml     NexT 主题配置（简洁阅读向，动画已关）
source/_posts/       文章（Markdown + 资源目录）
source/about/        关于页
tools/             bun 运维脚本
```

## 主题

[NexT](https://theme-next.js.org/)（Gemini scheme），干净、中文排版友好、支持深色模式与站内搜索。
想换样式改 `_config.next.yml` 即可（`scheme` 可选 Gemini/Muse/Mistral/Pisces）。
