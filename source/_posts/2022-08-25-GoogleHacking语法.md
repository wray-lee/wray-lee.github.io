---
title: "GoogleHacking语法"
date: 2022-08-25 20:55:30
tags: ["web"]
---

intext:		网页内容作为搜索
inurl:		网址作为搜索
intitle:	网页标题作为搜索
cache:		搜索缓存，过期内容
filetype:T name	搜索类型文件，定义类型和名字
site:		在指定网站下搜索

“”		把引号内作为整体搜索
and		与，一起搜索
or		或，搜索多个关键字
link:		搜索某个网站链接





 1.找管理后台地址

    site:http://xxx.com intext:管理、后台、登录、用户名、密码、系统、帐号
    site:http://xxx.com inurl:login、admin、manage、manager、admin_login、system
    site:http://xxx.com intitle:管理、后台、登陆

2.找上传类漏洞地址

    site:http://xxx.com inurl:file
    site:http://xxx.com inurl:upload

3.找注入页面

    site:http://xxx.com inurl:php?id=

4.找编辑器页面

    site:http://xxx.com inurl:ewebeditor