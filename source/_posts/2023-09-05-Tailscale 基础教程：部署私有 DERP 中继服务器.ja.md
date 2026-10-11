---
title: Tailscale 基礎チュートリアル：プライベート DERP リレーサーバーのデプロイ
date: 2023-09-05 02:16:06
tags: ["web"]
lang: ja
slug: Tailscale 基础教程：部署私有 DERP 中继服务器
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

## Tailscale 基礎チュートリアル：プライベート DERP リレーサーバーをデプロイする

[前回の記事](https://icloudnative.io/posts/how-to-set-up-or-migrate-headscale/#总结)では、`Headscale` を使って Tailscale 公式のコントロールサーバーを置き換え、各プラットフォームのクライアントを接続する方法を紹介しました。本記事では、Tailscale にカスタム DERP Servers を使わせる方法を紹介します。多くの人は `DERP` が何なのか知らないかもしれませんが、大丈夫です。まず**リレーサーバー**から説明を始めます。

## STUN とは何か

Tailscale の最終目標は、**ネットワーク上のどこにいても**2 台のマシンが**ポイントツーポイント接続**（直接接続）を確立できるようにすることですが、現実世界は複雑で、ほとんどの場合マシンは NAT とファイアウォールの背後にあります。このような場合、直接接続を実現するためにホールパンチング、つまり NAT トラバーサルが必要になります。

NAT は **NAT マッピング動作**と**ステートフルファイアウォール動作**によってさまざまな種類に分けられますが、NAT トラバーサルにとってそんなに多くの種類を気にする必要はありません。見るべきは **NAT またはステートフルファイアウォールが宛先 Endpoint を厳密にチェックするかどうか**だけであり、この要素に基づいて NAT を **Easy NAT** と **Hard NAT** に分類できます。

- **Easy NAT** およびその変種は「Endpoint-Independent Mapping」（**EIM、エンドポイント非依存マッピング**）と呼ばれます。
    ここでの Endpoint は宛先 Endpoint を指します。つまり、ステートフルファイアウォールは、クライアント自身が開始したアウトバウンドパケットを見さえすれば、対応するインバウンドパケットの進入を許可します。**このインバウンドパケットを誰が送ってきたかは問いません**。
- **hard NAT** およびその変種は「Endpoint-Dependent Mapping」（**EDM、エンドポイント依存マッピング**）と呼ばれます。
    この種の NAT は、各宛先 Endpoint に対して対応するマッピング関係を生成します。このようなデバイス上で、クライアントがある宛先 Endpoint にアウトバウンドパケットを送信し、クライアントのパブリック IP が 2.2.2.2 だと仮定すると、ステートフルファイアウォールはあるポート、仮に 4242 を開けます。すると、その宛先 Endpoint からのインバウンドパケットだけが `2.2.2.2:4242` を通過でき、他のクライアントは一切許可されません。この NAT はより厳格なので、Hard NAT と呼ばれます。

Easy NAT の場合、サードパーティのサービスを 1 つ用意するだけで済みます。それはクライアントに「自分から見たクライアントのパブリック ip:port は何か」を伝え、その情報を何らかの方法で通信相手（peer）に伝えると、相手はどのアドレスに接続すればよいか分かります！このサービスを **STUN**（Session Traversal Utilities for NAT、NAT セッショントラバーサルユーティリティ）と呼びます。そのワークフローは次の図のとおりです：

- ノート PC が STUN サーバーにリクエストを送信します：「あなたから見て、私のアドレスは何ですか？」
- STUN サーバーがレスポンスを返します：「あなたの UDP パケットはこのアドレスから来ていると見えます：`ip:port`」。

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting3@main/uPic/2022-03-26-17-27-yqHlMG.jpg)

## リレーとは何か

**Hard NAT** の場合、STUN はうまく機能しません。たとえ STUN がクライアントのパブリック `ip:port` を取得して通信相手に伝えても無駄です。なぜなら、ファイアウォールは STUN と通信するために穴を開けたのであり、その穴は STUN のインバウンドパケットだけを通過させ、他の通信相手がその穴を知っても入れないからです。通常、エンタープライズ NAT は Hard NAT に属します。

このような場合、ホールパンチングは不可能ですが、諦める必要はありません。折衷案として、リレーサーバー（relay server）を作成し、クライアントがリレーサーバーと通信し、リレーサーバーがパケットを通信相手に中継（relay）する方法を選べます。

リレーの性能については、状況によります：

