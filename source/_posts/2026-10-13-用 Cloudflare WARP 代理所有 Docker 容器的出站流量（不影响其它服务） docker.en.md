---
title: Proxy outbound traffic for all Docker containers with Cloudflare WARP (without affecting other services) docker
date: 2026-10-13 11:08:57
tags: ["cloudflare","docker"]
lang: en
slug: 用 Cloudflare WARP 代理所有 Docker 容器的出站流量（不影响其它服务） docker
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

Goal: All container traffic accessing the public internet goes through the WARP exit; the host's own traffic, externally mapped ports, and intranet access such as ZeroTier / NetBird remain unchanged.

Example: `192.236.240.51` (Ubuntu 22.04, script at `/root/warp/`)

## 1. Approach

Do not modify the host's default route. Use only **policy routing** to steer traffic whose source address belongs to the Docker subnet (`172.16.0.0/12`) into a separate routing table (table 200). The default route in this table is the WireGuard interface `warp`.

```
容器 172.x ──► ip rule (from 172.16/12) ──► table 200: default dev warp ──► MASQUERADE ──► WARP
宿主机进程 ──► main 表 ──► eth0（不受影响）
```

Several types of traffic need to be excluded (all returned to the main table):

| Rule | Effect | Consequence of omitting |
|---|---|---|
| `101 fwmark 0x40000/0x40000 lookup main` | For connections **entering** from eth0 (mapped ports such as `-p 7080:7080`), reply packets go out via eth0 | Reply packets are sent into WARP; all external access to mapped ports times out |
| `102 from 172.16/12 to 10.0.0.0/8 lookup main` | Container access to ZeroTier / NetBird and other overlay intranets | Container access to internal addresses such as `10.17.1.200` fails |
| `102 from 172.16/12 to 192.168.0.0/16 lookup main` | Other private networks | Same as above |
| `103 from 172.16/12 to 172.16/12 lookup main` | Container-to-container traffic and container access to the host bridge | Inter-container communication breaks |
| `104 from 172.16/12 lookup 200` | All remaining traffic goes through WARP | — |

The marking for `101` is applied via conntrack:

```bash
# 新连接从 eth0 进来 → 给连接打 connmark
iptables -t mangle -A PREROUTING -i eth0 -m conntrack --ctstate NEW -j CONNMARK --set-xmark 0x40000/0x40000
# 属于这些连接的包（包括容器发出的回包）→ 恢复成包标记，供 ip rule 匹配
iptables -t mangle -A PREROUTING -m connmark --mark 0x40000/0x40000 -j MARK --set-xmark 0x40000/0x40000
```

> The marking bit uses `0x40000` to avoid conflict with NetBird's `0x1bd00` (rule 110).

Also required:

```bash
iptables -t nat -A POSTROUTING -o warp -j MASQUERADE        # 容器源地址 NAT 成 warp 地址
iptables -t mangle -A FORWARD -o warp -p tcp --tcp-flags SYN,RST SYN -j TCPMSS --set-mss 1240
# warp MTU 1280 - 40 = 1240；不夹 MSS 时，Node/Chrome 的大 TLS ClientHello 会被分片丢掉，
# 表现为 curl 能通但 HTTPS 客户端卡住
```

## 2. Obtain WARP configuration (wgcf)

```bash
wgcf register          # 生成 wgcf-account.toml
wgcf generate          # 生成 wgcf-profile.conf
```

`/root/warp/warp.conf` retains only fields recognized by `wg setconf` (must not contain Address/DNS/MTU):

```ini
[Interface]
PrivateKey = <wgcf-profile.conf 里的>

[Peer]
PublicKey = bmXOC+F1FxEMF9dyiK2H5/1SUtzH0JuVo51h2wPfgyo=
AllowedIPs = 0.0.0.0/0
AllowedIPs = ::/0
Endpoint = 162.159.192.1:854
PersistentKeepalive = 25
```

