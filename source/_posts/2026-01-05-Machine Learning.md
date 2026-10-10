---
title: "Machine Learning"
date: 2026-01-05 21:27:13
tags: ["笔记"]
---

# Machine Learning

## 学习

- 有监督学习(supervised learning)：照着学，有训练集的正确答案
- 无监督学习(unsupervised learning) ：只给予目的，只有粗略范围的合理答案
    - 自监督学习（Self-Supervised Learning）：可预见的小内容量化，通过自己打标签学习
- 强化学习(reinforcement learning): 多维度两种学习再包含时间维度（延迟反馈）的拟合，往往是没办法量化的内容



涌现：在训练结果中所出现的意料之外，未发现过的有意义的现象

## Transformer

- **Heads:** 对矩阵进行分割，每一部分叫做一个head，每一个heads包含一组qkv，不同heads进行不同部分的处理（语法，情感等），每个heads的专注方向通过loss curve来自适应

    - **Q(query):** 用户的输入

    - **K(key):** 根据用户输入相关的可能输出内容

    - **V(Value):** 输出的内容

    $$
    Attention = \text{softmax}(\frac{Q \cdot K^T}{\sqrt{d}})V
    $$

    

    $\frac{Q \cdot K^T}{\sqrt{d}}$ 用于生成查询的概率分布，通过V输出

    训练时候是整个矩阵相乘，最终的到训练好的$W_Q, W_K, W_V$ 

    

### 改进

- **CoT(Chain of thought):** 输入的内容会分割成token，会通过反复对token进行拓展（thoughts 中的内容），增加推理深度
- **MoE(Mixture of Experts):** 每一个Expert都有不同的擅长领域（W权重面向的领域不同），每次输入调用若干个相关expert进行处理（与heads不同在于heads是全部调用，experts是选取若干个调用）
- **MoR(Mixture of Recursion):** 增加Expert的调用次数，增加推理深度

## 附件

- [教你如何获得一个南极ip - 笨猫博客.pdf](%E6%95%99%E4%BD%A0%E5%A6%82%E4%BD%95%E8%8E%B7%E5%BE%97%E4%B8%80%E4%B8%AA%E5%8D%97%E6%9E%81ip%20-%20%E7%AC%A8%E7%8C%AB%E5%8D%9A%E5%AE%A2.pdf)
