---
title: NetworkManager で DNS を変更する
date: 2025-11-30 03:24:59
tags: ["linux"]
lang: ja
slug: NetworkManager 更改dns
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

# NetworkManager で DNS を変更
```bash
nmcli con -> "$connectionName"  # get $connectionName

nmcli con mod "$connectionName" ipv4.dns "10.0.0.1"
nmcli con mod "$connectionName" ipv4.ignore-auto-dns no
```



```bash
#/etc/NetworkManager/system-connections/name

[ipv4]
dns=1.1.1.1;
```

## 添付ファイル

- [linux時間同期.pdf](linux%E5%90%8C%E6%AD%A5%E6%97%B6%E9%97%B4.pdf)
- [linuxバッテリー管理.pdf](linux%E7%94%B5%E6%B1%A0%E7%AE%A1%E7%90%86.pdf)