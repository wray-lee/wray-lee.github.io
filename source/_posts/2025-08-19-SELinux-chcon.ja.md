---
title: SELinux-chcon
date: 2025-08-19 14:02:02
tags: ["linux"]
lang: ja
slug: SELinux-chcon
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

ユニットの有効化に失敗しました: ユニットファイル slurmctld.service が存在しません。

## 一時

```bash
ls -Z /etc/systemd/system/my_app.service
#sudo chcon system_u:object_r:systemd_unit_file_t:s0 /etc/systemd/system/my_app.service
sudo chcon -t systemd_unit_file_t /etc/systemd/system/my_app.service
```

## 永続

```bash
#sudo semanage fcontext -a system_u:object_r:systemd_unit_file_t:s0 /etc/systemd/system/my_app.service
sudo semanage fcontext -a -t systemd_unit_file_t /etc/systemd/system/my_app.service
sudo restorecon -v /etc/systemd/system/my_app.service
```