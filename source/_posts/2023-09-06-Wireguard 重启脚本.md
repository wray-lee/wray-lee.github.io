---
title: "Wireguard 重启脚本"
date: 2023-09-06 17:20:19
tags: ["Windows"]
---

# Wireguard 重启脚本

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

## 附件

- [Group3.7z](Group3.7z)
