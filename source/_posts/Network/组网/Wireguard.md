---
title: Wireguard
date: 2023-09-04 21:48:57
---
# Wireguard

> Config Template

```shell
[Interface]
Address = 10.77.0.1/24,fd77:77:77::1/64
ListenPort = 59831
PrivateKey = ODS9kt3XxBgo0KfVXb6XEPqsSaEOtBOL915l7LLtwEY=
PostUp = iptables -I INPUT -p udp --dport 59831 -j ACCEPT
PostUp = iptables -I FORWARD -i eth0 -o wraywg -j ACCEPT
PostUp = iptables -I FORWARD -i wraywg -j ACCEPT
PostUp = iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostUp = ip6tables -I FORWARD -i wraywg -j ACCEPT
PostUp = ip6tables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D INPUT -p udp --dport 59831 -j ACCEPT
PostDown = iptables -D FORWARD -i eth0 -o wraywg -j ACCEPT
PostDown = iptables -D FORWARD -i wraywg -j ACCEPT
PostDown = iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
PostDown = ip6tables -D FORWARD -i wraywg -j ACCEPT
PostDown = ip6tables -t nat -D POSTROUTING -o eth0 -j MASQUERADE


### Client wray-win
[Peer]
PublicKey = HwUbJ5U2q6xBugfAlH4h/k8cCwSVk6IYnSdC2rEhRSY=
PresharedKey = oRkrgeKD0YbRPvb+EdTQc657s2vEImo+IqJT31MN+m4=
AllowedIPs = 10.77.0.2/32,fd77:77:77::2/128

### Client wray-arch
[Peer]
PublicKey = LjrmgkjWVFBYSASXLYQbw3Kg6Qffc8CeIyIf4vvQbRY=
PresharedKey = 6vtre1Y1/BuC3kqc9cBDcR7y+FK/HDxnnhQtdf9qgWs=
AllowedIPs = 10.77.0.3/32,fd77:77:77::3/128

### Client starstudiofdr
[Peer]
PublicKey = OYToCgnrLC8zE3hSAFBXCo4Gqg437Ll40gRX7+CKswQ=
PresharedKey = QqI86bY4Q3XraFpli/pNKX+QBKjsF2y9YON5OpnolpA=
AllowedIPs = 10.77.0.4/32,fd77:77:77::4/128
```



## Start

`systemctl start wg-quick@[insteface]`	/	`wg-quick up [interface]`

### autostart

`systemctl enable wg-quick@[interface]`



## Proxy

```shell
PostUp = iptables -A FORWARD -i wraywg -j ACCEPT; iptables -t nat -A POSTROUTING -o ens18 -j MASQUERADE; 
ip6tables -A FORWARD -i wraywg -j ACCEPT; 
ip6tables -t nat -A POSTROUTING -o ens18 -j MASQUERADE # Add forwarding when VPN is started
PostDown = iptables -D FORWARD -i wraywg -j ACCEPT; 
iptables -t nat -D POSTROUTING -o ens18 -j MASQUERADE; 
ip6tables -D FORWARD -i wraywg -j ACCEPT; 
ip6tables -t nat -D POSTROUTING -o ens18 -j MASQUERADE # Remove forwarding when VPN is shutdown
```

