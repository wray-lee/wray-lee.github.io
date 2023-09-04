---
title: iptables
date: 2023-09-04 21:48:57
---
# iptables

```shell
iptables -A (FORWARD/INPUT/OUTPUT/POSTROUTING)模式 -i 入口 -o 出口 -t nat -j MASQUERADE(自动选择nat模式)
```





```bash
sysctl -w net.ipv4.conf.all.forwarding=1
sysctl -w net.ipv6.conf.all.forwarding=1
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
iptables -t mangle -A POSTROUTING -p tcp --tcp-flags SYN,RST SYN -j TCPMSS --clamp-mss-to-pmtu
ip6tables -t mangle -A POSTROUTING -p tcp --tcp-flags SYN,RST SYN -j TCPMSS --clamp-mss-to-pmtu
```



## Bridge

```bash
ip link add taps_bridge type bridge
ip link set taps_bridge up
ip address add $SERVER_IP6/64 dev taps_bridge
ip address add $SERVER_LOCAL_IP/16 dev taps_bridge
```



