---
title: OpenWrt change MAC
date: 2026-06-07 18:12:16
tags: ["linux"]
lang: en
slug: Openwrt更改mac
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

# OpenWrt Change MAC

## LAN MAC

```bash
# /etc/config/network
...
config device
	...
	option macaddr '00:00:00:91:BE:F0'
...
```



## BSSID (WiFi MAC)

> Depending on the driver, in addition to the device vendor, you can also check
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

### Standard driver (mac80211) (Qualcomm devices)

```bash
# /etc/config/wireless
...
config wifi-iface ...
	...
	option macaddr '00:00:01:91:BE:F0'
...
```

### Proprietary driver (wl Broadcom, MTK MediaTek)

```bash
# /etc/config/wireless
...
config wifi-device ...
	...
	option macaddr '00:00:01:91:BE:F0'
...	
```





JDCloud RE-CP-03: `00:00:00:91:BE:F1`