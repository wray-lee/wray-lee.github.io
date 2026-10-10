---
title: "Archlinux 忽略包及调整编译选项"
date: 2026-08-31 05:14:36
tags: ["linux"]
---

# Archlinux 忽略包及调整编译选项

## pacman美化

**启用颜色**：找到 `#Color`，去掉前面的 `#` 注释符号。

**启用吃豆人进度条**：在 `Color` 的下一行，手动添加一行 `ILoveCandy`。

**启用并行下载**（强烈推荐，可大幅提升下载速度）：找到 `#ParallelDownloads = 5`，去掉前面的 `#`，并将数字调整为你希望的并发数（例如 5 或 8）。

## 忽略包

```bash
#/etc/pacman.conf

IgnorePkg   = anaconda
```

## 调整编译

```bash
#/etc/makepkg.conf
# 删除debug
# debug -> !debug
OPTIONS=(strip docs !libtool !staticlibs emptydirs zipman purge !debug lto)

```