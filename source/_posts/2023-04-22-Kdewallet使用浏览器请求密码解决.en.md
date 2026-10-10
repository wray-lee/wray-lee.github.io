---
title: Solution to Kdewallet requesting a password when using a browser
date: 2023-04-22 21:59:51
tags: ["linux"]
lang: en
slug: Kdewallet使用浏览器请求密码解决
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

# Solution to Kdewallet Requesting Password When Using Browser

`vim ~/.config/kwalletrc`

```shell
[Auto Deny]
kdewallet=Chromium
```

If there is no configuration file

`sudo pacman -S kwalletmanager`

## Attachments

- [linux time synchronization.pdf](linux%E5%90%8C%E6%AD%A5%E6%97%B6%E9%97%B4.pdf)
- [linux battery management.pdf](linux%E7%94%B5%E6%B1%A0%E7%AE%A1%E7%90%86.pdf)