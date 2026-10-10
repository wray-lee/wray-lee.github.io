---
title: Linuxでsftpを構築する
date: 2023-04-17 13:52:51
tags: ["linux"]
lang: ja
slug: Linux搭建sftp
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

# Linuxでsftpを構築する

sshd_configを設定する

    vi /etc/ssh/sshd_config

以下の内容を変更し、保存して終了する

    \#この行をコメントアウト
    \#Subsystem sftp /usr/libexec/openssh/sftp-server
    この行を追加：
    Subsystem sftp internal-sftp

---

1、ユーザー sftpuser を作成し、sshログインを禁止し、ホームディレクトリを作成しない

    useradd -s /sbin/nologin -M sftpuser

2、ユーザーパスワードを設定

    passwd sftpuser

3、sftpルートディレクトリを作成する。すべてのsftpユーザーはこのディレクトリ配下で活動する。（今後新しいユーザーを追加しない場合は、このディレクトリをスキップできる）

    mkdir /sftp

4、ディレクトリ権限を設定する。ディレクトリ権限の設定には2つの要点がある：

   そのディレクトリから上位のシステムルートディレクトリまでのディレクトリ所有者はすべてrootのみでなければならない

   そのディレクトリから上位のシステムルートディレクトリまでの間で、グループ書き込み権限を持ってはならない

   chown root:root /sftp

   chmod 755 /sftp   注：このディレクトリの権限は最大755。777に設定するとエラーになる。これも私が悩まされた点である。

5、ユーザーsftpuserのルートディレクトリを作成する。ディレクトリ名はユーザー名

    cd /sftp
    mkdir sftpuser

6、sftpuserディレクトリの権限を設定

    chown root:sftpuser /sftp/sftpuser
    （注：ユーザーsftpuserを設定する。所有者をrootに設定した場合、そのディレクトリsftpuserには読み書き権限がないことを示す。そのディレクトリ下に他のディレクトリを作成し、sftpuserユーザーに読み書き権限を付与する；
      そのディレクトリに読み書き権限が必要な場合は、権限を設定：chown sftpuser:sftpuser /home/sftp/sftpuser）
    chmod 755 /sftp/sftpuser  注：ここでのディレクトリsftpuserの権限も755のみ可能。そうでなければディレクトリを制限できない。

7、sshd_configを設定

    vi /etc/ssh/sshd_config

8、以下の内容を変更し、保存して終了

    \#この行をコメントアウト
    \#Subsystem sftp /usr/libexec/openssh/sftp-server
    この行を追加：
    Subsystem sftp internal-sftp #sftpサービスがシステム標準のinternal-sftpを使用するよう指定する。追加しない場合、ユーザーはsftpでログインできない。
    \#設定ファイルの末尾に追加
    Match User sftpuser#ユーザーをマッチする。複数のグループをマッチする場合、複数のグループはカンマで区切る
    ChrootDirectory /sftp/%u #chrootで指定ユーザーのルートディレクトリを設定する。chrootの意味：http://www.ibm.com/developerworks/cn/linux/l-cn-chroot/；
       \#ここでの%uはアカウント名を指す。/home/sftp/%u の意味は：/sftp/sftpuser
    ForceCommand internal-sftp #sftpコマンドを指定
    X11Forwarding no #この2行は、そのユーザーにポート転送を使用させたくない場合に追加し、そうでなければ削除する
    AllowTcpForwarding no

 9、sshdサーバーを再起動

    systemctl restart sshd.service
    \#sshd起動状態を確認するコマンド：
    systemctl status sshd.service

10、sftpuserユーザーのログインテスト：

    sftp -oPort=22 sftpuser@127.0.0.1

以上でsftpユーザーの作成、権限変更、ルートディレクトリ制限が完了した。