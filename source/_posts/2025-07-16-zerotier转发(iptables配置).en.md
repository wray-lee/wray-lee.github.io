---
title: ZeroTier Forwarding (iptables configuration)
date: 2025-07-16 03:16:06
tags: ["web"]
lang: en
slug: zerotier转发(iptables配置)
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

# Network Three-Layer NAT Configuration Method (Linux Host)

- Assume the ZeroTier virtual LAN subnet is 192.168.192.0, LAN A is 192.168.1.0, LAN B is 192.168.2.0
- (If interconnection is required) One host in each of LAN A and LAN B needs to have ZeroTier installed and serve as the gateway for interconnecting the two internal networks
- Respectively 192.168.1.10 (192.168.192.10) and 192.168.2.10 (192.168.192.20) #The IP addresses in parentheses are the virtual LAN IP addresses

## 1. On the [zerotier](https://so.csdn.net/so/search?q=zerotier&spm=1001.2101.3001.7020) website, under Managed Routes in networks, configure the routing table and add the following content

```crystal
#如果单向连接,仅需填写下方一个即可.



#本地网络段 via 远端ZeroTier IP



192.168.1.0/24 via 192.168.192.10 



192.168.2.0/24 via 192.168.192.20 
```

## 2. Enable Kernel Forwarding

```typescript
echo "net.ipv4.ip_forward = 1" >> /etc/sysctl.conf
echo "net.ipv4.conf.all.src_valid_mark=1" >> /etc/sysctl.conf
echo "net.ipv6.conf.all.forwarding = 1" >> /etc/sysctl.conf
echo "net.ipv6.conf.default.forwarding = 1" >> /etc/sysctl.conf

#与zt以外网卡互通
zerotier-cli set [zt网络号] allowGlobal=1
zerotier-cli set [zt网络号] allowDefault=1


sysctl -p
```

## 3. Firewall Settings

```shell
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

# Handling of Old Version ZeroTier "cannot bind local interface port" or Inability to Access the Network

```shell
killall -9 zerotier-one //杀死zerotier所有进程
netstat -lp | grep zero //查看9993端口是否被占用
zerotier-one -d //启动zerotier客户端
zerotier-cli listnetworks //列出连接的zerotier网络
#旧版orbit无法使用则用生成的签名放入moons.d
看到status这一项为ACCESS_DENIED说明端口绑定成功
```


```bash
netstat -anp | grep 9993 | awk -F ' ' '{len=split($7,arr,"/");for(i=1;i<len;i++){$7=arr[i];print $7}}' | xargs kill -9

netstat -anp | grep 9993 | awk '{len=split($NF,arr,"/");for(i=1;i<len;++i){$7=arr[i]};print $7}' | sed -n '1p' | xargs kill -9

```





# OpenWrt Configuration

```bash
uci set zerotier.global.enabled='1'
uci set zerotier.global.port='9993'
uci delete zerotier.earth
uci set zerotier.wraynet=network
uci set zerotier.wraynet.id=0cccb752f7005ee1
uci set zerotier.wraynet.config_path='/etc/zerotier'
uci set zerotier.wraynet.copy_config_path='1'
mkdir /etc/zerotier
cp -r /var/lib/zerotier-one/* /etc/zerotier/
uci commit zerotier
reboot

uci set zerotier.global.secret="$(cat /var/lib/zerotier-one/identity.secret)"
uci commit zerotier
zerotier-cli orbit ae86d77ff9 ae86d77ff9
cp -r /var/lib/zerotier-one/* /etc/zerotier/

# -->转到配置firewall
```





```bash
#/etc/config/zerotier
config zerotier 'global'
        option enabled '1'
        option secret ''

config network 'wraynet'
        option id '0cccb752f7005ee1'
        option allow_managed '1'
        option allow_global '0'
        option allow_default '0'
        option allow_dns '0'
```





## Firewall

```bash
uci add firewall rule
uci set firewall.@rule[-1].name='Allow-ZeroTier-Inbound'
uci set firewall.@rule[-1].src='*'
uci set firewall.@rule[-1].target='ACCEPT'
uci set firewall.@rule[-1].proto='udp'
uci set firewall.@rule[-1].dest_port='9993'
uci commit firewall

/etc/init.d/firewall restart
```



## Forward

```bash
# Create interface
uci set network.ZeroTier=interface
uci set network.ZeroTier.proto='none'
uci set network.ZeroTier.device='ztly53odaw' # Replace ztXXXXXXXX with your own ZeroTier interface name

# Create zone
uci add firewall zone
uci set firewall.@zone[-1].name='zt'
uci set firewall.@zone[-1].input='ACCEPT'
uci set firewall.@zone[-1].output='ACCEPT'
uci set firewall.@zone[-1].forward='ACCEPT'
uci set firewall.@zone[-1].masq='1'
uci set firewall.@zone[-1].masq6='1'
uci add_list firewall.@zone[-1].network='ZeroTier'
uci add firewall forwarding
uci set firewall.@forwarding[-1].src='zt'
uci set firewall.@forwarding[-1].dest='lan'
uci add firewall forwarding
uci set firewall.@forwarding[-1].src='zt'
uci set firewall.@forwarding[-1].dest='wan'
uci add firewall forwarding
uci set firewall.@forwarding[-1].src='lan'
uci set firewall.@forwarding[-1].dest='zt'

# Commit changes
uci commit



/etc/init.d/firewall restart
```



At this point the ZT network can access the internal network. If the internal network needs to access ZT, configure a static route, with the source IP set to the router's ZT IP.

## Attachments

- [moon node setup.zip](moon%E8%8A%82%E7%82%B9%E8%AE%BE%E7%BD%AE.zip)
- [zerotier moon setup.pdf](zerotier%E6%90%AD%E5%BB%BAmoon.pdf)
- [zerotier configuration.pdf](zerotier%E9%85%8D%E7%BD%AE.pdf)