---
title: Subst maps a Windows folder to a drive
date: 2026-01-24 17:30:39
tags: ["Windows"]
lang: en
slug: Subst 将windows文件夹映射为磁盘
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

# `Subst` Map a Windows folder to a drive

It is a legacy of the DOS era, but to this day it remains the fastest and most native way in Windows to map **"long-path folders" to "short drive letters"**.

For the "Linux-like" environment you want to build, this is a godsend. For example, you can map `C:\dev` directly to drive `X:`, so your code path is `X:\MyProject` instead of `C:\dev\MyProject`.

### 1. Basic usage (temporary effect)

Open CMD or PowerShell (administrator privileges are not required), and enter:

PowerShell

```
# 语法：subst [盘符] [目标文件夹路径]
subst X: C:\dev
```

**Effect:**

- An **X: drive** will instantly appear in "My Computer".
- Its contents are the contents of `C:\dev`.
- **Two-way sync:** When you modify files on drive X, `C:\dev` also changes, because they point to the same physical location.

**Remove the mapping:**

PowerShell

```
subst X: /d
```

### 2. Why is it suitable for your development scenarios?

This is very important for your **Unreal Engine C++** and **Android reverse engineering** work:

1. **Solving "path too long" (Path too long):**

    UE compilation often reports errors because file paths exceed 260 characters.

    - Original path: `C:\dev\UnrealEngine\Engine\Source\ThirdParty\OpenSSL\...\include\openssl\aes.h` (very long)
    - After mapping: `X:\Engine\Source\...\aes.h` (extremely short)

2. **Simulating a Linux root directory:**

    You can map `C:\bin` to `B:`, and map `C:\dev` to `S:` (Source), to create a psychological sense of physical separation.

------

### 3. Advanced: How to make it "take effect permanently" (not disappear after restart)

**A big pitfall of the `subst` command is: the mapping disappears after restarting the computer.**

Since you want to use it as a fixed system structure, you have two ways to make it permanent:

#### Method A: Registry method (most stable, recommended)

This method lets Windows load the drive letter when it starts core system services, which is earlier and more stable than a startup script.

1. Open the Registry Editor (`Win + R`, enter `regedit`).

2. Navigate to:

    `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\DOS Devices`

3. On the right side, right-click -> **New** -> **String Value (String Value)**.

4. **Name:** `X:` (the drive letter you want)

5. **Data:** `\??\C:\dev` (note that the preceding `\??\` is a required prefix)

6. Restart the computer.

#### Method B: Startup script method (simplest)

In your `C:\bin`, write a `mount.bat`:

Code snippet

```
@echo off
subst X: C:\dev
subst T: C:\tools
```

Then put a **shortcut** to this file into Windows' "Startup" folder:

- Press `Win + R` -> enter `shell:startup` -> paste the shortcut.

## Attachments

- [bitlocker.zip](bitlocker.zip)
- [CCleaner_6.38.11537_Portable.7z](CCleaner_6.38.11537_Portable.7z)
- [color.7z](color.7z)
- [nfcTools(PCR532).7z](nfcTools(PCR532).7z)
- [WinX.zip](WinX.zip)
- [Display color configuration.7z](%E6%98%BE%E7%A4%BA%E5%99%A8%E9%A2%9C%E8%89%B2%E9%85%8D%E7%BD%AE.7z)