---
title: "SELinux-chcon"
date: 2025-08-19 14:02:02
tags: ["linux"]
---

Failed to enable unit: Unit file slurmctld.service does not exist.

## temp

```bash
ls -Z /etc/systemd/system/my_app.service
#sudo chcon system_u:object_r:systemd_unit_file_t:s0 /etc/systemd/system/my_app.service
sudo chcon -t systemd_unit_file_t /etc/systemd/system/my_app.service
```

## permenant

```bash
#sudo semanage fcontext -a system_u:object_r:systemd_unit_file_t:s0 /etc/systemd/system/my_app.service
sudo semanage fcontext -a -t systemd_unit_file_t /etc/systemd/system/my_app.service
sudo restorecon -v /etc/systemd/system/my_app.service
```