---
title: "Kdewallet使用浏览器请求密码解决"
date: 2023-04-22 21:59:51
tags: ["linux"]
---

# Kdewallet使用浏览器请求密码解决

`vim ~/.config/kwalletrc`

```shell
[Auto Deny]
kdewallet=Chromium
```

如果没有配置文件

`sudo pacman -S kwalletmanager`

## 附件

- [linux同步时间.pdf](linux%E5%90%8C%E6%AD%A5%E6%97%B6%E9%97%B4.pdf)
- [linux电池管理.pdf](linux%E7%94%B5%E6%B1%A0%E7%AE%A1%E7%90%86.pdf)
