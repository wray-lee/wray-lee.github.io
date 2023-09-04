---
title: BitTorrent 原理简介
date: 2023-09-04 21:48:57
---
## BitTorrent 原理简介

By 01月12日 2017 [P2P](https://jaminzhang.github.io/categories/#P2P) [P2P](https://jaminzhang.github.io/tags/#P2P)[BT](https://jaminzhang.github.io/tags/#BT)[TCP](https://jaminzhang.github.io/tags/#TCP)[UDP](https://jaminzhang.github.io/tags/#UDP)[Tracker](https://jaminzhang.github.io/tags/#Tracker)[DHT](https://jaminzhang.github.io/tags/#DHT)



# 引言

之前我这边在生产环境中使用 Murder 软件的 BT 上传下载的方式来实现大文件的快速分发。
这属于 BT 软件的应用。最近重新看了下 BT 协议的分析与实现，现在重新了解下 BT 协议原理。



# BitTorrent 原理简述

```
与传统客户端/服务器网络通信模式不同，对等方到对等方（P2P）通信模式在近年来越来越流行起来。
在 P2P 模式中，服务和资源分布化，资源不集中存储在某些设备上，而是分散存储在运行 P2P 程序的设备上，
每一个对等方都可以为其他对等方提供服务。
BitTorrent（中文全称比特流，简称 BT）是一个网络文件传输协议，是能够实现点对点文件分享的技术。
在大多数人感觉中与 P2P 成了对等的一组概念，而它也将 P2P 技术发展到了近乎完美的地步。
研究 BitTorrent 协议对我们深入把握 P2P 技术，了解 Interent 网络发展的未来走向有很大的意义。
BitTorrent 协议是架构于 TCP/IP 协议之上的一个 P2P 文件传输协议，处于 TCP/IP 结构的应用层。
BitTorrent 协议本身也包含了很多具体的内容协议和扩展协议，并在不断扩充中。
如果有多个下载者并发的下载同一个文件，则每个下载者也同时为其它下载者上传文件，
这样，文件源可以支持大量的用户进行下载，而只带来适当的负载的增长。

BitTorrent 协议把提供下载的文件虚拟分成大小相等的块，块大小必须为 2k 的整数次方
（由于是虚拟分块，硬盘上并不产生各个块文件），并把每个块的索引信息和 Hash 验证码
写入 .torrent 文件（即种子文件，也简称为“种子”）中，作为被下载文件的“索引”。 
下载者要下载文件内容，需要先得到相应的 .torrent 文件，然后使用 BT 客户端软件进行下载。 

下载时，BT 客户端首先解析 .torrent 文件得到 Tracker 地址，然后连接 Tracker 服务器。
Tracker 服务器回应下载者的请求，提供下载者其他下载者（包括发布者）的 IP。
或者，BT客户端也可解析 .torrent 文件得到 nodes 路由表，然后连接路由表中的有效节点，
由网络节点提供下载者其他下载者的 IP。

下载者再连接其他下载者，根据 .torrent 文件，两者分别对方告知自己已经有的块，
然后交换对方没有的数据。此时不需要其他服务器参或者其他网络节点的参与，
分散了单个线路上的数据流量，因此减轻了服务器负担。
下载者每得到一个块，需要算出下载块的 Hash 验证码与 .torrent 文件中的对比，
如果一样则说明块正确，不一样则需要重新下载这个块。

因此，下载的人越多，提供的带宽也越多，种子也会越来越多，下载速度就越快。

从 BT 客户端角度考虑，下载原理分为以下几步：

一．根据 BitTorrent 协议，文件发布者会根据要发布的文件生成提供一个 .torrent 文件。
客户端可从 Web 服务器上下载种子文件，并从中得到 Tracker 服务器 URL 和 DHT 网络 nodes 等信息。

二．根据 Tracker URL 与 Tracker 服务器建立连接，并从服务器上得到 Peers 信息。
或者根据 nodes 与 DHT 网络中节点通信，并从节点上得到 Peers 信息。

三．根据 Peers 信息与一个 Peer 建立连接，依据 Peer wire 协议完成握手，
并从 Peer 端下载数据文件。同时监听 Peer 的连接，并给 Peer 上传数据文件。

依据得到 Peers 信息的途径的不同，可分为使用 Tracker 服务器和使用 Trackerless DHT 网络两种方式。

基于 HTTP 的 Tracker 协议，
基于 UDP 的 Trackerless 协议，
基于 TCP 的 Peer wire 协议。
```



虽然目前的主流 BT 软件都大同小异，但是往往各软件都有一些各自的特点。

当然这些都不能起到决定性作用，前面说了，BT 下载速度取决于**其他用户的上传速度**，因此用户越多越好，而用户靠 **Peer、DHT、Tracker** 获得。

> **Peer：**获得一个有效用户后才会起作用，该用户会把它获得的用户信息告诉你。
> ——
> **DHT：**布式储存用户信息，获得一个用户后，会通过该用户获得更多的用户信息。缺点是需要养（下载热门资源）。

Peer、DHT 我们做不了什么，但是 Tracker 大部分软件都支持自定义，所以如果你的 BT 软件支持自定义 Tracker，那么可以试试下面这个**整合了全网热门 Tracker 的项目：**

- **官方网站：**[trackerslist.com](https://trackerslist.com/)
- **项目主页：**[github.com/XIU2/TrackersListCollection](https://github.com/XIU2/TrackersListCollection)
- **相关文章：**[zhuanlan.zhihu.com/p/85135793](https://zhuanlan.zhihu.com/p/85135793)

这就引出了一个问题，***Tracker 是什么？\***

Tracker 是 BT 下载中一个**几乎必须**的角色。

> **Tracker：**记录下载同一个资源的用户信息并提供给你，帮助你与其他用户建立连接。
> ***以上三者的优缺点是互补的，不存在谁替代谁，一起用效果最好！\***

**使用 Tracker 可以帮你获取到更多的用户，用户数量增加，相应的也会提高下载速度。**

> *使用这些 Tracker 的人越多，用户数量就越多，大家的下载速度就越快！*