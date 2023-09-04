---
title: ssh多私钥管理
date: 2023-09-04 21:48:57
---
```yaml
#Windows 上是 ~/.ssh/config
#Linux 上是 /etc/ssh/ssh_config
#
#
# 别名（Host）：Host 和 HostName 的值可以相同
# 如 ssh aliyun，在这里等于 ssh -i C:\Users\Think\.ssh\id_rsa_aliyun root@144.90.100.144
# 用别名登录会使用别名下的配置，不用别名登录（如IP）不会使用别名下的配置
Host aliyun
    User root
    HostName 144.90.100.144
    # 私钥文件位置
    IdentityFile "~/.ssh/id_rsa_aliyun"

Host tencent
    User root
    HostName 100.28.144.47
    IdentityFile "~/.ssh/id_rsa_tencent"
```