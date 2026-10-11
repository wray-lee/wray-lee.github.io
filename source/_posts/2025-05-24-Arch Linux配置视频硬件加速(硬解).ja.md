---
title: Arch Linuxで動画のハードウェアアクセラレーション（ハードウェアデコード）を設定する
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
| NVIDIA              | オープンソース（VA-API と VDPAU をサポート）：<br />`Nouveau`  <br /><br />GeForce 8 から GeForce GTX 750 のハードウェアでは、`libva-mesa-driver` パッケージと `mesa-vdpau包`<br/><br /> を使用してください。さらに `nouveau-fw  (AUR)` ファームウェアパッケージも必要です（現在は NVIDIA バイナリドライバーから抽出されたものです）<br /><br /><br />クローズドソース：`nvidia-utils`（VDPAU と NVDEC をサポート） |
| Intel（VA-API をサポート） | Broadwell（~2014）以降の HD Graphics シリーズ（例：Intel Arc シリーズ GPU）では、`intel-media-driver` パッケージを使用してください。<br /><br />GMA 4500（2008）から Coffee Lake（2017）の GPU では、`libva-intel-driver` パッケージを使用してください。<br/><br />GMA 4500 の H.264 デコードは `libva-intel-driver-g45-h264  (AUR)` によってサポートされています。Intel グラフィックスプロセッサ#GMA 4500 上のハードウェアアクセラレーション H.264 デコードを参照してください。<br/><br />Haswell Refresh から Skylake の VP9 デコード、および Broadwell から Skylake のハイブリッド VP8 エンコードには、`intel-hybrid-codec-driver-git  (AUR)` を使用してください。<br/><br />Skylake 以降のハードウェアにはさらに `linux-firmware` パッケージが必要です。 |
| AMD                 | オープンソース（VA-API と VDPAU をサポート）：Radeon HD 2000 以降の GPU の VA-API は `libva-mesa-driver` パッケージでサポートされています<br/>Radeon R600 以降の GPU の VDPAU は `mesa-vdpau` パッケージでサポートされています<br /><br />プロプライエタリ（VA-API、VDPAU、AMF をサポート）：` amf-amdgpu-pro  (AUR)` |

## 変換レイヤー

- **`libva-vdpau-driver`** — VDPAU をバックエンドとする VA-API。
- **`nvidia-vaapi-driver`** — CUDA  NVDEC をバックエンドとする VA-API。

## 検証

`libva-utils` -> `vainfo`

`vdpauinfo`

# Arch Linux で動画のハードウェアアクセラレーションを設定

