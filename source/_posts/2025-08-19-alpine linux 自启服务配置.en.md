---
title: Alpine Linux auto-start service configuration
date: 2025-08-19 18:18:22
tags: ["linux"]
lang: en
slug: alpine linux 自启服务配置
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

# Alpine Linux Auto-Start Service Configuration

## Path

`/etc/init.d`

## Service

```bash
#!/sbin/openrc-run

description="stat_client"
command="/opt/ServerStatus/client/stat_client"
command_args="-a "https://probe.wray7.top/report" -u h6 -p wray6s"
command_background=true
pidfile="/var/run/stat_client.pid"

```

Customizable section

```bash
depend() {

}

start_pre() {

}

reload() {

}
```



## Auto-Start

```bash
#rc-update add stat_client default
rc-update add stat_client
rc-update show
```