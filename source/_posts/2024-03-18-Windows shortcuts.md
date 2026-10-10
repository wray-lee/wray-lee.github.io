---
title: "Windows shortcuts"
date: 2024-03-18 19:19:14
tags: ["Windows"]
---

# Windows shortcuts

## Windows Environment Path Variables

| VARIABLE                    | WINDOWS 10 AND WINDOWS 11                                    |
| :-------------------------- | :----------------------------------------------------------- |
| %ALLUSERSPROFILE%           | C:\ProgramData                                               |
| %APPDATA%                   | C:\Users\{username}\AppData\Roaming                          |
| %COMMONPROGRAMFILES%        | C:\Program Files\Common Files                                |
| %COMMONPROGRAMFILES(x86)%   | C:\Program Files (x86)\Common Files                          |
| %CommonProgramW6432%        | C:\Program Files\Common Files                                |
| %COMSPEC%                   | C:\Windows\System32\cmd.exe                                  |
| %HOMEDRIVE%                 | C:\                                                          |
| %HOMEPATH%                  | C:\Users\{username}                                          |
| %LOCALAPPDATA%              | C:\Users\{username}\AppData\Local                            |
| %LOGONSERVER%               | \\{domain_logon_server}                                      |
| %PATH%                      | C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem      |
| %PathExt%                   | .com;.exe;.bat;.cmd;.vbs;.vbe;.js;.jse;.wsf;.wsh;.msc        |
| %PROGRAMDATA%               | C:\ProgramData                                               |
| %PROGRAMFILES%              | C:\Program Files                                             |
| %ProgramW6432%              | C:\Program Files                                             |
| %PROGRAMFILES(X86)%         | C:\Program Files (x86)                                       |
| %PROMPT%                    | $P$G                                                         |
| %SystemDrive%               | C:                                                           |
| %SystemRoot%                | C:\Windows                                                   |
| %TEMP%                      | C:\Users\{username}\AppData\Local\Temp                       |
| %TMP%                       | C:\Users\{username}\AppData\Local\Temp                       |
| %USERDOMAIN%                | Userdomain associated with current user.                     |
| %USERDOMAIN_ROAMINGPROFILE% | Userdomain associated with roaming profile.                  |
| %USERNAME%                  | {username}                                                   |
| %USERPROFILE%               | C:\Users\{username}                                          |
| %WINDIR%                    | C:\Windows                                                   |
| %PUBLIC%                    | C:\Users\Public                                              |
| %PSModulePath%              | %SystemRoot%\system32\WindowsPowerShell\v1.0\Modules\        |
| %OneDrive%                  | C:\Users\{username}\OneDrive                                 |
| %DriverData%                | C:\Windows\System32\Drivers\DriverData                       |
| %CD%                        | Outputs current directory path. (Command Prompt.)            |
| %CMDCMDLINE%                | Outputs command line used to launch current Command Prompt session. (Command Prompt.) |
| %CMDEXTVERSION%             | Outputs the number of current command processor extensions. (Command Prompt.) |
| %COMPUTERNAME%              | Outputs the system name.                                     |
| %DATE%                      | Outputs current date. (Command Prompt.)                      |
| %TIME%                      | Outputs time. (Command Prompt.)                              |
| %ERRORLEVEL%                | Outputs the number of defining exit status of previous command. (Command Prompt.) |
| %PROCESSOR_IDENTIFIER%      | Outputs processor identifier.                                |
| %PROCESSOR_LEVEL%           | Outputs processor level.                                     |
| %PROCESSOR_REVISION%        | Outputs processor revision.                                  |
| %NUMBER_OF_PROCESSORS%      | Outputs the number of physical and virtual cores.            |
| %RANDOM%                    | Outputs random number from 0 through 32767.                  |
| %OS%                        | Windows_NT                                                   |

**%AppData%\Microsoft\Windows\Start Menu\Programs\Startup** - Opens Windows 10 Startup location for program shortcuts



Keep in mind that some of the variables mentioned are not location-specific, including `%COMPUTERNAME%`, `%PATHEXT%`, `%PROMPT%`,` %USERDOMAIN%`, `%USERNAME%`.

You can always view all the environment variables available on your device using the `Get-ChildItem Env: | Sort Name` PowerShell command.

------

Win+R

## Run commands

