---
title: "Subst 将windows文件夹映射为磁盘"
date: 2026-01-24 17:30:39
tags: ["Windows"]
---

# `Subst` 将windows文件夹映射为磁盘

它是 DOS 时代的遗产，但至今仍然是 Windows 中将**“长路径文件夹”映射为“短盘符”**的最快、最原生方式。

对于你想要构建的“类 Linux”环境，这是一个神器。比如你可以把 `C:\dev` 直接映射成 `X:` 盘，这样你的代码路径就是 `X:\MyProject`，而不是 `C:\dev\MyProject`。

### 1. 基本用法 (临时生效)

打开 CMD 或 PowerShell（不需要管理员权限），输入：

PowerShell

```
# 语法：subst [盘符] [目标文件夹路径]
subst X: C:\dev
```

**效果：**

- “我的电脑”里会瞬间多出一个 **X: 盘**。
- 里面的内容就是 `C:\dev` 的内容。
- **双向同步：** 你在 X 盘改文件，`C:\dev` 里也会变，因为它们指向同一个物理位置。

**删除映射：**

PowerShell

```
subst X: /d
```

### 2. 为什么它适合你的开发场景？

这对你的 **Unreal Engine C++** 和 **Android 逆向** 工作非常重要：

1. **解决“路径过长” (Path too long)：**

    UE 编译时经常因为文件路径超过 260 字符而报错。

    - 原路径：`C:\dev\UnrealEngine\Engine\Source\ThirdParty\OpenSSL\...\include\openssl\aes.h` (很长)
    - 映射后：`X:\Engine\Source\...\aes.h` (极短)

2. **模拟 Linux 根目录：**

    你可以把 `C:\bin` 映射为 `B:`，把 `C:\dev` 映射为 `S:` (Source)，在心理上建立物理隔离感。

------

### 3. 进阶：如何让它“永久生效” (重启不消失)

**`subst` 命令的一个大坑是：重启电脑后映射会消失。**

既然你想把它作为固定的系统结构，你有两个办法让它永久化：

#### 方法 A：注册表法（最稳定，推荐）

这个方法让 Windows 在启动系统核心服务时就加载盘符，比启动脚本更早、更稳定。

1. 打开注册表编辑器 (`Win + R`, 输入 `regedit`)。

2. 定位到：

    `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\DOS Devices`

3. 在右侧右键 -> **新建** -> **字符串值 (String Value)**。

4. **名称：** `X:` (你想要的盘符)

5. **数据：** `\??\C:\dev` (注意前面的 `\??\` 是必须的引导符)

6. 重启电脑。

#### 方法 B：启动脚本法（最简单）

在你的 `C:\bin` 里写一个 `mount.bat`：

Code snippet

```
@echo off
subst X: C:\dev
subst T: C:\tools
```

然后把这个文件的**快捷方式**扔进 Windows 的“启动”文件夹：

- 按 `Win + R` -> 输入 `shell:startup` -> 粘贴快捷方式。

## 附件

- [bitlocker.zip](bitlocker.zip)
- [CCleaner_6.38.11537_Portable.7z](CCleaner_6.38.11537_Portable.7z)
- [color.7z](color.7z)
- [nfcTools(PCR532).7z](nfcTools(PCR532).7z)
- [WinX.zip](WinX.zip)
- [显示器颜色配置.7z](%E6%98%BE%E7%A4%BA%E5%99%A8%E9%A2%9C%E8%89%B2%E9%85%8D%E7%BD%AE.7z)
