---
title: powershellでプロキシを設定する
date: 2022-06-21 19:39:06
tags: ["web"]
lang: ja
slug: powershell设置代理
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

function set_proxy_variable {
	Set-Item Env:http_proxy "http://127.0.0.1:1080"  # プロキシアドレス
	Set-Item Env:https_proxy "http://127.0.0.1:1080" # プロキシアドレス
}

function unset_proxy_variable {
    Remove-Item Env:http_proxy
    Remove-Item Env:https_proxy
}

New-Alias -Name spp -Value set_proxy_variable		#sppでプロキシを有効にするショートカットを設定
New-Alias -Name upp -Value unset_proxy_variable	#uppでプロキシを無効にするショートカットを設定

------------------------------------------------------------------------------------------------



Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser






---------------------------------------------------------------------------
---------------------------------------------------------------------------
別の方法
function vpn { $env:HTTP_PROXY="http://127.0.0.1:7078" ; $env:HTTPS_PROXY="https://126.0.0.1:7078" }
function unvpn { $env:HTTP_PROXY="" ; $env:HTTPS_PROXY="" }