先日、Arch Linux をメインシステムとして使うことにしました。すると問題が発生しました。CPU が弱すぎて、アニメをまとめて見るときは完全にスライドショーを見ている状態でした![:sob:](https://github.githubassets.com/images/icons/emoji/unicode/1f62d.png)。そこでハードウェアアクセラレーションに取り組み始めました。しかし周知のとおり、Linux でグラフィックスドライバー関連を設定するのは非常に面倒です（実際にはオープンソースドライバーならまだましですが）。それで半日ほど試行錯誤し、ついでにこの記事を書きました。。

ここではオープンソースドライバーの設定についてのみ説明します。プロプライエタリドライバーは面倒すぎるので。。

現在 Linux で広く使われているハードウェアアクセラレーション API は VA-API と VDPAU の2つです。アプリケーションによってサポート状況が異なるため、どちらも設定しておくのが最善です。

まず、関連するドライバーをインストールする必要があります：

**VA-API**

- `libva-intel-driver` は Intel 内蔵 GPU のドライバーを提供します。
- `libva-mesa-driver` は NVIDIA と AMD のドライバーを提供します。
- `libva-vdpau-driver` はすべてのグラフィックスカードをサポートするドライバーを提供しますが、実際には内部的に VDPAU を呼び出しており、単に API を変換しているだけなので、使用するには VDPAU を設定しておく必要があります。

**VDPAU**

- `mesa-vdpau` は NVIDIA と AMD のドライバーを提供します（ただし NVIDIA グラフィックスカードでは、プロプライエタリドライバーから抽出された AUR パッケージ `nouveau-fw` をインストールする必要があります）。
- `libvdpau-va-gl` はすべてのグラフィックスカードをサポートするドライバーを提供しますが、`libva-vdpau-driver` とは逆に、内部的に VA-API を呼び出します。

私は USB メモリに Arch を入れて、さまざまなマシンで起動していたので、Intel/NVIDIA/AMD のすべてをインストールする必要がありました。。簡単に分析すると、各グラフィックスカードには対応する VA-API ドライバーがありますが、Intel 内蔵 GPU には対応する VDPAU ドライバーがなく、VDPAU をサポートするには `libvdpau-va-gl` で VA-API を呼び出す必要があります。したがって、すべてのグラフィックスカードをサポートするには、これらのパッケージをインストールします：`libva-intel-driver` `libva-mesa-driver` `mesa-vdpau` `libvdpau-va-gl` `nouveau-fw`(AUR)。理屈の上では、VDPAU に関しては実際にはすべてのグラフィックスカードで VA-API に変換すればよいだけですが、やはりネイティブのほうが変換より性能が少し良いと思います（おそらく）。。

理屈の上ではこれで問題ないはずで、システムが対応するドライバーを自動的に選択します。しかし、自動認識の効果が良くないことがあります（特に内蔵 GPU＋専用 GPU のマシンでは、システムが既定で性能の低い内蔵 GPU を使用します）。そのため、環境変数で使用するドライバーを指定するのが最善です：（以下の設定は、私が以前選択したドライバーにのみ対応しています）

|  グラフィックスカード  |                      LIBVA_DRIVER_NAME                       | VDPAU_DRIVER |
| :----: | :----------------------------------------------------------: | :----------: |
| Intel  | i965                                                                                                                                                                                mesa/mesa-amber（第7世代以前の Intel）                                                                                                                 32ビット対応の mesa lib32-*                                                                                                                                                                                xf86-video-intel                                                                                                                                                  vulkan-intel/amdvlk                                                                                       (yay -S xf86-video-intel vulkan-intel mesa-amber lib32-mesa-amber libvdpau-va-gl-i965) |    va_gl     |
| NVIDIA |                           nouveau                            |   nouveau    |
|  AMD   |                           radeonsi                           |   radeonsi   |

また、内蔵 GPU＋専用 GPU のマシンで専用 GPU ドライバーを使用する場合は、`DRI_PRIME=1` も設定する必要があります。これはハードウェアアクセラレーションのための設定だけでなく、グラフィックスカードを呼び出す他のすべてのプログラムにも専用 GPU を強制的に使用させるため、ノートパソコンではかなり電力消費が激しくなることに注意してください。

しかし先にも述べたとおり、私は異なるマシンをサポートする必要があり、起動のたびに環境変数を切り替えるのは面倒すぎるので、現在読み込まれているカーネルモジュールに基づいてグラフィックスカードを自動認識し、環境変数を設定する簡単なスクリプトを書きました。

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

スクリプトを `/etc/xprofile`（display manager 向け）および/または `/etc/profile`（グラフィカルインターフェースを開かずにハードウェアアクセラレーションを使用する必要がある場合）に追加すれば、環境変数を自動設定できます。

ただし注意すべき点として、[OpenGL ベースのウィンドウマネージャーは PRIME を使用すると問題が発生します](https://wiki.archlinux.org/index.php/PRIME#Black_screen_with_GL-based_compositors)。Xrender ベースのウィンドウマネージャーに切り替えるか、上記のスクリプトを `/etc/profile` にだけ追加し、デスクトップ環境が提供するターミナルでハードウェアアクセラレーションが必要なプログラムを実行することをおすすめします。