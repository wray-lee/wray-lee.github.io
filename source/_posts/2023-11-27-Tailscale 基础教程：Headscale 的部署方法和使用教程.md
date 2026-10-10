---
title: "Tailscale 基础教程：Headscale 的部署方法和使用教程"
date: 2023-11-27 17:52:55
tags: ["web"]
---

## Tailscale 基础教程：Headscale 的部署方法和使用教程

> 基础命令

```shell
headscale namespaces create default

headscale preauthkeys create -e 65535h -u default --reusable	#生成auth_key

headscale node list

tailscale up --login-server=http://<HEADSCALE_PUB_IP>:8080 --accept-routes=true --accept-dns=false --advertise-routes=192.168.100.0/24

### tailscale up --login-server=http://124.221.253.77:8080 --accept-routes=true --accept-dns=false --advertise-routes=10.10.0.0/24,121.48.165.112/32,202.115.0.0/24 --authkey 068287073b622d63fd62286744bb6646b7e13fa13fff9d53 --reset --force-reauth

### 671eddba4d7cef3dd4bbc27aa61771d926dab8c5a72b5d64
```



## Docker部署

```bash
# docker-compose.yml
version: '3.5'
services:
  headscale:
    image: headscale/headscale:latest
    container_name: headscale
    volumes:
      - ./config:/etc/headscale
      - ./data/data:/var/lib/headscale
    ports:
      - 8080:8080
    command: headscale serve
    restart: unless-stopped
```

`docker-compose up -d`



修改配置文件，将 `server_url` 改为公网 IP 或域名

如果暂时用不到 DNS 功能，可以先将 `magic_dns` 设为 false

`server_url` 设置为 `http://<PUBLIC_IP>:8080`，将 `<PUBLIC_IP>` 替换为公网 IP 或者域名。

可自定义私有网段，也可同时开启 IPv4 和 IPv6：

```yaml
ip_prefixes:
# Format: 100.64.0.0/16
  # - fd7a:115c:a1e0::/48
  - 100.64.77.0/24
```



# [Running headscale in a container](https://github.com/juanfont/headscale/blob/main/docs/running-headscale-container.md#running-headscale-in-a-container)

!!! warning "Community documentation"

```
This page is not actively maintained by the headscale authors and is
written by community members. It is _not_ verified by `headscale` developers.

**It might be outdated and it might miss necessary steps**.
```



## [Goal](https://github.com/juanfont/headscale/blob/main/docs/running-headscale-container.md#goal)

