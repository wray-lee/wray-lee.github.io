---
title: openwrt_luci-frp
date: 2026-06-01 16:53:59
tags: ["web"]
lang: en
slug: openwrt_luci-frp
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

## Frpc

`/usr/lib/lua/luci/model/cbi/frp/basic.lua`

Search for Protocol Type or protocol. This corresponds to the protocol selection on the frpc interface. Add a QUIC protocol. After modification, it is as follows, for reference:

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