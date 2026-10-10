---
title: "Google QuickShare for Windows登录失败解决"
date: 2025-12-03 13:45:29
tags: ["android"]
---

# Google QuickShare for Windows登录失败解决

```log
E1203 04:38:00.255539   24248 http_loader.cc:303] Failed to send request to remote web server with error 12057.
E1203 04:38:00.255676   24248 http_client_impl.cc:54] ... status FAILED_PRECONDITION: 0
```

因为证书是否吊销信息验证失败



## 解决

Win + R -> inetcpl.cpl -> 高级 ->安全

**取消勾选：**

- 检查服务器证书吊销
- 检查发行商的证书是否吊销