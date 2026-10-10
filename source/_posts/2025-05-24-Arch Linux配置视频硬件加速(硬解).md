---
title: "Arch Linux配置视频硬件加速(硬解)"
date: 2025-05-24 00:02:26
tags: ["linux"]
---

# 硬解

主流的两个接口：`VA-API` 和 `VDPAU  （仅x11）`

## 驱动

|                     |                                                              |
| ------------------- | ------------------------------------------------------------ |
| NVIDIA              | 开源(支持VA-API 和 VDPAU)：<br />`Nouveau`  <br /><br />GeForce 8 到 GeForce GTX 750 的硬件，请使用 `libva-mesa-driver`包 和 `mesa-vdpau包`<br/><br />还需要 `nouveau-fw  (AUR)` 固件包（目前是从NVIDIA二进制驱动解压出来的）<br /><br /><br />闭源：`nvidia-utils` （支持VDPAU和NVDEC） |
| Intel（支持VA-API） | Broadwell (~2014) 及之后的 HD Graphics 系列（例如英特尔 Arc 系列显卡），请使用 `intel-media-driver`包 。<br /><br />GMA 4500 (2008) 到 Coffee Lake (2017) 的 GPU, 请使用 `libva-intel-driver`包 。<br/><br />GMA 4500 H.264 解码由 `libva-intel-driver-g45-h264  (AUR)` 提供支持, 参见 Intel 图形处理器#GMA 4500上的硬件加速 H.264 解码.<br/><br />Haswell Refresh 到 Skylake 的 VP9 解码，以及 Broadwell 到 Skylake 的混合 VP8 编码，请使用 `intel-hybrid-codec-driver-git  (AUR)`.<br/><br />Skylake 及之后的硬件还需要 `linux-firmware`包. |
| Amd                 | 开源(支持VA-API 和 VDPAU)：Radeon HD 2000 和更新的 GPU 的 VA-API 由 `libva-mesa-driver`包 支持<br/>Radeon R600 和更新的 GPU 的 VDPAU 由 `mesa-vdpau`包 支持<br /><br />专有(支持VA-API ，VDPAU和AMF)：` amf-amdgpu-pro  (AUR)` |

## 翻译层

- **`libva-vdpau-driver`** — VDPAU 作后端的 VA-API.

- **`nvidia-vaapi-driver`** — CUDA  NVDEC 作为后端的 VA-API.

## 验证

`libva-utils` -> `vainfo`

`vdpauinfo`

# Arch Linux配置视频硬件加速

前几天决定用Arch Linux当主系统，那么问题来了，CPU太渣，补番的时候完全是在看幻灯片![:sob:](https://github.githubassets.com/images/icons/emoji/unicode/1f62d.png)，于是开始搞硬件加速。然而众所周知，Linux配置显卡驱动相关是很蛋疼的（其实开源驱动还好），所以折腾了半天，顺手写了这篇东西。。

这里仅讨论开源驱动的配置，专有驱动太蛋疼。。

目前Linux下的广泛使用的硬件加速API有两个：VA-API和VDPAU，不同应用程序的支持情况不同，所以最好都配置好。

首先需要安装相关的驱动：

**VA-API**

- `libva-intel-driver`提供Intel核显的驱动。
- `libva-mesa-driver`提供NVIDIA和AMD的驱动。
- `libva-vdpau-driver`提供支持所有显卡的驱动，但实际上底层调用的是VDPAU，只是对API进行了翻译，所以需要配置好VDPAU才能使用。

**VDPAU**

- `mesa-vdpau`提供NVIDIA和AMD的驱动（但对于NVIDIA显卡需要安装提取自专有驱动的AUR包`nouveau-fw`）。
- `libvdpau-va-gl`提供支持所有显卡的驱动，但和`libva-vdpau-driver`相反，底层调用VA-API。

因为我是拿了个U盘把Arch塞进去，在不同的机器上启动的，所以Intel/NVIDIA/AMD的都要装。。简单分析可以发现各显卡都有对应的VA-API驱动，但Intel核显没有对应VDPAU驱动，需要`libvdpau-va-gl`调用VA-API来支持VDPAU。所以为了支持所有显卡，要安装这些包：`libva-intel-driver` `libva-mesa-driver` `mesa-vdpau` `libvdpau-va-gl` `nouveau-fw`(AUR)。虽然讲道理针对VDPAU实际上所有显卡都只要翻译到VA-API就好，然而我想原生的总比翻译的性能好一点（大概）。。

讲道理这样就没问题了，系统会自动选用对应的驱动，然而有时候自动识别的效果不是很好（尤其是对于核显+独显的机器，系统会默认使用性能较差的核显），所以最好用环境变量指定使用的驱动：（下面的配置仅针对我之前所选用的驱动）

|  显卡  |                      LIBVA_DRIVER_NAME                       | VDPAU_DRIVER |
| :----: | :----------------------------------------------------------: | :----------: |
| Intel  | i965                                                                                                                                                                                mesa/mesa-amber(7代及以前intel)                                                                                                                 32位支持的mesa lib32-*                                                                                                                                                                                xf86-video-intel                                                                                                                                                  vulkan-intel/amdvlk                                                                                       (yay -S xf86-video-intel vulkan-intel mesa-amber lib32-mesa-amber libvdpau-va-gl-i965) |    va_gl     |
| NVIDIA |                           nouveau                            |   nouveau    |
|  AMD   |                           radeonsi                           |   radeonsi   |

 

同时，如果是核显+独显的机器要使用独显驱动的话，还需要设置`DRI_PRIME=1`。注意这不只是针对硬件加速的设置，也会强制其他所有调用显卡的程序使用独显，所以笔记本的话会相当耗电。

然而我之前也说了，我需要支持不同的机器，每次开机都切换环境变量太麻烦了，所以我写了一个简单的脚本用于自动根据当前加载的内核模块识别显卡并设置环境变量。

```shell
#!/bin/bash


unset LIBVA_DRIVER_NAME VDPAU_DRIVER DRI_PRIME


if lspci -k | grep -q -e amdgpu -e radeon; then
	export LIBVA_DRIVER_NAME=radeonsi
	export VDPAU_DRIVER=radeonsi
elif lspci -k | grep -q nouveau; then
	export LIBVA_DRIVER_NAME=nouveau
	export VDPAU_DRIVER=nouveau
fi


if lspci -k | grep -q i915; then
	if [ -z "$LIBVA_DRIVER_NAME" ]; then
		export LIBVA_DRIVER_NAME=i965
		export VDPAU_DRIVER=va_gl
	else
		export DRI_PRIME=1
	fi
fi
```

将脚本加入`/etc/xprofile`（针对display manager）和/或`/etc/profile`（如果你需要在不开图形界面的情况下使用硬件加速）就可以自动配置环境变量了。

不过需要注意的是，[基于OpenGL的窗口管理器在使用PRIME时会出现问题](https://wiki.archlinux.org/index.php/PRIME#Black_screen_with_GL-based_compositors)，建议切换到基于Xrender的窗口管理器，或者只把上述脚本加入`/etc/profile`，在桌面环境提供的终端中运行需要硬件加速的程序。