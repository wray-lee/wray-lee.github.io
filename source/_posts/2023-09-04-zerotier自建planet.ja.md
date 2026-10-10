---
title: zerotier自前planet
date: 2023-09-04 00:00:00
tags: ["Network", "组网"]
lang: ja
slug: zerotier自建planet
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

著者のDockerを使用すると、最終的に中心ノードはleafと表示され、中国移動4Gと中国電信ブロードバンドの遅延をテストすると500ms、中心ノードまではそれぞれ120msと40msで、実際にはカスタムノードを経由していませんでした。
**調査の結果、さらに設定が必要です**。以下に方針を示します:

1. composeにはports: ‘9993:9993’と’9993:9993/udp’を追加する必要があり、サーバーとファイアウォールでも許可する必要があります
2. コンテナに入り、moon.jsonを生成する
3. moon.jsonをホストマシンにコピーし、stableEndpointsを変更する
4. ホストマシンで[mkmoonworld-x86](https://github.com/kaaass/ZeroTierOne/releases/download/mkmoonworld-1.0/mkmoonworld-x86)生成行星文件 を使用する
5. 変更後のmoon.jsonをコンテナにコピーし、コンテナ内でmoonファイルを生成し、moons.dフォルダを作成して、その中に入れる。予備として1部をホストマシンにコピーする
6. planetファイルをコンテナに戻して置き換える
7. コンテナを再起動する
8. クライアントのplanetファイルを置き換える
9. Android端末の場合、実測ではplanetを単独で読み込んでも効果がない。moonファイルを読み込み、公式のplanetノードを無効にすると効果がある

具体的には [https://github.com/xubiaolin/docker-zerotier-planet](https://github.com/xubiaolin/docker-zerotier-planet) 内のコード実装と各種moon生成チュートリアルを参照してください

######## 参考のみ #########

1. ダウンロード

```none
git clone https://github.com/Jonnyan404/zerotier-planet
cd zerotier-planet
vim docker-compose.yml
```
2. 変更

```none
###　参考
### date:2021年11月29日
### author: www.mrdoc.fun | jonnyan404
### 转载请保留来源
version: '2.0'
services:
    ztncui:
        container_name: ztncui
        restart: always
        environment:
            # - MYADDR=公网地址(不设置该项自动获取)
            - MYADDR=127.0.0.1  # 改成自己的服务器公网ip
            - HTTP_PORT=3443
            - HTTP_ALL_INTERFACES=yes
            - ZTNCUI_PASSWD=root
        ports:
            - '3443:3443'  # 设置网页的端口
            - '9993:9993'  # 作为中心节点，提供9993端口给客户端用，一般是9993
            - '9993:9993/udp'
        volumes:
            - './zerotier-one:/var/lib/zerotier-one'
            - './ztncui/etc:/opt/key-networks/ztncui/etc'
            # 按实际路径挂载卷， 冒号前面是宿主机的， 支持相对路径
        image: keynetworks/ztncui
```
3. 実行

```none
docker-compose up -d

docker images #　查看镜像
docker container ps -a # 查看容器

docker exec -it ztncui bash # 进入容器
# 在容器内操作
cd /var/lib/zerotier-one
ls -l
# 生成moon配置文件
zerotier-idtool initmoon identity.public > moon.json
chmod 777 moon.json
```
4. 新しいterminalを開き、**コンテナ外**で`moon.json`を変更する。位置はマウント位置に対応する

`stableEndpoints`を変更し、形式と実際の公衆IPに注意する

```none
{
 "id": "b72b5e9e1a",
 "objtype": "world",
 "roots": [
  {
   "identity": "b72b5e9e1a:0:a892e51d2ef94ef941e4c499af01fbc2903f7ad2fd53e9370f9ac6260c2f5d2484fd90756bec0c410675a81b7cf61d2bb885783bd6a8c28bce83bcab5f03fe14",
   "stableEndpoints": ["127.0.0.1/9993"]
  }
 ],
 "signingKey": "45f0613e569a0549c74293c39b30495b594a003534290e8ade9ef82877aa7505d7a73eeabfc22c97c404e4caaf9f3c9eed2b134d696935c966e28f523364f15f",
 "signingKey_SECRET": "cc6afd67e7b7f84a92e2c8d3c2e7212c71e2ad0a4f5b3c03bf60ab1cd3b99281b57d9a2958d2bd8fc2bc77fdf2a1160099c2c61d3d9acc8cb311673ee120b4a6",
 "updatesMustBeSignedBy": "45f0613e569a0549c74293c39b30495b594a003534290e8ade9ef82877aa7505d7a73eeabfc22c97c404e4caaf9f3c9eed2b134d696935c966e28f523364f15f",
 "worldType": "moon"
}
```
5. **コンテナ内**でmoonファイルを生成する

```none
zerotier-idtool genmoon moon.json
mkdir moons.d
cp *.moon moons.d/
```
6. **コンテナ外**でplanetファイルを生成する

- moonファイルを1部コピーする。クライアントで使用できる
- [mkmoonworld](https://github.com/kaaass/ZeroTierOne/releases/tag/mkmoonworld-1.0), をダウンロードし、moon.jsonをコピーして、1つのディレクトリに置く
- ```
  ./mkmoonworld-x86_64 ./moon.json
  mv world.bin planet

- ```
    # コンテナ内にコピー
    docker cp ./planet ztncui:/var/lib/zerotier-one
```
7. 重启容器

```none
docker restart ztncui
docker exec -it ztncui bash # コンテナに入る
# コンテナ内で操作
cd /var/lib/zerotier-one
#　moonを確認
zerotier-cli listmoons
```
8. `ip+端口`に対応する設定ページにアクセスする
9. クライアントのplanetファイルを置き換えてサービスを再起動し、その後ネットワークに参加し、Web画面で承認する