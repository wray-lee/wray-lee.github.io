---
title: OpenWrtのMACを変更
date: 2026-06-07 18:12:16
tags: ["linux"]
lang: ja
slug: Openwrt更改mac
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

# OpenWrt MAC変更

## LAN MAC

```bash
# /etc/config/network
...
config device
	...
	option macaddr '00:00:00:91:BE:F0'
...
```



## BSSID（Wi-Fi MAC）

> ドライバによって異なりますが、デバイスメーカー以外に、以下も確認できます
>
> ```bash
> config wifi-device ...
> 	option type 'mac80211' # 标准驱动
> ```
>
> ```bash
> config wifi-device ...
> 	option type 'mt_dbdc' # 联发科私有驱动
> ```
>
> 

### 標準ドライバ（mac80211）（Qualcomm デバイス）

```bash
# /etc/config/wireless
...
config wifi-iface ...
	...
	option macaddr '00:00:01:91:BE:F0'
...
```

### プロプライエタリドライバ（wl Broadcom、mtk MediaTek）

```bash
# /etc/config/wireless
...
config wifi-device ...
	...
	option macaddr '00:00:01:91:BE:F0'
...	
```





JDCloud RE-CP-03: `00:00:00:91:BE:F1`