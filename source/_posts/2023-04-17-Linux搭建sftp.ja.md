---
title: Linuxでsftpを構築
date: 2023-04-17 13:52:51
tags: ["linux"]
lang: ja
slug: Linux搭建sftp
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

# Linuxでsftpを構築

sshd_config を設定

    vi /etc/ssh/sshd_config

以下の内容を変更し、保存して終了

    #この行をコメントアウト
    #Subsystem sftp /usr/libexec/openssh/sftp-server
    この行を追加：
    Subsystem sftp internal-sftp 

---



1、ユーザー sftpuser を作成し、ssh ログインを禁止し、ホームディレクトリを作成しない

    useradd -s /sbin/nologin -M sftpuser

2、ユーザーパスワードを設定

    passwd sftpuser

3、sftp ルートディレクトリを作成する。すべての sftp ユーザーはこのディレクトリ配下で操作します。（今後新しいユーザーを追加しない場合は、このディレクトリをスキップできます）

    mkdir /sftp

4、ディレクトリ権限を設定する。ディレクトリ権限の設定には 2 つの要点があります：

   そのディレクトリからシステムルートディレクトリまでの上位すべてのディレクトリの所有者は root のみでなければなりません
   そのディレクトリからシステムルートディレクトリまでの上位すべてのディレクトリは、グループ書き込み権限を持ってはなりません

   chown root:root /sftp
   chmod 755 /sftp   注：このディレクトリの権限は最大 755 です。777 に設定するとエラーになります。これは私が悩んだ点の一つでもあります。

5、ユーザー sftpuser のルートディレクトリを作成する。ディレクトリ名はユーザー名とする

    cd /sftp
    mkdir sftpuser

6、sftpuser ディレクトリの権限を設定

    chown root:sftpuser /sftp/sftpuser
    （注：ユーザー sftpuser を設定する場合、所有者を root に設定すると、その sftpuser ディレクトリには読み書き権限がないことを意味します。そのディレクトリ配下に他のディレクトリを作成し、sftpuser ユーザーに読み書き権限を付与します；
      そのディレクトリに読み書き権限が必要な場合は、権限を設定します：chown sftpuser:sftpuser /home/sftp/sftpuser）
    chmod 755 /sftp/sftpuser  注：ここでの sftpuser ディレクトリの権限も 755 のみ可能です。そうでなければディレクトリを制限できません。

7、sshd_config を設定

    vi /etc/ssh/sshd_config

8、以下の内容を変更し、保存して終了

    #この行をコメントアウト
    #Subsystem sftp /usr/libexec/openssh/sftp-server
    この行を追加：
    Subsystem sftp internal-sftp #sftp サービスでシステム標準の internal-sftp を使用するよう指定します。これを追加しないと、ユーザーは sftp でログインできません。
    #設定ファイルの末尾に追加
    Match User sftpuser#ユーザーをマッチします。複数のグループをマッチする場合は、グループ間をカンマで区切ります
    ChrootDirectory /sftp/%u #chroot で指定ユーザーのルートディレクトリを設定します。chroot の意味：http://www.ibm.com/developerworks/cn/linux/l-cn-chroot/；
       #ここでの %u はアカウント名を指します。/home/sftp/%u の意味は：/sftp/sftpuser
    ForceCommand internal-sftp #sftp コマンドを指定
    X11Forwarding no #この 2 行は、そのユーザーにポート転送を使用させたくない場合に追加し、そうでなければ削除します
    AllowTcpForwarding no

 9、sshd サーバーを再起動

    systemctl restart sshd.service
    #sshd の起動状態を確認するコマンド：
    systemctl status sshd.service

10、sftpuser ユーザーのログインテスト：

    sftp -oPort=22 sftpuser@127.0.0.1

これで、sftp ユーザーの作成、権限の変更、ルートディレクトリの制限が完了しました。