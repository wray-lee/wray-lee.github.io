---
title: traceroute原理
date: 2023-09-04 21:48:57
---
# traceroute原理

经过的路由如果出现错误会返回一个错误包，可以利用ttl超时错误，不断增加ttl就可以依次根据返回的报错包拿到路由地址

```python
#python实现traceroute

from scapy.all import *

# 构造 IP 数据包，设置目标地址为不存在的地址
ip = IP(dst='192.0.2.255', ttl=1)

# 发送数据包并接收 ICMP "Time-to-live exceeded" 错误消息
ans, unans = sr(ip/ICMP(), timeout=1)

# 输出接收到的错误消息
ans.summary()
```



## 基于udp

发送给一个大于30000的端口，看返回错误是是TTL超时（还未到达目标主机）还是端口不可达（到达目标主机）

返回的带有服务器信息的包名称为`time-to-live exceeded`即`ttl exceeded`



***可以修改ttl exceeded ip头来更改traceroute返回信息<IP 包头欺骗（IP Spoofing）>***

> 包中ttl-1可隐藏自己的路由
>
> 包中修改ttl 同时配置 DNat 即可改变路由信息







> 假设B上的客户运行rlogin与A上的rlogind通信： 
>
> 1. B发送带有SYN标志的数据段通知A需要建立TCP连接。并将TCP报头中的sequence number设
>
> 置成自己本次连接的初始值ISN。 
>
> 2. A回传给B一个带有SYS+ACK标志的数据段，告之自己的ISN，并确认B发送来的第一个数据段
>
> ，将acknowledge number设置成B的ISN+1。 
>
> 3. B确认收到的A的数据段，将acknowledge number设置成A的ISN+1。 
>
> 
> B ---- SYN ----> A 
> B <---- SYN+ACK ---- A 
> B ---- ACK ----> A 
>
> TCP使用的sequence number是一个32位的计数器，从0-4294967295。 TCP为每一个连接选
> 择一个初始序号ISN，为了防止因为延迟、重传等扰乱三次握手，ISN不能随便选取，不同系统
> 有不同算法。理解TCP如何分配ISN以及ISN随时间变化的规律，对于成功地进行IP欺骗攻击很
> 重要。 
>
> 基于远程过程调用RPC的命令，比如rlogin、rcp、rsh等等，根据/etc/hosts.equiv以及
> $HOME/.rhosts文件进行安全校验，其实质是仅仅根据信源IP地址进行用户身份确认，以便允
> 许或拒绝用户RPC。 

```shell
#通过设置iptables规则来filter指定信息

iptables -t nat -A POSTROUTING -p tcp -s <your_server_ip> --dport <target_port> -j SNAT --to-source 8.8.8.8	#从服务器发送的TCP流量的源地址更改为8.8.8.8

iptables -t nat -A PREROUTING -p tcp -d <your_server_ip> --dport <target_port> -j DNAT --to-destination 8.8.8.8	#将服务器上目标端口TCP流量的目标地址更改为8.8.8.8，到达另一个地址

iptables -t nat -A OUTPUT -p icmp --source [源ip（即服务器ip）] -j DNAT --to-destination 8.8.8.8	#包被转发到8.8.8.8，出现自己服务器ip

iptables -t nat -A POSTROUTING -p icmp --icmp-type time-exceeded -j TTL --ttl-set 255 -j DNAT --to-destination [ip]	#路径中不存在自己服务器，目标变为目标ip
```



## 基于icmp

发送icmp回显请求（echo request）数据包，客户端收到会发送icmp回显应答（icmp reply）数据包

第一个路由的TTL=1,之后递增1,根据ttl的超时报错，依次拿到路径上的路由地址，直到获得icmp reply



