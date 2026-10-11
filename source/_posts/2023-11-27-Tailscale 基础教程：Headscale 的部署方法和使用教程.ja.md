---
title: Tailscale 基礎チュートリアル：Headscale のデプロイ方法と使用チュートリアル
date: 2023-11-27 17:52:55
tags: ["web"]
lang: ja
slug: Tailscale 基础教程：Headscale 的部署方法和使用教程
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

## Tailscale 基礎チュートリアル：Headscale のデプロイ方法と使用チュートリアル

> 基本コマンド

```shell
headscale namespaces create default

headscale preauthkeys create -e 65535h -u default --reusable	#生成auth_key

headscale node list

tailscale up --login-server=http://<HEADSCALE_PUB_IP>:8080 --accept-routes=true --accept-dns=false --advertise-routes=192.168.100.0/24

### tailscale up --login-server=http://124.221.253.77:8080 --accept-routes=true --accept-dns=false --advertise-routes=10.10.0.0/24,121.48.165.112/32,202.115.0.0/24 --authkey 068287073b622d63fd62286744bb6646b7e13fa13fff9d53 --reset --force-reauth

### 671eddba4d7cef3dd4bbc27aa61771d926dab8c5a72b5d64
```



## Docker デプロイ

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



設定ファイルを修正し、`server_url` をパブリック IP またはドメイン名に変更します

当面 DNS 機能を使用しない場合は、まず `magic_dns` を false に設定してもかまいません

`server_url` を `http://<PUBLIC_IP>:8080` に設定し、`<PUBLIC_IP>` をパブリック IP またはドメイン名に置き換えます。

プライベートネットワークセグメントをカスタマイズでき、IPv4 と IPv6 を同時に有効にすることもできます：

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

現在、国家工業情報化部は三大通信事業者に IPv6 の発展を強力に推進させており、家庭用ブロードバンドにとって利用可能な IPv4 パブリック IP はますます少なくなっています。一部地域では、たとえパブリック IPv4 アドレスを取得しても、それは大きな内部ネットワークアドレスであり、真のパブリック IP ではありません。家庭内ネットワークのリソースへのアクセスはますます困難になるでしょう。

一部の人は、frp など特定のプロトコルとポート向けの NAT トラバーサルソリューションを選ぶかもしれませんが、この方法ではまだ不十分で、家庭内ネットワークの任意のデバイスの任意のポートにアクセスできません。より良い選択は、VPN で大規模な内部ネットワークを構築することです。どの VPN を選ぶべきかといえば、間違いなく WireGuard です。WireGuard は VPN の未来です。**私はすでに何度も皆さんに WireGuard の使用を勧めてきました。疲れました、もう話したくありません。どうしてもクソみたいな OpenVPN などを使いたいなら使えばいい、あなたが楽しければそれでいい。**

