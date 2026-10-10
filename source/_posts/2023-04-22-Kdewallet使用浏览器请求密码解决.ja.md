---
title: Kdewalletがブラウザ使用時にパスワードを要求する問題の解決
date: 2023-04-22 21:59:51
tags: ["linux"]
lang: ja
slug: Kdewallet使用浏览器请求密码解决
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

# Kdewallet使用時にブラウザがパスワードを要求する問題の解決

`vim ~/.config/kwalletrc`

```shell
[Auto Deny]
kdewallet=Chromium
```

設定ファイルがない場合

`sudo pacman -S kwalletmanager`

## 添付ファイル

- [linux同期時間.pdf](linux%E5%90%8C%E6%AD%A5%E6%97%B6%E9%97%B4.pdf)
- [linuxバッテリー管理.pdf](linux%E7%94%B5%E6%B1%A0%E7%AE%A1%E7%90%86.pdf)