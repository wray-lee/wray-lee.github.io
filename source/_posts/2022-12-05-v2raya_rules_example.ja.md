---
title: v2raya_rules_example
date: 2022-12-05 23:08:42
tags: ["web"]
lang: ja
slug: v2raya_rules_example
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

# customize inbound. we support http, socks
# インバウンド inbound をカスタマイズ、http, socks に対応
inbound:httpauthin=http(address: 0.0.0.0, port: 1081, user: user1, pass: user1pass, user:user2, pass:user2pass)
inbound:socksauthin=socks(address: 0.0.0.0, port: 1082, user: 123, pass: 123)
inbound:sockslocalin=socks(address: 127.0.0.1, port: 1080)

# customize outbound. we support http,socks,freedom
# アウトバウンド outbound をカスタマイズ、http, socks, freedom に対応
outbound:httpout=http(address: 127.0.0.1, port: 8080, user: 'my-username', pass: 'my-password')
outbound:socksout=socks(address: 127.0.0.1, port: 10800, user: "my-username", pass: "my-password")
outbound:special=freedom(domainStrategy: AsIs, redirect: "127.0.0.1:3366", userLevel: 0)

# set default outbound. unsetting it means proxy (this option only applies to preset inbounds)
# デフォルト outbound を設定、設定しない場合は proxy がデフォルト （このオプションはデフォルトのインバウンドにのみ適用されます）
default: httpout

# proxy, block and direct are preset outbounds
# プリセットされた3つの outbounds: proxy, block, direct

# domain rule
# ドメインルール
domain(domain: v2raya.mzz.pub) -> socksout
domain(full: dns.google) -> proxy
domain(contains: facebook) -> proxy
domain(regexp: \.goo.*\.com$) -> proxy
domain(geosite:category-ads) -> block
domain(geosite:cn)->direct

# target IP rule
# 宛先IPルール
ip(8.8.8.8) -> direct
ip(101.97.0.0/16) -> direct
ip(geoip:private) -> direct

# source IP rule
# 送信元IPルール
source(192.168.0.0/24) -> proxy
source(192.168.50.0/24) -> direct

# target port rule
# 宛先ポートルール
port(80) -> direct
port(10080-30000) -> direct

# source port rule
# 送信元ポートルール
sourcePort(38563) -> direct
sourcePort(10080-30000) -> direct

# multiple domains
# 複数ドメインルール
domain(contains: google, domain: www.twitter.com, domain: mzz.pub) -> proxy
# multiple IPs
# 複数IPルール
ip(geoip:cn, geoip:private) -> direct
ip(9.9.9.9, 223.5.5.5) -> direct
source(192.168.0.6, 192.168.0.10, 192.168.0.15) -> direct

# inbound rule
# inbound インバウンドルール
inboundTag(httpauthin, socksauthin) -> direct
inboundTag(sockslocalin) -> special

# AND rule
# 同時に満たすルール
ip(geoip:cn) && port(80) && user(mzz2017@tuta.io) -> direct
ip(8.8.8.8) && network(tcp, udp) && port(1-1023, 8443) -> proxy
ip(1.1.1.1) && protocol(http) && source(10.0.0.1, 172.20.0.0/16) -> direct

## 附件

- [Clash .NET 1.2.8.zip](Clash%20.NET%201.2.8.zip)
- [Clash.NET.1.2.8.x64.7z](Clash.NET.1.2.8.x64.7z)