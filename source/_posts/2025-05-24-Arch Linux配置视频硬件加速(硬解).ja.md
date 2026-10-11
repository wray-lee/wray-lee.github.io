---
title: Arch Linuxで動画ハードウェアアクセラレーション（ハードウェアデコード）を設定
date: 2025-05-24 00:02:26
tags: ["linux"]
lang: ja
slug: Arch Linux配置视频硬件加速(硬解)
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

# ハードウェアデコード

主流の2つのインターフェース：`VA-API` と `VDPAU  （仅x11）`

## ドライバー

|                     |                                                              |
| ------------------- | ------------------------------------------------------------ |
| NVIDIA              | オープンソース（VA-API と VDPAU をサポート）：<br />`Nouveau`  <br /><br />GeForce 8 から GeForce GTX 750 のハードウェアでは、`libva-mesa-driver`パッケージと `mesa-vdpau包`<br/><br />にはさらに `nouveau-fw  (AUR)` ファームウェアパッケージも必要です（現在は NVIDIA バイナリドライバーから抽出されたもの）<br /><br /><br />プロプライエタリ：`nvidia-utils`（VDPAU と NVDEC をサポート） |
| Intel（VA-API をサポート） | Broadwell（~2014）以降の HD Graphics シリーズ（例：Intel Arc シリーズ GPU）では、`intel-media-driver`パッケージを使用してください。<br /><br />GMA 4500（2008）から Coffee Lake（2017）までの GPU では、`libva-intel-driver`パッケージを使用してください。<br/><br />GMA 4500 の H.264 デコードは `libva-intel-driver-g45-h264  (AUR)` によってサポートされています。Intel グラフィックスプロセッサ#GMA 4500 上のハードウェアアクセラレーション H.264 デコードを参照。<br/><br />Haswell Refresh から Skylake の VP9 デコード、および Broadwell から Skylake のハイブリッド VP8 エンコードには、`intel-hybrid-codec-driver-git  (AUR)` を使用してください。<br/><br />Skylake 以降のハードウェアにはさらに `linux-firmware`パッケージが必要です。 |
| AMD                 | オープンソース（VA-API と VDPAU をサポート）：Radeon HD 2000 以降の GPU の VA-API は `libva-mesa-driver`パッケージでサポートされています<br/>Radeon R600 以降の GPU の VDPAU は `mesa-vdpau`パッケージでサポートされています<br /><br />プロプライエタリ（VA-API、VDPAU、AMF をサポート）：` amf-amdgpu-pro  (AUR)` |

## 変換レイヤー

- **`libva-vdpau-driver`** — VDPAU をバックエンドとする VA-API。

- **`nvidia-vaapi-driver`** — CUDA  NVDEC をバックエンドとする VA-API。

## 検証

`libva-utils` -> `vainfo`

`vdpauinfo`

# Arch Linux で動画のハードウェアアクセラレーションを設定

