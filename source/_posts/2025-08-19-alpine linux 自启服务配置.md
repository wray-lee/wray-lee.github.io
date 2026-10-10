---
title: "alpine linux 自启服务配置"
date: 2025-08-19 18:18:22
tags: ["linux"]
---

# alpine linux 自启服务配置

## 路径

`/etc/init.d`

## 服务

```bash
#!/sbin/openrc-run

description="stat_client"
command="/opt/ServerStatus/client/stat_client"
command_args="-a "https://probe.wray7.top/report" -u h6 -p wray6s"
command_background=true
pidfile="/var/run/stat_client.pid"

```

可自定义部分

```bash
depend() {

}

start_pre() {

}

reload() {

}
```



## 自启动

```bash
#rc-update add stat_client default
rc-update add stat_client
rc-update show
```