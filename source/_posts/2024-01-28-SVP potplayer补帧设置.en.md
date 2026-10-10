---
title: SVP PotPlayer frame interpolation settings
date: 2024-01-28 23:34:49
tags: ["笔记"]
lang: en
slug: SVP potplayer补帧设置
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

# SVP+potplayer Frame Interpolation Settings

1. Add system filter "ffdshow raw video filter"
2. Filter - Global filter priority    Force use

3. Filter priority: Enable d3d11 dxva in the video built-in decoder
4. avisynth enable use script

```json
SetMemoryMax(4096)	# 内存大小
SetFilterMTMode("DEFAULT_MT_MODE", 2)	# Potplayer线程
SetFilterMTMode("FFVideoSource", 3)	# FFVideoSource滤镜线程
potplayer_source()
LoadPlugin("F:\Potplayer\AviSynth+\plugins64\mvtools2.dll")
super=MSuper(pel=1, hpad=0, vpad=0)
backward_1=MAnalyse(super, chroma=false, isb=true, blksize=16, blksizev=16, 	searchparam=3, plevel=0, search=3, badrange=(-24))	# 16*16范围取帧
forward_1=MAnalyse(super, chroma=false, isb=false, blksize=16, blksizev=16, searchparam=3, plevel=0, search=3, badrange=(-24))
backward_2 = MRecalculate(super, chroma=false, backward_1, blksize=4, blksizev=4, searchparam=0, search=3)	# 4*4范围追踪补帧
forward_2 = MRecalculate(super, chroma=false, forward_1, blksize=4, blksizev=4, searchparam=0, search=3)
MBlockFps(super, backward_2, forward_2, num=90, den=1, mode=2) # 补帧到90
Prefetch(4)
```

## Attachments

- [How to Get an Antarctic IP - Stupid Cat Blog.pdf](%E6%95%99%E4%BD%A0%E5%A6%82%E4%BD%95%E8%8E%B7%E5%BE%97%E4%B8%80%E4%B8%AA%E5%8D%97%E6%9E%81ip%20-%20%E7%AC%A8%E7%8C%AB%E5%8D%9A%E5%AE%A2.pdf)