```shell
# 伪装的第一种方法 IP sproofing
IP欺骗攻击的描述： 

1. 假设Z企图攻击A，而A信任B，所谓信任指/etc/hosts.equiv和$HOME/.rhosts中有相关设置
。注意，如何才能知道A信任B呢？没有什么确切的办法。我的建议就是平时注意搜集蛛丝马迹
，厚积薄发。一次成功的攻击其实主要不是因为技术上的高明，而是因为信息搜集的广泛翔实
。动用了自以为很有成就感的技术，却不比人家酒桌上的巧妙提问，攻击只以成功为终极目标
，不在乎手段。 

2. 假设Z已经知道了被信任的B，应该想办法使B的网络功能暂时瘫痪，以免对攻击造成干扰。
著名的SYN flood常常是一次IP欺骗攻击的前奏。请看一个并发服务器的框架： 
int initsockid, newsockid; 
if ((initsockid = socket(...)) < 0) { 
error("can‘t create socket"); 
} 
if (bind(initsockid, ...) < 0) { 
error("bind error"); 
} 
if (listen(initsockid, 5) < 0) { 
error("listen error"); 
} 
for (;{ 
newsockid = accept(initsockid, ...); /* 阻塞 */ 
if (newsockid < 0) { 
error("accept error"); 
} 
if (fork() == 0) { /* 子进程 */ 
close(initsockid); 
do(newsockid); /* 处理客户方请求 */ 
exit(0); 
} 
close(newsockid); 
} 

listen函数中第二个参数是5，意思是在initsockid上允许的最大连接请求数目。如果某个时
刻initsockid上的连接请求数目已经达到5，后续到达initsockid的连接请求将被TCP丢弃。注
意一旦连接通过三次握手建立完成，accept调用已经处理这个连接，则TCP连接请求队列空出
一个位置。所以这个5不是指initsockid上只能接受5个连接请求。SYN flood正是一种 Denial
of Service，导致B的网络功能暂时中断 

Z向B发送多个带有SYN标志的数据段请求连接，注意将信源IP 地址换成一个不存在的主机X；B
向子虚乌有的X发送SYN+ACK数据段，但没有任何来自X的ACK出现。B的IP层会报告B的TCP层，X
不可达，但B的TCP层对此不予理睬，认为只是暂时的。于是B在这个initsockid上再也不能接
收正常的连接请求。 

Z(X) ---- SYN ----> B 
Z(X) ---- SYN ----> B 
Z(X) ---- SYN ----> B 
Z(X) ---- SYN ----> B 
Z(X) ---- SYN ----> B 
...... 
X <---- SYN+ACK ---- B 
X <---- SYN+ACK ---- B 
X <---- SYN+ACK ---- B 
X <---- SYN+ACK ---- B 
X <---- SYN+ACK ---- B 
...... 

我认为这样就使得B网络功能暂时瘫痪，可我总觉得好象不对头。 

因为B虽然在initsockid上无法接收TCP连接请求，但可以在another initsockid上接收，
这种SYN flood应该只对特定的服务(端口)，不应该影响到全局。当然如果不断地发送连接请
求，就和用ping发洪水包一个道理，使得B的TCP/IP忙于处理负载增大。至于SYN flood，回头
有机会我单独灌一瓢有关DoS的。如何使B的网络功能暂 碧被居 很多办法，根据具体情况而定
，不再赘述。 

3. Z必须确定A当前的ISN。首先连向25端口(SMTP是没有安全校验机制的)，与1中类似，不过
这次需要记录A的ISN，以及Z到A的大致的RTT(round trip time)。这个步骤要重复多次以便求
出RTT的平均值。现在Z知道了A的ISN基值和增加规律(比如每秒增 加128000，每次连接增加
64000)，也知道了从Z到A需要RTT/2 的时间。必须立即进入攻击，否则在这之间有其他主机与
A连接， ISN将比预料的多出64000。 

4. Z向A发送带有SYN标志的数据段请求连接，只是信源IP改成了B，注意是针对TCP513端口
(rlogin)。A向B回送SYN+ACK数据段，B已经无法响应，B的TCP层只是简单地丢弃A的回送数据
段。 

5. Z暂停一小会儿，让A有足够时间发送SYN+ACK，因为Z看不到这个包。然后Z再次伪装成B向A
发送ACK，此时发送的数据段带有Z预测的A的ISN+1。如果预测准确，连接建立，数据传送开始
。问题在于即使连接建立，A仍然会向B发送数据，而不是Z，Z 仍然无法看到A发往B的数据段
，Z必须蒙着头按照rlogin协议标准假冒B向A发送类似 "cat + + >> ~/.rhosts" 这样的命令
，于是攻击完成。如果预测不准确，A将发送一个带有RST标志的数据段异常终止连接，Z只有
从头再来。 

Z(B) ---- SYN ----> A 
B <---- SYN+ACK ---- A 
Z(B) ---- ACK ----> A 
Z(B) ---- PSH ----> A 
...... 

6. IP欺骗攻击利用了RPC服务器仅仅依赖于信源IP地址进行安全校验的特性，建议阅读
rlogind的源代码。攻击最困难的地方在于预测A的ISN。我认为攻击难度虽然大，但成功的可
能性也很大，不是很理解，似乎有点矛盾。考虑这种情况，入侵者控制了一台由A到B之间的路
由器，假设Z就是这台路由器，那么A回送到B的数据段，现在Z是可以看到的，显然攻击难度骤
然下降了许多。否则Z必须精确地预见可能从A发往B的信息，以及A期待来自B的什么应答信息
，这要求攻击者对协议本身相当熟悉。同时需要明白，这种攻击根本不可能在交互状态下完成
，必须写程序完成。当然在准备阶段可以用netxray之类的工具进行协议分析。 

7. 如果Z不是路由器，能否考虑组合使用ICMP重定向以及ARP欺骗等技术？没有仔细分析过，
只是随便猜测而已。并且与A、B、Z之间具体的网络拓扑有密切关系，在某些情况下显然大幅
度降低了攻击难度。注意IP欺骗攻击理论上是从广域网上发起的，不局限于局域网，这也正是
这种攻击的魅力所在。利用IP欺骗攻击得到一个A上的shell，对于许多高级入侵者，得到目标
主机的shell，离root权限就不远了，最容易想到的当然是接下来进行buffer overflow攻击。 

8. 也许有人要问，为什么Z不能直接把自己的IP设置成B的？这个问题很不好回答，要具体分
析网络拓扑，当然也存在ARP冲突、出不了网关等问题。那么在IP欺骗攻击过程中是否存在ARP
冲突问题。回想我前面贴过的ARP欺骗攻击，如果B的ARP Cache没有受到影响，就不会出现ARP
冲突。如果Z向A发送数据段时，企图解析A的MAC地址或者路由器的MAC地址，必然会发送ARP请
求包，但这个ARP请求包中源IP以及源MAC都是Z的，自然不会引起ARP冲突。而ARP Cache只会
被ARP包改变，不受IP包的影响，所以可以肯定地说，IP欺骗攻击过程中不存在ARP冲突。相反
，如果Z修改了自己的IP，这种ARP冲突就有可能出现，示具体情况而言。攻击中连带B一起攻
击了，其目的无非是防止B干扰了攻击过程， 如果B本身已经down掉，那是再好不过。 

9. fakeip曾经沸沸扬扬了一下，我对之进行端口扫描，发现其tcp端口113是接收入连接的。
和IP欺骗等没有直接联系，和安全校验是有关系的。当然，这个东西并不如其名所暗示，对IP
层没有任何动作。 

10. 关于预测ISN，我想到另一个问题。就是如何以第三方身份切断 A与B之间的TCP连接，实
际上也是预测sequence number的问题。尝试过，也很困难。如果Z是A与B之间的路由器，就不
用说了； 或者Z动用了别的技术可以监听到A与B之间的通信，也容易些； 否则预测太难。作
者在3中提到连接A的25端口，可我想不明白的 是513端口的ISN和25端口有什么关系？看来需
要看看TCP/IP内部实现的源代码。 

未雨绸缪 

虽然IP欺骗攻击有着相当难度，但我们应该清醒地意识到，这种攻击非常广泛，入侵往往由这
里开始。预防这种攻击还是比较容易的， 比如删除所有的/etc/hosts.equiv、$HOME/.rhosts
文件，修改/etc/ inetd.conf文件，使得RPC机制无法运做，还可以杀掉portmapper等等。设
置路由器，过滤来自外部而信源地址却是内部IP的报文。cisio公司的产品就有这种功能。不
过路由器只防得了外部入侵，内部入侵呢？ 

TCP的ISN选择不是随机的，增加也不是随机的，这使攻击者有规可循，可以修改与ISN相关的
代码，选择好的算法，使得攻击者难以找到规律。估计Linux下容易做到，那solaris、irix、
hp-unix还有aix呢？sigh 

虽然写的不怎么，但总算让大家了解了一下IP欺骗攻击，我实验过预测sequence number，不
是ISN，企图切断一个TCP连接，感觉难度很大。作者建议要找到规律，不要盲目预测，这需要
时间和耐心。现在越发明白什么是那种锲而不舍永远追求的精神，我们所向往的传奇故事背后
有着如此沉默的艰辛和毅力，但愿我们学会的是这个，而不是浮华与喧嚣。一个现成的bug足
以让你取得root权限，可你在做什么，你是否明白？我们太肤浅了...... 
```



```markdown
# 伪装的第二种方法
Bgp hijacking
Bgp劫持
通过修改AS宣告信息将流量路由到不属于自己的线路上

## 路径修改方法

Bgp选路有三个参数
- local preference	本地优先值
- med	通过延迟的综合考虑选出了优先路径
- weight	手动设置的线路权重
```
