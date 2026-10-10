---
title: "Openwrt更改mac"
date: 2026-06-07 18:12:16
tags: ["linux"]
---

# Openwrt更改mac

## LAN MAC

```bash
# /etc/config/network
...
config device
	...
	option macaddr '00:00:00:91:BE:F0'
...
```



## BSSID(wifi mac)

> 根据驱动不同，除了设备厂商，还可以看
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

### 标准驱动（mac80211）(高通设备)

```bash
# /etc/config/wireless
...
config wifi-iface ...
	...
	option macaddr '00:00:01:91:BE:F0'
...
```

### 私有驱动（wl博通, mtk联发科）

```bash
# /etc/config/wireless
...
config wifi-device ...
	...
	option macaddr '00:00:01:91:BE:F0'
...	
```





JDCloud RE-CP-03: `00:00:00:91:BE:F1`