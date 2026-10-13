---
title: "用 Cloudflare WARP 代理所有 Docker 容器的出站流量（不影响其它服务） docker"
date: 2026-10-13 11:08:57
tags: ["cloudflare","docker"]
---

目标：所有容器访问公网时走 WARP 出口，宿主机自身流量、对外映射的端口、
ZeroTier / NetBird 等内网访问都保持原样。

实例：`192.236.240.51`（Ubuntu 22.04，脚本在 `/root/warp/`）

## 1. 思路

不改宿主机默认路由，只用**策略路由**把源地址属于 Docker 网段（`172.16.0.0/12`）的流量
导向一张单独的路由表（table 200），这张表的默认路由是 WireGuard 接口 `warp`。

```
容器 172.x ──► ip rule (from 172.16/12) ──► table 200: default dev warp ──► MASQUERADE ──► WARP
宿主机进程 ──► main 表 ──► eth0（不受影响）
```

需要排除的几类流量（都放回 main 表）：

| 规则 | 作用 | 不加的后果 |
|---|---|---|
| `101 fwmark 0x40000/0x40000 lookup main` | 从 eth0 **进来**的连接（`-p 7080:7080` 这类映射端口），回包走 eth0 | 回包被送进 WARP，外部访问映射端口全部超时 |
| `102 from 172.16/12 to 10.0.0.0/8 lookup main` | 容器访问 ZeroTier / NetBird 等 overlay 内网 | 容器访问 `10.17.1.200` 这类内网地址失败 |
| `102 from 172.16/12 to 192.168.0.0/16 lookup main` | 其它私网 | 同上 |
| `103 from 172.16/12 to 172.16/12 lookup main` | 容器之间、容器访问宿主网桥 | 容器间通信中断 |
| `104 from 172.16/12 lookup 200` | 其余所有流量走 WARP | — |

`101` 的标记靠 conntrack 打上：

```bash
# 新连接从 eth0 进来 → 给连接打 connmark
iptables -t mangle -A PREROUTING -i eth0 -m conntrack --ctstate NEW -j CONNMARK --set-xmark 0x40000/0x40000
# 属于这些连接的包（包括容器发出的回包）→ 恢复成包标记，供 ip rule 匹配
iptables -t mangle -A PREROUTING -m connmark --mark 0x40000/0x40000 -j MARK --set-xmark 0x40000/0x40000
```

> 标记位选 `0x40000`，是为了避开 NetBird 用的 `0x1bd00`（规则 110）。

另外还需要：

```bash
iptables -t nat -A POSTROUTING -o warp -j MASQUERADE        # 容器源地址 NAT 成 warp 地址
iptables -t mangle -A FORWARD -o warp -p tcp --tcp-flags SYN,RST SYN -j TCPMSS --set-mss 1240
# warp MTU 1280 - 40 = 1240；不夹 MSS 时，Node/Chrome 的大 TLS ClientHello 会被分片丢掉，
# 表现为 curl 能通但 HTTPS 客户端卡住
```

## 2. 获取 WARP 配置（wgcf）

```bash
wgcf register          # 生成 wgcf-account.toml
wgcf generate          # 生成 wgcf-profile.conf
```

`/root/warp/warp.conf` 只保留 `wg setconf` 能识别的字段（不能有 Address/DNS/MTU）：

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

**Endpoint 的坑（本机实测）：**
- `engage.cloudflareclient.com:2408` / `[2606:4700:d0::a29f:c001]:2408` 在这台机器上始终握手失败。
- 接口新建后，**第一个端点的握手经常收不到回包**（tcpdump 只看到出站 148 字节的包），
  换一个端口马上就能握手，之后一直稳定。所以不能指望写死一个端点，要有自动轮换。
- 可用端口（Cloudflare WARP 官方端口池）：`854 859 864 878 880 890 891 894 903 908 928 934 939 942 943 945 946 955 968 987 988 1002 1010 1014 1018 1070 1074 1180 1387 1701 1843 2371 2408 2506 3138 3476 3581 3854 4177 4198 4233 4500 5279 5956 7103 7152 7156 7281 7559 8319 8742 8854 8886`

## 3. 脚本 `/root/warp/setup.sh`

```
setup.sh up      # 默认：建 warp 接口 + 规则 101-103 + iptables，然后执行 check
setup.sh down    # 全部撤掉
setup.sh check   # 握手新鲜 → 确保规则 104 存在；不新鲜 → 轮换端点端口；
                 # 全部失败 → 删除规则 104（fail-open，容器回到直连，不断网）
```

关键设计：

- **规则 104 只在握手成功后才加。** 之前的版本一上来就加 104，WARP 一旦握手失败，
  所有容器（openclaw 的 Telegram/Slack 等）全部断网。
- **fail-open**：WARP 不可用时容器回落为直连宿主 IP。代价是这段时间出口 IP 暴露为 VPS IP；
  如果某个服务**必须**用 WARP IP，把 `route_off` 改成不删除 104（fail-closed）。
- 握手新鲜度阈值 180 秒（WireGuard 有流量或 keepalive 时每 120 秒重新握手）。

## 4. systemd

```
warp-egress.service         oneshot，ExecStart=setup.sh，ExecStop=setup.sh down
warp-egress-check.timer     开机 2 分钟后起，每 1 分钟跑一次 setup.sh check
```

```bash
systemctl enable --now warp-egress warp-egress-check.timer
journalctl -u warp-egress -u warp-egress-check -f      # 看切换日志
```

**防止规则被 systemd-networkd 清掉**：networkd 默认会删除"不是它创建的"策略路由规则
（之前规则 104 莫名消失很可能就是这个原因）。已加：

```ini
# /etc/systemd/networkd.conf.d/10-keep-foreign.conf
[Network]
ManageForeignRoutingPolicyRules=no
ManageForeignRoutes=no
```

（下次 networkd 重启时才会生效；即使规则被删，check 定时器也会在 1 分钟内补回 104。
101-103 若丢失需要重新执行 `systemctl restart warp-egress`。）

## 5. 验证

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

## 6. 注意事项

- 宿主机进程**不走** WARP（`curl` 直接在宿主上跑出口是 VPS IP），需要时用 `--interface warp`。
- 新创建的容器 MTU 是 1500，`setup.sh up` 只会给当时在跑的容器改 1380；TCP 有 MSS 夹持兜底，
  UDP 大包可能分片。需要时 `systemctl restart warp-egress`。
- 容器访问 `172.17.0.1:<端口>` 这种宿主网桥地址走的是规则 103，和 WARP 无关；
  若服务只绑定 `127.0.0.1`，容器本来就访问不到，应改用同一 docker 网络里的服务名。
- ZeroTier 已在 `local.conf` 里把 `warp` 接口加入 `interfacePrefixBlacklist`，避免 ZT 尝试经 WARP 打洞。

