---
title: Openwrt サービス(Init script)
date: 2026-06-02 15:12:05
tags: ["linux"]
lang: ja
slug: Openwrt 服务(Init script)
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

# Openwrt サービス(Init script)

```bash
#!/bin/sh /etc/rc.common

# 定义服务名称
NAME=cloudflared

# 定义启动顺序（数值越小越早启动，建议在网络服务之后启动）
START=90
STOP=10

# 启用 procd 支持
USE_PROCD=1

# 定义 cloudflared 的可执行文件路径
PROG=/usr/bin/cloudflared

# 定义 PID 文件路径
PIDFILE=/var/run/${NAME}.pid

# 从 UCI 配置文件加载参数
load_config() {
    local token
    local updateTime

    # 加载 UCI 配置
    config_load cloudflared

    # 获取 token 和 updateTime
    config_get token "config" "token"
    config_get updateTime "config" "updateTime" "24h0m0s" # 默认值 24 小时

    # 如果 token 为空，打印错误并退出
    if [ -z "$token" ]; then
        logger -t "$NAME" "Error: 'token' is not set in /etc/config/cloudflared"
        exit 1
    fi

    # 构造 cloudflared 的启动参数
    PROG_ARGS="--pidfile $PIDFILE --autoupdate-freq $updateTime tunnel run --token $token"
}

# 启动服务
start_service() {
    # 加载 UCI 配置
    load_config

    # 检查 cloudflared 可执行文件是否存在
    if [ ! -x "$PROG" ]; then
        logger -t "$NAME" "Error: $PROG not found or not executable"
        exit 1
    fi

    # 使用 procd 管理服务
    procd_open_instance

    # 设置启动命令
    procd_set_param command $PROG $PROG_ARGS

    # 设置 PID 文件
    procd_set_param pidfile $PIDFILE

    # 设置服务自动重启（默认重启策略：最多重试 3 次，每次间隔 5 秒）
    # 3600s内崩溃视作异常，每5s重启一次，无限重启
    procd_set_param respawn 3600 5 0

    # 将标准输出和错误输出重定向到日志
    procd_set_param stdout 1
    procd_set_param stderr 1

    # 关闭 procd 实例
    procd_close_instance

    logger -t "$NAME" "Service started"
}

# 重载服务（procd 支持 reload 信号）
reload_service() {
    procd_send_signal "$NAME"
    logger -t "$NAME" "Service reloaded"
}

# 服务启动后的额外检查（可选）
service_triggers() {
    # 依赖网络接口，确保网络就绪后再启动
    procd_add_reload_trigger "network"

    # 监听 UCI 配置文件的变化
    # procd_add_reload_trigger "cloudflared"
}

# 可选：验证配置
# validate_section_cloudflared() {
#     uci_validate_section cloudflared cloudflared "${1}" \
#         'token:string' \
#         'updateTime:string:24h0m0s'
# }

# uci配置 /etc/config/cloudflared
# config cloudflared 'config'
#     option token 'your_token_here'
# option updateTime '24h0m0s'
#     option token 'your_cloudflare_tunnel_token'

```



## Procd

openwrt 下のプロセス管理ツール

必要なパラメータ

-   `USE_PROCD=1`
-   `PROG=path/to/bin`
-   `PIDFILE=/var/run/${NAME}.pid`
-   `PROG_ARGS=args`



`procd` は経由で`procd_open_instance`サービスインスタンスを作成して編集し、その後`procd_close_instance`で保存し、instanceから実行後`procd`に移行してサービス管理を行います



## config

`/etc/config/**`

```bash
config cloudflared 'config'
    option enabled '0'
    option config '/etc/cloudflared/config.yml'
    option origincert '/etc/cloudflared/cert.pem'
    option region ''
    option loglevel 'info'
    option logfile '/var/log/cloudflared.log'
    option token ''
    option updateTime '24h0m0s'
```