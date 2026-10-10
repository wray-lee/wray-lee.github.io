---
title: Powershell oh-my-posh conda 起動が遅い場合の最適化
date: 2023-02-06 21:25:26
tags: ["Windows"]
lang: ja
slug: Powershell oh-my-posh conda 启动慢优化
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

# Powershell oh-my-posh+conda 起動遅延の最適化

conda をインストールしている場合、conda init powershell した後は、おそらく起動時間が1秒ほど遅くなります。PowerShell の`$profile` と同じディレクトリにある `profile.ps1` 内で、conda を起動する記述をコメントアウトし、その後自分で alias を設定して、conda を使うときに手動でアクティベートできます。

## 添付ファイル

- [Group3.7z](Group3.7z)