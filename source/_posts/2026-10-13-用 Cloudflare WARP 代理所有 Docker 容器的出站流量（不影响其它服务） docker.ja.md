---
title: Cloudflare WARP ですべての Docker コンテナのアウトバウンドトラフィックをプロキシする（他のサービスに影響しない） docker
date: 2026-10-13 11:08:57
tags: ["cloudflare","docker"]
lang: ja
slug: 用 Cloudflare WARP 代理所有 Docker 容器的出站流量（不影响其它服务） docker
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

目的：すべてのコンテナがパブリックインターネットへアクセスする際は WARP の出口経路を使い、ホストマシン自身のトラフィック、外部へマッピングしたポート、ZeroTier / NetBird などの内部ネットワークアクセスはそのままの動作とする。

例：`192.236.240.51`（Ubuntu 22.04。スクリプトは `/root/warp/`）

## 1. 基本方針

ホストマシンのデフォルトルートは変更せず、**ポリシールーティング**のみを使って、送信元アドレスが Docker のネットワーク範囲（`172.16.0.0/12`）に属するトラフィックを、単独のルーティングテーブル（table 200）に誘導する。このテーブルのデフォルトルートは WireGuard インターフェース `warp` とする。

```
容器 172.x ──► ip rule (from 172.16/12) ──► table 200: default dev warp ──► MASQUERADE ──► WARP
宿主机进程 ──► main 表 ──► eth0（不受影响）
```

除外が必要なトラフィックの種類（いずれも main テーブルに戻す）：

| ルール | 役割 | 追加しない場合の影響 |
|---|---|---|
| `101 fwmark 0x40000/0x40000 lookup main` | eth0 に**入ってくる**接続（`-p 7080:7080` のようなマッピングポート）。戻りパケットは eth0 経由とする | 戻りパケットが WARP に入れられ、外部からのマッピングポートアクセスはすべてタイムアウトする |
| `102 from 172.16/12 to 10.0.0.0/8 lookup main` | ZeroTier / NetBird などのオーバーレイ内部ネットワークへのコンテナからのアクセス | コンテナは `10.17.1.200` のような内部ネットワークアドレスにアクセスできない |
| `102 from 172.16/12 to 192.168.0.0/16 lookup main` | その他のプライベートネットワーク | 同上 |
| `103 from 172.16/12 to 172.16/12 lookup main` | コンテナ間、コンテナからホストブリッジへのアクセス | コンテナ間通信が切断される |
| `104 from 172.16/12 lookup 200` | 残りすべてのトラフィックは WARP 経由 | — |

`101` のマークは conntrack で付与する：

```bash
# 新连接从 eth0 进来 → 给连接打 connmark
iptables -t mangle -A PREROUTING -i eth0 -m conntrack --ctstate NEW -j CONNMARK --set-xmark 0x40000/0x40000
# 属于这些连接的包（包括容器发出的回包）→ 恢复成包标记，供 ip rule 匹配
iptables -t mangle -A PREROUTING -m connmark --mark 0x40000/0x40000 -j MARK --set-xmark 0x40000/0x40000
```

> マーク値として `0x40000` を選ぶのは、NetBird が使用する `0x1bd00`（ルール 110）を避けるためである。

また、以下も必要：

```bash
iptables -t nat -A POSTROUTING -o warp -j MASQUERADE        # 容器源地址 NAT 成 warp 地址
iptables -t mangle -A FORWARD -o warp -p tcp --tcp-flags SYN,RST SYN -j TCPMSS --set-mss 1240
# warp MTU 1280 - 40 = 1240；不夹 MSS 时，Node/Chrome 的大 TLS ClientHello 会被分片丢掉，
# 表现为 curl 能通但 HTTPS 客户端卡住
```

## 2. WARP 設定を取得（wgcf）

```bash
wgcf register          # 生成 wgcf-account.toml
wgcf generate          # 生成 wgcf-profile.conf
```

`/root/warp/warp.conf` では、`wg setconf` が認識できるフィールドのみを保持する（Address/DNS/MTU は含めてはならない）：

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

