---
title: v2raya_rules
date: 2023-02-10 20:30:34
tags: ["web"]
lang: en
slug: v2raya_rules
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

#example doc: https://www.v2ray.com/chapter_02/03_routing.html

default: proxy
# write your own rules below

#customized
domain(domain:mail.qq.com)->direct
domain(domain:www.mymypic.net,contains:deepl)->proxy
domain(contains:uestc)->direct
domain(domain:ppy.sh)->proxy

#default
domain(contains:github,contains:google,contains:gmail) -> proxy
domain(geosite:category-ads) -> block
domain(geosite:category-ads-all) -> block
domain(geosite:google-scholar)->proxy
domain(geosite:category-scholar-cn)->direct
domain(geosite:geolocation-!cn, geosite:google)->proxy
domain(geosite:cn)->direct
ip(geoip:hk,geoip:mo)->proxy
ip(geoip:private, geoip:cn)->direct
#

## Attachments

- [Clash .NET 1.2.8.zip](Clash%20.NET%201.2.8.zip)
- [Clash.NET.1.2.8.x64.7z](Clash.NET.1.2.8.x64.7z)