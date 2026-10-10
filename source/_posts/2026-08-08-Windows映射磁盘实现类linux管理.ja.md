---
title: WindowsマップドディスクでLinuxライクな管理を実現
date: 2026-08-08 19:12:39
tags: ["Windows"]
lang: ja
slug: Windows映射磁盘实现类linux管理
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

# Windows マップド ドライブで Linux 風管理を実現

## レジストリ subst+link

```powershell
reg add "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run" /t REG_SZ /v "MapFolder1" /d "subst D: C:\\your_folder1" /f
New-Item -ItemType Junction -Path "{destination}" -Target "{origin}"
```

### 最終実施案：SYSTEM アカウントでグローバル マッピングを実行

### レジストリ実行

> Windows のカーネル（Session Manager）は起動時に、実際に SYSTEM として特定のレジストリ パスを読み取り、ドライブをロードします。これが以前に触れた **DOS Devices** です。

```powershell
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\DOS Devices" /v "D:" /t REG_SZ /d "\??\C:\your_folder" /f
```

- **/v の値にはコロンが必要**：必ず `D:` で、`D` ではいけません。

- **/d のデータにはカーネル エスケープ プレフィックスが必要**：必ず `\??\C:\your_folder` です。ここでの `\??\` は、Windows オブジェクト マネージャーに、これが直接のローカル ファイル システム解決要求であることを伝えます。



変更後は ACL 設定を忘れずに行い、ときどき発生する権限問題を防いでください。

`icacls "C:\Tools" /grant:r "$($env:USERNAME):(OI)(CI)F" /T /C`



### 手動

「タスク スケジューラ」を利用して、システムが起動時またはユーザー ログイン時に `SYSTEM` として `subst` をサイレント実行するようにする必要があります。

#### 手順：

1. **残留のクリーンアップ**：まずすべてのターミナルで `subst D: /D` を実行し、以前テストしたレジストリ マッピングと SMB マッピングを削除して、D ドライブが完全に解放されるようにします。
2. **タスク スケジューラを開く**：`Win + R` を押して `taskschd.msc` を入力し、Enter を押します。
3. **コア タスクを作成**：右側の操作バーで **「タスクの作成...」** をクリックします（「基本タスクの作成」ではないことに注意）。
4. **【全般】タブを構成**：
   - 名前：任意で入力、たとえば `Global_Subst_D`
   - セキュリティ オプション：**「ユーザーまたはグループの変更」** をクリック -> `SYSTEM` を入力 -> 「名前の確認」をクリック（`NT AUTHORITY\SYSTEM` に変わります）-> OK。
   - 下部の **「最上位の特権で実行する」** にチェックを入れます。
5. **【トリガー】タブを構成**：
   - 「新規」をクリック。
   - タスクの開始：**「ログオン時」** を選択。
   - 設定：**「任意のユーザー」** を選択。
   - OK をクリック。
6. **【操作】タブを構成（重要）**：
   - 「新規」をクリック。
   - 操作：**「プログラムの開始」** を選択。
   - プログラムまたはスクリプト：`cmd.exe` を入力
   - 引数の追加：`/c subst D: C:\cuda` を入力 *(C:\cuda を実際の深いディレクトリ パスに置き換えてください)*
   - OK をクリック。
7. **【条件】タブを構成**：
   - **チェックを外す** 「コンピューターが AC 電源を使用している場合にのみ、このタスクを開始する」（ノート PC がバッテリ使用時に無効になるのを防ぐ）。
8. **保存してすぐに有効化**：
   - 「OK」をクリックしてタスクを保存。
   - タスク一覧で先ほど作成した `Global_Subst_D` を見つけ、右クリックして **「実行」** を選択。

## 添付ファイル

- [bitlocker.zip](bitlocker.zip)
- [CCleaner_6.38.11537_Portable.7z](CCleaner_6.38.11537_Portable.7z)
- [color.7z](color.7z)
- [nfcTools(PCR532).7z](nfcTools(PCR532).7z)
- [WinX.zip](WinX.zip)
- [モニターの色設定.7z](%E6%98%BE%E7%A4%BA%E5%99%A8%E9%A2%9C%E8%89%B2%E9%85%8D%E7%BD%AE.7z)