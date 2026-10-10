---
title: Windows ショートカット
date: 2024-03-18 19:19:14
tags: ["Windows"]
lang: ja
slug: Windows shortcuts
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

# Windows ショートカット

## Windows 環境パス変数

| 変数                        | Windows 10 および Windows 11                                 |
| :-------------------------- | :----------------------------------------------------------- |
| %ALLUSERSPROFILE%           | C:\ProgramData                                               |
| %APPDATA%                   | C:\Users\{username}\AppData\Roaming                          |
| %COMMONPROGRAMFILES%        | C:\Program Files\Common Files                                |
| %COMMONPROGRAMFILES(x86)%   | C:\Program Files (x86)\Common Files                          |
| %CommonProgramW6432%        | C:\Program Files\Common Files                                |
| %COMSPEC%                   | C:\Windows\System32\cmd.exe                                  |
| %HOMEDRIVE%                 | C:\                                                          |
| %HOMEPATH%                  | C:\Users\{username}                                          |
| %LOCALAPPDATA%              | C:\Users\{username}\AppData\Local                            |
| %LOGONSERVER%               | \\{domain_logon_server}                                      |
| %PATH%                      | C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem      |
| %PathExt%                   | .com;.exe;.bat;.cmd;.vbs;.vbe;.js;.jse;.wsf;.wsh;.msc        |
| %PROGRAMDATA%               | C:\ProgramData                                               |
| %PROGRAMFILES%              | C:\Program Files                                             |
| %ProgramW6432%              | C:\Program Files                                             |
| %PROGRAMFILES(X86)%         | C:\Program Files (x86)                                       |
| %PROMPT%                    | $P$G                                                         |
| %SystemDrive%               | C:                                                           |
| %SystemRoot%                | C:\Windows                                                   |
| %TEMP%                      | C:\Users\{username}\AppData\Local\Temp                       |
| %TMP%                       | C:\Users\{username}\AppData\Local\Temp                       |
| %USERDOMAIN%                | 現在のユーザーに関連付けられているユーザー ドメイン。       |
| %USERDOMAIN_ROAMINGPROFILE% | ローミング プロファイルに関連付けられているユーザー ドメイン。 |
| %USERNAME%                  | {username}                                                   |
| %USERPROFILE%               | C:\Users\{username}                                          |
| %WINDIR%                    | C:\Windows                                                   |
| %PUBLIC%                    | C:\Users\Public                                              |
| %PSModulePath%              | %SystemRoot%\system32\WindowsPowerShell\v1.0\Modules\        |
| %OneDrive%                  | C:\Users\{username}\OneDrive                                 |
| %DriverData%                | C:\Windows\System32\Drivers\DriverData                       |
| %CD%                        | 現在のディレクトリ パスを出力します。(コマンド プロンプト。) |
| %CMDCMDLINE%                | 現在のコマンド プロンプト セッションを起動するために使用されたコマンド ラインを出力します。(コマンド プロンプト。) |
| %CMDEXTVERSION%             | 現在のコマンド プロセッサ拡張の数を出力します。(コマンド プロンプト。) |
| %COMPUTERNAME%              | システム名を出力します。                                     |
| %DATE%                      | 現在の日付を出力します。(コマンド プロンプト。)              |
| %TIME%                      | 時刻を出力します。(コマンド プロンプト。)                    |
| %ERRORLEVEL%                | 前のコマンドの終了ステータスを定義する番号を出力します。(コマンド プロンプト。) |
| %PROCESSOR_IDENTIFIER%      | プロセッサ識別子を出力します。                               |
| %PROCESSOR_LEVEL%           | プロセッサ レベルを出力します。                              |
| %PROCESSOR_REVISION%        | プロセッサ リビジョンを出力します。                          |
| %NUMBER_OF_PROCESSORS%      | 物理コアと仮想コアの数を出力します。                         |
| %RANDOM%                    | 0 から 32767 までの乱数を出力します。                        |
| %OS%                        | Windows_NT                                                   |

**%AppData%\Microsoft\Windows\Start Menu\Programs\Startup** - Windows 10 のプログラム ショートカット用スタートアップの場所を開きます。



言及されている変数の中には、場所に固有ではないものもあることに注意してください。たとえば `%COMPUTERNAME%`、`%PATHEXT%`、`%PROMPT%`、` %USERDOMAIN%`、`%USERNAME%` などです。

デバイスで利用可能なすべての環境変数は、`Get-ChildItem Env: | Sort Name` PowerShell コマンドを使用していつでも表示できます。

------

Win+R

## 実行コマンド

