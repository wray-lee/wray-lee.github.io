---
title: Wireguard 再起動スクリプト
date: 2023-09-06 17:20:19
tags: ["Windows"]
lang: ja
slug: Wireguard 重启脚本
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

# Wireguard 再起動スクリプト

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

## 添付ファイル

- [Group3.7z](Group3.7z)