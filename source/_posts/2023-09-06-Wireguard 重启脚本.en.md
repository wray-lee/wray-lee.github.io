---
title: WireGuard Restart Script
date: 2023-09-06 17:20:19
tags: ["Windows"]
lang: en
slug: Wireguard 重启脚本
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

# WireGuard Restart Script

```powershell
$profileName = ""
$servicesName = "WireGuardTunnel`$$profileName"

$log = wireguard.exe /dumplog | Select-String -Pattern $profileName | Select-Object -Last 10 | Select-String -Pattern retrying
if ($log.Length -gt 3) {
Write-Output $log
Stop-Service $servicesName
Start-Sleep -Seconds 5
Start-Service $servicesName
}
```

## Attachments

- [Group3.7z](Group3.7z)