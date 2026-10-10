---
title: "Windows映射磁盘实现类linux管理"
date: 2026-08-08 19:12:39
tags: ["Windows"]
---

# Windows映射磁盘实现类linux管理

## 注册表subst+link

```powershell
reg add "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run" /t REG_SZ /v "MapFolder1" /d "subst D: C:\\your_folder1" /f
New-Item -ItemType Junction -Path "{destination}" -Target "{origin}"
```







### 终极实施方案：通过 SYSTEM 账户执行全局映射

### 注册表执行

> Windows 的内核（Session Manager）在开机时，确实会以 SYSTEM 身份读取一个特定的注册表路径来加载驱动器。这就是我们之前提到过的 **DOS Devices**。

```powershell
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\DOS Devices" /v "D:" /t REG_SZ /d "\??\C:\your_folder" /f
```

- **/v 的值必须带冒号**：必须是 `D:`，不能是 `D`。

- **/d 的数据必须带内核转义前缀**：必须是 `\??\C:\your_folder`。这里的 `\??\` 是告诉 Windows 对象管理器这是一个直接的本地文件系统解析请求



修改后记得进行acl配置，以免有时候出现权限问题

`icacls "C:\Tools" /grant:r "$($env:USERNAME):(OI)(CI)F" /T /C`



### 手动

我们需要利用“任务计划程序”，让系统在开机或用户登录时，以 `SYSTEM` 的身份静默执行 `subst`。

#### 步骤说明：

1. **清理残留**：先在所有终端里执行 `subst D: /D`，并删掉之前测试的注册表映射和 SMB 映射，确保 D 盘被彻底释放。
2. **打开任务计划程序**： 按 `Win + R` 输入 `taskschd.msc` 回车。
3. **创建核心任务**： 在右侧操作栏点击 **“创建任务...”**（注意不是“创建基本任务”）。
4. **配置【常规】选项卡**：
   - 名称：随便填，比如 `Global_Subst_D`
   - 安全选项：点击 **“更改用户或组”** -> 输入 `SYSTEM` -> 点击“检查名称”（会变成 `NT AUTHORITY\SYSTEM`）-> 确定。
   - 勾选底部的 **“使用最高权限运行”**。
5. **配置【触发器】选项卡**：
   - 点击“新建”。
   - 开始任务：选择 **“登录时”**。
   - 设置：选择 **“任何用户”**。
   - 点击确定。
6. **配置【操作】选项卡（关键）**：
   - 点击“新建”。
   - 操作：选择 **“启动程序”**。
   - 程序或脚本：输入 `cmd.exe`
   - 添加参数：输入 `/c subst D: C:\cuda` *(将 C:\cuda 替换为你真实的深层目录路径)*
   - 点击确定。
7. **配置【条件】选项卡**：
   - **取消勾选** “只有在计算机使用交流电源时才启动此任务”（防止笔记本用电池时失效）。
8. **保存并立即生效**：
   - 点击“确定”保存任务。
   - 在任务列表中找到你刚建好的 `Global_Subst_D`，右键点击它，选择 **“运行”**。

## 附件

- [bitlocker.zip](bitlocker.zip)
- [CCleaner_6.38.11537_Portable.7z](CCleaner_6.38.11537_Portable.7z)
- [color.7z](color.7z)
- [nfcTools(PCR532).7z](nfcTools(PCR532).7z)
- [WinX.zip](WinX.zip)
- [显示器颜色配置.7z](%E6%98%BE%E7%A4%BA%E5%99%A8%E9%A2%9C%E8%89%B2%E9%85%8D%E7%BD%AE.7z)
