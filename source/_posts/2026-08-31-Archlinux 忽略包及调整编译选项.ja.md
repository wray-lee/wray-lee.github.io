---
title: Arch Linux のパッケージ無視とコンパイルオプションの調整
date: 2026-08-31 05:14:36
tags: ["linux"]
lang: ja
slug: Archlinux 忽略包及调整编译选项
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

# Arch Linux パッケージの無視とコンパイルオプションの調整

## pacmanの美化

**色を有効にする**：`#Color` を見つけ、前にある `#` のコメント記号を外します。

**パックマンのプログレスバーを有効にする**：`Color` の次の行に、手動で `ILoveCandy` を1行追加します。

**並列ダウンロードを有効にする**（強く推奨、ダウンロード速度を大幅に向上できます）：`#ParallelDownloads = 5` を見つけ、前にある `#` を外し、数字を希望する同時ダウンロード数に調整します（例：5 または 8）。

## パッケージの無視

```bash
#/etc/pacman.conf

IgnorePkg   = anaconda
```

## コンパイルの調整

```bash
#/etc/makepkg.conf
# 删除debug
# debug -> !debug
OPTIONS=(strip docs !libtool !staticlibs emptydirs zipman purge !debug lto)

```