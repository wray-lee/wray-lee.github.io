---
title: "Tailscale Basics Tutorial: Deploying a Private DERP Relay Server"
date: 2023-09-05 02:16:06
tags: ["web"]
lang: en
slug: Tailscale 基础教程：部署私有 DERP 中继服务器
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

## Tailscale Basics: Deploying a Private DERP Relay Server

[Previous article](https://icloudnative.io/posts/how-to-set-up-or-migrate-headscale/#总结) introduced how to use `Headscale` to replace Tailscale's official control server and connect clients on various platforms. This article will introduce how to make Tailscale use custom DERP Servers. Many people may not know what `DERP` is, but that's okay, I'll start with **relay servers**.

## What Is STUN

Tailscale's ultimate goal is to make two machines **located anywhere on the network** establish a **peer-to-peer connection** (direct connection), but the real world is complex. In most cases, machines are behind NAT and firewalls. At this point, hole punching is needed to achieve direct connection, i.e., NAT traversal.

NAT can be divided into many types according to **NAT mapping behavior** and **stateful firewall behavior**, but for NAT traversal there is no need to care about so many types. You only need to look at **whether the NAT or stateful firewall strictly checks the target Endpoint**. Based on this factor, NAT can be divided into **Easy NAT** and **Hard NAT**.

- **Easy NAT** and its variants are called “Endpoint-Independent Mapping” (**EIM, endpoint-independent mapping**)
    Endpoint here refers to the target Endpoint. That is, as long as a stateful firewall sees an outbound packet initiated by the client itself, it will allow the corresponding inbound packet to enter, **regardless of who sent this inbound packet**.
- **hard NAT** and its variants are called “Endpoint-Dependent Mapping” (**EDM, endpoint-dependent mapping**)
    This kind of NAT generates a corresponding mapping relationship for each target Endpoint. On such a device, if the client initiates an outbound packet to a target Endpoint, assuming the client's public IP is 2.2.2.2, then the stateful firewall will open a port, say 4242. Then only inbound packets from that target Endpoint are allowed through `2.2.2.2:4242`, and all other clients are not allowed. This kind of NAT is stricter, so it is called Hard NAT.

For Easy NAT, we only need to provide a third-party service that can tell the client "what is the public ip:port of the client as seen by it", and then tell this information to the peer in some way. The latter then knows which address to connect to! This kind of service is called **STUN** (Session Traversal Utilities for NAT, NAT session traversal application). Its workflow is shown in the following figure:

- The laptop sends a request to the STUN server: "From your perspective, what is my address?"
- The STUN server returns a response: "I see your UDP packet is coming from this address: `ip:port`".

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting3@main/uPic/2022-03-26-17-27-yqHlMG.jpg)

## What Is Relay

For **Hard NAT**, STUN doesn't work well. Even if STUN obtains the client's public `ip:port` and tells the peer, it won't help, because the firewall only opened the hole when communicating with STUN. This hole only allows inbound packets from STUN to enter. Other peers know about this hole but still can't get in. Usually enterprise-grade NAT is Hard NAT.

In this case, hole punching is impossible, but we can't give up just like that. We can choose a compromise: create a relay server, the client communicates with the relay server, and the relay server then relays packets to the peer.

As for relay performance, it depends on the specific situation:

- If direct connection is possible, then there is obviously no need to use relay;
- But if direct connection is impossible, while the relay path is very close to the real path of direct connection between the two parties and the bandwidth is sufficient, then the relay method will not significantly reduce communication quality. Latency will definitely increase a bit, and bandwidth will be consumed, but **compared with being completely unable to connect, it is still acceptable**.

In fact, for most networks, Tailscale can successfully punch holes through various black technologies, and only in very few cases will it choose relay. Relay is only a fallback mechanism.

## Introduction to Relay Protocols

There are multiple ways to implement relay protocols.

### TURN

