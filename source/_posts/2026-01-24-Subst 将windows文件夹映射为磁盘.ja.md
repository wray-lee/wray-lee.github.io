---
title: Subst で Windows フォルダーをドライブに割り当てる
date: 2026-01-24 17:30:39
tags: ["Windows"]
lang: ja
slug: Subst 将windows文件夹映射为磁盘
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

# `Subst` Windows フォルダーをドライブにマッピングする

これは DOS 時代の遺産ですが、今日でも Windows で**「長いパスのフォルダー」を「短いドライブ文字」にマッピングする**ための、最速かつ最もネイティブな方法です。

あなたが構築したい「Linux ライク」な環境にとって、これは強力なツールです。たとえば `C:\dev` を直接 `X:` ドライブにマッピングできます。そうすれば、コードパスは `C:\dev\MyProject` ではなく `X:\MyProject` になります。

### 1. 基本的な使い方（一時的に有効）

CMD または PowerShell を開き（管理者権限は不要）、次を入力します：

PowerShell

```
# 语法：subst [盘符] [目标文件夹路径]
subst X: C:\dev
```

**効果：**

- 「マイ コンピューター」に瞬時に **X: ドライブ** が追加されます。
- 中身は `C:\dev` の内容です。
- **双方向同期：** X ドライブでファイルを変更すると、`C:\dev` 側でも変わります。同じ物理的な場所を指しているからです。

**マッピングを削除：**

PowerShell

```
subst X: /d
```

### 2. なぜこれがあなたの開発シナリオに適しているのか？

これはあなたの **Unreal Engine C++** と **Android リバースエンジニアリング** の作業にとって非常に重要です：

1. **「パスが長すぎる」 (Path too long) 問題を解決：**

    UE のコンパイル時、ファイルパスが 260 文字を超えるとよくエラーになります。

    - 元のパス：`C:\dev\UnrealEngine\Engine\Source\ThirdParty\OpenSSL\...\include\openssl\aes.h`（非常に長い）
    - マッピング後：`X:\Engine\Source\...\aes.h`（極めて短い）

2. **Linux ルートディレクトリを模擬：**

    `C:\bin` を `B:` に、`C:\dev` を `S:`（Source）にマッピングして、心理的に物理的な隔離感を築けます。

------

### 3. 応用：どうすれば「永続的に有効」にするか（再起動しても消えない）

**`subst` コマンドの大きな落とし穴は、PC を再起動するとマッピングが消えることです。**

これを固定されたシステム構造として使いたいなら、永続化する方法が 2 つあります：

#### 方法 A：レジストリ方式（最も安定、推奨）

この方法では Windows がシステムの中核サービス起動時にドライブ文字を読み込むため、スタートアップ スクリプトより早く、より安定します。

1. レジストリ エディターを開きます（`Win + R`、`regedit` を入力）。

2. 次の場所に移動します：

    `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\DOS Devices`

3. 右側で右クリック -> **新規** -> **文字列値 (String Value)**。

4. **名前：** `X:`（希望するドライブ文字）

5. **データ：** `\??\C:\dev`（先頭の `\??\` は必須のプレフィックスであることに注意）

6. PC を再起動します。

#### 方法 B：スタートアップ スクリプト方式（最も簡単）

あなたの `C:\bin` に `mount.bat` を書きます：

コード スニペット

```
@echo off
subst X: C:\dev
subst T: C:\tools
```

その後、このファイルの**ショートカット**を Windows の「スタートアップ」フォルダーに入れます：

- `Win + R` を押す -> `shell:startup` を入力 -> ショートカットを貼り付けます。

## 添付ファイル

- [bitlocker.zip](bitlocker.zip)
- [CCleaner_6.38.11537_Portable.7z](CCleaner_6.38.11537_Portable.7z)
- [color.7z](color.7z)
- [nfcTools(PCR532).7z](nfcTools(PCR532).7z)
- [WinX.zip](WinX.zip)
- [モニターの色設定.7z](%E6%98%BE%E7%A4%BA%E5%99%A8%E9%A2%9C%E8%89%B2%E9%85%8D%E7%BD%AE.7z)