先日、Arch Linux をメインシステムにすることにしたのですが、そこで問題が。CPU が貧弱すぎて、アニメを一気見するときは完全にスライドショーを見ている状態です![:sob:](https://github.githubassets.com/images/icons/emoji/unicode/1f62d.png)，于是开始搞硬件加速。然而众所周知，Linux配置显卡驱动相关是很蛋疼的（其实开源驱动还好），所以折腾了半天，顺手写了这篇东西。。

ここではオープンソースドライバーの設定についてのみ扱います。プロプライエタリドライバーは面倒すぎるので……

現在 Linux で広く使われているハードウェアアクセラレーション API は VA-API と VDPAU の2つです。アプリケーションによって対応状況が異なるため、どちらも設定しておくのがよいでしょう。

まず、関連するドライバーをインストールする必要があります：

**VA-API**

- `libva-intel-driver` は Intel 内蔵 GPU 用のドライバーを提供します。
- `libva-mesa-driver` は NVIDIA と AMD のドライバーを提供します。
- `libva-vdpau-driver` はすべての GPU をサポートするドライバーを提供しますが、実際には内部で VDPAU を呼び出しており、API を変換しているだけなので、使用するには VDPAU を正しく設定しておく必要があります。

**VDPAU**

- `mesa-vdpau` は NVIDIA と AMD のドライバーを提供します（ただし NVIDIA の GPU では、プロプライエタリドライバーから抽出された AUR パッケージ `nouveau-fw` をインストールする必要があります）。
- `libvdpau-va-gl` はすべての GPU をサポートするドライバーを提供しますが、`libva-vdpau-driver` とは逆に、内部で VA-API を呼び出します。

私は USB メモリに Arch を入れて、いろいろなマシンで起動しているので、Intel/NVIDIA/AMD のドライバーをすべてインストールする必要があります……簡単に分析すると、各 GPU には対応する VA-API ドライバーがありますが、Intel 内蔵 GPU には対応する VDPAU ドライバーがないため、`libvdpau-va-gl` で VA-API を呼び出して VDPAU をサポートする必要があります。したがって、すべての GPU をサポートするには、これらのパッケージをインストールします：`libva-intel-driver` `libva-mesa-driver` `mesa-vdpau` `libvdpau-va-gl` `nouveau-fw`(AUR)。理屈の上では VDPAU に関して実際にはすべての GPU を VA-API に変換すればよいだけですが、ネイティブのほうが変換より性能が少し良いはずだと思ったので（おそらく）。。

理屈の上ではこれで問題ありません。システムが対応するドライバーを自動的に選択します。しかし、自動認識の結果がよくないことがあります（特に内蔵 GPU + ディスクリート GPU のマシンでは、システムが性能の低い内蔵 GPU をデフォルトで使用します）。そのため、環境変数で使用するドライバーを指定するのがよいでしょう：（以下の設定は、私が以前選択したドライバーにのみ対応しています）

|  GPU  | LIBVA_DRIVER_NAME | VDPAU_DRIVER |
| :----: | :----------------------------------------------------------: | :----------: |
| Intel  | i965                                                                                                                                                                                mesa/mesa-amber(Intel 第7世代以前)                                                                                                                 32ビット対応の mesa lib32-*                                                                                                                                                                                xf86-video-intel                                                                                                                                                  vulkan-intel/amdvlk                                                                                       (yay -S xf86-video-intel vulkan-intel mesa-amber lib32-mesa-amber libvdpau-va-gl-i965) |    va_gl     |
| NVIDIA |                           nouveau                            |   nouveau    |
|  AMD   |                           radeonsi                           |   radeonsi   |

 

また、内蔵 GPU + ディスクリート GPU のマシンでディスクリート GPU のドライバーを使用する場合は、さらに `DRI_PRIME=1` を設定する必要があります。これはハードウェアアクセラレーションの設定だけではなく、GPU を呼び出すほかのすべてのプログラムにもディスクリート GPU を強制的に使用させるため、ノート PC ではかなり電池を消費します。

しかし先ほども言ったように、私はさまざまなマシンに対応する必要があり、起動するたびに環境変数を切り替えるのは面倒すぎるので、現在読み込まれているカーネルモジュールに基づいて GPU を自動認識し、環境変数を設定する簡単なスクリプトを書きました。

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

スクリプトを `/etc/xprofile`（display manager 向け）および/または `/etc/profile`（グラフィカルインターフェースを起動せずにハードウェアアクセラレーションを使う必要がある場合）に追加すれば、環境変数を自動設定できます。

ただし、注意が必要です。[OpenGL ベースのウィンドウマネージャーは PRIME を使用すると問題が発生する](https://wiki.archlinux.org/index.php/PRIME#Black_screen_with_GL-based_compositors)，建议切换到基于Xrender的窗口管理器，或者只把上述脚本加入`/etc/profile`，在桌面环境提供的终端中运行需要硬件加速的程序。