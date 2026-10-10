---
title: arch update pacman-keyring
date: 2025-09-19 10:21:41
tags: ["linux"]
lang: en
slug: arch更新pacman-keyring
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

# arch update pacman-keyring

Remove or reset all the keys installed in your system by removing the /etc/pacman.d/gnupg directory (as root) and by rerunning pacman-key --init followed by pacman-key --populate to re-add the default keys.

## Default

```bash
sudo pacman -Sy archlinux-keyring
sudo pacman -Syu
```

## Alternatives

### Reset keys

```shell
sudo rm -rf /etc/pacman.d/gnupg
sudo pacman-key --init
sudo pacman-key --populate

###
rm -rf /etc/pacman.d/gnupg && pacman-key --init && pacman-key --populate && pacman-key --refresh-keys
```

### Update keys

`sudo pacman -S archlinux-keyring && sudo pacman -Syu`

`pacman-key --refresh-keys`

## Ignore keys

```bash
# /etc/pacman.conf
[option]
SigLevel = Never
```