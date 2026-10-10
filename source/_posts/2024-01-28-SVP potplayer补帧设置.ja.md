---
title: SVP PotPlayer フレーム補間設定
date: 2024-01-28 23:34:49
tags: ["笔记"]
lang: ja
slug: SVP potplayer补帧设置
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

# SVP+potplayerフレーム補間設定

1. システムフィルター「ffdshow raw video filter」を追加
2. フィルター - グローバルフィルター優先度    強制使用

3. フィルター優先度 映像内蔵デコーダーでd3d11 dxvaを有効にする
4. avisynthでスクリプトの使用を有効にする

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

## 添付ファイル

- [南極IPを取得する方法を教える - 笨猫博客.pdf](%E6%95%99%E4%BD%A0%E5%A6%82%E4%BD%95%E8%8E%B7%E5%BE%97%E4%B8%80%E4%B8%AA%E5%8D%97%E6%9E%81ip%20-%20%E7%AC%A8%E7%8C%AB%E5%8D%9A%E5%AE%A2.pdf)