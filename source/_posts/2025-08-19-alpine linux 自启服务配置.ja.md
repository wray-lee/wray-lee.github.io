---
title: Alpine Linux 自動起動サービス設定
date: 2025-08-19 18:18:22
tags: ["linux"]
lang: ja
slug: alpine linux 自启服务配置
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

# Alpine Linux 自動起動サービス設定

## パス

`/etc/init.d`

## サービス

```bash
#!/sbin/openrc-run

description="stat_client"
command="/opt/ServerStatus/client/stat_client"
command_args="-a "https://probe.wray7.top/report" -u h6 -p wray6s"
command_background=true
pidfile="/var/run/stat_client.pid"

```

カスタマイズ可能な部分

```bash
depend() {

}

start_pre() {

}

reload() {

}
```



## 自動起動

```bash
#rc-update add stat_client default
rc-update add stat_client
rc-update show
```