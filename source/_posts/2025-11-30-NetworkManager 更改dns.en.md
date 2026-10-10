---
title: NetworkManager Change DNS
date: 2025-11-30 03:24:59
tags: ["linux"]
lang: en
slug: NetworkManager 更改dns
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

# NetworkManager Change DNS
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

## Attachments

- [linux sync time.pdf](linux%E5%90%8C%E6%AD%A5%E6%97%B6%E9%97%B4.pdf)
- [linux battery management.pdf](linux%E7%94%B5%E6%B1%A0%E7%AE%A1%E7%90%86.pdf)