- 直接接続できるなら、明らかにリレー方式を使う必要はありません；
- しかし直接接続できず、リレー経路が双方の直接接続の実際の経路に非常に近く、帯域幅が十分に大きいなら、リレー方式でも通信品質はそれほど低下しません。遅延は確実に少し増え、帯域幅もいくらか消費しますが、**完全に接続できないよりは、まだ受け入れられます**。

実際、ほとんどのネットワークでは、Tailscale はさまざまな黒科技（裏技）によってホールパンチングに成功でき、ごくまれな場合にのみリレーが選択されます。リレーは単なるフォールバック機構です。

## リレープロトコルの概要

リレープロトコルには複数の実装方式があります。

### TURN

TURN とは Traversal Using Relays around NAT であり、これは古典的なリレー実装方式です。核心理念は次のとおりです：

- **ユーザー**（人）がまずインターネット上の TURN サーバーで認証し、成功すると後者があなたに伝えます：「私はあなたに ip:port を割り当てました。これからあなたのトラフィックを中継します」、
- その後、この ip:port アドレスを相手に伝え、相手にこのアドレスへ接続させます。あとは非常に単純なクライアント/サーバー通信モデルになります。

STUN と異なり、このプロトコルには真の対話性がなく、あまり使い勝手がよくないため、Tailscale は TURN をリレープロトコルとして採用していません。

### DERP

DERP とは Detoured Encrypted Routing Protocol であり、これは Tailscale が独自開発したプロトコルです：

- これは**汎用目的のパケットリレープロトコルで、HTTP 上で動作します**。そしてほとんどのネットワークは HTTP 通信を許可しています。
- これは宛先公開鍵（destination’s public key）に基づいて暗号化されたトラフィック（encrypted payloads）を中継します。

![Tailscale はターゲットノードに最も近い DERP server を自動的に選択してトラフィックを中継します](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting3@main/uPic/2022-03-26-19-02-zLDv51.svg)

Tailscale が使用するアルゴリズムは興味深いものです。**すべてのクライアント間の接続は、まず DERP モード（リレーモード）が選択されます。これは接続が即座に確立できることを意味し（優先度は最低だが 100% 成功するモード）、ユーザーは一切待つ必要がありません**。その後、並行してパス探索を開始し、通常は数秒後に、より優れたパスを発見し、既存の接続を透過的にアップグレード（upgrade）して、ポイントツーポイント接続（直接接続）に変えます。

したがって、DERP は Tailscale が NAT トラバーサルに失敗したときのフォールバック通信方式（このときの役割は TURN に似ています）であると同時に、他のいくつかのシナリオで NAT トラバーサルを完了させるのを助けるバイパスチャネルでもあります。言い換えれば、それは私たちのフォールバック方式であり、より良いトラバーサルリンクがある場合に、接続のアップグレード（upgrade to a peer-to-peer connection）を助けるインフラストラクチャでもあります。

## プライベート DERP server を自前で構築する

Tailscale の秘密鍵は現在のノードにのみ保存されるため、DERP server はトラフィックを復号できません。それはインターネット上の他のルーターと同じように、暗号化されたトラフィックをあるノードから別のノードへただ転送するだけです。ただし、DERP は乱用を防ぐために少し高度なプロトコルを使用しています。

