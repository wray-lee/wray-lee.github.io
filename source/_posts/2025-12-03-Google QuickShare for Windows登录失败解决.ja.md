---
title: Google QuickShare for Windows ログイン失敗の解決
date: 2025-12-03 13:45:29
tags: ["android"]
lang: ja
slug: Google QuickShare for Windows登录失败解决
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

# Google QuickShare for Windows ログイン失敗の解決

```log
E1203 04:38:00.255539   24248 http_loader.cc:303] Failed to send request to remote web server with error 12057.
E1203 04:38:00.255676   24248 http_client_impl.cc:54] ... status FAILED_PRECONDITION: 0
```

証明書の失効ステータス情報の検証に失敗したため



## 解決

Win + R -> inetcpl.cpl -> 詳細設定 -> セキュリティ

**チェックを外す：**

- サーバー証明書の失効を確認する
- 発行元の証明書の失効を確認する