**Calc** - 電卓
**Cfgwiz32** - ISDN 構成ウィザード
**Charmap** - 文字コード表
**Chkdisk** - 破損したファイルを修復します
**Cleanmgr** - ハード ドライブをクリーンアップします
**Clipbrd** - Windows クリップボード ビューアー
**Cmd** - 新しいコマンド ウィンドウを開きます (cmd.exe)
**Control** - コントロール パネルを表示します
**Dcomcnfg** - DCOM ユーザー セキュリティ
**Debug** - アセンブリ言語プログラミング ツール
**Defrag** - デフラグ ツール
**Drwatson** - プログラムのクラッシュとスナップショットを記録します
**Dxdiag** - DirectX 診断ユーティリティ
**Explorer** - Windows エクスプローラー
**Fontview** - グラフィカル フォント ビューアー
**Ftp** - ftp.exe プログラム
**Hostname** - コンピューター名を返します
**Ipconfig** - すべてのネットワーク アダプターの IP 構成を表示します
**Jview** - Java クラス用の Microsoft コマンドライン ローダー
**MMC** - Microsoft 管理コンソール
**Msconfig** - スタートアップ ファイルを編集するための構成
**Msinfo32** - Microsoft システム情報ユーティリティ
**Nbtstat** - TCP/IP 上の NetBios を使用した統計と現在の接続を表示します
**Netstat** - すべてのアクティブなネットワーク接続を表示します
**Nslookup** - ローカル DNS サーバーを返します
**Odbcad32** - ODBC データ ソース アドミニストレーター
**Ping** - 指定したホスト/IP にデータを送信します
**Regedit** - レジストリ エディター
**Regsvr32** - DLL/OCX/ActiveX を登録/登録解除します
**Regwiz** - 登録ウィザード
**Sfc /scannow** - システム ファイル チェッカー
**Sndrec32** - サウンド レコーダー
**Sndvol32** - サウンドカードの音量コントロール
**Sysedit** - システム スタートアップ ファイル (config.sys、autoexec.bat、win.ini など) を編集します
**Systeminfo** - テキスト コンソールにさまざまなシステム情報を表示します
**Taskmgr** - タスク マネージャー
**Telnet** - Telnet プログラム
**Taskkill** - コマンド ライン インターフェイスを使用してプロセスを終了します
**Tskill** - Windows XP Home の Taskkill の縮小版
**Tracert** - インターネット ホストに到達するために必要なすべてのパスをトレースして表示します
**Winchat** - Windows ネットワーク用のシンプルなチャット プログラム
**Winipcfg** - IP 構成を表示します

### Microsoft Office スイート

**winword** - Microsoft Word
**excel** - Microsoft Excel
**powerpnt** - Microsoft PowerPoint
**msaccess** - Microsoft Access
**outlook** - Microsoft Outlook
**ois** - Microsoft Picture Manager
**winproj** - Microsoft Project

### 管理コンソール

**certmgr.msc** - 証明書マネージャー
**ciadv.msc** - インデックス サービス
**compmgmt.msc** - コンピューターの管理
**devmgmt.msc** - デバイス マネージャー
**dfrg.msc** - デフラグ
**diskmgmt.msc** - ディスクの管理
**fsmgmt.msc** - フォルダー共有の管理
**eventvwr.msc** - イベント ビューアー
**gpedit.msc** - グループ ポリシー (< XP Pro)
**iis.msc** - インターネット インフォメーション サービス
**lusrmgr.msc** - ローカル ユーザーとグループ
**mscorcfg.msc** - ネット構成
**ntmsmgr.msc** - リムーバブル ストレージ
**perfmon.msc** - パフォーマンス マネージャー
**secpol.msc** - ローカル セキュリティ ポリシー
**services.msc** - システム サービス
**wmimgmt.msc** - Windows 管理

### コントロール パネル ユーティリティ

**access.cpl** - ユーザー補助のオプション
**hdwwiz.cpl** - 新しいハードウェアの追加ウィザード
**appwiz.cpl** - プログラムの追加と削除
**timedate.cpl** - 日付と時刻のプロパティ
**desk.cpl** - 画面のプロパティ
**inetcpl.cpl** - インターネットのプロパティ
**joy.cpl** - ジョイスティックのプロパティ
**main.cpl keyboard** - キーボードのプロパティ
**main.cpl** - マウスのプロパティ
**ncpa.cpl** - ネットワーク接続
**ncpl.cpl** - ネットワークのプロパティ
**telephon.cpl** - 電話とモデムのオプション
**powercfg.cpl** - 電源管理
**intl.cpl** - 地域の設定
**mmsys.cpl sounds** - サウンドのプロパティ
**mmsys.cpl** - サウンドとオーディオ デバイスのプロパティ
**sysdm.cpl** - システムのプロパティ
**nusrmgr.cpl** - ユーザー設定
**firewall.cpl** - ファイアウォール設定 (sp2)
**wscui.cpl** - セキュリティ センター (sp2)
**Wupdmgr** - Microsoft Windows Update に移動します

元のフォーラム投稿を提供してくれた The New Tech に感謝します。

## 添付ファイル

- [bitlocker.zip](bitlocker.zip)
- [CCleaner_6.38.11537_Portable.7z](CCleaner_6.38.11537_Portable.7z)
- [color.7z](color.7z)
- [nfcTools(PCR532).7z](nfcTools(PCR532).7z)
- [WinX.zip](WinX.zip)
- [显示器颜色配置.7z](%E6%98%BE%E7%A4%BA%E5%99%A8%E9%A2%9C%E8%89%B2%E9%85%8D%E7%BD%AE.7z)