**Calc** - Calculator
**Cfgwiz32** - ISDN Configuration Wizard
**Charmap** - Character Map
**Chkdisk** - Repair damaged files
**Cleanmgr** - Cleans up hard drives
**Clipbrd** - Windows Clipboard viewer
**Cmd** - Opens a new Command Window (cmd.exe)
**Control** - Displays Control Panel
**Dcomcnfg** - DCOM user security
**Debug** - Assembly language programming tool
**Defrag** - Defragmentation tool
**Drwatson** - Records programs crash & snapshots
**Dxdiag** - DirectX Diagnostic Utility
**Explorer** - Windows Explorer
**Fontview** - Graphical font viewer
**Ftp** - ftp.exe program
**Hostname** - Returns Computer's name
**Ipconfig** - Displays IP configuration for all network adapters
**Jview** - Microsoft Command-line Loader for Java classes
**MMC** - Microsoft Management Console
**Msconfig** - Configuration to edit startup files
**Msinfo32** - Microsoft System Information Utility
**Nbtstat** - Displays stats and current connections using NetBios over TCP/IP
**Netstat** - Displays all active network connections
**Nslookup** - Returns your local DNS server
**Odbcad32** - ODBC Data Source Administrator
**Ping** - Sends data to a specified host/IP
**Regedit** - registry Editor
**Regsvr32** - register/de-register DLL/OCX/ActiveX
**Regwiz** - Registration wizard
**Sfc /scannow** - System File Checker
**Sndrec32** - Sound Recorder
**Sndvol32** - Volume control for soundcard
**Sysedit** - Edit system startup files (config.sys, autoexec.bat, win.ini, etc.)
**Systeminfo** - display various system information in text console
**Taskmgr** - Task manager
**Telnet** - Telnet program
**Taskkill** - kill processes using command line interface
**Tskill** - reduced version of Taskkill from Windows XP Home
**Tracert** - Traces and displays all paths required to reach an internet host
**Winchat** - simple chat program for Windows networks
**Winipcfg** - Displays IP configuration

### Microsoft Office suite

**winword** - Microsoft Word
**excel** - Microsoft Excel
**powerpnt** - Microsoft PowerPoint
**msaccess** - Microsoft Access
**outlook** - Microsoft Outlook
**ois** - Microsoft Picture Manager
**winproj** - Microsoft Project

### Management Consoles

**certmgr.msc** - Certificate Manager
**ciadv.msc** - Indexing Service
**compmgmt.msc** - Computer management
**devmgmt.msc** - Device Manager
**dfrg.msc** - Defragment
**diskmgmt.msc** - Disk Management
**fsmgmt.msc** - Folder Sharing Management
**eventvwr.msc** - Event Viewer
**gpedit.msc** - Group Policy (< XP Pro)
**iis.msc** - Internet Information Services
**lusrmgr.msc** - Local Users and Groups
**mscorcfg.msc** - Net configurations
**ntmsmgr.msc** - Removable Storage
**perfmon.msc** - Performance Manager
**secpol.msc** - Local Security Policy
**services.msc** - System Services
**wmimgmt.msc** - Windows Management

### Control Panel utilities

**access.cpl** - Accessibility Options
**hdwwiz.cpl** - Add New Hardware Wizard
**appwiz.cpl** - Add/Remove Programs
**timedate.cpl** - Date and Time Properties
**desk.cpl** - Display Properties
**inetcpl.cpl** - Internet Properties
**joy.cpl** - Joystick Properties
**main.cpl keyboard** - Keyboard Properties
**main.cpl** - Mouse Properties
**ncpa.cpl** - Network Connections
**ncpl.cpl** - Network Properties
**telephon.cpl** - Phone and Modem options
**powercfg.cpl** - Power Management
**intl.cpl** - Regional settings
**mmsys.cpl sounds** - Sound Properties
**mmsys.cpl** - Sounds and Audio Device Properties
**sysdm.cpl** - System Properties
**nusrmgr.cpl** - User settings
**firewall.cpl** - Firewall Settings (sp2)
**wscui.cpl** - Security Center (sp2)
**Wupdmgr** - Takes you to Microsoft Windows Update

Thanks to The New Tech for the original forum posting.

## 附件

- [bitlocker.zip](bitlocker.zip)
- [CCleaner_6.38.11537_Portable.7z](CCleaner_6.38.11537_Portable.7z)
- [color.7z](color.7z)
- [nfcTools(PCR532).7z](nfcTools(PCR532).7z)
- [WinX.zip](WinX.zip)
- [显示器颜色配置.7z](%E6%98%BE%E7%A4%BA%E5%99%A8%E9%A2%9C%E8%89%B2%E9%85%8D%E7%BD%AE.7z)
