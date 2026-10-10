---
title: zerotier forwarding (iptables configuration)
date: 2023-09-04 00:00:00
tags: ["Network", "组网"]
lang: en
slug: zerotier转发(iptables配置)
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

# Layer 3 Network NAT Configuration Method (Linux Host)

- Assume that the ZeroTier virtual LAN subnet is 192.168.192.0, LAN A is 192.168.1.0, and LAN B is 192.168.2.0
- (If interconnection is required) In LAN A and LAN B, there must be one host each with ZeroTier installed, serving as the gateway for interconnection between the two internal networks
- They are respectively 192.168.1.10 (192.168.192.10) and 192.168.2.10 (192.168.192.20) # The IP addresses in the parentheses are the virtual LAN IP addresses

## 1. In the networks on the ZeroTier website, under Managed Routes, configure the routing table and add the following content

```crystal
#如果单向连接,仅需填写下方一个即可.

#本地网络段 via 远端ZeroTier IP

192.168.1.0/24 via 192.168.192.10

192.168.2.0/24 via 192.168.192.20
```

## 2. Enable kernel forwarding

```typescript
echo "net.ipv4.ip_forward = 1" >> /etc/sysctl.conf
#与zt以外网卡互通
zerotier-cli set [zt网络号] allowGlobal=1
zerotier-cli set [zt网络号] allowDefault=1

sysctl -p
```

## 3. Firewall settings

```bash
sudo iptables -A FORWARD -i ztly53odaw -o eth0 -j ACCEPT
sudo iptables -A FORWARD -i eth0 -o ztly53odaw -m state --state RELATED,ESTABLISHED -j ACCEPT
#或
#sudo iptables -A FORWARD -i eth0 -o ztly53odaw -j ACCEPT
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE	#不中断原始流量下路由流量

iptables-save
```

[Reference: Route between ZeroTier and Physical Networks - ZeroTier Knowledge Base - Confluence (atlassian.net)![icon-default.png?t=M5H6](https://csdnimg.cn/release/blog_editor_html/release2.1.4/ckeditor/plugins/CsdnLink/icons/icon-default.png?t=M5H6)https://zerotier.atlassian.net/wiki/spaces/SD/pages/224395274/Route+between+ZeroTier+and+Physical+Networks](https://zerotier.atlassian.net/wiki/spaces/SD/pages/224395274/Route+between+ZeroTier+and+Physical+Networks)

```bash
#物理网卡 eth0;

#ZeroTier虚拟网卡 zt7nnig26

#你可以在路由器ssh环境中用 ifconfig 查询

#ZeroTier一般以zt开头

#可以根据IP地址判断

sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

sudo iptables -A FORWARD -i eth0 -o ztly53odaw -m state --state RELATED,ESTABLISHED -j ACCEPT

# state 报错的话用这个

#sudo iptables -A FORWARD -i eth0 -o ztly53odaw -j ACCEPT

sudo iptables -A FORWARD -i ztly53odaw -o eth0 -j ACCEPT

iptables-save #保存配置到文件,否则重启规则会丢失.

#sudo 看系统, 不一定要带
```

---

# Handling for old ZeroTier “cannot bind local interface port” or inability to connect to the network

```bash
killall -9 zerotier-one //杀死zerotier所有进程
netstat -lp | grep zero //查看9993端口是否被占用
zerotier-one -d //启动zerotier客户端
zerotier-cli listnetworks //列出连接的zerotier网络
#旧版orbit无法使用则用生成的签名放入moons.d
看到status这一项为ACCESS_DENIED说明端口绑定成功
```