Tailscale は DERP サーバーのコードをオープンソース化しています。興味があれば、[DERP のソースコード](https://github.com/tailscale/tailscale/tree/main/derp) を読んでください。

------

Tailscale 公式には多くの DERP サーバーが組み込まれており、世界各地に分散していますが、**中国大陸だけは含まれていません**。理由はご存じのとおりです。そのため、いったんトラフィックが DERP サーバー経由で中継されると、遅延が非常に高くなります。しかも公式提供の DERP サーバーは誰でも使える状態であり、セキュリティ上の懸念があります。

低遅延・高セキュリティを実現するために、[Tailscale 公式ドキュメント](https://tailscale.com/kb/1118/custom-derp-servers/) を参考にしてプライベート DERP サーバーを自前で構築できます。デプロイモードは 2 つあり、1 つはドメインベース、もう 1 つはドメイン不要で IP を直接使用できますが、少し裏技が必要です。まず最も簡単なドメインを使用する方案を見てみましょう。

### ドメインを使用する

この方案は次のいくつかの条件を満たす必要があります：

- 自分のドメインがあり、SSL 証明書を申請していること
- 1 台または複数台のクラウドホストを用意する必要がある
- サーバーが国内にある場合、ドメインは ICP 登録（备案）が必要
- サーバーが国外にある場合、备案は不要

以上の条件がすべて揃っていれば、以下の手順に従ってデプロイを開始できます。

Docker を直接使ってデプロイすることをおすすめします。私はすでに Docker イメージを構築済みなので、そのままデプロイできます：

```bash
🐳  → docker run --restart always \
  --name derper -p 12345:12345 -p 3478:3478/udp \
  -v /root/.acme.sh/xxxx/:/app/certs \
  -e DERP_CERT_MODE=manual \
  -e DERP_ADDR=:12345 \
  -e DERP_DOMAIN=xxxx \
  -d ghcr.io/yangchuansheng/derper:latest
```

いくつか注意点があります：

- 443 ポートを使えるならできるだけ 443 ポートを使い、どうしてもだめなら別のポートを使います；
- デフォルトでは STUN サービスも有効になり、UDP ポートは `3478` です；
- ファイアウォールでポート 12345 と 3478 を許可する必要があります；
- SSL 証明書を用意してください；
- ドメイン部分はマスクしています。自分のドメインに置き換えてください。

証明書部分について重点的に説明します：**あなたのドメインが `xxx.com` だと仮定すると、証明書の名前は必ず `xxx.com.crt` でなければならず、1 文字も間違えてはいけません！同様に、秘密鍵の名前は必ず `xxx.com.key` でなければならず、1 文字も間違えてはいけません！**

コンテナログを確認します：

```bash
🐳  → docker logs -f derper
2022/03/26 11:36:28 no config path specified; using /var/lib/derper/derper.key
2022/03/26 11:36:28 derper: serving on :12345 with TLS
2022/03/26 11:36:28 running STUN server on [::]:3478
```

現在、derper はしばらく動作するとクラッシュしてしまいます。今のところより良い解決策はなく、定時再起動で解決するしかありません。たとえば crontab で 2 時間ごとにコンテナを再起動するように設定します：

```bash
0 */2 * * * docker restart derper &> /dev/null
```

具体的にはこの issue を参照してください： [Derper TLS handshake error: remote error: tls: internal error](https://github.com/tailscale/tailscale/issues/4082)

------

derper をデプロイした後、Headscale の設定を変更してカスタム DERP サーバーを使用できます。Headscale は 2 つの形式の設定でカスタム DERP を使用できます：

- 1 つはオンライン URL で、形式は `JSON` であり、Tailscale 公式コントロールサーバーが使用する形式と構文と同じです。
- もう 1 つはローカルファイルで、形式は `YAML` です。

ローカルの YAML 設定ファイルを直接使用できます。内容は次のとおりです：

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

設定の説明：

- `regions` は YAML 内の**オブジェクト**で、以下の各オブジェクトは 1 つの**アベイラビリティゾーン**を表し、各**アベイラビリティゾーン**の中には複数の DERP ノード、すなわち `nodes` を設定できます。
- 各アベイラビリティゾーンの `regionid` は重複できません。
- 各 `node` の `name` は重複できません。
- `regionname` は一般にアベイラビリティゾーンを説明するために使い、`regioncode` は一般にアベイラビリティゾーンの略称に設定します。
- `ipv4` フィールドは必須ではありません。あなたのドメインがパブリックネットワーク経由で DERP サーバーアドレスに解決できるなら、ここは入力しなくてもかまいません。もしあなたがサブドメインを使用していて、そのドメインに関する解析レコードをパブリック DNS サーバーに追加していないなら、ここで IP を指定する必要があります（前提として、あなたの証明書がこのサブドメインを含んでいること。これは簡単に対応でき、ワイルドカード証明書を取得すればよいだけです）。
- `stunonly: false` は STUN サービスに加えて DERP サービスも使用できることを表します。
- 上記の設定ではドメインと IP 部分をマスクしています。あなたの実際の状況に応じて記入してください。

次に、Headscale の設定ファイルを変更し、上記のカスタム DERP 設定ファイルを参照する必要があります。変更が必要な設定項目は次のとおりです：

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

Tailscale 公式の DERP サーバーを無効化して、自前で構築した DERP サーバーが正常に動作するかテストできます。

設定変更後、headscale サービスを再起動します：

```bash
$ systemctl restart headscale
```

Tailscale クライアントで次のコマンドを使用し、現在利用可能な DERP サーバーを確認します：

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

`tailscale netcheck` は実際には `3478/udp` のポートだけを検出します。たとえ netcheck が接続可能と表示しても、12345 ポートがトラフィックを転送できるとは限りません。最も簡単な方法は、DERP サーバーの URL を直接開くことです：https://xxxx:12345。次のページが表示され、アドレスバーの SSL 証明書ラベルが正常に利用可能と表示されていれば、本当に問題ありません。

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting3@main/uPic/2022-03-27-11-21-dZ5dtZ.png)

通信相手との接続方式を確認します：

```bash
$ tailscale status
10.1.0.5        coredns              default      linux   -
                carsondemacbook-pro  default      macOS   active; direct xxxx:2756; offline, tx 50424 rx 34056
                oneplus-8t           default      android active; relay "thk"; offline, tx 1608 rx 1552
                openwrt              default      linux   active; direct xxxx:2834; offline, tx 1403688 rx 1217620
```

このクライアントはクラウドホストで、通信相手が 3 つあり、それぞれ macOS、OpenWRT、Android スマートフォンです。macOS と OpenWRT はどちらも中国電信の家庭内ネットワーク内にあり、Android スマートフォンは中国電信のモバイルデータを使用しています。見て分かるように、Android スマートフォンだけがカスタム DERP サーバー経由でトラフィックを中継しており、ホールパンチングの成功率はかなり高いです。ping で接続性をテストします：

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

Tailscale コマンドラインツールを使ってテストすることもできます：

```bash
$ tailscale ping 10.1.0.8
pong from oneplus-8t (10.1.0.8) via DERP(thk) in 104ms
pong from oneplus-8t (10.1.0.8) via DERP(thk) in 111ms
pong from oneplus-8t (10.1.0.8) via DERP(thk) in 105ms
```

こちらのほうがより親切で、DERP リレーサーバー経由で相手と通信していることを直接教えてくれます。

現在の Tailscale クライアントが存在するホストで IPv6 が有効になっていれば、スマートフォンとは IPv6 経由で直接ポイントツーポイント接続できます：

```bash
$ /Applications/Tailscale.app/Contents/MacOS/Tailscale status
                coredns              default      linux   active; direct xxxx:45986; offline, tx 124352 rx 185736
                oneplus-8t           default      android active; direct [240e:472:da0:24a2:a07f:2a67:2a1e:4475]:37237; offline, tx 125216 rx 20052
                openwrt              default      linux   active; direct [240e:390:caf:1870:c02c:e8ff:feb9:b0b]:41641; offline, tx 181992 rx 3910120

$ /Applications/Tailscale.app/Contents/MacOS/Tailscale ping 10.1.0.8
pong from oneplus-8t (10.1.0.8) via [240e:472:da0:24a2:a07f:2a67:2a1e:4475]:37237 in 62ms
```

したがって、IPv6 を有効にすると、**ポイントツーポイント接続**の成功率を大幅に高められます。

### 純粋な IP を使用する

ご存じのとおり、ほとんどの人は自分のドメインを持っていません。さらに譲歩しても、たとえ自分のドメインを持っていても、备案がなければ国内サーバーにデプロイして使用することはできません。

この場合、derper のソースコードに手を加えるしかありません。tailscale リポジトリ内の `cmd/derper/cert.go` ファイルを見つけ、ドメイン検証に関連する内容を削除またはコメントアウトします：

```go
func (m *manualCertManager) getCertificate(hi *tls.ClientHelloInfo) (*tls.Certificate, error) {
	//if hi.ServerName != m.hostname {
	//	return nil, fmt.Errorf("cert mismatch with hostname: %q", hi.ServerName)
	//}
	return m.cert, nil
}
```

また、自己署名証明書を作成する必要があります。スクリプトで作成できます：

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

Dockerfile を書き直し、derper のドメインを `127.0.0.1` に設定します：

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

イメージを構築した後、derper をデプロイしたいホスト上でそのイメージを使って直接 derper コンテナを起動できます。コマンドは次のとおりです：

```bash
🐳  → docker run --restart always --net host --name derper -d ghcr.io/yangchuansheng/ip_derper
```

ドメインを使用する方案と同様に、ファイアウォールで対応するポート（12345 と 3478）を許可する必要があります。

コンテナログを確認します：

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

自分で derper イメージを構築したい場合は、[私の GitHub リポジトリ](https://github.com/yangchuansheng/ip_derper) を参照してください。

------

ここからが裏技です。Headscale の設定で**DERP のドメインを IP に設定する**必要があります！理解できない人はもう一度よく噛み砕いてから、そのまま読み進めてください ハハ~~

derper 以外に、Tailscale クライアントも**ドメイン検証をスキップする**必要があり、これは DERP の設定で行う必要があります。しかし Headscale のローカル YAML ファイルは現在この設定項目をサポートしていないため、仕方ありません。オンライン URL を使うしかありません。JSON 設定内容は次のとおりです：

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

設定の解析：

- `HostName` には derper のパブリック IP を直接入力します。つまり `IPv4` の値と同じです。
- `InsecureForTests` は必ず true に設定し、ドメイン検証をスキップします。

この JSON ファイルを Headscale サーバーがアクセスできる URL にする必要があります。たとえば Headscale ホスト上に Nginx を立てるか、オブジェクトストレージ（たとえば Alibaba Cloud OSS）にアップロードします。

次に、Headscale の設定ファイルを変更し、上記のカスタム DERP の URL を参照する必要があります。変更が必要な設定項目は次のとおりです：

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

設定変更後、headscale サービスを再起動します：

```bash
$ systemctl restart headscale
```

Tailscale クライアントで次のコマンドを使用し、現在利用可能な DERP サーバーを確認します：

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

再度、通信相手との接続方式を確認します：

```bash
$ tailscale status
                coredns              default      linux   active; direct xxxx:45986; offline, tx 131012 rx 196020
                oneplus-8t           default      android active; relay "home"; offline, tx 211900 rx 22780
                openwrt              default      linux   active; direct 192.168.100.254:41641; offline, tx 189868 rx 4074772
```

今回は Tailscale が回線が最適な**国内の** DERP サーバーをリレーとして自動選択したことが分かります。遅延をテストしてみましょう：

```bash
$ tailscale ping 10.1.0.8
pong from oneplus-8t (10.1.0.8) via DERP(home) in 30ms
pong from oneplus-8t (10.1.0.8) via DERP(home) in 45ms
pong from oneplus-8t (10.1.0.8) via DERP(home) in 30ms
```

完璧です！ここでの home はもちろん私の家庭用ブロードバンドです。デプロイ方式は上記の国内クラウドホストと似ていますが、追加でパブリックネットワークのポートマッピング（12345/tcp, 3478/udp）を有効にする必要があります。もう 1 つ注意すべき点は設定内容です：

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

国内クラウドホストと比較して、家庭用ブロードバンドの設定には 2 点の違いがあります：

- `IPv4` 設定項目を削除する必要があります。家庭用ブロードバンドのパブリック IP は動的に変化するため、**DDNS** を使ってパブリック IP を動的に解決する必要があります。
- `HostName` にはドメインを入力するのが最好です。あなたのパブリック IP は動的に変化するため、IP を入力できません。設定ファイルを絶えず変更しない限りは。ドメインを入力しても問題ありません。どうせドメインは検証されませんし、証明書のことも気にする必要はありません。**ドメインがあなたのパブリック IP に解決できさえすればよいのです。**

## DERP のただ乗りを防ぐ

デフォルトでは DERP サーバーはただ乗り可能です。他人があなたの DERP サーバーのアドレスとポートを知りさえすれば、彼らに利用されます。あなたのサーバーが細い回線なら、利用者が増えると耐えきれなくなる可能性があるため、設定を変更してただ乗りを防ぐ必要があります。

> 特記事項：ドメインを使用する方式だけが認証によってただ乗りを防げます。純粋な IP を使用する方式ではただ乗りを防げません。あなたは自分の IP とポートを慎重に隠し、他人に知られないようにするしかありません。

必要なことは 2 つだけです：

**1、DERP サーバー上に Tailscale をインストールする。**

最初のステップでは、DERP サービスが存在するホストに Tailscale クライアントをインストールし、**tailscaled プロセスを起動**する必要があります。

**2、derper 起動時にパラメータ `--verify-clients` を追加する。**

本記事ではコンテナ経由での起動を推奨しています。[Dockerfile の内容](https://github.com/yangchuansheng/docker-image/blob/master/derper/Dockerfile)は次のとおりです：

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

デフォルトでは `--verify-clients` パラメータは `false` に設定されています。Dockerfile の内容に何も変更を加える必要はなく、コンテナ起動時に環境変数を追加するだけで済みます。以前の起動コマンドを次のように変更します：

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

これで完了です。他人があなたの DERP サーバーアドレスを知っても使用できません。ただし、1 点説明しておくと、それでもなお、他人に付け入る隙を与えないよう、あなたのサーバーアドレスをできるだけ他人に知られないようにすべきです。

## まとめ

本記事では、STUN が NAT トラバーサルを補助する意義を紹介し、いくつかの一般的なリレープロトコル（Tailscale が独自開発した DERP プロトコルを含む）を解説しました。最後に、プライベート DERP サーバーを自前で構築し、Tailscale に自前構築した DERP サーバーを使用させる方法を手取り足取り説明しました。