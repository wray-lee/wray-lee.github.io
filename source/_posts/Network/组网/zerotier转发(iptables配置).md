---
title: zerotier转发(iptables配置)
date: 2023-09-04 21:48:57
---
# 网络三层NAT配置方法（linux主机）

- 假设zerotier虚拟局域网的网段是192.168.192.0 局域网A 192.168.1.0 局域网B 192.168.2.0
- (如果需要互联)在局域网A和B中需要各有一台主机安装zerotier并作为两个内网互联的网关
- 分别是192.168.1.10（192.168.192.10） 192.168.2.10（192.168.192.20）#括号里面为虚拟局域网的IP地址

## 1. 在[zerotier](https://so.csdn.net/so/search?q=zerotier&spm=1001.2101.3001.7020)网站的networks里面的Managed Routes下配置路由表,增加如下内容

```crystal
#如果单向连接,仅需填写下方一个即可.



#本地网络段 via 远端ZeroTier IP



192.168.1.0/24 via 192.168.192.10 



192.168.2.0/24 via 192.168.192.20 
```

## 2. 开启内核转发

```typescript
echo "net.ipv4.ip_forward = 1" >> /etc/sysctl.conf
#与zt以外网卡互通
zerotier-cli set [zt网络号] allowGlobal=1
zerotier-cli set [zt网络号] allowDefault=1


sysctl -p
```

## 3. 防火墙设置

```shell
sudo iptables -A FORWARD -i ztly53odaw -o eth0 -j ACCEPT
sudo iptables -A FORWARD -i eth0 -o ztly53odaw -m state --state RELATED,ESTABLISHED -j ACCEPT
#或
#sudo iptables -A FORWARD -i eth0 -o ztly53odaw -j ACCEPT
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE	#不中断原始流量下路由流量

iptables-save
```

[参考: Route between ZeroTier and Physical Networks - ZeroTier Knowledge Base - Confluence (atlassian.net)![icon-default.png?t=M5H6](https://csdnimg.cn/release/blog_editor_html/release2.1.4/ckeditor/plugins/CsdnLink/icons/icon-default.png?t=M5H6)https://zerotier.atlassian.net/wiki/spaces/SD/pages/224395274/Route+between+ZeroTier+and+Physical+Networks](https://zerotier.atlassian.net/wiki/spaces/SD/pages/224395274/Route+between+ZeroTier+and+Physical+Networks)

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

# 旧版zerotier "cannot bind local interface port"或无法接入网络处理

```shell
killall -9 zerotier-one //杀死zerotier所有进程
netstat -lp | grep zero //查看9993端口是否被占用
zerotier-one -d //启动zerotier客户端
zerotier-cli listnetworks //列出连接的zerotier网络
#旧版orbit无法使用则用生成的签名放入moons.d
看到status这一项为ACCESS_DENIED说明端口绑定成功
```



