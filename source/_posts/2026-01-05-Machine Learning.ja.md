---
title: 機械学習
date: 2026-01-05 21:27:13
tags: ["笔记"]
lang: ja
slug: Machine Learning
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

# 機械学習

## 学習

- 教師あり学習(supervised learning)：手本に従って学び、訓練セットの正解がある
- 教師なし学習(unsupervised learning) ：目的だけが与えられ、粗い範囲の妥当な答えしかない
    - 自己教師あり学習（Self-Supervised Learning）：予見可能な小さな内容を定量化し、自分でラベル付けして学習する
- 強化学習(reinforcement learning): 多次元における2種類の学習にさらに時間次元（遅延フィードバック）を含めたフィッティングであり、しばしば定量化できない内容である



創発：訓練結果の中に現れる、予想外で、これまで発見されなかった意味のある現象

## Transformer

- **Heads:** 行列を分割し、各部分を1つのheadと呼ぶ。各headsは1組のqkvを含み、異なるheadsは異なる部分（文法、感情など）を処理する。各headsの注力方向はloss curveによって適応する

    - **Q(query):** ユーザーの入力

    - **K(key):** ユーザー入力に関連する可能性のある出力内容

    - **V(Value):** 出力内容

    $$
    Attention = \text{softmax}(\frac{Q \cdot K^T}{\sqrt{d}})V
    $$

    

    $\frac{Q \cdot K^T}{\sqrt{d}}$ はクエリの確率分布を生成するために用いられ、Vを通して出力される

    訓練時は行列全体を掛け合わせ、最終的に訓練済みの$W_Q, W_K, W_V$ を得る

    

### 改良

- **CoT(Chain of thought):** 入力内容はtokenに分割され、tokenを繰り返し拡張すること（thoughts内の内容）によって推論の深さを増す
- **MoE(Mixture of Experts):** 各Expertは異なる得意分野を持つ（W重みが対象とする領域が異なる）。入力ごとに関連するexpertをいくつか呼び出して処理する（headsとの違いは、headsは全部呼び出し、expertsはいくつかを選んで呼び出すことである）
- **MoR(Mixture of Recursion):** Expertの呼び出し回数を増やし、推論の深さを増す

## 添付

- [南極IPを取得する方法を教える - 笨猫ブログ.pdf](%E6%95%99%E4%BD%A0%E5%A6%82%E4%BD%95%E8%8E%B7%E5%BE%97%E4%B8%80%E4%B8%AA%E5%8D%97%E6%9E%81ip%20-%20%E7%AC%A8%E7%8C%AB%E5%8D%9A%E5%AE%A2.pdf)