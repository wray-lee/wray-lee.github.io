---
title: Google QuickShare for Windows login failure solution
date: 2025-12-03 13:45:29
tags: ["android"]
lang: en
slug: Google QuickShare for Windows登录失败解决
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

# Google QuickShare for Windows Login Failure Fix

```log
E1203 04:38:00.255539   24248 http_loader.cc:303] Failed to send request to remote web server with error 12057.
E1203 04:38:00.255676   24248 http_client_impl.cc:54] ... status FAILED_PRECONDITION: 0
```

Because certificate revocation information verification failed



## Solution

Win + R -> inetcpl.cpl -> Advanced -> Security

**Uncheck:**

- Check for server certificate revocation
- Check for publisher's certificate revocation