TURN stands for Traversal Using Relays around NAT. This is a classic relay implementation method. The core idea is:

- The **user** (person) first authenticates with a TURN server on the public internet. After success, the latter tells you: "I have allocated ip:port for you, and will relay traffic for you next",
- Then tell the other party this ip:port address and let it connect to this address. After that, it is a very simple client/server communication model.

Unlike STUN, this protocol has no real interactivity and is not very easy to use, so Tailscale did not adopt TURN as its relay protocol.

### DERP

DERP stands for Detoured Encrypted Routing Protocol. This is a protocol developed by Tailscale itself:

- It is a **general-purpose packet relay protocol that runs over HTTP**, and most networks allow HTTP communication.
- It relays encrypted traffic (encrypted payloads) according to the destination’s public key.

![Tailscale will automatically select the DERP server nearest to the target node to relay traffic](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting3@main/uPic/2022-03-26-19-02-zLDv51.svg)

The algorithm Tailscale uses is very interesting. **Connections between all clients first choose DERP mode (relay mode), which means the connection can be established immediately (the lowest-priority but 100% successful mode), and users do not need to wait at all**. Then path discovery starts in parallel. Usually after a few seconds, we can discover a better path, then transparently upgrade the existing connection to a peer-to-peer connection (direct connection).

Therefore, DERP is both Tailscale's guaranteed communication method when NAT traversal fails (its role at this time is similar to TURN), and a side channel that helps us complete NAT traversal in some other scenarios. In other words, it is both our fallback method and the infrastructure that helps us upgrade to a peer-to-peer connection when there is a better traversal link.

## Self-Hosted Private DERP Server

Tailscale's private key is only stored on the current node, so the DERP server cannot decrypt traffic. It can only, like other routers on the Internet, dumbly forward encrypted traffic from one node to another. The only difference is that DERP uses a slightly more advanced protocol to prevent abuse.

