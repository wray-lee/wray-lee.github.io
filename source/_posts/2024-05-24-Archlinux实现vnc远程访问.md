---
title: "Archlinux实现vnc远程访问"
date: 2024-05-24 00:37:31
tags: ["linux"]
---

# Archlinux实现vnc远程访问

````bash
# 安装xrdp tigervnc
yay xrdp
yay tigervnc

# 创建.vnc
mkdir .vnc
# 创建vnc密码
vncpasswd
# 创建vnc session配置文件
vim ~/.vnc/config
```
session=xfce
geometry=1920x1080
localhost
alwaysshared
```

# 随xorg启动
/etc/X11/xorg.conf.d/10-vnc.conf
```
Section "Module"
Load "vnc"
EndSection

Section "Screen"
Identifier "Screen0"
Option "UserPasswdVerifier" "VncAuth"
Option "PasswordFile" "/root/.vnc/passwd"
EndSection
```


# 开机自启
vim ~/.xprofile

```
x0vncserver -rfbauth ~/.vnc/passwd &
```

````



## 剪贴板同步

`autocutsel`