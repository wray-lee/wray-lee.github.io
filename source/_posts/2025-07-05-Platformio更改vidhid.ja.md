---
title: PlatformIOでvidhidを変更
date: 2025-07-05 13:41:56
tags: ["code"]
lang: ja
slug: Platformio更改vidhid
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

# Platformioでvid/hidを変更

## Method.1

```ini
# platformio.ini
[env:micro]
platform = atmelavr
board = micro
framework = arduino
lib_deps = arduino-libraries/Mouse@^1.0.1
extra_scripts = pre:id.py
```

```python
# id.py
Import("env")

print(env.Dump())

board_config = env.BoardConfig()
# should be array of VID:PID pairs
board_config.update("build.hwids", [["0x0461", "0x4d2b"]])
```



## Method.2

```ini
# platformio.ini
[env:micro]
platform = atmelavr
board = jitter
framework = arduino
lib_deps = arduino-libraries/Mouse@^1.0.1
```



`platformio.ini` と同じ階層のパス下にフォルダ`boards`を作成



```json
// boards/jitter.json

{
    "build": {
        "core": "arduino",
        "extra_flags": "-DARDUINO_AVR_MICRO",
        "f_cpu": "16000000L",
        "hwids": [["0x0461", "0x4d2b"]],
        "mcu": "atmega32u4",
        "usb_product": "Wireless Laser Mini Mouse",
        "variant": "micro"
    },
    "bootloader": {
        "efuse": "0xCB",
        "file": "caterina/Caterina-Micro.hex",
        "hfuse": "0xD8",
        "lock_bits": "0x2F",
        "lfuse": "0xFF",
        "unlock_bits": "0x3F"
    },
    "debug": {
        "simavr_target": "atmega32u4"
    },
    "frameworks": ["arduino"],
    "name": "Arduino Micro",
    "upload": {
        "disable_flushing": true,
        "maximum_ram_size": 2560,
        "maximum_size": 28672,
        "protocol": "avr109",
        "require_upload_port": true,
        "speed": 57600,
        "use_1200bps_touch": true,
        "wait_for_upload_port": true
    },
    "url": "https://www.arduino.cc/en/Main/ArduinoBoardMicro",
    "vendor": "Dell"
}
```







# ドライバの作成

```inf
# dell.inf
[Version]
Signature="$CHICAGO$"
Class=Ports
ClassGuid={4D36E978-E325-11CE-BFC1-08002BE10318}
Provider=%MfgName%
DriverVer=07/05/2025,1.0.0

[Manufacturer]
%MfgName%=DeviceList, NTamd64

[DeviceList.NTamd64]
%DeviceDescription%=USB_Install, USB\VID_0461&PID_4D2B

[USB_Install.Services]
AddService=usbser, 0x00000002, DriverService

[DriverService]
DisplayName=%DeviceDescription%
ServiceType=1
StartType=3
ErrorControl=1
ServiceBinary=%12%\usbser.sys

[Strings]
MfgName="Dell"
DeviceDescription="Wireless Laser Mini Mouse"
```