**Endpoint の落とし穴（本機での実測）：**
- `engage.cloudflareclient.com:2408` / `[2606:4700:d0::a29f:c001]:2408` は、このマシンでは常にハンドシェイクに失敗する。
- インターフェースを新規作成した直後は、**最初のエンドポイントでハンドシェイクの応答が受信できないことが多い**（tcpdump では送信方向の 148 バイトのパケットのみが見える）。
  別のポートへ切り替えるとすぐにハンドシェイクでき、以降は安定する。そのため、エンドポイントを固定値に決め打ちするのではなく、自動ローテーションが必要である。
- 利用可能なポート（Cloudflare WARP 公式のポートプール）：`854 859 864 878 880 890 891 894 903 908 928 934 939 942 943 945 946 955 968 987 988 1002 1010 1014 1018 1070 1074 1180 1387 1701 1843 2371 2408 2506 3138 3476 3581 3854 4177 4198 4233 4500 5279 5956 7103 7152 7156 7281 7559 8319 8742 8854 8886`

## 3. スクリプト `/root/warp/setup.sh`

```
setup.sh up      # 默认：建 warp 接口 + 规则 101-103 + iptables，然后执行 check
setup.sh down    # 全部撤掉
setup.sh check   # 握手新鲜 → 确保规则 104 存在；不新鲜 → 轮换端点端口；
                 # 全部失败 → 删除规则 104（fail-open，容器回到直连，不断网）
```

主な設計ポイント：

- **ルール 104 は、ハンドシェイクが成功した後にのみ追加する。** 以前のバージョンでは最初から 104 を追加していたため、WARP のハンドシェイクが失敗すると、全コンテナ（openclaw の Telegram/Slack など）のネットワークがすべて切断された。
- **fail-open**：WARP が利用不可の場合、コンテナはホスト IP への直接接続にフォールバックする。代償として、この間は出口 IP が VPS IP として露出する。あるサービスがどうしても WARP IP を**必須**とする場合は、`route_off` を変更して 104 を削除しない（fail-closed）。
- ハンドシェイクの新鮮性しきい値は 180 秒（WireGuard にトラフィックがある場合や keepalive 時は、120 秒ごとに再ハンドシェイクされる）。

## 4. systemd

```
warp-egress.service         oneshot，ExecStart=setup.sh，ExecStop=setup.sh down
warp-egress-check.timer     开机 2 分钟后起，每 1 分钟跑一次 setup.sh check
```

```bash
systemctl enable --now warp-egress warp-egress-check.timer
journalctl -u warp-egress -u warp-egress-check -f      # 看切换日志
```

**systemd-networkd にルールを削除されないようにする**：networkd はデフォルトで、「自身が作成したものではない」ポリシールーティングルールを削除する（以前ルール 104 が原因不明で消えたのは、これが原因である可能性が高い）。以下を追加済み：

```ini
# /etc/systemd/networkd.conf.d/10-keep-foreign.conf
[Network]
ManageForeignRoutingPolicyRules=no
ManageForeignRoutes=no
```

（次回 networkd を再起動したときに有効になる。ルールが削除された場合でも、check タイマーが 1 分以内に 104 を復元する。101-103 が失われた場合は、`systemctl restart warp-egress` を再実行する必要がある。）

## 5. 検証

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

## 6. 注意事項

- ホストマシン上のプロセスは WARP を**経由しない**（`curl` をホスト上で直接実行した場合、出口は VPS IP になる）。必要に応じて `--interface warp` を使用する。
- 新規作成されるコンテナの MTU は 1500 であり、`setup.sh up` はその時点で実行中だったコンテナの MTU のみを 1380 に変更する。TCP は MSS クランプでフォールバックされるが、大きな UDP パケットは断片化する可能性がある。必要に応じて `systemctl restart warp-egress`。
- コンテナから `172.17.0.1:<端口>` のようなホストブリッジアドレスへのアクセスはルール 103 を通り、WARP とは無関係である。サービスが `127.0.0.1` にのみバインドしている場合、コンテナからはそもそもアクセスできないため、同一 Docker ネットワーク内のサービス名を使うべきである。
- ZeroTier は `local.conf` 内で `warp` インターフェースを `interfacePrefixBlacklist` に追加してあり、ZT が WARP 経由でホールパンチングを試みないようになっている。