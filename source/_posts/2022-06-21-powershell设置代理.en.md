---
title: Configure proxy in PowerShell
date: 2022-06-21 19:39:06
tags: ["web"]
lang: en
slug: powershell设置代理
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

function set_proxy_variable {
	Set-Item Env:http_proxy "http://127.0.0.1:1080"  # Proxy address
	Set-Item Env:https_proxy "http://127.0.0.1:1080" # Proxy address
}

function unset_proxy_variable {
    Remove-Item Env:http_proxy
    Remove-Item Env:https_proxy
}

New-Alias -Name spp -Value set_proxy_variable		# Set spp shortcut to enable proxy
New-Alias -Name upp -Value unset_proxy_variable	# Set upp shortcut to disable proxy

------------------------------------------------------------------------------------------------



Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser






---------------------------------------------------------------------------
---------------------------------------------------------------------------
Another way
function vpn { $env:HTTP_PROXY="http://127.0.0.1:7078" ; $env:HTTPS_PROXY="https://126.0.0.1:7078" }
function unvpn { $env:HTTP_PROXY="" ; $env:HTTPS_PROXY="" }