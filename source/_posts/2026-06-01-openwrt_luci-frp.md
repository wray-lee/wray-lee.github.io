---
title: "openwrt_luci-frp"
date: 2026-06-01 16:53:59
tags: ["web"]
---

## Frpc

`/usr/lib/lua/luci/model/cbi/frp/basic.lua`

搜索Protocol Type或是protocol，这里是对应frpc界面上的协议选择，增加一个quic的协议，修改后如下，供参考：

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