---
title: openwrt_luci-frp
date: 2026-06-01 16:53:59
tags: ["web"]
lang: ja
slug: openwrt_luci-frp
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

## Frpc

`/usr/lib/lua/luci/model/cbi/frp/basic.lua`

Protocol Typeまたはprotocolを検索します。ここはfrpc画面のプロトコル選択に対応しており、quicプロトコルを追加します。変更後は以下のとおりです。ご参考までに：

```js
e = t:taboption("other", ListValue, "protocol", translate("protocol Type"))
e.description = translate("Frp support kcp protocol since v0.12.0")
e.default = "tcp"
e:value("tcp", translate("TCP Protocol"))
e:value("kcp", translate("KCP Protocol"))
e:value("quic", translate("QUIC Protocol"))
```



## Frps

`/usr/lib/lua/luci/model/cbi/frps/server.lua`

```js
o = option(Value, "quic_bind_port", translate("QUIC bind port"))
o.description = translatef("Optional: udp port to help make udp hole to penetrate nat")
o.datatype = "port"
```