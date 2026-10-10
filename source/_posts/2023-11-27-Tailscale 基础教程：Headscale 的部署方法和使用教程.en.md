---
title: "Tailscale Basic Tutorial: Headscale Deployment Method and Usage Tutorial"
date: 2023-11-27 17:52:55
tags: ["web"]
lang: en
slug: Tailscale 基础教程：Headscale 的部署方法和使用教程
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

## Tailscale Basic Tutorial: Headscale Deployment and Usage Tutorial

> Basic commands

```shell
headscale namespaces create default

headscale preauthkeys create -e 65535h -u default --reusable	#生成auth_key

headscale node list

tailscale up --login-server=http://<HEADSCALE_PUB_IP>:8080 --accept-routes=true --accept-dns=false --advertise-routes=192.168.100.0/24

### tailscale up --login-server=http://124.221.253.77:8080 --accept-routes=true --accept-dns=false --advertise-routes=10.10.0.0/24,121.48.165.112/32,202.115.0.0/24 --authkey 068287073b622d63fd62286744bb6646b7e13fa13fff9d53 --reset --force-reauth

### 671eddba4d7cef3dd4bbc27aa61771d926dab8c5a72b5d64
```



## Docker Deployment

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



Modify the configuration file, change `server_url` to the public IP or domain name.

If the DNS function is not needed for now, you can first set `magic_dns` to false.

Set `server_url` to `http://<PUBLIC_IP>:8080`, and replace `<PUBLIC_IP>` with the public IP or domain name.

You can customize the private network segment, and you can also enable both IPv4 and IPv6:

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

At present, the Ministry of Industry and Information Technology of China is vigorously promoting the three major operators to develop IPv6. For home broadband, the available public IPv4 addresses will become fewer and fewer. In some areas, even if you get a public IPv4 address, it is a large internal network address, not a true public IP at all, and accessing resources on the home intranet will become increasingly difficult.

Some friends may choose to use frp and other intranet penetration solutions for specific protocols and ports, but this kind of solution is still not satisfying enough—it cannot access any port of any device on the home intranet. A better choice is still to build a large intranet through VPN. As for which VPN to choose, there is no doubt that it must be WireGuard; WireGuard is the future of VPN. **I have recommended WireGuard to everyone more than once. I'm tired and don't want to talk about it anymore. If you love to use garbage like OpenVPN, then go ahead, as long as you're happy.**

