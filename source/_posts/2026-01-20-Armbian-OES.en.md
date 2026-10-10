---
title: Armbian-OES
date: 2026-01-20 12:27:31
tags: ["linux"]
lang: en
slug: Armbian-OES
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

# Armbian-OES

## System Installation

### emmc

>   `dd if=path-to-armbian.img of=/dev/mmcblk1 status=progress`

`armbian-install`

### sata

#### Method 1

`dd if=path-to-armbian.img of=/dev/sda1 status=progress`

 `cfdisk /dev/sda` Delete `/boot` 

>   After uEnv boots the system, the system fstab will scan all device mounts; mounting boot by label may cause SATA to respond first.

`mount /dev/sda2 /mnt` `vim /mnt/etc/fstab` Change the UUID mounted by systemd to the SATA UUID.

Change the UUID of `/boot/uEnv.txt`  to the SATA UUID.

**Fill up the SATA space**

```bash
reboot
parted /dev/sda resizepart 2 100%
resize2fs /dev/sda2
reboot
```

#### Method 2

**Do not waste space; run after the system boots from emmc**

```bash
cfdisk /dev/sda
mkfs.btrfs /dev/sda1
mount /dev/sda1 /mnt
# 排除虚拟目录和当前挂载点
rsync -avx --progress --exclude={'/proc','/sys','/dev','/run','/boot','/mnt','/media','/tmp'} / /mnt/
mkdir -p /mnt/{proc,sys,dev,run,boot,mnt,media,tmp}
chmod 1777 /mnt/tmp
```

`mount /dev/sda1 /mnt` `vim /mnt/etc/fstab` Change the UUID mounted by systemd to the SATA UUID.

Change the UUID of `/boot/uEnv.txt`  to the SATA UUID.

## Boot

ARM Linux will first mount the boot application `dtb` and `uEnv.txt`, then determine the system disk location, and then map/mount the entire system directory through `/etc/fstab` under the system.

```bash
# /boot/uEnv.txt
LINUX=/zImage
INITRD=/uInitrd
FDT=/dtb/amlogic/meson-g12b-a311d-oes-00050000.dtb # 这里是dtb, meson-g12b-a311d-oes-00050000.dtb 避免网络丢包与不稳定
# 下面UUID为系统盘 / 挂载的设备，如果将系统装入外置硬盘，则需要更改uuid为外置硬盘的uuid
# ** armbian-update 依赖一致的/ /boot 挂载设备，如果需要更新，则需要在先更改uEnv中的uuid设备为emmc，重启，更新， 挂载sata, chroot到sata系统再执行一次更新， 退出chroot改回uEnv **
APPEND=root=UUID=ee23f37e-7972-4267-8c8c-3d003ad91903 rootflags=compress=zstd:6 rootfstype=btrfs console=ttyAML0,115200n8 console=tty0 no_console_suspend consoleblank=0 coherent_pool=2M libata.force=noncq ubootpart= fsck.fix=yes fsck.repair=yes net.ifnames=0 max_loop=128 cgroup_enable=cpuset cgroup_memory=1 cgroup_enable=memory swapaccount=1
```



Working version

```bash
LINUX=/zImage
INITRD=/uInitrd
FDT=/dtb/amlogic/meson-g12b-a311d-oes-00050000.dtb
# sata
APPEND=root=UUID=ee23f37e-7972-4267-8c8c-3d003ad91903 rootflags=compress=zstd:6 rootfstype=btrfs console=ttyAML0,115200n8 console=tty0 no_console_suspend consoleblank=0 coherent_pool=2M libata.force=noncq ubootpart= fsck.fix=yes fsck.repair=yes net.ifnames=0 max_loop=128 cgroup_enable=cpuset cgroup_memory=1 cgroup_enable=memory swapaccount=1

# emmc
#APPEND=root=UUID=17d936bc-2338-4942-8221-9e529306c246 rootflags=compress=zstd:6 rootfstype=btrfs console=ttyAML0,115200n8 console=tty0 no_console_suspend consoleblank=0 coherent_pool=2M libata.force=noncq ubootpart= fsck.fix=yes fsck.repair=yes net.ifnames=0 max_loop=128 cgroup_enable=cpuset cgroup_memory=1 cgroup_enable=memory swapaccount=1
```



## Update

```bash
# 改uEnv为emmc后
armbian-update

mount /dev/sda1 /mnt/s
mount -t proc /proc /mnt/s/proc
mount -t sysfs /sys /mnt/s/sys
mount --bind /dev /mnt/s/dev
mount --bind /dev/pts /mnt/s/dev/pts


chroot /mnt/s

armbian-update

exit

# 改回uEnv
```