Tailscale has open-sourced the DERP server code. If you are interested, you can read [the DERP source code](https://github.com/tailscale/tailscale/tree/main/derp).

------

Tailscale officially has many built-in DERP servers distributed around the world, **except mainland China**, for reasons you know. This causes the latency to be very high once traffic is relayed through a DERP server. Moreover, the official DERP servers are used by countless people, which poses security risks.

To achieve low latency and high security, we can refer to [Tailscale's official documentation](https://tailscale.com/kb/1118/custom-derp-servers/) to self-host a private DERP server. There are two deployment modes: one is based on a domain name, and the other does not require a domain name and can use an IP directly, but requires a bit of hackery. Let's first look at the simplest domain name solution.

### Using a Domain Name

This solution needs to meet the following conditions:

- You must have your own domain name and have applied for an SSL certificate
- You need to prepare one or more cloud servers
- If the server is in China, the domain name needs ICP filing
- If the server is abroad, no filing is required

If all the above conditions are met, you can start deployment according to the following steps.

It is recommended to deploy directly with Docker. I have already built the Docker image, so you can deploy directly:

```bash
🐳  → docker run --restart always \
  --name derper -p 12345:12345 -p 3478:3478/udp \
  -v /root/.acme.sh/xxxx/:/app/certs \
  -e DERP_CERT_MODE=manual \
  -e DERP_ADDR=:12345 \
  -e DERP_DOMAIN=xxxx \
  -d ghcr.io/yangchuansheng/derper:latest
```

There are a few things to note:

- Use port 443 if possible; only use another port if absolutely necessary;
- By default, the STUN service is also enabled, and the UDP port is `3478`;
- The firewall needs to allow ports 12345 and 3478;
- Prepare an SSL certificate;
- I have redacted the domain part; please replace it with your own domain name.

The certificate part needs special emphasis: **Suppose your domain is `xxx.com`, then the certificate name must be `xxx.com.crt`, not a single character wrong! Similarly, the private key name must be `xxx.com.key`, not a single character wrong!**

View container logs:

```bash
🐳  → docker logs -f derper
2022/03/26 11:36:28 no config path specified; using /var/lib/derper/derper.key
2022/03/26 11:36:28 derper: serving on :12345 with TLS
2022/03/26 11:36:28 running STUN server on [::]:3478
```

Currently derper crashes after running for a while. There is no better solution for now, so we can only solve it by scheduled restarts, for example, using crontab to restart the container every two hours:

```bash
0 */2 * * * docker restart derper &> /dev/null
```

For details, see this issue: [Derper TLS handshake error: remote error: tls: internal error](https://github.com/tailscale/tailscale/issues/4082)

------

After deploying derper, you can modify Headscale's configuration to use a custom DERP server. Headscale can use custom DERP through two forms of configuration:

- One is an online URL, with the format `JSON`, the same format and syntax used by Tailscale's official control server.
- The other is a local file, with the format `YAML`.

We can directly use a local YAML configuration file, with the following content:

```yaml
# /etc/headscale/derp.yaml
regions:
  900:
    regionid: 900
    regioncode: thk 
    regionname: Tencent Hongkong 
    nodes:
      - name: 900a
        regionid: 900
        hostname: xxxx
        ipv4: xxxx
        stunport: 3478
        stunonly: false
        derpport: 12345
      - name: 900b
        regionid: 900
        hostname: xxxx
        ipv4: xxxx
        stunport: 3478
        stunonly: false
        derpport: 12345
  901:
    regionid: 901
    regioncode: hs 
    regionname: Huawei Shanghai 
    nodes:
      - name: 901a
        regionid: 901
        hostname: xxxx
        ipv4: xxxx
        stunport: 3478
        stunonly: false
        derpport: 12345
```

Configuration notes:

- `regions` is an **object** in YAML. Each object below represents an **availability zone**. Each **availability zone** can have multiple DERP nodes, i.e. `nodes`.
- The `regionid` of each availability zone cannot be duplicated.
- The `name` of each `node` cannot be duplicated.
- `regionname` is generally used to describe the availability zone, and `regioncode` is generally set to the abbreviation of the availability zone.
- The `ipv4` field is not required. If your domain name can resolve to your DERP server address over the public internet, you can leave it blank here. If you use a subdomain and have not added the relevant resolution record for this domain in a public DNS server, then you need to specify the IP here (provided that your certificate includes this subdomain, which is easy to support; just get a wildcard certificate).
- `stunonly: false` indicates that in addition to using the STUN service, the DERP service can also be used.
- I have redacted the domain and IP parts in the above configuration; you need to fill them in according to your actual situation.

Next, you also need to modify Headscale's configuration file to reference the custom DERP configuration file above. The configuration items that need to be modified are as follows:

```yaml
# /etc/headscale/config.yaml
derp:
  # List of externally available DERP maps encoded in JSON
  urls:
  #  - https://controlplane.tailscale.com/derpmap/default

  # Locally available DERP map files encoded in YAML
  #
  # This option is mostly interesting for people hosting
  # their own DERP servers:
  # https://tailscale.com/kb/1118/custom-derp-servers/
  #
  # paths:
  #   - /etc/headscale/derp-example.yaml
  paths:
    - /etc/headscale/derp.yaml

  # If enabled, a worker will be set up to periodically
  # refresh the given sources and update the derpmap
  # will be set up.
  auto_update_enabled: true

  # How often should we check for DERP updates?
  update_frequency: 24h
```

You can disable Tailscale's official DERP servers to test whether the self-hosted DERP server works properly.

After modifying the configuration, restart the headscale service:

```bash
$ systemctl restart headscale
```

On the Tailscale client, use the following command to view the currently available DERP servers:

```bash
$ tailscale netcheck

Report:
        * UDP: true
        * IPv4: yes, xxxxx:57068
        * IPv6: no
        * MappingVariesByDestIP: false
        * HairPinning: false
        * PortMapping: 
        * Nearest DERP: Tencent Hongkong
        * DERP latency:
                - thk: 39.7ms (Tencent Hongkong)
```

`tailscale netcheck` actually only checks the port of `3478/udp`. Even if netcheck shows it can connect, it does not necessarily mean port 12345 can forward traffic. The simplest way is to directly open the DERP server URL: https://xxxx:12345. If you see the following page and the SSL certificate indicator in the address bar shows normal and valid, then it is truly okay.

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting3@main/uPic/2022-03-27-11-21-dZ5dtZ.png)

Check the connection method with the peer:

```bash
$ tailscale status
10.1.0.5        coredns              default      linux   -
                carsondemacbook-pro  default      macOS   active; direct xxxx:2756; offline, tx 50424 rx 34056
                oneplus-8t           default      android active; relay "thk"; offline, tx 1608 rx 1552
                openwrt              default      linux   active; direct xxxx:2834; offline, tx 1403688 rx 1217620
```

This client is a cloud server and has 3 peers, namely macOS, OpenWRT, and an Android phone. macOS and OpenWRT are both in a China Telecom home network, and the Android phone uses China Telecom mobile data. As you can see, only the Android phone relays traffic through the custom DERP server, and the hole punching success rate is quite high. Use ping to test connectivity:

```bash
$ ping 10.1.0.8
PING 10.1.0.8 (10.1.0.8) 56(84) bytes of data.
64 bytes from 10.1.0.8: icmp_seq=1 ttl=64 time=150 ms
64 bytes from 10.1.0.8: icmp_seq=2 ttl=64 time=131 ms
64 bytes from 10.1.0.8: icmp_seq=3 ttl=64 time=161 ms
64 bytes from 10.1.0.8: icmp_seq=4 ttl=64 time=137 ms
64 bytes from 10.1.0.8: icmp_seq=5 ttl=64 time=156 ms
64 bytes from 10.1.0.8: icmp_seq=6 ttl=64 time=169 ms
^C
--- 10.1.0.8 ping statistics ---
6 packets transmitted, 6 received, 0% packet loss, time 5005ms
rtt min/avg/max/mdev = 131.728/151.154/169.627/13.193 ms
```

You can also use the Tailscale command-line tool to test:

```bash
$ tailscale ping 10.1.0.8
pong from oneplus-8t (10.1.0.8) via DERP(thk) in 104ms
pong from oneplus-8t (10.1.0.8) via DERP(thk) in 111ms
pong from oneplus-8t (10.1.0.8) via DERP(thk) in 105ms
```

This is a bit more friendly, and will directly tell you that you are communicating with the peer through the DERP relay server.

If the host running the current Tailscale client has IPv6 enabled, then it can directly connect peer-to-peer with the phone over IPv6:

```bash
$ /Applications/Tailscale.app/Contents/MacOS/Tailscale status
                coredns              default      linux   active; direct xxxx:45986; offline, tx 124352 rx 185736
                oneplus-8t           default      android active; direct [240e:472:da0:24a2:a07f:2a67:2a1e:4475]:37237; offline, tx 125216 rx 20052
                openwrt              default      linux   active; direct [240e:390:caf:1870:c02c:e8ff:feb9:b0b]:41641; offline, tx 181992 rx 3910120

$ /Applications/Tailscale.app/Contents/MacOS/Tailscale ping 10.1.0.8
pong from oneplus-8t (10.1.0.8) via [240e:472:da0:24a2:a07f:2a67:2a1e:4475]:37237 in 62ms
```

So if you enable IPv6, it can greatly increase the success rate of **peer-to-peer connections**.

### Using Pure IP

I know that most people do not have their own domain name. To take it a step further, even if you have your own domain name, if it has not been filed, you cannot deploy it on a domestic server for use.

At this point, we can only tamper with the derper source code. Find the `cmd/derper/cert.go` file in the tailscale repository, and delete or comment out content related to domain verification:

```go
func (m *manualCertManager) getCertificate(hi *tls.ClientHelloInfo) (*tls.Certificate, error) {
	//if hi.ServerName != m.hostname {
	//	return nil, fmt.Errorf("cert mismatch with hostname: %q", hi.ServerName)
	//}
	return m.cert, nil
}
```

You also need to create a self-signed certificate, which can be created with a script:

```bash
# build_cert.sh

#!/bin/bash

CERT_HOST=$1
CERT_DIR=$2
CONF_FILE=$3

echo "[req]
default_bits  = 2048
distinguished_name = req_distinguished_name
req_extensions = req_ext
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
countryName = XX
stateOrProvinceName = N/A
localityName = N/A
organizationName = Self-signed certificate
commonName = $CERT_HOST: Self-signed certificate

[req_ext]
subjectAltName = @alt_names

[v3_req]
subjectAltName = @alt_names

[alt_names]
IP.1 = $CERT_HOST
" > "$CONF_FILE"

mkdir -p "$CERT_DIR"
openssl req -x509 -nodes -days 730 -newkey rsa:2048 -keyout "$CERT_DIR/$CERT_HOST.key" -out "$CERT_DIR/$CERT_HOST.crt" -config "$CONF_FILE"
```

Rewrite the Dockerfile and set derper's domain to `127.0.0.1`:

```Dockerfile
FROM golang:latest AS builder

WORKDIR /app

# ========= CONFIG =========
# - download links
ENV MODIFIED_DERPER_GIT=https://github.com/yangchuansheng/ip_derper.git
ENV BRANCH=ip_derper
# ==========================

# build modified derper
RUN git clone -b $BRANCH $MODIFIED_DERPER_GIT tailscale --depth 1 && \
    cd /app/tailscale/cmd/derper && \
    /usr/local/go/bin/go build -ldflags "-s -w" -o /app/derper && \
    cd /app && \
    rm -rf /app/tailscale

FROM ubuntu:20.04
WORKDIR /app

# ========= CONFIG =========
# - derper args
ENV DERP_HOST=127.0.0.1
ENV DERP_CERTS=/app/certs/
ENV DERP_STUN true
ENV DERP_VERIFY_CLIENTS false
# ==========================

# apt
RUN apt-get update && \
    apt-get install -y openssl curl

COPY build_cert.sh /app/
COPY --from=builder /app/derper /app/derper

# build self-signed certs && start derper
CMD bash /app/build_cert.sh $DERP_HOST $DERP_CERTS /app/san.conf && \
    /app/derper --hostname=$DERP_HOST \
    --certmode=manual \
    --certdir=$DERP_CERTS \
    --stun=$DERP_STUN  \
    --verify-clients=$DERP_VERIFY_CLIENTS
```

After building the image, you can directly start the derper container with this image on the host where you want to deploy derper. The command is as follows:

```bash
🐳  → docker run --restart always --net host --name derper -d ghcr.io/yangchuansheng/ip_derper
```

As with the domain name solution, the firewall needs to allow the corresponding ports (12345 and 3478).

View container logs:

```bash
🐳  → docker logs -f derper
Generating a RSA private key
.......................................+++++
..............+++++
writing new private key to '/app/certs//127.0.0.1.key'
-----
2022/03/26 14:30:31 no config path specified; using /var/lib/derper/derper.key
2022/03/26 14:30:31 derper: serving on :443 with TLS
2022/03/26 14:30:31 running STUN server on [::]:3478
```

If you want to build the derper image yourself, you can refer to [my GitHub repository](https://github.com/yangchuansheng/ip_derper).

------

Now for the fancy trick: in Headscale's configuration, we need to **set the DERP domain to an IP**! If you don't understand, take a moment to digest it, then keep reading haha~~

In addition to derper, the Tailscale client also needs to **skip domain verification**, and this needs to be set in the DERP configuration. However, Headscale's local YAML file does not currently support this configuration item, so there's no way; we can only use an online URL. The JSON configuration content is as follows:

```json
{
  "Regions": {
    "901": {
      "RegionID": 901,
      "RegionCode": "ali-sh",
      "RegionName": "Aliyun Shanghai",
      "Nodes": [
        {
          "Name": "901a",
          "RegionID": 901,
          "DERPPort": 443,
          "HostName": "xxxx",
          "IPv4": "xxxx",
          "InsecureForTests": true
        }
      ]
    }
  }
}
```

Configuration explanation:

- For `HostName`, directly fill in derper's public IP, i.e. the same as the value of `IPv4`.
- `InsecureForTests` must be set to true to skip domain verification.

You need to turn this JSON file into a URL accessible by the Headscale server, for example, set up Nginx on the Headscale host, or upload it to object storage (such as Alibaba Cloud OSS).

Next, you also need to modify Headscale's configuration file to reference the custom DERP URL above. The configuration items that need to be modified are as follows:

```yaml
# /etc/headscale/config.yaml
derp:
  # List of externally available DERP maps encoded in JSON
  urls:
  #  - https://controlplane.tailscale.com/derpmap/default
    - https://xxxxx/derp.json

  # Locally available DERP map files encoded in YAML
  #
  # This option is mostly interesting for people hosting
  # their own DERP servers:
  # https://tailscale.com/kb/1118/custom-derp-servers/
  #
  # paths:
  #   - /etc/headscale/derp-example.yaml
  paths:
    - /etc/headscale/derp.yaml

  # If enabled, a worker will be set up to periodically
  # refresh the given sources and update the derpmap
  # will be set up.
  auto_update_enabled: true

  # How often should we check for DERP updates?
  update_frequency: 24h
```

After modifying the configuration, restart the headscale service:

```bash
$ systemctl restart headscale
```

On the Tailscale client, use the following command to view the currently available DERP servers:

```bash
$ tailscale netcheck

Report:
	* UDP: true
	* IPv4: yes, 192.168.100.1:49656
	* IPv6: no
	* MappingVariesByDestIP: true
	* HairPinning: false
	* PortMapping: UPnP
	* Nearest DERP: Home Hangzhou
	* DERP latency:
		- home: 9.7ms   (Home Hangzhou)
		-  hs: 25.2ms  (Huawei Shanghai)
		- thk: 43.5ms  (Tencent Hongkong)
```

Check the connection method with the peer again:

```bash
$ tailscale status
                coredns              default      linux   active; direct xxxx:45986; offline, tx 131012 rx 196020
                oneplus-8t           default      android active; relay "home"; offline, tx 211900 rx 22780
                openwrt              default      linux   active; direct 192.168.100.254:41641; offline, tx 189868 rx 4074772
```

As you can see, this time Tailscale automatically selected a **domestic** DERP server with the optimal route as the relay. You can test the latency:

```bash
$ tailscale ping 10.1.0.8
pong from oneplus-8t (10.1.0.8) via DERP(home) in 30ms
pong from oneplus-8t (10.1.0.8) via DERP(home) in 45ms
pong from oneplus-8t (10.1.0.8) via DERP(home) in 30ms
```

Perfect! The home here is of course my home broadband. The deployment method is similar to the domestic cloud server mentioned above. You need to additionally enable public port mapping (12345/tcp, 3478/udp). One more thing to note is the configuration content:

```json
{
  "Regions": {
    "901": {
      "RegionID": 901,
      "RegionCode": "ali-sh",
      "RegionName": "Aliyun Shanghai",
      "Nodes": [
        {
          "Name": "901a",
          "RegionID": 901,
          "DERPPort": 443,
          "HostName": "xxxx",
          "IPv4": "xxxx",
          "InsecureForTests": true
        }
      ]
    },
    "902": {
      "RegionID": 902,
      "RegionCode": "home",
      "RegionName": "Home Hangzhou",
      "Nodes": [
        {
          "Name": "902a",
          "RegionID": 902,
          "DERPPort": 12345,
          "HostName": "xxxx",
          "InsecureForTests": true
        }
      ]
    }
  }
}
```

Compared with a domestic cloud server, home broadband configuration has two differences:

- You need to delete the `IPv4` configuration item. Because the public IP of home broadband changes dynamically, you need to use **DDNS** to dynamically resolve the public IP.
- For `HostName`, it is best to fill in a domain name, because your public IP changes dynamically and you cannot fill in an IP unless you keep modifying the configuration file. It's okay to fill in a domain name anyway, since the domain name will not be verified, and you don't need to worry about certificates. **As long as the domain name can resolve to your public IP.**

## Preventing DERP from Being Freeloaded

By default, the DERP server can be freeloaded. As long as others know the address and port of your DERP server, they can use it for themselves. If your server has low bandwidth, many users might overload it, so we need to modify the configuration to prevent freeloading.

> Special note: only the domain name method can prevent freeloading through authentication. The pure IP method cannot prevent freeloading. You can only carefully hide your IP and port so that others cannot know them.

You only need to do two things:

**1. Install Tailscale on the DERP server.**

The first step is to install the Tailscale client on the host where the DERP service is located, and **start the tailscaled process**.

**2. Add the parameter `--verify-clients` when starting derper.**

This article recommends starting via container. The [Dockerfile content](https://github.com/yangchuansheng/docker-image/blob/master/derper/Dockerfile) is as follows:

```Dockerfile
FROM golang:latest AS builder

LABEL org.opencontainers.image.source https://github.com/yangchuansheng/docker-image

WORKDIR /app

# https://tailscale.com/kb/1118/custom-derp-servers/
RUN go install tailscale.com/cmd/derper@main

FROM ubuntu
WORKDIR /app

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y --no-install-recommends apt-utils && \
    apt-get install -y ca-certificates && \
    mkdir /app/certs

ENV DERP_DOMAIN your-hostname.com
ENV DERP_CERT_MODE letsencrypt
ENV DERP_CERT_DIR /app/certs
ENV DERP_ADDR :443
ENV DERP_STUN true
ENV DERP_HTTP_PORT 80
ENV DERP_VERIFY_CLIENTS false

COPY --from=builder /go/bin/derper .

CMD /app/derper --hostname=$DERP_DOMAIN \
    --certmode=$DERP_CERT_MODE \
    --certdir=$DERP_CERT_DIR \
    --a=$DERP_ADDR \
    --stun=$DERP_STUN  \
    --http-port=$DERP_HTTP_PORT \
    --verify-clients=$DERP_VERIFY_CLIENTS
```

By default, the `--verify-clients` parameter is set to `false`. We do not need to make any changes to the Dockerfile content; just add an environment variable when starting the container. Modify the previous startup command:

```bash
🐳  → docker run --restart always \
  --name derper -p 12345:12345 -p 3478:3478/udp \
  -v /root/.acme.sh/xxxx/:/app/certs \
  -e DERP_CERT_MODE=manual \
  -e DERP_ADDR=:12345 \
  -e DERP_DOMAIN=xxxx \
  -e DERP_VERIFY_CLIENTS=true \
  -d ghcr.io/yangchuansheng/derper:latest
```

That's it, all done. Even if others know your DERP server address, they cannot use it. But one thing should still be noted: even so, you should try your best not to let others know your server address, to prevent others from taking advantage of it.

## Summary

This article introduced the significance of STUN for assisting NAT traversal, explained several common relay protocols, including Tailscale's self-developed DERP protocol. Finally, it taught step by step how to self-host a private DERP server and make Tailscale use our self-hosted DERP server.