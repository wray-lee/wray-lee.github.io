---
title: Configuring Video Hardware Acceleration on Arch Linux (Hardware Decoding)
date: 2025-05-24 00:02:26
tags: ["linux"]
lang: en
slug: Arch Linux配置视频硬件加速(硬解)
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

# Hardware decoding

Two mainstream interfaces: `VA-API` and `VDPAU  （仅x11）`

## Drivers

|                     |                                                              |
| ------------------- | ------------------------------------------------------------ |
| NVIDIA              | Open source (supports VA-API and VDPAU): <br />`Nouveau`  <br /><br />For GeForce 8 to GeForce GTX 750 hardware, please use the `libva-mesa-driver` package and `mesa-vdpau包`<br/><br /> You also need the `nouveau-fw  (AUR)` firmware package (currently extracted from the NVIDIA binary driver) <br /><br /><br /> Closed source: `nvidia-utils` (supports VDPAU and NVDEC) |
| Intel (supports VA-API) | Broadwell (~2014) and later HD Graphics series (e.g., Intel Arc series graphics), please use the `intel-media-driver` package. <br /><br />For GMA 4500 (2008) to Coffee Lake (2017) GPUs, please use the `libva-intel-driver` package. <br/><br />GMA 4500 H.264 decoding is supported by `libva-intel-driver-g45-h264  (AUR)`, see Intel graphics processor#Hardware-accelerated H.264 decoding on GMA 4500.<br/><br />For VP9 decoding from Haswell Refresh to Skylake, and hybrid VP8 encoding from Broadwell to Skylake, please use `intel-hybrid-codec-driver-git  (AUR)`.<br/><br />Hardware from Skylake and later also requires the `linux-firmware` package. |
| AMD                 | Open source (supports VA-API and VDPAU): VA-API for Radeon HD 2000 and newer GPUs is supported by the `libva-mesa-driver` package<br/> VDPAU for Radeon R600 and newer GPUs is supported by the `mesa-vdpau` package<br /><br /> Proprietary (supports VA-API, VDPAU and AMF): ` amf-amdgpu-pro  (AUR)` |

## Translation layers

- **`libva-vdpau-driver`** — VA-API with VDPAU as backend.

- **`nvidia-vaapi-driver`** — VA-API with CUDA NVDEC as backend.

## Verification

`libva-utils` -> `vainfo`

`vdpauinfo`

# Configuring video hardware acceleration on Arch Linux

A few days ago I decided to use Arch Linux as my main system, and then the problem came: the CPU is too weak, and when catching up on anime I was basically watching a slideshow![:sob:](https://github.githubassets.com/images/icons/emoji/unicode/1f62d.png)，于是开始搞硬件加速。然而众所周知，Linux配置显卡驱动相关是很蛋疼的（其实开源驱动还好），所以折腾了半天，顺手写了这篇东西。。

Here I only discuss the configuration of open-source drivers; proprietary drivers are too much of a pain..

Currently there are two widely used hardware acceleration APIs under Linux: VA-API and VDPAU. Different applications support them differently, so it is best to configure both.

First, you need to install the relevant drivers:

**VA-API**

- `libva-intel-driver` provides the driver for Intel integrated graphics.
- `libva-mesa-driver` provides drivers for NVIDIA and AMD.
- `libva-vdpau-driver` provides a driver that supports all graphics cards, but in fact it calls VDPAU at the underlying level; it only translates the API, so VDPAU must be configured before it can be used.

**VDPAU**

- `mesa-vdpau` provides drivers for NVIDIA and AMD (but for NVIDIA graphics cards you need to install the AUR package `nouveau-fw`, extracted from the proprietary driver).
- `libvdpau-va-gl` provides a driver that supports all graphics cards, but unlike `libva-vdpau-driver`, it calls VA-API at the underlying level.

Because I put Arch onto a USB drive and boot it on different machines, I need to install all of the Intel/NVIDIA/AMD ones..

A simple analysis reveals that each graphics card has a corresponding VA-API driver, but Intel integrated graphics has no corresponding VDPAU driver, so `libvdpau-va-gl` is needed to call VA-API to support VDPAU. Therefore, to support all graphics cards, install these packages: `libva-intel-driver` `libva-mesa-driver` `mesa-vdpau` `libvdpau-va-gl` `nouveau-fw`(AUR). Although in theory for VDPAU all graphics cards really only need translation to VA-API, I think native performance is a bit better than translated (probably)..

In theory this should be fine; the system will automatically select the corresponding driver. However, sometimes automatic detection is not very good (especially on machines with integrated + discrete graphics, where the system defaults to the weaker integrated graphics), so it is best to use environment variables to specify the driver to use: (the following configuration is only for the drivers I previously selected)

| Graphics card | LIBVA_DRIVER_NAME | VDPAU_DRIVER |
| :----: | :----------------------------------------------------------: | :----------: |
| Intel  | i965                                                                                                                                                                                mesa/mesa-amber (Intel 7th generation and earlier)                                                                                                                 32-bit supported mesa lib32-*                                                                                                                                                                                xf86-video-intel                                                                                                                                                  vulkan-intel/amdvlk                                                                                       (yay -S xf86-video-intel vulkan-intel mesa-amber lib32-mesa-amber libvdpau-va-gl-i965) |    va_gl     |
| NVIDIA |                           nouveau                            |   nouveau    |
|  AMD   |                           radeonsi                           |   radeonsi    |

 

Also, if it is a machine with integrated + discrete graphics and you want to use the discrete GPU driver, you also need to set `DRI_PRIME=1`. Note that this is not just a hardware acceleration setting; it will also force all other programs that use the graphics card to use the discrete GPU, so on a laptop it will consume quite a lot of power.

However, as I said before, I need to support different machines, and switching environment variables on every boot is too troublesome, so I wrote a simple script to automatically identify the graphics card based on the currently loaded kernel modules and set the environment variables.

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

Add the script to `/etc/xprofile` (for display manager) and/or `/etc/profile` (if you need to use hardware acceleration without starting a graphical interface), and the environment variables will be configured automatically.

However, note that [OpenGL-based window managers have problems when using PRIME](https://wiki.archlinux.org/index.php/PRIME#Black_screen_with_GL-based_compositors)，建议切换到基于Xrender的窗口管理器，或者只把上述脚本加入`/etc/profile`，在桌面环境提供的终端中运行需要硬件加速的程序。