This documentation has the goal of showing a user how-to set up and run `headscale` in a container. [Docker](https://www.docker.com/) is used as the reference container implementation, but there is no reason that it should not work with alternatives like [Podman](https://podman.io/). The Docker image can be found on Docker Hub [here](https://hub.docker.com/r/headscale/headscale).

## [Configure and run `headscale`](https://github.com/juanfont/headscale/blob/main/docs/running-headscale-container.md#configure-and-run-headscale)

1. Prepare a directory on the host Docker node in your directory of choice, used to hold `headscale` configuration and the [SQLite](https://www.sqlite.org/) database:

```
mkdir -p ./headscale/config
cd ./headscale
```



1. Create an empty SQlite datebase in the headscale directory:

```
touch ./config/db.sqlite
```



1. **(Strongly Recommended)** Download a copy of the [example configuration][config-example.yaml](https://github.com/juanfont/headscale/blob/main/config-example.yaml) from the headscale repository.

Using wget:

```
wget -O ./config/config.yaml https://raw.githubusercontent.com/juanfont/headscale/main/config-example.yaml
```



Using curl:

```
curl https://raw.githubusercontent.com/juanfont/headscale/main/config-example.yaml -o ./config/config.yaml
```



**(Advanced)** If you would like to hand craft a config file **instead** of downloading the example config file, create a blank `headscale` configuration in the headscale directory to edit:

```
touch ./config/config.yaml
```



Modify the config file to your preferences before launching Docker container. Here are some settings that you likely want:

```
# Change to your hostname or host IP
server_url: http://your-host-name:8080
# Listen to 0.0.0.0 so it's accessible outside the container
metrics_listen_addr: 0.0.0.0:9090
# The default /var/lib/headscale path is not writable in the container
private_key_path: /etc/headscale/private.key
# The default /var/lib/headscale path is not writable in the container
noise:
  private_key_path: /etc/headscale/noise_private.key
# The default /var/lib/headscale path is not writable  in the container
db_type: sqlite3
db_path: /etc/headscale/db.sqlite
```



1. Start the headscale server while working in the host headscale directory:

```
docker run \
  --name headscale \
  --detach \
  --volume $(pwd)/config:/etc/headscale/ \
  --publish 127.0.0.1:8080:8080 \
  --publish 127.0.0.1:9090:9090 \
  headscale/headscale:<VERSION> \
  headscale serve
```



Note: use `0.0.0.0:8080:8080` instead of `127.0.0.1:8080:8080` if you want to expose the container externally.

This command will mount `config/` under `/etc/headscale`, forward port 8080 out of the container so the `headscale` instance becomes available and then detach so headscale runs in the background.

1. Verify `headscale` is running:

Follow the container logs:

```
docker logs --follow headscale
```



Verify running containers:

```
docker ps
```



Verify `headscale` is available:

```
curl http://127.0.0.1:9090/metrics
```



1. Create a user ([tailnet](https://tailscale.com/kb/1136/tailnet/)):

```
docker exec headscale \
  headscale users create myfirstuser
```



### [Register a machine (normal login)](https://github.com/juanfont/headscale/blob/main/docs/running-headscale-container.md#register-a-machine-normal-login)

On a client machine, execute the `tailscale` login command:

```
tailscale up --login-server YOUR_HEADSCALE_URL
```



To register a machine when running `headscale` in a container, take the headscale command and pass it to the container:

```
docker exec headscale \
  headscale --user myfirstuser nodes register --key <YOU_+MACHINE_KEY>
```



### [Register machine using a pre authenticated key](https://github.com/juanfont/headscale/blob/main/docs/running-headscale-container.md#register-machine-using-a-pre-authenticated-key)

Generate a key using the command line:

```
docker exec headscale \
  headscale --user myfirstuser preauthkeys create --reusable --expiration 24h
```



This will return a pre-authenticated key that can be used to connect a node to `headscale` during the `tailscale` command:

```
tailscale up --login-server <YOUR_HEADSCALE_URL> --authkey <YOUR_AUTH_KEY>
```



## [Debugging headscale running in Docker](https://github.com/juanfont/headscale/blob/main/docs/running-headscale-container.md#debugging-headscale-running-in-docker)

The `headscale/headscale` Docker container is based on a "distroless" image that does not contain a shell or any other debug tools. If you need to debug your application running in the Docker container, you can use the `-debug` variant, for example `headscale/headscale:x.x.x-debug`.

### [Running the debug Docker container](https://github.com/juanfont/headscale/blob/main/docs/running-headscale-container.md#running-the-debug-docker-container)

To run the debug Docker container, use the exact same commands as above, but replace `headscale/headscale:x.x.x` with `headscale/headscale:x.x.x-debug` (`x.x.x` is the version of headscale). The two containers are compatible with each other, so you can alternate between them.

### [Executing commands in the debug container](https://github.com/juanfont/headscale/blob/main/docs/running-headscale-container.md#executing-commands-in-the-debug-container)

The default command in the debug container is to run `headscale`, which is located at `/bin/headscale` inside the container.

Additionally, the debug container includes a minimalist Busybox shell.

To launch a shell in the container, use:

```
docker run -it headscale/headscale:x.x.x-debug sh
```



You can also execute commands directly, such as `ls /bin` in this example:

```
docker run headscale/headscale:x.x.x-debug ls /bin
```



Using `docker exec` allows you to run commands in an existing container.













![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting5@main/uPic/2022-11-29-10-20-bADiKL.png)

目前国家工信部在大力推动三大运营商发展 IPv6，对家用宽带而言，可以使用的 IPv4 公网 IP 会越来越少。有部分地区即使拿到了公网 IPv4 地址，也是个大内网地址，根本不是真正的公网 IP，访问家庭内网的资源将会变得越来越困难。

部分小伙伴可能会选择使用 frp 等针对特定协议和端口的内网穿透方案，但这种方案还是不够酸爽，无法访问家庭内网任意设备的任意端口。更佳的选择还是通过 VPN 来组建大内网。至于该选择哪种 VPN，毫无疑问肯定是 WireGuard，WireGuard 就是 VPN 的未来。**我已经不止一次向大家推荐使用 WireGuard 了，我累了，不想再讲了，你爱 JB 用辣鸡 OpenVPN 之类的就用吧，你开心就好。**

WireGuard 相比于传统 VPN 的核心优势是没有 VPN 网关，所有节点之间都可以点对点（P2P）连接，也就是我之前提到的 [全互联模式（full mesh）](https://icloudnative.io/posts/wireguard-full-mesh/#1-全互联模式架构与配置)，效率更高，速度更快，成本更低。

WireGuard 目前最大的痛点就是上层应用的功能不够健全，因为 WireGuard 推崇的是 Unix 的哲学，WireGuard 本身只是一个内核级别的模块，只是一个数据平面，至于上层的更高级的功能（比如秘钥交换机制，UDP 打洞，ACL 等），需要通过用户空间的应用来实现。

所以为了基于 WireGuard 实现更完美的 VPN 工具，现在已经涌现出了很多项目在互相厮杀。笔者前段时间一直在推崇 [Netmaker](https://icloudnative.io/posts/configure-a-mesh-network-with-netmaker/)，它通过可视化界面来配置 WireGuard 的全互联模式，它支持 UDP 打洞、多租户等各种高端功能，几乎适配所有平台，非常强大。然而现实世界是复杂的，无法保证所有的 NAT 都能打洞成功，且 Netmaker 目前还没有 fallback 机制，如果打洞失败，无法 fallback 改成走中继节点。Tailscale 在这一点上比 Netmaker 高明许多，它支持 fallback 机制，可以尽最大努力实现全互联模式，部分节点即使打洞不成功，也能通过中继节点在这个虚拟网络中畅通无阻。

没错，我移情别恋了，从 Netmaker 阵营转向了 Tailscale，是渣男没错了。

## Tailscale 是什么

Tailscale 是一种基于 WireGuard 的虚拟组网工具，和 Netmaker 类似，**最大的区别在于 Tailscale 是在用户态实现了 WireGuard 协议，而 Netmaker 直接使用了内核态的 WireGuard**。所以 Tailscale 相比于内核态 WireGuard 性能会有所损失，但与 OpenVPN 之流相比还是能甩好几十条街的，Tailscale 虽然在性能上做了些许取舍，但在功能和易用性上绝对是完爆其他工具：

1. 开箱即用

- 无需配置防火墙
- 没有额外的配置

1. 高安全性/私密性

- 自动密钥轮换
- 点对点连接
- 支持用户审查端到端的访问记录

1. 在原有的 ICE、STUN 等 UDP 协议外，实现了 DERP TCP 协议来实现 NAT 穿透
2. 基于公网的控制服务器下发 ACL 和配置，实现节点动态更新
3. 通过第三方（如 Google） SSO 服务生成用户和私钥，实现身份认证

简而言之，我们可以将 Tailscale 看成是更为易用、功能更完善的 WireGuard。

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting3@main/uPic/2022-03-20-14-50-Q4bWmK.png)

光有这些还不够，作为一个白嫖党，咱更关心的是**免费**与**开源**。

Tailscale 是一款商业产品，但个人用户是可以白嫖的，个人用户在接入设备不超过 20 台的情况下是可以免费使用的（虽然有一些限制，比如子网网段无法自定义，且无法设置多个子网）。除 Windows 和 macOS 的图形应用程序外，其他 Tailscale 客户端的组件（包含 Android 客户端）是在 BSD 许可下以开源项目的形式开发的，你可以在他们的 [GitHub 仓库](https://github.com/tailscale/)找到各个操作系统的客户端源码。

对于大部份用户来说，白嫖 Tailscale 已经足够了，如果你有更高的需求，比如自定义网段，可以选择付费。

**我就不想付费行不行？行，不过得往下看。**

## Headscale 是什么

Tailscale 的控制服务器是不开源的，而且对免费用户有诸多限制，这是人家的摇钱树，可以理解。好在目前有一款开源的实现叫 [Headscale](https://github.com/juanfont/headscale)，这也是唯一的一款，希望能发展壮大。

Headscale 由欧洲航天局的 Juan Font 使用 Go 语言开发，在 BSD 许可下发布，实现了 Tailscale 控制服务器的所有主要功能，可以部署在企业内部，没有任何设备数量的限制，且所有的网络流量都由自己控制。

目前 Headscale 还没有可视化界面，期待后续更新吧。

## Headscale 部署

Headscale 部署很简单，推荐直接在 Linux 主机上安装。

> 理论上来说只要你的 Headscale 服务可以暴露到公网出口就行，但最好不要有 NAT，所以推荐将 Headscale 部署在有公网 IP 的云主机上。

首先需要到其 GitHub 仓库的 Release 页面下载最新版的二进制文件。

```bash
$ wget --output-document=/usr/local/bin/headscale \
   https://github.com/juanfont/headscale/releases/download/v<HEADSCALE VERSION>/headscale_<HEADSCALE VERSION>_linux_<ARCH>

$ chmod +x /usr/local/bin/headscale
```



创建配置目录：

```bash
$ mkdir -p /etc/headscale
```



创建目录用来存储数据与证书：

```bash
$ mkdir -p /var/lib/headscale
```



创建空的 SQLite 数据库文件：

```bash
$ touch /var/lib/headscale/db.sqlite
```



创建 Headscale 配置文件：

```bash
$ wget https://github.com/juanfont/headscale/raw/main/config-example.yaml -O /etc/headscale/config.yaml
```



- 修改配置文件，将 `server_url` 改为公网 IP 或域名。**如果是国内服务器，域名必须要备案**。我的域名无法备案，所以我就直接用公网 IP 了。

- 如果暂时用不到 DNS 功能，可以先将 `magic_dns` 设为 false。

- `server_url` 设置为 `http://<PUBLIC_IP>:8080`，将 `<PUBLIC_IP>` 替换为公网 IP 或者域名。

- 可自定义私有网段，也可同时开启 IPv4 和 IPv6：

    ```yaml
    ip_prefixes:
      # - fd7a:115c:a1e0::/48
      - 10.1.0.0/16
    ```

    

创建 SystemD service 配置文件：

```bash
# /etc/systemd/system/headscale.service
[Unit]
Description=headscale controller
After=syslog.target
After=network.target

[Service]
Type=simple
User=headscale
Group=headscale
ExecStart=/usr/local/bin/headscale serve
Restart=always
RestartSec=5

# Optional security enhancements
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=/var/lib/headscale /var/run/headscale
AmbientCapabilities=CAP_NET_BIND_SERVICE
RuntimeDirectory=headscale

[Install]
WantedBy=multi-user.target
```



创建 headscale 用户：

```bash
$ useradd headscale -d /home/headscale -m
```



修改 /var/lib/headscale 目录的 owner：

```bash
$ chown -R headscale:headscale /var/lib/headscale
```



修改配置文件中的 `unix_socket`：

```yaml
unix_socket: /var/run/headscale/headscale.sock
```



Reload SystemD 以加载新的配置文件：

```bash
$ systemctl daemon-reload
```



启动 Headscale 服务并设置开机自启：

```bash
$ systemctl enable --now headscale
```



查看运行状态：

```bash
$ systemctl status headscale
```



查看占用端口：

```bash
$ ss -tulnp|grep headscale

tcp LISTEN 0 1024 [::]:9090 [::]:* users:(("headscale",pi

d=10899,fd=13))

tcp LISTEN 0 1024 [::]:50443 [::]:* users:(("headscale",pi

d=10899,fd=10))

tcp LISTEN 0 1024 [::]:8080 [::]:* users:(("headscale",pi

d=10899,fd=12))
```



Tailscale 中有一个概念叫 tailnet，你可以理解成租户，租户与租户之间是相互隔离的，具体看参考 Tailscale 的官方文档： [What is a tailnet](https://tailscale.com/kb/1136/tailnet/)。Headscale 也有类似的实现叫 namespace，即命名空间。我们需要先创建一个 namespace，以便后续客户端接入，例如：

```bash
$ headscale namespaces create default
```



查看命名空间：

```bash
$ headscale namespaces list

ID | Name | Created

1 | default | 2022-03-09 06:12:06
```



## Tailscale 客户端接入

目前除了 iOS 客户端，其他平台的客户端都有办法自定义 Tailscale 的控制服务器。

| OS      | 是否支持 Headscale                                           |
| :------ | :----------------------------------------------------------- |
| Linux   | Yes                                                          |
| OpenBSD | Yes                                                          |
| FreeBSD | Yes                                                          |
| macOS   | Yes                                                          |
| Windows | Yes 参考 [Windows 客户端文档](https://github.com/juanfont/headscale/blob/main/docs/windows-client.md) |
| Android | 支持,参考 [这个 PR](https://github.com/tailscale/tailscale-android/pull/55) |
| iOS     | 暂不支持                                                     |

我们先来看下 Linux 平台的接入。

### Linux

Tailscale 官方提供了各种 Linux 发行版的软件包，但国内的网络你懂得，软件源根本用不了。好在官方还提供了 [静态编译的二进制文件](https://tailscale.com/download/linux/static)，我们可以直接下载。例如：

```bash
$ wget https://pkgs.tailscale.com/stable/tailscale_1.22.2_amd64.tgz
```



解压：

```bash
$ tar zxvf tailscale_1.22.2_amd64.tgz
x tailscale_1.22.2_amd64/
x tailscale_1.22.2_amd64/tailscale
x tailscale_1.22.2_amd64/tailscaled
x tailscale_1.22.2_amd64/systemd/
x tailscale_1.22.2_amd64/systemd/tailscaled.defaults
x tailscale_1.22.2_amd64/systemd/tailscaled.service
```



将二进制文件复制到官方软件包默认的路径下：

```bash
$ cp tailscale_1.22.2_amd64/tailscaled /usr/sbin/tailscaled
$ cp tailscale_1.22.2_amd64/tailscale /usr/bin/tailscale
```



将 systemD service 配置文件复制到系统路径下：

```bash
$ cp tailscale_1.22.2_amd64/systemd/tailscaled.service /lib/systemd/system/tailscaled.service
```



将环境变量配置文件复制到系统路径下：

```bash
$ cp tailscale_1.22.2_amd64/systemd/tailscaled.defaults /etc/default/tailscaled
```



启动 tailscaled.service 并设置开机自启：

```bash
$ systemctl enable --now tailscaled
```



查看服务状态：

```bash
$ systemctl status tailscaled
```



Tailscale 接入 Headscale：

```bash
# 将 <HEADSCALE_PUB_IP> 换成你的 Headscale 公网 IP 或域名
$ tailscale up --login-server=http://<HEADSCALE_PUB_IP>:8080 --accept-routes=true --accept-dns=false
```



这里推荐将 DNS 功能关闭，因为它会覆盖系统的默认 DNS。如果你对 DNS 有需求，可自己研究官方文档，这里不再赘述。

执行完上面的命令后，会出现下面的信息：

```bash
To authenticate, visit:

http://xxxxxx:8080/register?key=905cf165204800247fbd33989dbc22be95c987286c45aac303393704

1150d846
```



在浏览器中打开该链接，就会出现如下的界面：

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting3@main/uPic/2022-03-20-17-06-08qWbz.png)

将其中的命令复制粘贴到 headscale 所在机器的终端中，并将 NAMESPACE 替换为前面所创建的 namespace。

```bash
$ headscale -n default nodes register --key 905cf165204800247fbd33989dbc22be95c987286c45aac3033937041150d846
Machine register
```



注册成功，查看注册的节点：

```bash
$ headscale nodes list

ID | Name | NodeKey | Namespace | IP addresses | Ephemeral | Last seen | Onlin

e | Expired

1 | coredns | [Ew3RB] | default | 10.1.0.1 | false | 2022-03-20 09:08:58 | onlin

e | no
```



回到 Tailscale 客户端所在的 Linux 主机，可以看到 Tailscale 会自动创建相关的路由表和 iptables 规则。路由表可通过以下命令查看：

```bash
$ ip route show table 52
```



查看 iptables 规则：

```bash
$ iptables -S
-P INPUT DROP
-P FORWARD ACCEPT
-P OUTPUT ACCEPT
-N ts-forward
-N ts-input
-A INPUT -j ts-input
-A FORWARD -j ts-forward
-A ts-forward -i tailscale0 -j MARK --set-xmark 0x40000/0xffffffff
-A ts-forward -m mark --mark 0x40000 -j ACCEPT
-A ts-forward -s 100.64.0.0/10 -o tailscale0 -j DROP
-A ts-forward -o tailscale0 -j ACCEPT
-A ts-input -s 10.1.0.5/32 -i lo -j ACCEPT
-A ts-input -s 100.115.92.0/23 ! -i tailscale0 -j RETURN
-A ts-input -s 100.64.0.0/10 ! -i tailscale0 -j DROP

$ iptables -S -t nat
-P PREROUTING ACCEPT
-P INPUT ACCEPT
-P OUTPUT ACCEPT
-P POSTROUTING ACCEPT
-A ts-postrouting -m mark --mark 0x40000 -j MASQUERADE
```



### macOS

macOS 有 3 种安装方法：

- 直接通过应用商店安装，地址： https://apps.apple.com/ca/app/tailscale/id1475387142。前提是你**需要一个美区 ID**。。。
- 下载 [安装包](https://pkgs.tailscale.com/stable/#macos)直接安装，绕过应用商店。
- 安装开源的命令行工具 `tailscale` 和 `tailscaled`。相关链接： https://github.com/tailscale/tailscale/wiki/Tailscaled-on-macOS。

这三种安装包的核心数据包处理代码是相同的，唯一的区别在于在于打包方式以及与系统的交互方式。

应用商店里的应用运行在一个 [应用沙箱](https://developer.apple.com/library/archive/documentation/Security/Conceptual/AppSandboxDesignGuide/AboutAppSandbox/AboutAppSandbox.html)中，与系统的其他部分隔离。在沙箱内，应用可以是一个 [网络扩展](https://developer.apple.com/documentation/networkextension)，以实现 VPN 或者类 VPN 的功能。网络扩展实现的功能对应用商店之外的应用是无法生效的。

从 macOS 从 10.15 开始新增了 [系统扩展](https://developer.apple.com/system-extensions/)，说白了就是运行在用户态的内核扩展，它相比于传统的网络扩展增强了很多功能，比如内容过滤、透明代理、DNS 代理等。Tailscale 独立于应用商店的安装包使用的就是**系统扩展**，通过 DMG 或者 zip 压缩包进行分发。

不要同时安装应用商店版本和独立分发版本，同时只能装一个。

而命令行工具既没有使用网络扩展也没有使用系统扩展，而是使用的 [utun 接口](https://en.wikipedia.org/wiki/TUN/TAP)，相比于 GUI 版本缺少了部分功能，比如 MagicDNS 和 Taildrop。

总览：

|                | 应用商店（网络扩展）                                        | 独立应用（系统扩展）                                         | 命令行版本                                                   |
| :------------- | :---------------------------------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| 是否可用       | [yes](https://apps.apple.com/ca/app/tailscale/id1475387142) | yes, [beta](https://tailscale.com/kb/1167/release-stages/#beta) | [yes](https://github.com/tailscale/tailscale/wiki/Tailscaled-on-macOS) |
| 图形界面       | yes                                                         | yes                                                          | no; CLI                                                      |
| macOS 最低版本 | macOS 10.13                                                 | macOS 10.15                                                  | macOS 10.13                                                  |
| 后台运行       | no; sandboxed                                               | 理论上支持; 尚未实现                                         | yes                                                          |
| 使用的钥匙串🔑  | 用户级                                                      | 系统级                                                       | 直接存放在文件中                                             |
| 沙盒隔离       | yes                                                         | no                                                           | no                                                           |
| 自动更新       | yes; 应用商店直接更新                                       | yes; [Sparkle](https://sparkle-project.org/)                 | no                                                           |
| 是否开源       | no                                                          | no                                                           | yes                                                          |
| MagicDNS       | yes                                                         | yes                                                          | yes                                                          |
| Taildrop       | yes                                                         | yes                                                          | 未实现                                                       |

安装完 GUI 版应用后还需要做一些骚操作，才能让 Tailscale 使用 Headscale 作为控制服务器。当然，Headscale 已经给我们提供了详细的操作步骤，你只需要在浏览器中打开 URL：`http://<HEADSCALE_PUB_IP>:8080/apple`，便会出现如下的界面：

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting4@main/uPic/2022-11-22-17-53-rjcTVg.png)

你只需要按照图中所述的步骤操作即可，本文就不再赘述了。

非应用商店版本的 macOS 客户端需要将 `io.tailscale.ipn.macos` 替换为 `io.tailscale.ipn.macsys`。即：`defaults write io.tailscale.ipn.macsys ControlURL http://<HEADSCALE_PUB_IP>:8080`

修改完成后重启 Tailscale 客户端，在 macOS 顶部状态栏中找到 Tailscale 并点击，然后再点击 `Log in`。

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting3@main/uPic/2022-03-20-17-43-pTW3r7.png)

然后立马就会跳转到浏览器并打开一个页面。

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting3@main/uPic/2022-03-20-17-46-AbzngB.png)

接下来与之前 Linux 客户端相同，回到 Headscale 所在的机器执行浏览器中的命令即可，注册成功：

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting3@main/uPic/2022-03-20-17-51-Gcjcmy.png)

回到 Headscale 所在主机，查看注册的节点：

```bash
$ headscale nodes list

ID | Name | NodeKey | Namespace | IP addresses | Ephemeral | Last seen | Onlin

e | Expired

1 | coredns | [Ew3RB] | default | 10.1.0.1 | false | 2022-03-20 09:08:58 | onlin

e | no
2 | carsondemacbook-pro | [k7bzX] | default   | 10.1.0.2     | false     | 2022-03-20 09:48:30 | online  | no
```



回到 macOS，测试是否能 ping 通对端节点：

```bash
$ ping -c 2 10.1.0.1
PING 10.1.0.1 (10.1.0.1): 56 data bytes
64 bytes from 10.1.0.1: icmp_seq=0 ttl=64 time=37.025 ms
64 bytes from 10.1.0.1: icmp_seq=1 ttl=64 time=38.181 ms

--- 10.1.0.1 ping statistics ---
2 packets transmitted, 2 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 37.025/37.603/38.181/0.578 ms
```



也可以使用 Tailscale CLI 来测试：

```bash
$ /Applications/Tailscale.app/Contents/MacOS/Tailscale ping 10.1.0.1
pong from coredns (10.1.0.1) via xxxx:41641 in 36ms
```



### Android

Android 客户端从 1.30.0 版本开始支持自定义控制服务器（即 coordination server），你可以通过 [Google Play](https://play.google.com/store/apps/details?id=com.tailscale.ipn) 或者 [F-Droid](https://f-droid.org/packages/com.tailscale.ipn/) 下载最新版本的客户端。

安装完成后打开 Tailscale App，会出现如下的界面：

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting4@main/uPic/2022-11-22-18-12-m2IYpv.jpeg)

点开右上角的“三个点”，你会看到只有一个 `About` 选项：

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting4@main/uPic/2022-11-22-18-14-ghdl4A.jpeg)

接下来就需要一些骚操作了，你需要反复不停地**点开再关闭**右上角的“三个点”，重复三四次之后，便会出现一个 `Change server` 选项：

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting4@main/uPic/2022-11-22-18-23-mcAexh.jpeg)

点击 `Change server`，将 headscale 控制服务器的地址填进去：

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting4@main/uPic/2022-11-22-18-37-fkRIxW.jpeg)

然后点击 `Save and restart` 重启，点击 `Sign in with other`，就会跳出这个页面：

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting4@main/uPic/2022-06-07-09-30-bf83jv.jpeg)

将其中的命令粘贴到 Headscale 所在主机的终端，将 **NAMESPACE** 替换为之前创建的 namespace，然后执行命令即可。注册成功后可将该页面关闭，回到 App 主页，效果如图：

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting4@main/uPic/2022-11-22-18-48-M07ibg.jpeg)

### Windows

Windows Tailscale 客户端想要使用 Headscale 作为控制服务器，只需在浏览器中打开 URL：`http://<HEADSCALE_PUB_IP>:8080/windows`，便会出现如下的界面：

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting3@main/uPic/2022-03-20-23-30-zcQX3F.png)

按照其中的步骤操作即可。

### 其他 Linux 发行版

除了常规的 Linux 发行版之外，还有一些特殊场景的 Linux 发行版，比如 OpenWrt、威联通（QNAP）、群晖等，这些发行版的安装方法已经有人写好了，这里就不详细描述了，我只给出相关的 GitHub 仓库，大家如果自己有需求，直接去看相关仓库的文档即可。

- OpenWrt： https://github.com/adyanth/openwrt-tailscale-enabler
- 群晖： https://github.com/tailscale/tailscale-synology
- 威联通： https://github.com/ivokub/tailscale-qpkg

### iOS

Tailscale iOS 客户端源代码没有开源，目前还无法破解使其使用第三方控制服务器，遗憾~~

### 通过 Pre-Authkeys 接入

前面的接入方法都需要服务端同意，步骤比较烦琐，其实还有更简单的方法，可以直接接入，不需要服务端同意。

首先在服务端生成 pre-authkey 的 token，有效期可以设置为 24 小时：

```bash
$ headscale preauthkeys create -e 24h -n default
```



查看已经生成的 key：

```bash
$ headscale -n default preauthkeys list
ID | Key                                              | Reusable | Ephemeral | Used  | Expiration          | Created            
1  | 57e419c40e30b0dxxxxxxxf15562c18a8c6xxxx28ae76f57 | false    | false     | false | 2022-05-30 07:14:17 | 2022-05-29 07:14:17
```



现在新节点就可以无需服务端同意直接接入了：

```bash
$ tailscale up --login-server=http://<HEADSCALE_PUB_IP>:8080 --accept-routes=true --accept-dns=false --authkey $KEY
```



## 打通局域网

到目前为止我们只是打造了一个点对点的 Mesh 网络，各个节点之间都可以通过 WireGuard 的私有网络 IP 进行直连。但我们可以更大胆一点，还记得我在文章开头提到的访问家庭内网的资源吗？我们可以通过适当的配置让每个节点都能访问其他节点的局域网 IP。这个使用场景就比较多了，你可以直接访问家庭内网的 NAS，或者内网的任何一个服务，**更高级的玩家可以使用这个方法来访问云上 Kubernetes 集群的 Pod IP 和 Service IP。**

假设你的家庭内网有一台 Linux 主机（比如 OpenWrt）安装了 Tailscale 客户端，我们希望其他 Tailscale 客户端可以直接通过家中的局域网 IP（例如 **192.168.100.0/24**） 访问家庭内网的任何一台设备。

配置方法很简单，首先需要设置 IPv4 与 IPv6 路由转发：

```bash
$ echo 'net.ipv4.ip_forward = 1' | tee /etc/sysctl.d/ipforwarding.conf
$ echo 'net.ipv6.conf.all.forwarding = 1' | tee -a /etc/sysctl.d/ipforwarding.conf
$ sysctl -p /etc/sysctl.d/ipforwarding.conf
```



客户端修改注册节点的命令，在原来命令的基础上加上参数 `--advertise-routes=192.168.100.0/24`，告诉 Headscale 服务器“我这个节点可以转发这些地址的路由”。

```bash
$ tailscale up --login-server=http://<HEADSCALE_PUB_IP>:8080 --accept-routes=true --accept-dns=false --advertise-routes=192.168.100.0/24 --reset
```



在 Headscale 端查看路由，可以看到相关路由是关闭的。

```bash
$ headscale nodes list|grep openwrt

6 | openwrt | [7LdVc] | default | 10.1.0.6 | false | 2022-03-20 15:50:46 | onlin

e | no

$ headscale routes list -i 6

Route | Enabled

192.168.100.0/24 | false
```



开启路由：

```bash
$ headscale routes enable -i 6 -r "192.168.100.0/24"

Route | Enabled

192.168.100.0/24 | true
```



如果有多条路由需要用 `,` 隔开：

```bash
$ headscale routes enable -i 6 -r "192.168.100.0/24,xxxx"
```



也可以通过参数 -a 开启所有路由：

```bash
$ headscale routes enable -i 6 -a
```



其他节点查看路由结果：

```bash
$ ip route show table 52|grep "192.168.100.0/24"
192.168.100.0/24 dev tailscale0
```



其他节点启动时需要增加 `--accept-routes=true` 选项来声明 “我接受外部其他节点发布的路由”。

现在你在任何一个 Tailscale 客户端所在的节点都可以 ping 通家庭内网的机器了，你在公司或者星巴克也可以像在家里一样用同样的 IP 随意访问家中的任何一个设备，就问你香不香？

## 总结

目前从稳定性来看，Tailscale 比 Netmaker 略胜一筹，基本上不会像 Netmaker 一样时不时出现 ping 不通的情况，这取决于 Tailscale 在用户态对 NAT 穿透所做的种种优化，他们还专门写了一篇文章介绍 [NAT 穿透的原理](https://tailscale.com/blog/how-nat-traversal-works/)， [中文版](https://arthurchiao.art/blog/how-nat-traversal-works-zh/)翻译自国内的 eBPF 大佬赵亚楠，墙裂推荐大家阅读。放一张图给大家感受一下：

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting3@main/uPic/2022-03-21-10-52-TzXGEZ.png)

本文给大家介绍了 Tailscale 和 Headscale，包括 Headscale 的安装部署和各个平台客户端的接入，以及如何打通各个节点所在的局域网。下篇文章将会给大家介绍 [如何让 Tailscale 使用自定义的 DERP Servers](https://icloudnative.io/posts/custom-derp-servers/)（也就是中继服务器），See you~~