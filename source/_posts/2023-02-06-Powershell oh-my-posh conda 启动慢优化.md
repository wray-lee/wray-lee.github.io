---
title: "Powershell oh-my-posh conda 启动慢优化"
date: 2023-02-06 21:25:26
tags: ["Windows"]
---

# Powershell oh-my-posh+conda 启动慢优化

如果装了 conda ，conda init powershell 后大概会拖慢一秒左右启动时间，可以在你 powershell 的`$profile` 同级目录下的 `profile.ps1`里注释掉启动 conda 那个语句，然后自己设个 alias ，用 conda 时手动激活

## 附件

- [Group3.7z](Group3.7z)
