---
title: "powershell设置代理"
date: 2022-06-21 19:39:06
tags: ["web"]
---

function set_proxy_variable {
	Set-Item Env:http_proxy "http://127.0.0.1:1080"  # 代理地址
	Set-Item Env:https_proxy "http://127.0.0.1:1080" # 代理地址
}

function unset_proxy_variable {
    Remove-Item Env:http_proxy
    Remove-Item Env:https_proxy
}

New-Alias -Name spp -Value set_proxy_variable		#设置spp开启代理快捷键
New-Alias -Name upp -Value unset_proxy_variable	#设置upp关闭代理快捷键

------------------------------------------------------------------------------------------------



Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser






---------------------------------------------------------------------------
---------------------------------------------------------------------------
另一种方式
function vpn { $env:HTTP_PROXY="http://127.0.0.1:7078" ; $env:HTTPS_PROXY="https://126.0.0.1:7078" }
function unvpn { $env:HTTP_PROXY="" ; $env:HTTPS_PROXY="" }