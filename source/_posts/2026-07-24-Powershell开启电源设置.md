---
title: "Powershell开启电源设置"
date: 2026-07-24 00:32:19
tags: ["Windows"]
---

```powershell
powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61

Get-ChildItem -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Power\PowerSettings" -Recurse | ForEach-Object { Set-ItemProperty -Path $_.PSPath -Name "Attributes" -Value 2 -ErrorAction SilentlyContinue }
```



处理器能量性能
处理器性能核心休眠最小核心数
链接状态电源管理
USB 选择性暂停





## 只开启常用设置

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

处理器性能提升模式 `be337238-...`
这个最关键，不是超频，是管睿频策略的：

| 值   | 模式                 | 效果                             |
| ---- | -------------------- | -------------------------------- |
| 0    | Disabled             | 不睿频，锁基频，最凉最省电       |
| 1    | Enabled              | 标准睿频，需要才提速             |
| 2    | Aggressive           | 只要有负载就拉满睿频             |
| 3    | Efficient Enabled    | 会睿频但优先省电                 |
| 4    | Efficient Aggressive | 省电前提下尽量睿频               |
| 5/6  | At Guaranteed        | 在保证基频之上额外精确提速的版本 |



处理器能效偏好 `36687f9e-...`
0-100的滑块，0=性能，100=省电。直接决定CPU多激进。

核心休眠 `0cc5b647...` 最小 / `ea062031...` 最大
填百分比。100=永不休眠，延迟最低，0=随便休眠，省电但切程序会卡一下。

控制台锁定显示超时 `8EC4B3A5...` / 无人参与睡眠 `7bc4a2f9...`
这两个是Windows最坑的隐藏项。你明明设了从不睡眠，锁屏2分钟还是黑屏休眠，就是 `System unattended sleep timeout` 默认120秒在作怪。

AHCI HIPM/DIPM `0b2d69d7...`
0=Active最快，1=HIPM，2=DIPM，3=HIPM+DIPM，4=Lowest最省电。SATA SSD/HDD才有效。

## 附件

- [bitlocker.zip](bitlocker.zip)
- [CCleaner_6.38.11537_Portable.7z](CCleaner_6.38.11537_Portable.7z)
- [color.7z](color.7z)
- [nfcTools(PCR532).7z](nfcTools(PCR532).7z)
- [WinX.zip](WinX.zip)
- [显示器颜色配置.7z](%E6%98%BE%E7%A4%BA%E5%99%A8%E9%A2%9C%E8%89%B2%E9%85%8D%E7%BD%AE.7z)
