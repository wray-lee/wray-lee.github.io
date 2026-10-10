---
title: PowerShellの権限昇格
date: 2026-01-24 18:56:24
tags: ["Windows"]
lang: ja
slug: powershell提权
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

# powershell権限昇格

```powershell
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    # 如果不是管理员，重新以管理员身份启动本脚本
    $processInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processInfo.FileName = "powershell.exe"
    # 注意：这里使用 $PSCommandPath 获取当前脚本的绝对路径
    $processInfo.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    $processInfo.Verb = "RunAs"
    [System.Diagnostics.Process]::Start($processInfo) | Out-Null
    Exit # 退出当前的普通权限进程
}
```