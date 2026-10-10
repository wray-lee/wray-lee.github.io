---
title: Windows mapped drives implement Linux-like management
date: 2026-08-08 19:12:39
tags: ["Windows"]
lang: en
slug: Windows映射磁盘实现类linux管理
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

# Windows Mapped Drives to Achieve Linux-like Management

## Registry subst+link

```powershell
reg add "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run" /t REG_SZ /v "MapFolder1" /d "subst D: C:\\your_folder1" /f
New-Item -ItemType Junction -Path "{destination}" -Target "{origin}"
```








### Ultimate Implementation Plan: Perform Global Mapping via the SYSTEM Account

### Registry Execution

> Windows' kernel (Session Manager), at boot time, does read a specific registry path as SYSTEM to load drives. This is the **DOS Devices** we mentioned earlier.

```powershell
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\DOS Devices" /v "D:" /t REG_SZ /d "\??\C:\your_folder" /f
```

- **The /v value must include a colon**: it must be `D:`, not `D`.

- **The /d data must include the kernel escape prefix**: it must be `\??\C:\your_folder`. Here, `\??\` tells the Windows Object Manager that this is a direct local file system parse request.



After modification, remember to configure ACLs to avoid occasional permission issues.

`icacls "C:\Tools" /grant:r "$($env:USERNAME):(OI)(CI)F" /T /C`



### Manual

We need to use "Task Scheduler" to have the system, at startup or user logon, use the identity of `SYSTEM` to silently execute `subst`.

#### Steps:

1. **Clean up remnants**: First, execute `subst D: /D` in all terminals, and delete the previously tested registry mappings and SMB mappings to ensure the D drive is completely freed.
2. **Open Task Scheduler**: Press `Win + R`, type `taskschd.msc`, and press Enter.
3. **Create the core task**: In the right-hand Actions pane, click **"Create Task..."** (note: not "Create Basic Task").
4. **Configure the [General] tab**:
   - Name: enter any name, for example `Global_Subst_D`
   - Security options: click **"Change User or Group"** -> enter `SYSTEM` -> click "Check Names" (it will become `NT AUTHORITY\SYSTEM`) -> OK.
   - Check **"Run with highest privileges"** at the bottom.
5. **Configure the [Triggers] tab**:
   - Click "New...".
   - Begin the task: select **"At log on"**.
   - Settings: select **"Any user"**.
   - Click OK.
6. **Configure the [Actions] tab (key)**:
   - Click "New...".
   - Action: select **"Start a program"**.
   - Program/script: enter `cmd.exe`
   - Add arguments: enter `/c subst D: C:\cuda` *(replace C:\cuda with your actual deep directory path)*
   - Click OK.
7. **Configure the [Conditions] tab**:
   - **Uncheck** "Start the task only if the computer is on AC power" (to prevent it from failing when a laptop is on battery).
8. **Save and apply immediately**:
   - Click "OK" to save the task.
   - In the task list, find the `Global_Subst_D` you just created, right-click it, and select **"Run"**.

## Attachments

- [bitlocker.zip](bitlocker.zip)
- [CCleaner_6.38.11537_Portable.7z](CCleaner_6.38.11537_Portable.7z)
- [color.7z](color.7z)
- [nfcTools(PCR532).7z](nfcTools(PCR532).7z)
- [WinX.zip](WinX.zip)
- [Display Color Configuration.7z](%E6%98%BE%E7%A4%BA%E5%99%A8%E9%A2%9C%E8%89%B2%E9%85%8D%E7%BD%AE.7z)