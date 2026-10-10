---
title: Enable power settings in PowerShell
date: 2026-07-24 00:32:19
tags: ["Windows"]
lang: en
slug: Powershell开启电源设置
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

```powershell
powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61

Get-ChildItem -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Power\PowerSettings" -Recurse | ForEach-Object { Set-ItemProperty -Path $_.PSPath -Name "Attributes" -Value 2 -ErrorAction SilentlyContinue }
```



Processor energy performance
Processor performance core parking minimum cores
Link State Power Management
USB selective suspend





## Only Enable Commonly Used Settings

```powershell
# 必须以管理员身份运行

# --- CPU 性能 ---
powercfg -attributes 54533251-82be-4824-96c1-47b60b740d00 be337238-0d82-4146-a960-4f3749d470c7 -ATTRIB_HIDE
powercfg -attributes 54533251-82be-4824-96c1-47b60b740d00 36687f9e-e3a5-4dbf-b1dc-15eb381c6863 -ATTRIB_HIDE
powercfg -attributes 54533251-82be-4824-96c1-47b60b740d00 0cc5b647-c1df-4637-891a-dec35c318583 -ATTRIB_HIDE
powercfg -attributes 54533251-82be-4824-96c1-47b60b740d00 ea062031-0e34-4ff1-9b6d-eb1059334028 -ATTRIB_HIDE
powercfg -attributes 54533251-82be-4824-96c1-47b60b740d00 75b0ae3f-bce0-45a7-8c89-c9611c25e100 -ATTRIB_HIDE
powercfg -attributes 54533251-82be-4824-96c1-47b60b740d00 5d76a2ca-e8c0-402f-a133-2158492d58ad -ATTRIB_HIDE

# --- 锁屏/睡眠 ---
powercfg -attributes 7516b95f-f776-4464-8c53-06167f40cc99 8EC4B3A5-6868-48c2-BE75-4F3044BE88A7 -ATTRIB_HIDE
powercfg -attributes 238C9FA8-0AAD-41ED-83F4-97BE242C8F20 7bc4a2f9-d8fc-4469-b07b-33eb785aaca0 -ATTRIB_HIDE
powercfg -attributes 238C9FA8-0AAD-41ED-83F4-97BE242C8F20 25dfa149-5dd1-4736-b5ab-e8a37b5b8187 -ATTRIB_HIDE

# --- 硬盘 ---
powercfg -attributes 0012ee47-9041-4b5d-9b77-535fba8b1442 0b2d69d7-a2a1-449c-9680-f91c70521c60 -ATTRIB_HIDE
powercfg -attributes 0012ee47-9041-4b5d-9b77-535fba8b1442 dab60367-53fe-4fbc-825e-521d069d2456 -ATTRIB_HIDE
powercfg -attributes 0012ee47-9041-4b5d-9b77-535fba8b1442 d639518a-e56d-4345-8af2-b9f32fb26109 -ATTRIB_HIDE
```

Processor performance boost mode `be337238-...`
This is the most critical one; it's not overclocking, it manages the Turbo Boost policy:

| Value | Mode | Effect |
| ---- | ---- | ---- |
| 0 | Disabled | No Turbo Boost, locks the base frequency, coolest and most power-efficient |
| 1 | Enabled | Standard Turbo Boost, speeds up only when needed |
| 2 | Aggressive | Ramps Turbo Boost to maximum whenever there is any load |
| 3 | Efficient Enabled | Will Turbo Boost but prioritizes power saving |
| 4 | Efficient Aggressive | Turbo Boosts as much as possible while saving power |
| 5/6 | At Guaranteed | Versions that provide additional precise speed boosts above the guaranteed base frequency |



Processor energy efficiency preference `36687f9e-...`
A 0-100 slider, 0 = performance, 100 = power saving. Directly determines how aggressive the CPU is.

Core parking `0cc5b647...` minimum / `ea062031...` maximum
Fill in a percentage. 100 = never park, lowest latency; 0 = park freely, saves power but switching programs may briefly stutter.

Console lock display off timeout `8EC4B3A5...` / Unattended sleep timeout `7bc4a2f9...`
These two are Windows' most troublesome hidden settings. Even if you set it to never sleep, the screen still goes black and sleeps after 2 minutes on the lock screen; it's `System unattended sleep timeout` defaulting to 120 seconds that's causing the problem.

AHCI HIPM/DIPM `0b2d69d7...`
0 = Active fastest, 1 = HIPM, 2 = DIPM, 3 = HIPM+DIPM, 4 = Lowest most power-saving. Only effective for SATA SSD/HDD.

## Attachments

- [bitlocker.zip](bitlocker.zip)
- [CCleaner_6.38.11537_Portable.7z](CCleaner_6.38.11537_Portable.7z)
- [color.7z](color.7z)
- [nfcTools(PCR532).7z](nfcTools(PCR532).7z)
- [WinX.zip](WinX.zip)
- [Display color configuration.7z](%E6%98%BE%E7%A4%BA%E5%99%A8%E9%A2%9C%E8%89%B2%E9%85%8D%E7%BD%AE.7z)