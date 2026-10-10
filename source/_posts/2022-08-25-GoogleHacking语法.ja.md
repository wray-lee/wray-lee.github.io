---
title: GoogleHackingの構文
date: 2022-08-25 20:55:30
tags: ["web"]
lang: ja
slug: GoogleHacking语法
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

intext:		Webページの内容を検索
inurl:		URLを検索
intitle:	Webページのタイトルを検索
cache:		キャッシュ、期限切れの内容を検索
filetype:T name	ファイルタイプを検索、タイプと名前を定義
site:		指定したサイト内で検索

“”		引用符内を全体として検索
and		かつ、一緒に検索
or		または、複数のキーワードを検索
link:		あるWebサイトへのリンクを検索






 1.管理画面のアドレスを探す

    site:http://xxx.com intext:管理、管理画面、ログイン、ユーザー名、パスワード、システム、アカウント
    site:http://xxx.com inurl:login、admin、manage、manager、admin_login、system
    site:http://xxx.com intitle:管理、管理画面、ログイン

2.アップロード系脆弱性のアドレスを探す

    site:http://xxx.com inurl:file
    site:http://xxx.com inurl:upload

3.インジェクションページを探す

    site:http://xxx.com inurl:php?id=

4.エディタページを探す

    site:http://xxx.com inurl:ewebeditor