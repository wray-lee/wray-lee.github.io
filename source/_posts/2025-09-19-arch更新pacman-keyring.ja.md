---
title: Arch の pacman-keyring を更新
date: 2025-09-19 10:21:41
tags: ["linux"]
lang: ja
slug: arch更新pacman-keyring
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

# Arch の pacman-keyring 更新

システムにインストールされているすべての鍵を削除またはリセットするには、/etc/pacman.d/gnupg ディレクトリを（root として）削除し、pacman-key --init を再実行した後、pacman-key --populate を実行してデフォルトの鍵を再追加します。

## デフォルト

```bash
sudo pacman -Sy archlinux-keyring
sudo pacman -Syu
```

## 代替手段

### 鍵のリセット

```shell
sudo rm -rf /etc/pacman.d/gnupg
sudo pacman-key --init
sudo pacman-key --populate

###
rm -rf /etc/pacman.d/gnupg && pacman-key --init && pacman-key --populate && pacman-key --refresh-keys
```

### 鍵の更新

`sudo pacman -S archlinux-keyring && sudo pacman -Syu`

`pacman-key --refresh-keys`

## 鍵の無視

```bash
# /etc/pacman.conf
[option]
SigLevel = Never
```