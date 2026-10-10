---
title: Powershell oh-my-posh conda slow startup optimization
date: 2023-02-06 21:25:26
tags: ["Windows"]
lang: en
slug: Powershell oh-my-posh conda 启动慢优化
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

# PowerShell oh-my-posh + conda Slow Startup Optimization

If you have conda installed, after `conda init powershell` it will roughly slow down startup by about one second. You can comment out the statement that starts conda in `profile.ps1` under the same directory as your PowerShell's `$profile`, then set an alias yourself, and manually activate it when using conda.

## Attachments

- [Group3.7z](Group3.7z)