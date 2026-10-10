---
title: Disable hibernation in Linux (gnome)
date: 2024-01-29 03:32:02
tags: ["linux"]
lang: en
slug: Linux关闭休眠（gnome）
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

# Disable Hibernation in Linux (GNOME)

`systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target`



```bash
sudo -u gdm dbus-run-session gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-battery-type  nothing
sudo -u gdm dbus-run-session gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-type  nothing
sudo -u gdm dbus-run-session gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-timeout 0
gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-timeout '0' && gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-battery-timeout '0' && gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-type  nothing && gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-battery-type  nothing
systemctl reboot
```





## Check

`sudo -u gdm dbus-run-session gsettings list-recursively org.gnome.settings-daemon.plugins.power | grep sleep`

`gsettings get org.gnome.settings-daemon.plugins.power sleep-inactive-ac-timeout && gsettings get org.gnome.settings-daemon.plugins.power sleep-inactive-ac-type`