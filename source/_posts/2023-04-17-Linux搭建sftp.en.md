---
title: Setting Up SFTP on Linux
date: 2023-04-17 13:52:51
tags: ["linux"]
lang: en
slug: Linux搭建sftp
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

# Setting up SFTP on Linux

Configure sshd_config

​    vi /etc/ssh/sshd_config

Modify the following content, then save and exit

​    \#Comment out this line

​    \#Subsystem sftp /usr/libexec/openssh/sftp-server

​    Add this line:

​    Subsystem sftp internal-sftp 

---



1. Create the user sftpuser, disable SSH login, and do not create a home directory

​    useradd -s /sbin/nologin -M sftpuser

2. Set the user password

​    passwd sftpuser

3. Create the SFTP root directory. All SFTP users will operate under this directory. (If you will not add new users in the future, you can skip this directory.)

​    mkdir /sftp

4. Set directory permissions. There are two key points for setting directory permissions:

   From the directory all the way up to the system root directory, the owner can only be root.

   From the directory all the way up to the system root directory, group write permission must not be present.

   chown root:root /sftp

   chmod 755 /sftp   Note: The maximum permission for this directory is 755. Setting it to 777 will cause an error. This is also one place that troubled me.

5. Create the root directory for the user sftpuser, with the directory name being the username

​    cd /sftp

​    mkdir sftpuser

6. Set permissions for the sftpuser directory

​    chown root:sftpuser /sftp/sftpuser

​    (Note: Set the user sftpuser. If the owner is set to root, it means that the directory sftpuser has no read/write permission. Create other directories under this directory and grant read/write permissions to the sftpuser user;

​      If you need read/write permission on this directory, set the permission: chown sftpuser:sftpuser /home/sftp/sftpuser)

​    chmod 755 /sftp/sftpuser  Note: The permission for the directory sftpuser here can also only be 755; otherwise, the directory cannot be restricted.

7. Configure sshd_config

​    vi /etc/ssh/sshd_config

8. Modify the following content, then save and exit

​    \#Comment out this line

​    \#Subsystem sftp /usr/libexec/openssh/sftp-server

​    Add this line:

​    Subsystem sftp internal-sftp #Specify that the SFTP service uses the system's built-in internal-sftp. If this is not added, users cannot log in via SFTP.

​    \#Add at the end of the configuration file

​    Match User sftpuser#Match the user. If multiple groups need to be matched, separate multiple groups with commas.

​    ChrootDirectory /sftp/%u #Use chroot to set the specified user's root directory. The meaning of chroot: http://www.ibm.com/developerworks/cn/linux/l-cn-chroot/;

​       \#Here %u refers to the account name. /home/sftp/%u means: /sftp/sftpuser

​    ForceCommand internal-sftp #Specify the SFTP command

​    X11Forwarding no #These two lines: if you do not want this user to be able to use port forwarding, add them; otherwise, delete them.

​    AllowTcpForwarding no

 9. Restart the sshd server

​    systemctl restart sshd.service

​    \#Command to check sshd startup status:

​    systemctl status sshd.service

10. sftpuser login test:

​    sftp -oPort=22 sftpuser@127.0.0.1

At this point, you have completed creating an SFTP user, modifying permissions, and restricting the root directory.