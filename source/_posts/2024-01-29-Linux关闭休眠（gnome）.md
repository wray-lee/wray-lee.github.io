---
title: "Linux关闭休眠（gnome）"
date: 2024-01-29 03:32:02
tags: ["linux"]
---

# Linux关闭休眠（gnome）

`systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target`



```bash
sudo -u gdm dbus-run-session gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-battery-type  nothing
sudo -u gdm dbus-run-session gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-type  nothing
sudo -u gdm dbus-run-session gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-timeout 0
gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-timeout '0' && gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-battery-timeout '0' && gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-type  nothing && gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-battery-type  nothing
systemctl reboot
```





## 查询

`sudo -u gdm dbus-run-session gsettings list-recursively org.gnome.settings-daemon.plugins.power | grep sleep`

`gsettings get org.gnome.settings-daemon.plugins.power sleep-inactive-ac-timeout && gsettings get org.gnome.settings-daemon.plugins.power sleep-inactive-ac-type`