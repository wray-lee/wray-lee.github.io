---
title: Machine Learning
date: 2026-01-05 21:27:13
tags: ["笔记"]
lang: en
slug: Machine Learning
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

# Machine Learning

## Learning

- Supervised learning: learning by example, with correct answers in the training set
- Unsupervised learning: only the objective is given, with only rough, reasonable answers within a broad range
    - Self-Supervised Learning: quantizing predictable small content, learning by labeling itself
- Reinforcement learning: fitting across multiple dimensions, including the two types of learning plus a temporal dimension (delayed feedback), often involving content that cannot be quantified



Emergence: unexpected, previously undiscovered meaningful phenomena that appear in training results

## Transformer

- **Heads:** Split the matrix, each part is called a head, each head contains a set of qkv, different heads process different parts (syntax, sentiment, etc.), and the focus direction of each head adapts through the loss curve

    - **Q(query):** the user's input

    - **K(key):** possible output content related to the user input

    - **V(Value):** the output content

    $$
    Attention = \text{softmax}(\frac{Q \cdot K^T}{\sqrt{d}})V
    $$

    

    $\frac{Q \cdot K^T}{\sqrt{d}}$ is used to generate the probability distribution of the query, and output through V

    During training, the entire matrix is multiplied, ultimately producing the trained $W_Q, W_K, W_V$ 

    

### Improvements

- **CoT(Chain of thought):** the input content is split into tokens, and reasoning depth is increased by repeatedly expanding the tokens (the content in thoughts)
- **MoE(Mixture of Experts):** each Expert has a different area of expertise (the domain each W weight focuses on differs), and each input calls several relevant experts for processing (unlike heads, which are all called, experts select several to call)
- **MoR(Mixture of Recursion):** increases the number of times Experts are called, increasing reasoning depth

## Attachments

- [Teach You How to Get an Antarctic IP - Stupid Cat Blog.pdf](%E6%95%99%E4%BD%A0%E5%A6%82%E4%BD%95%E8%8E%B7%E5%BE%97%E4%B8%80%E4%B8%AA%E5%8D%97%E6%9E%81ip%20-%20%E7%AC%A8%E7%8C%AB%E5%8D%9A%E5%AE%A2.pdf)