WireGuard が従来の VPN と比べての中核的な利点は、VPN ゲートウェイがなく、すべてのノード間でポイントツーポイント（P2P）接続ができることです。つまり、以前に私が言及した [フルメッシュ（full mesh）](https://icloudnative.io/posts/wireguard-full-mesh/#1-全互联模式架构与配置) であり、より高効率で、より高速で、より低コストです。

WireGuard の現在最大の課題は、上位アプリケーションの機能が十分に整っていないことです。なぜなら WireGuard は Unix の哲学を重んじており、WireGuard 自体はカーネルレベルのモジュールにすぎず、データプレーンにすぎません。上位のより高度な機能（たとえば鍵交換機構、UDP ホールパンチング、ACL など）は、ユーザー空間のアプリケーションを通じて実装する必要があります。

そのため、WireGuard をベースにより完璧な VPN ツールを実現するために、現在多くのプロジェクトがしのぎを削っています。筆者はしばらく前まで [Netmaker](https://icloudnative.io/posts/configure-a-mesh-network-with-netmaker/) を推奨していました。これは視覚的なインターフェースで WireGuard のフルメッシュモードを設定し、UDP ホールパンチング、マルチテナントなど各種の高度な機能をサポートし、ほぼすべてのプラットフォームに対応しており、非常に強力です。しかし現実世界は複雑で、すべての NAT でホールパンチングが成功するとは限らず、Netmaker には現在フォールバック機構がありません。ホールパンチングに失敗した場合、リレーノード経由にフォールバックできません。Tailscale はこの点で Netmaker よりはるかに優れており、フォールバック機構をサポートし、フルメッシュモードを最大限実現できます。一部のノードでホールパンチングが成功しなくても、リレーノードを通じてこの仮想ネットワーク内を支障なく移動できます。

そうです、私は心変わりしました。Netmaker 陣営から Tailscale に乗り換えたのです。間違いなくクズ男です。

## Tailscale とは

Tailscale は WireGuard をベースにした仮想ネットワーク構築ツールで、Netmaker に似ています。**最大の違いは、Tailscale がユーザー空間で WireGuard プロトコルを実装しているのに対し、Netmaker はカーネル空間の WireGuard を直接使用していることです**。そのため Tailscale はカーネル空間の WireGuard と比べて性能がいくらか劣りますが、OpenVPN の類と比べれば何十倍も優れています。Tailscale は性能面で多少の取捨選択をしていますが、機能と使いやすさでは間違いなく他のツールを圧倒します：

1. すぐに使える

- ファイアウォールの設定が不要
- 追加の設定がない

1. 高い安全性／プライバシー

- 自動鍵ローテーション
- ポイントツーポイント接続
- ユーザーによるエンドツーエンドのアクセス記録の監査をサポート

1. 既存の ICE、STUN などの UDP プロトコルに加えて、NAT トラバーサルを実現する DERP TCP プロトコルを実装

2. パブリックネットワーク上のコントロールサーバーが ACL と設定を配信し、ノードの動的更新を実現

3. サードパーティ（Google など）の SSO サービスを通じてユーザーと秘密鍵を生成し、本人認証を実現

要するに、Tailscale はより使いやすく、機能がより充実した WireGuard と見なすことができます。

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting3@main/uPic/2022-03-20-14-50-Q4bWmK.png)

これだけではまだ不十分です。ただ乗り派として、私がより気にするのは**無料**と**オープンソース**です。

Tailscale は商用製品ですが、個人ユーザーは無料で利用できます。個人ユーザーは接続デバイスが 20 台以下の場合、無料で使用できます（ただし、サブネットセグメントをカスタマイズできない、複数のサブネットを設定できないなど、いくつかの制限があります）。Windows と macOS のグラフィカルアプリケーションを除き、他の Tailscale クライアントのコンポーネント（Android クライアントを含む）は BSD ライセンスの下でオープンソースプロジェクトとして開発されています。各 OS のクライアントソースコードは彼らの [GitHub リポジトリ](https://github.com/tailscale/) で見つけられます。

ほとんどのユーザーにとって、Tailscale を無料で利用するだけで十分です。カスタムネットワークセグメントなど、より高い要件がある場合は、有料版を選択できます。

**お金を払いたくないのはダメですか？ダメではありませんが、この先を読み進める必要があります。**

## Headscale とは

Tailscale のコントロールサーバーはオープンソースではなく、無料ユーザーに多くの制限があります。これは彼らのドル箱なので理解できます。幸いなことに、現在 [Headscale](https://github.com/juanfont/headscale) というオープンソース実装があり、これが唯一のものです。大きく発展することを願っています。

Headscale は欧州宇宙機関の Juan Font によって Go 言語で開発され、BSD ライセンスの下で公開されています。Tailscale コントロールサーバーのすべての主要機能を実装しており、企業内にデプロイでき、デバイス数の制限がまったくなく、すべてのネットワークトラフィックを自分で制御できます。

現在 Headscale には可視化インターフェースがありません。今後のアップデートに期待しましょう。

## Headscale のデプロイ

Headscale のデプロイは簡単です。Linux ホストに直接インストールすることをおすすめします。

> 理論上は、Headscale サービスをパブリックネットワークの出口に公開できれば十分ですが、NAT がないことが望ましいため、パブリック IP を持つクラウドホストに Headscale をデプロイすることをおすすめします。

まず、その GitHub リポジトリの Release ページから最新版のバイナリファイルをダウンロードする必要があります。

```bash
$ wget --output-document=/usr/local/bin/headscale \
   https://github.com/juanfont/headscale/releases/download/v<HEADSCALE VERSION>/headscale_<HEADSCALE VERSION>_linux_<ARCH>

$ chmod +x /usr/local/bin/headscale
```



設定ディレクトリを作成：

```bash
$ mkdir -p /etc/headscale
```



データと証明書を保存するディレクトリを作成：

```bash
$ mkdir -p /var/lib/headscale
```



空の SQLite データベースファイルを作成：

```bash
$ touch /var/lib/headscale/db.sqlite
```



Headscale 設定ファイルを作成：

```bash
$ wget https://github.com/juanfont/headscale/raw/main/config-example.yaml -O /etc/headscale/config.yaml
```



- 設定ファイルを修正し、`server_url` をパブリック IP またはドメイン名に変更します。**中国国内のサーバーの場合、ドメイン名は必ず ICP 登録が必要です**。私のドメインは登録できないため、直接パブリック IP を使いました。

- 当面 DNS 機能を使用しない場合は、まず `magic_dns` を false に設定してもかまいません。

- `server_url` を `http://<PUBLIC_IP>:8080` に設定し、`<PUBLIC_IP>` をパブリック IP またはドメイン名に置き換えます。

- プライベートネットワークセグメントをカスタマイズでき、IPv4 と IPv6 を同時に有効にすることもできます：

    ```yaml
    ip_prefixes:
      # - fd7a:115c:a1e0::/48
      - 10.1.0.0/16
    ```
    

作成 SystemD サービス設定ファイルを作成：

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



headscale ユーザーを作成：

```bash
$ useradd headscale -d /home/headscale -m
```



/var/lib/headscale ディレクトリの所有者を変更：

```bash
$ chown -R headscale:headscale /var/lib/headscale
```



設定ファイル内の `unix_socket` を変更：

```yaml
unix_socket: /var/run/headscale/headscale.sock
```



新しい設定ファイルを読み込むために SystemD をリロード：

```bash
$ systemctl daemon-reload
```



Headscale サービスを起動し、起動時の自動開始を設定：

```bash
$ systemctl enable --now headscale
```



実行状態を確認：

```bash
$ systemctl status headscale
```



使用ポートを確認：

```bash
$ ss -tulnp|grep headscale

tcp LISTEN 0 1024 [::]:9090 [::]:* users:(("headscale",pi

d=10899,fd=13))

tcp LISTEN 0 1024 [::]:50443 [::]:* users:(("headscale",pi

d=10899,fd=10))

tcp LISTEN 0 1024 [::]:8080 [::]:* users:(("headscale",pi

d=10899,fd=12))
```



Tailscale には tailnet という概念があります。これはテナントと理解してよく、テナント同士は相互に分離されています。詳細は Tailscale の公式ドキュメント [What is a tailnet](https://tailscale.com/kb/1136/tailnet/) を参照してください。Headscale にも同様の実装があり、namespace、つまり名前空間と呼ばれます。後続のクライアント接続のために、まず namespace を作成する必要があります。たとえば：

```bash
$ headscale namespaces create default
```



名前空間を確認：

```bash
$ headscale namespaces list

ID | Name | Created

1 | default | 2022-03-09 06:12:06
```



## Tailscale クライアントの接続

現在 iOS クライアントを除き、他のプラットフォームのクライアントは Tailscale のコントロールサーバーをカスタマイズする方法があります。

| OS      | Headscale をサポートするか                                   |
| :------ | :----------------------------------------------------------- |
| Linux   | Yes                                                          |
| OpenBSD | Yes                                                          |
| FreeBSD | Yes                                                          |
| macOS   | Yes                                                          |
| Windows | Yes [Windows クライアントドキュメント](https://github.com/juanfont/headscale/blob/main/docs/windows-client.md) を参照 |
| Android | サポート、[この PR](https://github.com/tailscale/tailscale-android/pull/55) を参照 |
| iOS     | 未サポート                                                     |

まず Linux プラットフォームの接続を見てみましょう。

### Linux

Tailscale 公式は各種 Linux ディストリビューションのパッケージを提供していますが、中国国内のネットワークはご存じのとおり、ソフトウェアリポジトリはまったく使えません。幸い公式は [静的にコンパイルされたバイナリファイル](https://tailscale.com/download/linux/static) も提供しているので、直接ダウンロードできます。たとえば：

```bash
$ wget https://pkgs.tailscale.com/stable/tailscale_1.22.2_amd64.tgz
```



解凍：

```bash
$ tar zxvf tailscale_1.22.2_amd64.tgz
x tailscale_1.22.2_amd64/
x tailscale_1.22.2_amd64/tailscale
x tailscale_1.22.2_amd64/tailscaled
x tailscale_1.22.2_amd64/systemd/
x tailscale_1.22.2_amd64/systemd/tailscaled.defaults
x tailscale_1.22.2_amd64/systemd/tailscaled.service
```



バイナリファイルを公式パッケージのデフォルトパスにコピー：

```bash
$ cp tailscale_1.22.2_amd64/tailscaled /usr/sbin/tailscaled
$ cp tailscale_1.22.2_amd64/tailscale /usr/bin/tailscale
```



systemD サービス設定ファイルをシステムパスにコピー：

```bash
$ cp tailscale_1.22.2_amd64/systemd/tailscaled.service /lib/systemd/system/tailscaled.service
```



環境変数設定ファイルをシステムパスにコピー：

```bash
$ cp tailscale_1.22.2_amd64/systemd/tailscaled.defaults /etc/default/tailscaled
```



tailscaled.service を起動し、起動時の自動開始を設定：

```bash
$ systemctl enable --now tailscaled
```



サービス状態を確認：

```bash
$ systemctl status tailscaled
```



Tailscale を Headscale に接続：

```bash
# 将 <HEADSCALE_PUB_IP> 换成你的 Headscale 公网 IP 或域名
$ tailscale up --login-server=http://<HEADSCALE_PUB_IP>:8080 --accept-routes=true --accept-dns=false
```



ここでは DNS 機能をオフにすることをおすすめします。システムのデフォルト DNS を上書きするためです。DNS に要件がある場合は、公式ドキュメントを自分で調べてください。ここではこれ以上説明しません。

上記のコマンドを実行すると、次の情報が表示されます：

```bash
To authenticate, visit:

http://xxxxxx:8080/register?key=905cf165204800247fbd33989dbc22be95c987286c45aac303393704

1150d846
```



ブラウザでそのリンクを開くと、次の画面が表示されます：

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting3@main/uPic/2022-03-20-17-06-08qWbz.png)

その中のコマンドをコピーして headscale が動作しているマシンのターミナルに貼り付け、NAMESPACE を先ほど作成した namespace に置き換えます。

```bash
$ headscale -n default nodes register --key 905cf165204800247fbd33989dbc22be95c987286c45aac3033937041150d846
Machine register
```



登録に成功したら、登録されたノードを確認：

```bash
$ headscale nodes list

ID | Name | NodeKey | Namespace | IP addresses | Ephemeral | Last seen | Onlin

e | Expired

1 | coredns | [Ew3RB] | default | 10.1.0.1 | false | 2022-03-20 09:08:58 | onlin

e | no
```



Tailscale クライアントがある Linux ホストに戻ると、Tailscale が関連するルーティングテーブルと iptables ルールを自動的に作成することがわかります。ルーティングテーブルは次のコマンドで確認できます：

```bash
$ ip route show table 52
```



iptables ルールを確認：

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

macOS には 3 つのインストール方法があります：

- App Store から直接インストール、アドレス： https://apps.apple.com/ca/app/tailscale/id1475387142。前提として**米国アカウントの ID が必要です**。。。
- [インストールパッケージ](https://pkgs.tailscale.com/stable/#macos) をダウンロードして直接インストールし、App Store を迂回します。
- オープンソースのコマンドラインツール `tailscale` と `tailscaled` をインストールします。関連リンク： https://github.com/tailscale/tailscale/wiki/Tailscaled-on-macOS。

これら 3 つのインストールパッケージのコアとなるデータパケット処理コードは同じで、唯一の違いはパッケージング方法とシステムとの対話方法です。

App Store のアプリは [アプリサンドボックス](https://developer.apple.com/library/archive/documentation/Security/Conceptual/AppSandboxDesignGuide/AboutAppSandbox/AboutAppSandbox.html) 内で動作し、システムの他の部分から隔離されています。サンドボックス内で、アプリは [ネットワーク拡張](https://developer.apple.com/documentation/networkextension) になることができ、VPN または VPN 類似の機能を実現します。ネットワーク拡張で実装された機能は、App Store 外のアプリには効果を発揮できません。

macOS 10.15 から [システム拡張](https://developer.apple.com/system-extensions/) が追加されました。要するにユーザー空間で動作するカーネル拡張であり、従来のネットワーク拡張と比べて、コンテンツフィルタリング、透過プロキシ、DNS プロキシなど多くの機能が強化されています。Tailscale の App Store に依存しないインストールパッケージが使用するのは**システム拡張**で、DMG または zip 圧縮パッケージで配布されます。

App Store 版と独立配布版を同時にインストールしないでください。同時にインストールできるのは 1 つだけです。

コマンドラインツールはネットワーク拡張もシステム拡張も使用せず、[utun インターフェース](https://en.wikipedia.org/wiki/TUN/TAP) を使用しています。GUI 版と比べて、MagicDNS や Taildrop など一部の機能が欠けています。

概要：

|                | App Store（ネットワーク拡張）                               | 独立アプリ（システム拡張）                                   | コマンドラインバージョン                                     |
| :------------- | :---------------------------------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| 利用可否       | [yes](https://apps.apple.com/ca/app/tailscale/id1475387142) | yes, [beta](https://tailscale.com/kb/1167/release-stages/#beta) | [yes](https://github.com/tailscale/tailscale/wiki/Tailscaled-on-macOS) |
| グラフィカルインターフェース | yes                                                         | yes                                                          | no; CLI                                                      |
| macOS 最低バージョン | macOS 10.13                                                 | macOS 10.15                                                  | macOS 10.13                                                  |
| バックグラウンド実行 | no; sandboxed                                               | 理論上サポート; 未実装                                       | yes                                                          |
| 使用するキーチェーン🔑  | ユーザーレベル                                              | システムレベル                                               | 直接ファイルに保存                                           |
| サンドボックス分離 | yes                                                         | no                                                           | no                                                           |
| 自動更新       | yes; App Store から直接更新                                 | yes; [Sparkle](https://sparkle-project.org/)                 | no                                                           |
| オープンソースか | no                                                          | no                                                           | yes                                                          |
| MagicDNS       | yes                                                         | yes                                                          | yes                                                          |
| Taildrop       | yes                                                         | yes                                                          | 未実装                                                       |

GUI 版アプリをインストールした後、Tailscale に Headscale をコントロールサーバーとして使用させるために、いくつかの裏技的操作が必要です。もちろん、Headscale は詳細な操作手順を提供してくれています。ブラウザで URL：`http://<HEADSCALE_PUB_IP>:8080/apple` を開くと、次の画面が表示されます：

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting4@main/uPic/2022-11-22-17-53-rjcTVg.png)

図に書かれている手順に従って操作するだけで十分です。本記事ではこれ以上説明しません。

App Store 版でない macOS クライアントでは、`io.tailscale.ipn.macos` を `io.tailscale.ipn.macsys` に置き換える必要があります。すなわち：`defaults write io.tailscale.ipn.macsys ControlURL http://<HEADSCALE_PUB_IP>:8080`

変更完了後、Tailscale クライアントを再起動し、macOS の上部メニューバーで Tailscale を見つけてクリックし、さらに `Log in` をクリックします。

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting3@main/uPic/2022-03-20-17-43-pTW3r7.png)

するとすぐにブラウザに遷移し、ページが開きます。

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting3@main/uPic/2022-03-20-17-46-AbzngB.png)

次は以前の Linux クライアントと同様に、Headscale があるマシンに戻り、ブラウザに表示されたコマンドを実行するだけです。登録に成功：

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting3@main/uPic/2022-03-20-17-51-Gcjcmy.png)

Headscale があるホストに戻り、登録されたノードを確認：

```bash
$ headscale nodes list

ID | Name | NodeKey | Namespace | IP addresses | Ephemeral | Last seen | Onlin

e | Expired

1 | coredns | [Ew3RB] | default | 10.1.0.1 | false | 2022-03-20 09:08:58 | onlin

e | no
2 | carsondemacbook-pro | [k7bzX] | default   | 10.1.0.2     | false     | 2022-03-20 09:48:30 | online  | no
```



macOS に戻り、対向ノードに ping できるかテスト：

```bash
$ ping -c 2 10.1.0.1
PING 10.1.0.1 (10.1.0.1): 56 data bytes
64 bytes from 10.1.0.1: icmp_seq=0 ttl=64 time=37.025 ms
64 bytes from 10.1.0.1: icmp_seq=1 ttl=64 time=38.181 ms

--- 10.1.0.1 ping statistics ---
2 packets transmitted, 2 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 37.025/37.603/38.181/0.578 ms
```



Tailscale CLI を使ってテストすることもできます：

```bash
$ /Applications/Tailscale.app/Contents/MacOS/Tailscale ping 10.1.0.1
pong from coredns (10.1.0.1) via xxxx:41641 in 36ms
```



### Android

Android クライアントはバージョン 1.30.0 からカスタムコントロールサーバー（すなわち coordination server）をサポートしています。[Google Play](https://play.google.com/store/apps/details?id=com.tailscale.ipn) または [F-Droid](https://f-droid.org/packages/com.tailscale.ipn/) から最新版クライアントをダウンロードできます。

インストール完了後、Tailscale App を開くと、次の画面が表示されます：

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting4@main/uPic/2022-11-22-18-12-m2IYpv.jpeg)

右上の「3 点」を開くと、`About` オプションが 1 つだけ表示されます：

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting4@main/uPic/2022-11-22-18-14-ghdl4A.jpeg)

次にいくつかの裏技的操作が必要です。右上の「3 点」を**開いては閉じる**ことを繰り返し、3、4 回繰り返すと、`Change server` オプションが表示されます：

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting4@main/uPic/2022-11-22-18-23-mcAexh.jpeg)

`Change server` をクリックし、headscale コントロールサーバーのアドレスを入力します：

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting4@main/uPic/2022-11-22-18-37-fkRIxW.jpeg)

次に `Save and restart` をクリックして再起動し、`Sign in with other` をクリックすると、このページが表示されます：

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting4@main/uPic/2022-06-07-09-30-bf83jv.jpeg)

その中のコマンドを Headscale があるホストのターミナルに貼り付け、**NAMESPACE** を先に作成した namespace に置き換え、コマンドを実行するだけです。登録に成功したらこのページを閉じ、App のホームに戻ると、効果は図のとおりです：

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting4@main/uPic/2022-11-22-18-48-M07ibg.jpeg)

### Windows

Windows Tailscale クライアントで Headscale をコントロールサーバーとして使用したい場合、ブラウザで URL：`http://<HEADSCALE_PUB_IP>:8080/windows` を開くだけで、次の画面が表示されます：

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting3@main/uPic/2022-03-20-23-30-zcQX3F.png)

その中の手順に従って操作するだけです。

### その他の Linux ディストリビューション

通常の Linux ディストリビューション以外に、OpenWrt、QNAP、Synology などの特殊な用途向け Linux ディストリビューションもあります。これらのディストリビューションのインストール方法はすでに誰かが書いているので、ここでは詳しく説明しません。関連する GitHub リポジトリだけを示しますので、必要があれば直接関連リポジトリのドキュメントを参照してください。

- OpenWrt： https://github.com/adyanth/openwrt-tailscale-enabler
- Synology： https://github.com/tailscale/tailscale-synology
- QNAP： https://github.com/ivokub/tailscale-qpkg

### iOS

Tailscale iOS クライアントのソースコードはオープンソースではないため、現在まだ第三者製コントロールサーバーを使用させるために破解することはできません。残念です~~

### Pre-Authkeys による接続

これまでの接続方法はすべてサーバー側の承認が必要で、手順がやや煩雑です。実はもっと簡単な方法があり、サーバー側の承認なしで直接接続できます。

まずサーバー側で pre-authkey のトークンを生成します。有効期限は 24 時間に設定できます：

```bash
$ headscale preauthkeys create -e 24h -n default
```



すでに生成された key を確認：

```bash
$ headscale -n default preauthkeys list
ID | Key                                              | Reusable | Ephemeral | Used  | Expiration          | Created            
1  | 57e419c40e30b0dxxxxxxxf15562c18a8c6xxxx28ae76f57 | false    | false     | false | 2022-05-30 07:14:17 | 2022-05-29 07:14:17
```



これで新しいノードはサーバー側の同意なしで直接接続できます：

```bash
$ tailscale up --login-server=http://<HEADSCALE_PUB_IP>:8080 --accept-routes=true --accept-dns=false --authkey $KEY
```



## LAN を貫通させる

これまではポイントツーポイントの Mesh ネットワークを構築しただけで、各ノード間は WireGuard のプライベートネットワーク IP で直接接続できます。しかし、もっと大胆にできます。記事の冒頭で触れた家庭内ネットワークのリソースへのアクセスを覚えていますか？適切な設定により、各ノードが他のノードの LAN IP にアクセスできるようにできます。この使用シーンはかなり多く、家庭内ネットワークの NAS、または内部ネットワークの任意のサービスに直接アクセスできます。**より上級のプレイヤーはこの方法を使って、クラウド上の Kubernetes クラスタの Pod IP と Service IP にアクセスできます。**

あなたの家庭内ネットワークに Linux ホスト（たとえば OpenWrt）があり、Tailscale クライアントがインストールされていると仮定します。他の Tailscale クライアントが、家中の LAN IP（たとえば **192.168.100.0/24**）を通じて家庭内ネットワークの任意のデバイスに直接アクセスできるようにしたいと考えます。

設定方法はとても簡単です。まず IPv4 と IPv6 のルーティング転送を設定する必要があります：

```bash
$ echo 'net.ipv4.ip_forward = 1' | tee /etc/sysctl.d/ipforwarding.conf
$ echo 'net.ipv6.conf.all.forwarding = 1' | tee -a /etc/sysctl.d/ipforwarding.conf
$ sysctl -p /etc/sysctl.d/ipforwarding.conf
```



クライアント側でノード登録コマンドを変更し、元のコマンドにパラメータ `--advertise-routes=192.168.100.0/24` を追加して、Headscale サーバーに「このノードはこれらのアドレスのルートを転送できる」と伝えます。

```bash
$ tailscale up --login-server=http://<HEADSCALE_PUB_IP>:8080 --accept-routes=true --accept-dns=false --advertise-routes=192.168.100.0/24 --reset
```



Headscale 側でルートを確認すると、関連するルートが無効になっていることがわかります。

```bash
$ headscale nodes list|grep openwrt

6 | openwrt | [7LdVc] | default | 10.1.0.6 | false | 2022-03-20 15:50:46 | onlin

e | no

$ headscale routes list -i 6

Route | Enabled

192.168.100.0/24 | false
```



ルートを有効化：

```bash
$ headscale routes enable -i 6 -r "192.168.100.0/24"

Route | Enabled

192.168.100.0/24 | true
```



複数のルートがある場合は、`,` で区切る必要があります：

```bash
$ headscale routes enable -i 6 -r "192.168.100.0/24,xxxx"
```



パラメータ -a で全ルートを有効化することもできます：

```bash
$ headscale routes enable -i 6 -a
```



他のノードでルート結果を確認：

```bash
$ ip route show table 52|grep "192.168.100.0/24"
192.168.100.0/24 dev tailscale0
```



他のノードの起動時には、`--accept-routes=true` オプションを追加して「外部の他ノードが公開したルートを受け入れる」と宣言する必要があります。

これで、どの Tailscale クライアントがあるノードからでも家庭内ネットワークのマシンに ping できるようになります。会社やスターバックスでも、家にいるときと同じ IP で家中の任意のデバイスに自由にアクセスできます。便利だと思いませんか？

## まとめ

現在、安定性から見ると、Tailscale は Netmaker よりやや優れており、Netmaker のように時々 ping が通らなくなることは基本的にありません。これは Tailscale がユーザー空間で NAT トラバーサルに対して行ったさまざまな最適化によるものです。彼らは [NAT トラバーサルの原理](https://tailscale.com/blog/how-nat-traversal-works/) を紹介する記事もわざわざ書いており、[中国語版](https://arthurchiao.art/blog/how-nat-traversal-works-zh/) は国内の eBPF の大物である趙亜楠氏が翻訳したものです。ぜひ読むことを強くおすすめします。一枚の図で雰囲気を感じてみてください：

![img](https://jsdelivr.icloudnative.io/gh/yangchuansheng/imghosting3@main/uPic/2022-03-21-10-52-TzXGEZ.png)

本記事では Tailscale と Headscale を紹介しました。Headscale のインストールとデプロイ、各プラットフォームのクライアントの接続、そして各ノードが存在する LAN をどのように貫通させるかについてです。次の記事では [Tailscale にカスタム DERP Servers を使用させる方法](https://icloudnative.io/posts/custom-derp-servers/)（つまり中継サーバー）を紹介します。See you~~