The core advantage of WireGuard over traditional VPNs is that there is no VPN gateway; all nodes can connect peer-to-peer (P2P), which is the [full mesh mode](https://icloudnative.io/posts/wireguard-full-mesh/#1-全互联模式架构与配置)，效率更高，速度更快，成本更低。 I mentioned earlier.

The biggest pain point of WireGuard at present is that the functions of upper-layer applications are not complete enough, because WireGuard advocates the Unix philosophy. WireGuard itself is only a kernel-level module, only a data plane. As for higher-level functions at the upper layer (such as key exchange mechanisms, UDP hole punching, ACL, etc.), they need to be implemented through user-space applications.

Therefore, in order to implement a more perfect VPN tool based on WireGuard, many projects have emerged and are fighting each other. Some time ago, the author had been promoting [Netmaker](https://icloudnative.io/posts/configure-a-mesh-network-with-netmaker/)，它通过可视化界面来配置 WireGuard's full mesh mode. It supports UDP hole punching, multi-tenancy, and various high-end features, is almost compatible with all platforms, and is very powerful. However, the real world is complex, and it cannot be guaranteed that all NATs can successfully punch holes. Moreover, Netmaker currently has no fallback mechanism; if hole punching fails, it cannot fall back to using relay nodes. Tailscale is much smarter than Netmaker on this point. It supports a fallback mechanism and can try its best to implement full mesh mode. Even if some nodes fail to punch holes, they can still move freely in this virtual network through relay nodes.

That's right, I've fallen out of love and switched from the Netmaker camp to Tailscale. I'm indeed a scumbag.

## What Is Tailscale

Tailscale is a virtual networking tool based on WireGuard. Similar to Netmaker, **the biggest difference is that Tailscale implements the WireGuard protocol in user space, while Netmaker directly uses kernel-space WireGuard**. Therefore, compared with kernel-space WireGuard, Tailscale will suffer some performance loss, but compared with the likes of OpenVPN, it can still leave them far behind. Although Tailscale has made some trade-offs in performance, it absolutely crushes other tools in terms of functionality and ease of use:

1. Out of the box
- No firewall configuration required
- No additional configuration

1. High security/privacy
- Automatic key rotation
- Peer-to-peer connections
- Supports user auditing of end-to-end access records

1. In addition to the original ICE, STUN and other UDP protocols, it implements the DERP TCP protocol to achieve NAT traversal
2. A public-network-based control server distributes ACLs and configurations to enable dynamic node updates
3. Generates users and private keys through third-party (such as Google) SSO services to implement identity authentication

In short, we can regard Tailscale as a more user-friendly and more fully featured WireGuard.

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting3@main/uPic/2022-03-20-14-50-Q4bWmK.png)

These alone are not enough. As a freeloader, what I care about more is **free** and **open source**.

Tailscale is a commercial product, but individual users can freeload it. Individual users can use it for free when the number of connected devices does not exceed 20 (although there are some restrictions, such as subnet CIDR blocks cannot be customized, and multiple subnets cannot be set). Except for the graphical applications for Windows and macOS, the components of other Tailscale clients (including the Android client) are developed as open-source projects under the BSD license. You can find them in their [GitHub repository](https://github.com/tailscale/)找到各个操作系统的客户端源码。

For most users, freeloading Tailscale is already enough. If you have higher requirements, such as custom network segments, you can choose to pay.

**What if I just don't want to pay? Sure, but you'll need to read on.**

## What Is Headscale

Tailscale's control server is not open source, and it has many restrictions for free users. This is their cash cow, which is understandable. Fortunately, there is currently an open-source implementation called [Headscale](https://github.com/juanfont/headscale)，这也是唯一的一款，希望能发展壮大。

Headscale was developed by Juan Font of the European Space Agency using the Go language, and is released under the BSD license. It implements all the main functions of the Tailscale control server, can be deployed inside an enterprise, has no limit on the number of devices, and all network traffic is controlled by yourself.

Currently Headscale does not yet have a visual interface; look forward to future updates.

## Headscale Deployment

Headscale deployment is very simple. It is recommended to install it directly on a Linux host.

> Theoretically, as long as your Headscale service can be exposed to the public network egress, it is fine, but it is best not to have NAT, so it is recommended to deploy Headscale on a cloud host with a public IP.

First, you need to go to the Release page of its GitHub repository to download the latest binary file.

```bash
$ wget --output-document=/usr/local/bin/headscale \
   https://github.com/juanfont/headscale/releases/download/v<HEADSCALE VERSION>/headscale_<HEADSCALE VERSION>_linux_<ARCH>

$ chmod +x /usr/local/bin/headscale
```



Create a configuration directory:

```bash
$ mkdir -p /etc/headscale
```



Create directories for storing data and certificates:

```bash
$ mkdir -p /var/lib/headscale
```



Create an empty SQLite database file:

```bash
$ touch /var/lib/headscale/db.sqlite
```



Create the Headscale configuration file:

```bash
$ wget https://github.com/juanfont/headscale/raw/main/config-example.yaml -O /etc/headscale/config.yaml
```



- Modify the configuration file, change `server_url` to the public IP or domain name. **If it is a domestic server, the domain name must be filed/registered with the authorities**. My domain name cannot be filed, so I just used the public IP directly.

- If the DNS function is not needed for now, you can first set `magic_dns` to false.

- Set `server_url` to `http://<PUBLIC_IP>:8080`, and replace `<PUBLIC_IP>` with the public IP or domain name.

- You can customize the private network segment, and you can also enable both IPv4 and IPv6:

    ```yaml
    ip_prefixes:
      # - fd7a:115c:a1e0::/48
      - 10.1.0.0/16
    ```

    

Create the SystemD service configuration file:

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



Create the headscale user:

```bash
$ useradd headscale -d /home/headscale -m
```



Modify the owner of the /var/lib/headscale directory:

```bash
$ chown -R headscale:headscale /var/lib/headscale
```



Modify `unix_socket` in the configuration file:

```yaml
unix_socket: /var/run/headscale/headscale.sock
```



Reload SystemD to load the new configuration file:

```bash
$ systemctl daemon-reload
```



Start the Headscale service and set it to start on boot:

```bash
$ systemctl enable --now headscale
```



Check the running status:

```bash
$ systemctl status headscale
```



Check the occupied ports:

```bash
$ ss -tulnp|grep headscale

tcp LISTEN 0 1024 [::]:9090 [::]:* users:(("headscale",pi

d=10899,fd=13))

tcp LISTEN 0 1024 [::]:50443 [::]:* users:(("headscale",pi

d=10899,fd=10))

tcp LISTEN 0 1024 [::]:8080 [::]:* users:(("headscale",pi

d=10899,fd=12))
```



There is a concept in Tailscale called tailnet, which you can understand as a tenant. Tenants are isolated from each other. For details, refer to Tailscale's official documentation: [What is a tailnet](https://tailscale.com/kb/1136/tailnet/)。Headscale There is a similar implementation called namespace, i.e., namespace. We need to first create a namespace so that clients can connect later, for example:

```bash
$ headscale namespaces create default
```



View namespaces:

```bash
$ headscale namespaces list

ID | Name | Created

1 | default | 2022-03-09 06:12:06
```



## Tailscale Client Onboarding

Currently, except for the iOS client, clients on other platforms all have ways to customize Tailscale's control server.

| OS      | Whether Headscale Is Supported                                           |
| :------ | :----------------------------------------------------------- |
| Linux   | Yes                                                          |
| OpenBSD | Yes                                                          |
| FreeBSD | Yes                                                          |
| macOS   | Yes                                                          |
| Windows | Yes, refer to [Windows client documentation](https://github.com/juanfont/headscale/blob/main/docs/windows-client.md) |
| Android | Supported, refer to [this PR](https://github.com/tailscale/tailscale-android/pull/55) |
| iOS     | Not yet supported                                                     |

Let's first look at onboarding on the Linux platform.

### Linux

Tailscale officially provides packages for various Linux distributions, but you know how the domestic network is—the software repositories simply cannot be used. Fortunately, the official also provides [statically compiled binary files](https://tailscale.com/download/linux/static)，我们可以直接下载。例如：

```bash
$ wget https://pkgs.tailscale.com/stable/tailscale_1.22.2_amd64.tgz
```



Extract:

```bash
$ tar zxvf tailscale_1.22.2_amd64.tgz
x tailscale_1.22.2_amd64/
x tailscale_1.22.2_amd64/tailscale
x tailscale_1.22.2_amd64/tailscaled
x tailscale_1.22.2_amd64/systemd/
x tailscale_1.22.2_amd64/systemd/tailscaled.defaults
x tailscale_1.22.2_amd64/systemd/tailscaled.service
```



Copy the binary file to the default path of the official package:

```bash
$ cp tailscale_1.22.2_amd64/tailscaled /usr/sbin/tailscaled
$ cp tailscale_1.22.2_amd64/tailscale /usr/bin/tailscale
```



Copy the systemD service configuration file to the system path:

```bash
$ cp tailscale_1.22.2_amd64/systemd/tailscaled.service /lib/systemd/system/tailscaled.service
```



Copy the environment variable configuration file to the system path:

```bash
$ cp tailscale_1.22.2_amd64/systemd/tailscaled.defaults /etc/default/tailscaled
```



Start tailscaled.service and set it to start on boot:

```bash
$ systemctl enable --now tailscaled
```



Check the service status:

```bash
$ systemctl status tailscaled
```



Connect Tailscale to Headscale:

```bash
# 将 <HEADSCALE_PUB_IP> 换成你的 Headscale 公网 IP 或域名
$ tailscale up --login-server=http://<HEADSCALE_PUB_IP>:8080 --accept-routes=true --accept-dns=false
```



Here it is recommended to disable the DNS function, because it will override the system's default DNS. If you need DNS, you can study the official documentation yourself; I will not go into details here.

After executing the above command, the following information will appear:

```bash
To authenticate, visit:

http://xxxxxx:8080/register?key=905cf165204800247fbd33989dbc22be95c987286c45aac303393704

1150d846
```



Open the link in a browser, and the following interface will appear:

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting3@main/uPic/2022-03-20-17-06-08qWbz.png)

Copy and paste the command into the terminal of the machine where headscale is located, and replace NAMESPACE with the namespace created earlier.

```bash
$ headscale -n default nodes register --key 905cf165204800247fbd33989dbc22be95c987286c45aac3033937041150d846
Machine register
```



Registration successful. View the registered nodes:

```bash
$ headscale nodes list

ID | Name | NodeKey | Namespace | IP addresses | Ephemeral | Last seen | Onlin

e | Expired

1 | coredns | [Ew3RB] | default | 10.1.0.1 | false | 2022-03-20 09:08:58 | onlin

e | no
```



Return to the Linux host where the Tailscale client is located. You can see that Tailscale will automatically create the relevant routing table and iptables rules. The routing table can be viewed with the following command:

```bash
$ ip route show table 52
```



View iptables rules:

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

There are 3 installation methods for macOS:

- Install directly through the App Store, address: https://apps.apple.com/ca/app/tailscale/id1475387142。前提是你**需要一个美区 ID**...
- Download the [installation package](https://pkgs.tailscale.com/stable/#macos)直接安装，绕过应用商店。
- Install the open-source command-line tools `tailscale` and `tailscaled`. Related links: https://github.com/tailscale/tailscale/wiki/Tailscaled-on-macOS。

The core packet processing code of these three installation packages is the same. The only difference lies in the packaging method and the way they interact with the system.

The app in the App Store runs in an [app sandbox](https://developer.apple.com/library/archive/documentation/Security/Conceptual/AppSandboxDesignGuide/AboutAppSandbox/AboutAppSandbox.html)中，与系统的其他部分隔离。在沙箱内，应用可以是一个 [network extension](https://developer.apple.com/documentation/networkextension)，以实现 VPN or VPN-like functionality. The functionality implemented by the network extension cannot take effect for apps outside the App Store.

Starting from macOS 10.15, [system extensions](https://developer.apple.com/system-extensions/)，说白了就是运行在用户态的内核扩展，它相比于传统的网络扩展增强了很多功能，比如内容过滤、透明代理、DNS proxies, etc. were added. The Tailscale installation package independent of the App Store uses **system extensions**, distributed through DMG or zip archives.

Do not install both the App Store version and the independently distributed version at the same time; only one can be installed at a time.

The command-line tool uses neither a network extension nor a system extension, but uses the [utun interface](https://en.wikipedia.org/wiki/TUN/TAP)，相比于 The GUI version lacks some features, such as MagicDNS and Taildrop.

Overview:

|                | App Store (Network Extension)                                        | Standalone App (System Extension)                                         | Command-Line Version                                                   |
| :------------- | :---------------------------------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| Available       | [yes](https://apps.apple.com/ca/app/tailscale/id1475387142) | yes, [beta](https://tailscale.com/kb/1167/release-stages/#beta) | [yes](https://github.com/tailscale/tailscale/wiki/Tailscaled-on-macOS) |
| GUI       | yes                                                         | yes                                                          | no; CLI                                                      |
| Minimum macOS version | macOS 10.13                                                 | macOS 10.15                                                  | macOS 10.13                                                  |
| Runs in background       | no; sandboxed                                               | Theoretically supported; not yet implemented                                         | yes                                                          |
| Keychain used 🔑  | User-level                                                      | System-level                                                       | Stored directly in files                                             |
| Sandbox isolation       | yes                                                         | no                                                           | no                                                           |
| Automatic updates       | yes; updated directly by App Store                                       | yes; [Sparkle](https://sparkle-project.org/)                 | no                                                           |
| Open source       | no                                                          | no                                                           | yes                                                          |
| MagicDNS       | yes                                                         | yes                                                          | yes                                                          |
| Taildrop       | yes                                                         | yes                                                          | Not implemented                                                       |

After installing the GUI app, you still need to do some hacky operations to make Tailscale use Headscale as the control server. Of course, Headscale has already provided us with detailed operation steps. You just need to open the URL in a browser: `http://<HEADSCALE_PUB_IP>:8080/apple`, and the following interface will appear:

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting4@main/uPic/2022-11-22-17-53-rjcTVg.png)

You just need to follow the steps described in the image; this article will not repeat them.

For the non-App Store version of the macOS client, you need to replace `io.tailscale.ipn.macos` with `io.tailscale.ipn.macsys`. That is: `defaults write io.tailscale.ipn.macsys ControlURL http://<HEADSCALE_PUB_IP>:8080`

After modification, restart the Tailscale client. Find Tailscale in the macOS top status bar and click it, then click `Log in`.

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting3@main/uPic/2022-03-20-17-43-pTW3r7.png)

Then it will immediately jump to the browser and open a page.

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting3@main/uPic/2022-03-20-17-46-AbzngB.png)

Next, same as the previous Linux client, return to the machine where Headscale is located and execute the command in the browser. Registration successful:

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting3@main/uPic/2022-03-20-17-51-Gcjcmy.png)

Return to the host where Headscale is located and view the registered nodes:

```bash
$ headscale nodes list

ID | Name | NodeKey | Namespace | IP addresses | Ephemeral | Last seen | Onlin

e | Expired

1 | coredns | [Ew3RB] | default | 10.1.0.1 | false | 2022-03-20 09:08:58 | onlin

e | no
2 | carsondemacbook-pro | [k7bzX] | default   | 10.1.0.2     | false     | 2022-03-20 09:48:30 | online  | no
```



Return to macOS and test whether the peer node can be pinged:

```bash
$ ping -c 2 10.1.0.1
PING 10.1.0.1 (10.1.0.1): 56 data bytes
64 bytes from 10.1.0.1: icmp_seq=0 ttl=64 time=37.025 ms
64 bytes from 10.1.0.1: icmp_seq=1 ttl=64 time=38.181 ms

--- 10.1.0.1 ping statistics ---
2 packets transmitted, 2 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 37.025/37.603/38.181/0.578 ms
```



You can also use the Tailscale CLI to test:

```bash
$ /Applications/Tailscale.app/Contents/MacOS/Tailscale ping 10.1.0.1
pong from coredns (10.1.0.1) via xxxx:41641 in 36ms
```



### Android

Starting from version 1.30.0, the Android client supports a custom control server (i.e., coordination server). You can download the latest version of the client through [Google Play](https://play.google.com/store/apps/details?id=com.tailscale.ipn) or [F-Droid](https://f-droid.org/packages/com.tailscale.ipn/).

After installation, open the Tailscale App, and the following interface will appear:

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting4@main/uPic/2022-11-22-18-12-m2IYpv.jpeg)

Tap the "three dots" in the upper right corner, and you will see only one `About` option:

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting4@main/uPic/2022-11-22-18-14-ghdl4A.jpeg)

Next, some hacky operations are needed. You need to repeatedly **open and close** the "three dots" in the upper right corner. After repeating three or four times, a `Change server` option will appear:

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting4@main/uPic/2022-11-22-18-23-mcAexh.jpeg)

Click `Change server`, and fill in the address of the headscale control server:

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting4@main/uPic/2022-11-22-18-37-fkRIxW.jpeg)

Then click `Save and restart` to restart, and click `Sign in with other`, and this page will pop up:

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting4@main/uPic/2022-06-07-09-30-bf83jv.jpeg)

Paste the command into the terminal of the host where Headscale is located, replace **NAMESPACE** with the namespace created earlier, and then execute the command. After successful registration, you can close this page and return to the App home page. The effect is as shown:

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting4@main/uPic/2022-11-22-18-48-M07ibg.jpeg)

### Windows

If the Windows Tailscale client wants to use Headscale as the control server, you only need to open the URL in a browser: `http://<HEADSCALE_PUB_IP>:8080/windows`, and the following interface will appear:

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting3@main/uPic/2022-03-20-23-30-zcQX3F.png)

