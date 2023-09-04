---
title: Youtube-dl下载
date: 2023-09-04 21:48:57
---
# Youtube-dl下载

```shell
youtube-dl --download-archive log.txt "https://www.youtube.com/playlist?list=PLP5yb_kS9Bc4ARlmr6_PHZc0BkLUx31wF" --external-downloader aria2c --external-downloader-args "-x 16 -k 1M" --no-check-certificate
```

