---
title: NVIDIA Profile Inspector
date: 2026-06-07 03:56:57
tags: ["Windows"]
lang: en
slug: NVIDIA Profile Inspector
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

# Driver Tuning

Change gsync application mode and global mode to Fullscreen and Windowed

## Reduce Input Latency

`Maximum Pre—Rendered Frames ` Optimize the input queue size. Change it to `1` zero-latency input

`Ultra Low Latency - CPL State` -> `Ultra`

`Ultra Low Latency - Enabled ` -> `On`

## Reduce Frame Drops

`5 - Common` -> `CUDA - Force P2 State`, change it to `Off`   Reduce the impact of CUDA application preemption priority

`Other` -> `Ansel flags for enabled applications` change to `0x00000000`  Eliminate the impact of NVIDIA app screenshots

`5 - Common` -> `Power management mode` change to `Prefer maximum performance` Reduce the impact of power-saving policies



## Potato Graphics Quality

`Antialiasing - Transparency Supersampling` -> `0x00000008 AA_MODE_REPLAY_MODE_ALL`

`Texture filtering - LOD Bias (DX)` -> `+5.0`  the larger the positive lod value, the lower the texture quality

`Texture filtering - Quality` -> `High Performance`  Prevent automatic texture repair





```bash
# dxvk
d3d9.samplerLodBias = 5.0
d3d9.samplerAnisotropy = 0
```