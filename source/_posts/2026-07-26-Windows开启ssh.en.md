---
title: Enable SSH on Windows
date: 2026-07-26 13:37:46
tags: ["Windows"]
lang: en
slug: Windows开启ssh
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

# Enable SSH on Windows

## Install Service

```powershell
New-ItemProperty -Path "Registry::HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU" -Name "UseWUServer" -Value 0 -PropertyType Dword -Force | Out-Null

# Install the OpenSSH Client
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0

# Install the OpenSSH Server
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0

# Start the sshd service
Start-Service sshd

# OPTIONAL but recommended:
Set-Service -Name sshd -StartupType 'Automatic'

# Confirm the Firewall rule is configured. It should be created automatically by setup. Run the following to verify
if (!(Get-NetFirewallRule -Name "OpenSSH-Server-In-TCP" -ErrorAction SilentlyContinue)) {
    Write-Output "Firewall Rule 'OpenSSH-Server-In-TCP' does not exist, creating it..."
    New-NetFirewallRule -Name 'OpenSSH-Server-In-TCP' -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22 -Profile Any
} else {
    Write-Output "Firewall rule 'OpenSSH-Server-In-TCP' has been created and exists."
}
```



## Change Terminal Type

```powershell
New-ItemProperty -Path "HKLM:\SOFTWARE\OpenSSH" -Name "DefaultShell" -Value "C:\Program Files\PowerShell\7\pwsh.exe" -PropertyType String -Force
```



## Key-based Login

Modify `sshd_config`

`C:\ProgramData\ssh\sshd_config`

Key location

`C:\ProgramData\ssh\administrators_authorized_keys`

Change permissions

```powershell
icacls.exe "C:\ProgramData\ssh\administrators_authorized_keys" /inheritance:r /grant "Administrators:F" /grant "SYSTEM:F"
```





## Test

```bash
ssh -o PubkeyAuthentication=no -o PreferredAuthentications=password,keyboard-interactive -o NumberOfPasswordPrompts=0 用户名@服务器IP
```

## Attachments

- [bitlocker.zip](bitlocker.zip)
- [CCleaner_6.38.11537_Portable.7z](CCleaner_6.38.11537_Portable.7z)
- [color.7z](color.7z)
- [nfcTools(PCR532).7z](nfcTools(PCR532).7z)
- [WinX.zip](WinX.zip)
- [Display color configuration.7z](%E6%98%BE%E7%A4%BA%E5%99%A8%E9%A2%9C%E8%89%B2%E9%85%8D%E7%BD%AE.7z)