---
title: zerotier配置
date: 2023-09-04 21:48:57
---
# zerotier配置

## moon

```shell
cd /var/lib/zerotier-one	#定位到主机的密钥位置
sudo zerotier-idtool initmoon identity.public > moon.json	#生成moon配置
修改stableEndpoints参数	"主机ip/9993"	并保存推出
zerotier-idtool genmoon moon.json	#生成签名
mkdir moons.d
mv 00000*.moon moons.d/

最后复制签名文件到客户端
linux位于/var/lib/zerotier-one/moons.d	自行创建moons.d文件夹
windows位于C:\Programdata\zerotier\one\moons.d	自行创建moons.d文件夹
```



## 路由转发

### 开启内核转发功能

`sudo sysctl -w net.ipv4.ip_forward=1`

v6同理

---

更优选择

```shell
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
echo "net.ipv6.conf.default.forwarding=1" >> /etc/sysctl.conf
echo "net.ipv6.conf.all.forwarding=1" >> /etc/sysctl.conf
sysctl -p
```

关闭严格模式

```shell
echo "net.ipv4.conf.default.rp_filter=0" >> /etc/sysctl.conf
echo "net.ipv4.conf.all.rp_filter=0" >> /etc/sysctl.conf
sysctl -p
```

#### 解释

​			**`rp_filter `**

​			是 Linux 内核针对网络的一项网络安全保护功能，对于数据包的来源地址和来源网络界面（网卡）进行检查：

- 如果设置为 0（即禁用），放行所有数据包。

    - 但是有些无法正常回复（路由表内没有对应项目）的数据包也会被发给应用程序处理，消耗额外的系统资源。
    - 不过额外消耗应该很小，因此上述两项设置为 0 也没问题。

- 如果设置为 1（严格模式），如果数据包来源网卡不是发送这个数据包的最优网卡（也就是如果你本机要回复这个地址的话，会选择一张不同的网卡），就把这个数据包

    丢掉

    。

    - 来源和回复在不同网卡是 DN42 内**非常常见的情况**，因此 **千万 一定 绝对** 不能把 `rp_filter` 设置成 1！

- 如果设置为 2（宽松模式），

    从理论上来说

    ，如果数据包来源地址不在路由表内（也就是本机不知道要怎么回复这个地址），就把这个数据包丢掉。

    - 但是理论归理论，在新版本（5.0+）的内核中，实际使用中依然会有大量来源地址正确的正常数据包被丢弃。因此不要使用这个模式，请统一使用 0。

- 然后，**千万 一定 绝对** 关掉你的 UFW 等帮你简单配置 iptables 防火墙的工具。



### 添加防火墙规则

```shell
sudo iptables -t nat -A POSTROUTING -o $PHY_IFACE -j MASQUERADE
sudo iptables -A FORWARD -i $PHY_IFACE -o $ZT_IFACE -m state --state RELATED,ESTABLISHED -j ACCEPT
sudo iptables -A FORWARD -i $ZT_IFACE -o $PHY_IFACE -j ACCEPT
iptables-save	#保存
```

