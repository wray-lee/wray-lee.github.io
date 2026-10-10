---
title: Openwrt-Wray-Win
date: 2026-06-11 17:39:50
tags: ["linux"]
lang: ja
slug: Openwrt-Wray-Win
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

# Openwrt

## 定時再起動

`* * * * * sleep 70 && touch /etc/banner && reboot`

`sleep 70` 再起動後のタイムスタンプ検証が同一になり、繰り返し再起動されるのを回避

`touch /etc/banner` ログイン記録をクリアし、同時にtouchしてルーターが適時にNTPを行えず時刻検証が発生するのを避ける。ルーター時刻を再起動時の時刻に設定し、`touch`ファイルにより、再起動後の時刻（NTP前）をファイルの最終変更時刻にする

## Luciクラッシュ

uhttpdが原因

```bash
opkg list-installed | grep libustream
opkg remove libustream-openssl20201210
wget https://mirror.nju.edu.cn/immortalwrt/releases/24.10-SNAPSHOT/packages/aarch64_cortex-a53/base/libus
tream-mbedtls20201210_2024.07.28~99bd3d2b-r1_aarch64_cortex-a53.ipk

opkg install libustream-mbedtls
```

## dnsmasq転送

```yaml
# DHCP/DNS ->常规->所有服务器 
√

# DHCP/DNS -> 转发 -> DNS转发
127.0.0.1#1053

# DHCP/DNS -> 限制 -> DNS 查询缓存的大小
0

# 重启dnsmasq
/etc/init.d/dnsmasq restart
```

## 再起動後にネットワークがない

特定のCPUアーキテクチャ（一部のMediaTek、Realtekソリューション、または古いx86 NICなど）では、OpenWrtのオープンソースドライバは完全ではありません。システムのソフト再起動時に、NICチップへリセット（Reset）命令を正常に送信できません。

```bash
#/etc/rc.local

# 延迟 10 秒等待系统其它组件加载完毕
sleep 10
# 强制重启一次网络服务
/etc/init.d/network restart
/etc/init.d/firewall reload
```

## IPv6 NAT

```bash
uci set network.wan6.sourcefilter='0'
uci commit network
ip6tables -t nat -I POSTROUTING -s fc00::/7 -j MASQUERADE 2>/dev/null
nft add rule inet fw4 srcnat ip6 saddr fc00::/7 masquerade 2>/dev/null

/etc/init.d/network restart
/etc/init.d/firewall restart
```

## インターフェース再起動

主にZeroTierなどのNATトラバーサルが通らない場合に使用（WANポートの起動が遅い）

`/etc/hotplug.d/iface/99-zerotier`

```
#!/bin/sh

if [ "$ACTION" = "ifup" ] && [ "$INTERFACE" = "wan" ]; then

    logger -t zerotier-hotplug "WAN interface is up, syncing network states for ZeroTier..."
    
    killall zerotier-one 2>/dev/null
    /etc/init.d/zerotier restart
    /etc/init.d/firewall restart
    
fi
```

## インターフェース別ルーティング

### 外部アクセスを保持

ルーティングテーブルを作成（登録名をファイルに書き込む必要がある場合）

`echo "101 pppoe" >> /etc/iproute2/rt_tables`

```bash
# /etc/rc.local



ip rule add from $(ifconfig pppoe-wan | grep 'inet addr' | awk -F: '{print $2}' | awk '{print $1}') table pppoe
ip route add default dev pppoe-wan table pppoe
```

### IPをインターセプト

直接インターフェースにバインドすると、他のNAT越えインターフェースが異常になる

```bash
# /etc/config/network
config rule
    option src '10.17.1.200'
    option lookup 'main'
    option suppress_prefixlength '0'   # 核心：如果主表匹配到的是 0.0.0.0/0（外网），则判定无效并跳过
    option priority '10'

# 1. 对应你的命令：ip rule add from 10.17.1.200 table 20
config rule
    option src '10.17.1.200'
    option lookup '20'
    option priority '20'

# 2. 对应你的命令：ip route add default dev pppoe-wan table 20
config route
    option interface 'wan2'       # ⚠️注意：这里必须填你在 OpenWrt 里的【逻辑接口名】
    option target '0.0.0.0'
    option netmask '0.0.0.0'
    option table '20'
```

### bashスクリプト

on

```bash
#!/bin/sh

addr="192.168.1.100"
# 清理可能存在的残留
ip rule del from $addr pref 100 2>/dev/null
ip route flush table 100 2>/dev/null

# 建立专属路由表并指向 PPPoE 接口（假设接口名为 pppoe-wan）
ip route add default dev pppoe-wan table 100

# 拦截主机 IP 导向该路由表
ip rule add from $addr pref 100 table 100

echo "Game NAT Enabled (PPPoE)"
```

