---
title: Google Hacking Syntax
date: 2022-08-25 20:55:30
tags: ["web"]
lang: en
slug: GoogleHacking语法
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

intext:		search web page content
inurl:		search the URL
intitle:	search the page title
cache:		search cache, expired content
filetype:T name	search files of a type, defining type and name
site:		search within a specified site

“”		search the content inside the quotation marks as a whole
and		and, search together
or		or, search multiple keywords
link:		search links to a certain website





 1. Find admin backend addresses

    site:http://xxx.com intext:admin, backend, login, username, password, system, account
    site:http://xxx.com inurl:login, admin, manage, manager, admin_login, system
    site:http://xxx.com intitle:admin, backend, login

2. Find upload-type vulnerability addresses

    site:http://xxx.com inurl:file
    site:http://xxx.com inurl:upload

3. Find injection pages

    site:http://xxx.com inurl:php?id=

4. Find editor pages

    site:http://xxx.com inurl:ewebeditor