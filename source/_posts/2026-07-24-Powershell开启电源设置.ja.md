---
title: PowerShellで電源設定を有効にする
date: 2026-07-24 00:32:19
tags: ["Windows"]
lang: ja
slug: Powershell开启电源设置
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

```powershell
powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61

Get-ChildItem -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Power\PowerSettings" -Recurse | ForEach-Object { Set-ItemProperty -Path $_.PSPath -Name "Attributes" -Value 2 -ErrorAction SilentlyContinue }
```



プロセッサのエネルギー パフォーマンス
プロセッサのパフォーマンス コア パーキングの最小コア数
リンク状態の電源管理
USB セレクティブ サスペンド





## よく使う設定のみを有効にする

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

プロセッサのパフォーマンス ブースト モード `be337238-...`
これが最も重要で、オーバークロックではなく、ターボ ブースト ポリシーを管理するものです：

| 値   | モード                 | 効果                             |
| ---- | -------------------- | -------------------------------- |
| 0    | Disabled             | ターボ ブーストなし、ベース周波数固定、最も低温で最も省電力       |
| 1    | Enabled              | 標準ターボ ブースト、必要なときだけ高速化             |
| 2    | Aggressive           | 負荷があればすぐターボ ブーストを最大まで引き上げる             |
| 3    | Efficient Enabled    | ターボ ブーストするが省電力を優先                 |
| 4    | Efficient Aggressive | 省電力を前提にできるだけターボ ブースト               |
| 5/6  | At Guaranteed        | 保証されたベース周波数を超えて追加の精密な高速化を行うバージョン |



プロセッサのエネルギー パフォーマンス設定 `36687f9e-...`
0～100 のスライダー。0 = 性能、100 = 省電力。CPU がどれだけ積極的になるかを直接決めます。

コア パーキング `0cc5b647...` 最小 / `ea062031...` 最大
パーセントを入力。100 = 一切休止しない、遅延最小、0 = 自由に休止、省電力だがアプリ切り替え時に一瞬引っかかる。

コンソール ロックの表示タイムアウト `8EC4B3A5...` / 無人参与スリープ `7bc4a2f9...`
この2つは Windows で最も厄介な隠し項目です。決してスリープしない設定にしたのに、画面をロックして2分でそれでも画面が黒くなってスリープするのは、`System unattended sleep timeout` の既定の120秒が原因です。

AHCI HIPM/DIPM `0b2d69d7...`
0 = Active が最速、1 = HIPM、2 = DIPM、3 = HIPM+DIPM、4 = Lowest が最も省電力。SATA SSD/HDD でのみ有効。

## 添付ファイル

- [bitlocker.zip](bitlocker.zip)
- [CCleaner_6.38.11537_Portable.7z](CCleaner_6.38.11537_Portable.7z)
- [color.7z](color.7z)
- [nfcTools(PCR532).7z](nfcTools(PCR532).7z)
- [WinX.zip](WinX.zip)
- [显示器颜色配置.7z](%E6%98%BE%E7%A4%BA%E5%99%A8%E9%A2%9C%E8%89%B2%E9%85%8D%E7%BD%AE.7z)