Just follow the steps in it.

### Other Linux Distributions

In addition to regular Linux distributions, there are also Linux distributions for special scenarios, such as OpenWrt, QNAP, Synology, etc. Someone has already written installation methods for these distributions, so I will not describe them in detail here. I will only give the relevant GitHub repositories. If you have your own needs, just go look at the documentation of the relevant repositories.

- OpenWrt: https://github.com/adyanth/openwrt-tailscale-enabler
- Synology: https://github.com/tailscale/tailscale-synology
- QNAP: https://github.com/ivokub/tailscale-qpkg

### iOS

The Tailscale iOS client source code is not open source, and it is currently impossible to crack it to use a third-party control server. What a pity~~

### Onboarding via Pre-Authkeys

The previous onboarding methods all require server-side approval, and the steps are rather cumbersome. In fact, there is a simpler method that can connect directly without server-side approval.

First, generate a pre-authkey token on the server. The validity period can be set to 24 hours:

```bash
$ headscale preauthkeys create -e 24h -n default
```



View the already generated keys:

```bash
$ headscale -n default preauthkeys list
ID | Key                                              | Reusable | Ephemeral | Used  | Expiration          | Created            
1  | 57e419c40e30b0dxxxxxxxf15562c18a8c6xxxx28ae76f57 | false    | false     | false | 2022-05-30 07:14:17 | 2022-05-29 07:14:17
```