off

```bash
#!/bin/sh

addr="192.168.1.100"
# 销毁拦截规则
ip rule del from $addr pref 100 2>/dev/null

# 清空专属路由表
ip route flush table 100 2>/dev/null

# 停止现有连接
#conntrack -D -s $addr >/dev/null 2>&1

echo "Game NAT Disabled (DS-Lite)"
```

## IPv6 マルチWAN設定

### v4

`* * * * * /root/failover.sh`

```bash
#!/bin/sh

# 1. 填入你的乐天 DS-Lite 接口名称
IFACE_RAK="dslite"

# 2. 测试连通性的目标 IP（Google DNS）
TEST_IP="8.8.8.8"

# 强制使用乐天接口发送 3 个探测包
ping -c 3 -W 2 -I $IFACE_RAK $TEST_IP >/dev/null 2>&1

if [ $? -eq 0 ]; then
    # 【乐天存活】：恢复/保持乐天的默认路由（跃点 10）
    # 如果路由已存在，命令会静默失败，对系统零消耗
    ip route add default dev $IFACE_RAK metric 10 2>/dev/null
else
    # 【乐天断网】：拔掉乐天的默认路由
    # 此时系统的底层路由表只剩下跃点为 20 的公寓网，流量瞬间切换
    ip route del default dev $IFACE_RAK metric 10 2>/dev/null
fi
```

### v6

`* * * * * /root/failover_v6.sh`

```bash
#!/bin/sh

# ================= 配置区 =================
IFACE_RAK="wan6"                 # 乐天光 IPv6 接口名（或者是 pppoe-wan / dslite，根据实际获取到240开头的接口填）
TEST_IP="2001:4860:4860::8888"   # Google 公共 DNS IPv6 节点
# ==========================================

# 1. 动态抓取乐天光当前的 IPv6 网关
GW=$(ip -6 route show default dev "$IFACE_RAK" | awk '/via/ {print $3; exit}')

# 如果连网关都拿不到，说明物理层彻底断开，直接切除路由，回落到公寓网
if [ -z "$GW" ]; then
    ip -6 route del default dev "$IFACE_RAK" 2>/dev/null
    exit 0
fi

# 2. 核心锚点：建立一条只属于探针的静态主机路由，防止删除默认路由后无法探测外网
ip -6 route add "$TEST_IP" via "$GW" dev "$IFACE_RAK" metric 1 2>/dev/null

# 3. 强制通过固定宿主路径向外发射 3 个探测包
ping6 -c 3 -W 2 "$TEST_IP" >/dev/null 2>&1

if [ $? -eq 0 ]; then
    # 【乐天光 IPv6 正常】：将其默认路由以高优先级（metric 10）强行注入（如果已存在则静默跳过）
    ip -6 route add default via "$GW" dev "$IFACE_RAK" metric 10 2>/dev/null
else
    # 【乐天光 IPv6 断流】：精准切除乐天光的默认路由
    # 此时主路由表只剩下公寓网的默认路由（metric 20），流量瞬间无缝转移
    ip -6 route del default via "$GW" dev "$IFACE_RAK" 2>/dev/null
fi
```

## インターネットからのアクセス

ルーター自身のサービスは通信ルールでインバウンドを設定する

サブネット内のサービスはポート転送で転送を設定する

サブネットのグローバルIPv6を外部公開したい場合は通信ルールを設定する

### グローバルIPv6をサブネットに割り当てる（/64 PDのみの場合に必要）

> `/64` は最小の物理ブロードキャストドメイン（subnet）であり、つまり /64 はネットワークノードが直接通信するもの（NDPに応答、同一リンク on-link）と見なされるため、NDPプロキシが必要
>
> `/60 /56` などのより大きな範囲はデフォルトでルーティング可能で、転送できる
>
> 転送状態は next-hop、終点状態は on-link

wan6でDHCPサーバーを有効化：指定された主インターフェースを有効化し、RA、DHCP、NDPをすべて中継に変更

lan v6設定：RA、DHCP、NDPをすべて中継に変更

> グローバルIPv6を1つだけ使用する場合、ファイアウォールのwan内の詳細設定でIPv6マスカレード（NAT66）を有効化

## ルートトレース

```bash
nft add rule inet fw4 prerouting ip daddr 10.0.0.97 meta nftrace set 1
nft monitor trace
```