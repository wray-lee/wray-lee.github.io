---
title: Archlinux Ignore Packages and Adjust Compilation Options
date: 2026-08-31 05:14:36
tags: ["linux"]
lang: en
slug: Archlinux 忽略包及调整编译选项
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

# Arch Linux Ignoring Packages and Adjusting Compilation Options

## Pacman Beautification

**Enable colors**: Find `#Color` and remove the preceding `#` comment symbol.

**Enable the Pac-Man progress bar**: On the line below `Color`, manually add a line `ILoveCandy`.

**Enable parallel downloads** (highly recommended; it can greatly increase download speed): Find `#ParallelDownloads = 5`, remove the preceding `#`, and adjust the number to the level of concurrency you want (for example, 5 or 8).

## Ignoring Packages

```bash
#/etc/pacman.conf

IgnorePkg   = anaconda
```

## Adjusting Compilation

```bash
#/etc/makepkg.conf
# 删除debug
# debug -> !debug
OPTIONS=(strip docs !libtool !staticlibs emptydirs zipman purge !debug lto)

```