Now new nodes can connect directly without server-side approval:

```bash
$ tailscale up --login-server=http://<HEADSCALE_PUB_IP>:8080 --accept-routes=true --accept-dns=false --authkey $KEY
```



## Connecting the LAN

So far we have only built a peer-to-peer Mesh network, and each node can directly connect to others through WireGuard's private network IP. But we can be bolder. Do you remember the access to home intranet resources I mentioned at the beginning of the article? Through proper configuration, we can let each node access the LAN IP of other nodes. There are many use cases for this. You can directly access the NAS on the home intranet, or any service on the intranet. **More advanced players can use this method to access the Pod IP and Service IP of a Kubernetes cluster in the cloud.**

Suppose your home intranet has a Linux host (such as OpenWrt) with the Tailscale client installed. We want other Tailscale clients to be able to directly access any device on the home intranet through the home LAN IP (for example, **192.168.100.0/24**).

The configuration method is very simple. First, you need to set up IPv4 and IPv6 route forwarding:

```bash
$ echo 'net.ipv4.ip_forward = 1' | tee /etc/sysctl.d/ipforwarding.conf
$ echo 'net.ipv6.conf.all.forwarding = 1' | tee -a /etc/sysctl.d/ipforwarding.conf
$ sysctl -p /etc/sysctl.d/ipforwarding.conf
```



