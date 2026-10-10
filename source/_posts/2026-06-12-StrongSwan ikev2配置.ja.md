---
title: StrongSwan ikev2設定
date: 2026-06-12 01:24:33
tags: ["linux"]
lang: ja
slug: StrongSwan ikev2配置
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

# StrongSwan ikev2設定

`sysctl` カーネル転送を有効にする

`/etc/swanctl/swanctl.conf`

```bash
# 1. 连接定义 (等同于原 ipsec.conf)
connections {
    ikev2-vpn {
        version = 2
        encap = yes
        unique = replace
        proposals = default
        pools = rw_pool

        # 服务端
        local {
            auth = psk
            id = 1.2.3.4
        }
        
        # 客户端
        remote {
            auth = psk
            id = %any
        }
        
        # 流量与路由子网
        children {
            net {
                local_ts = 0.0.0.0/0
                esp_proposals = default
            }
        }
    }
}

# 2. 客户端 IP 池与 DNS (替代 rightsourceip 和 rightdns)
pools {
    rw_pool {
        addrs = 10.10.10.0/24
        dns = 8.8.8.8, 1.1.1.1
    }
}

# 3. 鉴权凭证 (替代 ipsec.secrets)
secrets {
    ike-psk {
        secret = "YourStrongPasswordHere"
    }
}
```



ファイアウォール設定

```bash
# /etc/default/ufw

DEFAULT_FORWARD_POLICY="ACCEPT"
```



```bash
# /etc/ufw/before.rules
# 放在开头

*nat
:POSTROUTING ACCEPT [0:0]
# 伪装 VPN 子网流量
-A POSTROUTING -s 10.10.10.0/24 -o eth0 -j MASQUERADE
COMMIT
```