**Endpoint pitfalls (tested on this machine):**
- `engage.cloudflareclient.com:2408` / `[2606:4700:d0::a29f:c001]:2408` consistently fail to handshake on this machine.
- After the interface is newly created, **the first endpoint's handshake often gets no reply** (tcpdump only shows outbound 148-byte packets); switching to another port enables handshake immediately and it remains stable thereafter. Therefore, you cannot rely on hard-coding a single endpoint; automatic rotation is required.
- Available ports (Cloudflare WARP official port pool): `854 859 864 878 880 890 891 894 903 908 928 934 939 942 943 945 946 955 968 987 988 1002 1010 1014 1018 1070 1074 1180 1387 1701 1843 2371 2408 2506 3138 3476 3581 3854 4177 4198 4233 4500 5279 5956 7103 7152 7156 7281 7559 8319 8742 8854 8886`

## 3. Script `/root/warp/setup.sh`

```
setup.sh up      # 默认：建 warp 接口 + 规则 101-103 + iptables，然后执行 check
setup.sh down    # 全部撤掉
setup.sh check   # 握手新鲜 → 确保规则 104 存在；不新鲜 → 轮换端点端口；
                 # 全部失败 → 删除规则 104（fail-open，容器回到直连，不断网）
```

Key design points:

- **Rule 104 is added only after a successful handshake.** The previous version added 104 from startup; once WARP handshake failed, all containers (openclaw's Telegram/Slack, etc.) lost network connectivity.
- **fail-open**: When WARP is unavailable, containers fall back to using the host IP directly. The cost is that during this period the exit IP is exposed as the VPS IP. If a service **must** use the WARP IP, change `route_off` so it does not delete 104 (fail-closed).
- Handshake freshness threshold is 180 seconds (with WireGuard traffic or keepalive, re-handshake occurs every 120 seconds).

## 4. systemd

```
warp-egress.service         oneshot，ExecStart=setup.sh，ExecStop=setup.sh down
warp-egress-check.timer     开机 2 分钟后起，每 1 分钟跑一次 setup.sh check
```

```bash
systemctl enable --now warp-egress warp-egress-check.timer
journalctl -u warp-egress -u warp-egress-check -f      # 看切换日志
```

**Prevent rules from being cleared by systemd-networkd**: networkd by default deletes policy routing rules that were "not created by it" (this is likely why rule 104 mysteriously disappeared previously). Added:

```ini
# /etc/systemd/networkd.conf.d/10-keep-foreign.conf
[Network]
ManageForeignRoutingPolicyRules=no
ManageForeignRoutes=no
```

(Takes effect only when networkd restarts; even if the rules are deleted, the check timer will restore 104 within 1 minute. If 101-103 are lost, re-run `systemctl restart warp-egress`.)

## 5. Verification

```bash
# WARP 隧道
wg show warp latest-handshakes            # 非 0 且在 180 秒内
curl --interface warp https://www.cloudflare.com/cdn-cgi/trace | grep warp   # warp=on

# 容器走 WARP
docker exec fgc curl -s https://www.cloudflare.com/cdn-cgi/trace | grep -E 'ip=|warp='

# 容器访问内网仍走 main（不应经过 warp）
docker exec openclaw node -e 'fetch("http://10.17.1.200:7000/v1/models").then(r=>console.log(r.status))'

# 外部访问映射端口（在别的机器上）
curl -o /dev/null -w '%{http_code}\n' http://192.236.240.51:7080/

ip rule        # 应看到 101/102/102/103/104
```

## 6. Notes

- Host processes **do not go through** WARP (running `curl` directly on the host exits via the VPS IP). When needed, use `--interface warp`.
- Newly created containers have an MTU of 1500; `setup.sh up` only changes containers that are running at that moment to 1380. TCP has MSS clamping as a fallback, but large UDP packets may be fragmented. When needed, use `systemctl restart warp-egress`.
- Container access to host bridge addresses such as `172.17.0.1:<端口>` goes through rule 103 and is unrelated to WARP. If a service only binds to `127.0.0.1`, containers originally cannot access it; use the service name within the same Docker network instead.
- ZeroTier has already added the `warp` interface to `interfacePrefixBlacklist` in `local.conf` to avoid ZT attempting to punch holes through WARP.