On the client, modify the command for registering the node. Add the parameter `--advertise-routes=192.168.100.0/24` to the original command to tell the Headscale server, "This node can forward routes for these addresses."

```bash
$ tailscale up --login-server=http://<HEADSCALE_PUB_IP>:8080 --accept-routes=true --accept-dns=false --advertise-routes=192.168.100.0/24 --reset
```



Check the routes on the Headscale side, and you can see that the relevant routes are disabled.

```bash
$ headscale nodes list|grep openwrt

6 | openwrt | [7LdVc] | default | 10.1.0.6 | false | 2022-03-20 15:50:46 | onlin

e | no

$ headscale routes list -i 6

Route | Enabled

192.168.100.0/24 | false
```



Enable routes:

```bash
$ headscale routes enable -i 6 -r "192.168.100.0/24"

Route | Enabled

192.168.100.0/24 | true
```



If there are multiple routes, they need to be separated with `,`:

```bash
$ headscale routes enable -i 6 -r "192.168.100.0/24,xxxx"
```



You can also enable all routes with the parameter -a:

```bash
$ headscale routes enable -i 6 -a
```



Other nodes view the route results:

```bash
$ ip route show table 52|grep "192.168.100.0/24"
192.168.100.0/24 dev tailscale0
```



When other nodes start, they need to add the `--accept-routes=true` option to declare, "I accept routes advertised by other external nodes."

Now you can ping machines on the home intranet from any node where a Tailscale client is located. At the office or Starbucks, you can also use the same IP to freely access any device at home just like at home. Isn't that awesome?

## Summary

From the perspective of stability, Tailscale is currently slightly better than Netmaker. It basically will not, like Netmaker, occasionally fail to ping. This depends on the various optimizations Tailscale has made for NAT traversal in user space. They also wrote a dedicated article introducing [the principles of NAT traversal](https://tailscale.com/blog/how-nat-traversal-works/)， [Chinese version](https://arthurchiao.art/blog/how-nat-traversal-works-zh/)翻译自国内的 by eBPF expert Zhao Yanan. I strongly recommend everyone read it. Here is a picture to give you a feel:

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting3@main/uPic/2022-03-21-10-52-TzXGEZ.png)

This article introduced Tailscale and Headscale, including Headscale installation and deployment, onboarding for clients on various platforms, and how to connect the LANs where each node is located. The next article will introduce [how to make Tailscale use custom DERP Servers](https://icloudnative.io/posts/custom-derp-servers/)（也就是中继服务器），See you~~