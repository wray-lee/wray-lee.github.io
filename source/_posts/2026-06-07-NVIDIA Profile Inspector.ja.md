---
title: NVIDIA Profile Inspector
date: 2026-06-07 03:56:57
tags: ["Windows"]
lang: ja
slug: NVIDIA Profile Inspector
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

# ドライバー調整

gsync application mode と global mode を Fullscreen and Windowed に変更

## 入力遅延を低減

`Maximum Pre—Rendered Frames ` 入力キューのサイズを最適化。`1` 遅延なし入力に変更

`Ultra Low Latency - CPL State` -> `Ultra`

`Ultra Low Latency - Enabled ` -> `On`

## フレーム落ちを低減

`5 - Common` -> `CUDA - Force P2 State`、これを `Off` に変更   CUDA アプリ呼び出し時のプリエンプション優先度の影響を低減

`Other` -> `Ansel flags for enabled applications` を `0x00000000` に変更  NVIDIA app のスクリーンショットの影響を排除

`5 - Common` -> `Power management mode` を `Prefer maximum performance` に変更  省電力ポリシーの影響を低減

## ポテト画質

`Antialiasing - Transparency Supersampling` -> `0x00000008 AA_MODE_REPLAY_MODE_ALL`

`Texture filtering - LOD Bias (DX)` -> `+5.0`  LOD の正の値が大きいほどマテリアルが低くなる

`Texture filtering - Quality` -> `High Performance`  マテリアルの自動修復を阻止

```bash
# dxvk
d3d9.samplerLodBias = 5.0
d3d9.samplerAnisotropy = 0
```