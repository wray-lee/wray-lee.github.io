---
title: "NVIDIA Profile Inspector"
date: 2026-06-07 03:56:57
tags: ["Windows"]
---

# 驱动调优

gsync application mode 和 global mode 改成Fullscreen and Windowed

## 降低输入延时

`Maximum Pre—Rendered Frames ` 优化输入队列大小。改成`1` 无延迟输入

`Ultra Low Latency - CPL State` -> `Ultra`

`Ultra Low Latency - Enabled ` -> `On`

## 降低掉帧

`5 - Common` -> `CUDA - Force P2 State`，将其修改为 `Off`   降低调用cuda应用抢占优先级影响

`Other` -> `Ansel flags for enabled applications` 修改为 `0x00000000`  消除nvidia app截图影响

`5 - Common` -> `Power management mode` 修改为 `Prefer maximum performance` 降低省电策略影响



## 土豆画质

`Antialiasing - Transparency Supersampling` -> `0x00000008 AA_MODE_REPLAY_MODE_ALL`

`Texture filtering - LOD Bias (DX)` -> `+5.0`  lod 正数值越大材质越低

`Texture filtering - Quality` -> `High Performance`  阻止材质自动修复





```bash
# dxvk
d3d9.samplerLodBias = 5.0
d3d9.samplerAnisotropy = 0
```