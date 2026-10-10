---
title: Introduction to BitTorrent Principles
date: 2023-09-04 00:00:00
tags: ["Network"]
lang: en
slug: BitTorrent 原理简介
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

By January 12, 2017 [P2P](https://jaminzhang.github.io/categories/#P2P) [P2P](https://jaminzhang.github.io/tags/#P2P)[BT](https://jaminzhang.github.io/tags/#BT)[TCP](https://jaminzhang.github.io/tags/#TCP)[UDP](https://jaminzhang.github.io/tags/#UDP)[Tracker](https://jaminzhang.github.io/tags/#Tracker)[DHT](https://jaminzhang.github.io/tags/#DHT)

# Introduction

Previously, in my production environment, I used BT upload/download via Murder software to quickly distribute large files.
This belongs to the application of BT software. Recently I re-read the analysis and implementation of the BT protocol, and now I’m re-familiarizing myself with the principles of the BT protocol.

# Brief Introduction to BitTorrent Principles

```none
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

Although current mainstream BT software is largely similar, each software often has its own characteristics.

Of course, none of these play a decisive role. As mentioned earlier, BT download speed depends on **other users’ upload speed**, so the more users the better, and users are obtained through **Peer, DHT, and Tracker**.

> **Peer:** It only takes effect after you obtain a valid user; that user will tell you the user information it has obtained.
> ——
> **DHT:** Stores user information in a distributed way; after obtaining one user, it will obtain more user information through that user. The downside is that it requires nurturing (downloading popular resources).

There is nothing we can do about Peer and DHT, but most software supports custom Tracker, so if your BT software supports custom Tracker, then you can try this **project that aggregates popular Trackers across the internet:**

- **Official website:** [trackerslist.com](https://trackerslist.com/)
- **Project homepage:** [github.com/XIU2/TrackersListCollection](https://github.com/XIU2/TrackersListCollection)
- **Related article:** [zhuanlan.zhihu.com/p/85135793](https://zhuanlan.zhihu.com/p/85135793)

This raises a question: ***What is a Tracker?***

Tracker is an **almost essential** role in BT downloading.

> **Tracker:** Records information about users downloading the same resource and provides it to you, helping you establish connections with other users.
> ***The pros and cons of the above three are complementary; none can replace another, and using them together works best!***

**Using Tracker can help you obtain more users. As the number of users increases, the download speed will increase accordingly.**

> *The more people use these Trackers, the more users there are, and the faster everyone’s download speed becomes!*