---
title: PowerShell privilege escalation
date: 2026-01-24 18:56:24
tags: ["Windows"]
lang: en
slug: powershell提权
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

# PowerShell Privilege Escalation

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