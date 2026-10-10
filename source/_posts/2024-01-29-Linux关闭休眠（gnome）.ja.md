---
title: Linuxでハイバネーションを無効にする（GNOME）
date: 2024-01-29 03:32:02
tags: ["linux"]
lang: ja
slug: Linux关闭休眠（gnome）
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

# Linuxでハイバネーションを無効化（gnome）

`systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target`



```bash
sudo -u gdm dbus-run-session gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-battery-type  nothing
sudo -u gdm dbus-run-session gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-type  nothing
sudo -u gdm dbus-run-session gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-timeout 0
gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-timeout '0' && gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-battery-timeout '0' && gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-type  nothing && gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-battery-type  nothing
systemctl reboot
```





## 確認

`sudo -u gdm dbus-run-session gsettings list-recursively org.gnome.settings-daemon.plugins.power | grep sleep`

`gsettings get org.gnome.settings-daemon.plugins.power sleep-inactive-ac-timeout && gsettings get org.gnome.settings-daemon.plugins.power sleep-inactive-ac-type`