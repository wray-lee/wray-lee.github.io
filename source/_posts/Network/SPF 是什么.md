---
title: SPF 是什么
date: 2023-09-04 21:48:57
---
## SPF 是什么

目前广泛使用的发信协议 [SMTP](https://zh.wikipedia.org/zh-hans/简单邮件传输协议) 中，发信方可以任意设定发件人的邮箱地址，任何人都可以假冒自己是 *boss@your-corp.com* 向其他人发送邮件。因此，SPF (Sender Policy Framework) 机制被提出来，用以校验电子邮件发送方（邮件传输代理，MTA），只有被 *your-corp.com* 所认可的服务器才可以发送以 *boss@your-corp.com* 作为发件人的邮件。邮件接收方会借助 SPF 记录与 IP 地址来识别发件服务器是否合法，并根据 SPF 记录的指示判断同意接收邮件或者拒收。



## 如何部署 SPF

DNS 系统中曾经有一种专门的 SPF 资源记录类型，但已经被废除了。现在的 SPF 都以 TXT 资源记录的形式存在，主机名一般为 @。比如本博客的 SPF 如下：



```bash
➞ dig chenxy.me txt +short
"v=spf1 include:spf.mail.qq.com ~all"
```

## SPF 记录的格式

SPF 记录以单个空格作为多个子项的分割符，每个子项由 qualifier、mechanism、modifier 等组件构成。在解析时将从左往右匹配，如果有任意一个子项匹配成功，则立即中止匹配过程并根据 qualifier 返回 SPF 校验结果。

SPF 记录以固定的 `v=spf1 `开始，标识着 SPF 版本，目前固定为 spf1。

### Qualifier 与 Mechanism

#### Qualifier

SPF 中存在的 qualifier 被放置在 mechanism 之前，共有以下四种。其中 + 作为默认的 qualifier，可以被省略。

| **Qualifier** | **Result** | **Explanation** *(若相应的 mechanism 匹配成功)*              |
| ------------- | ---------- | ------------------------------------------------------------ |
| +             | Pass       | 一个明确的声明，该发送方的机器通过了检查，可以从本域的邮箱发送邮件 |
| -             | Fail       | 一个明确的声明，该发送方的机器未通过检查，不允许从本域的邮箱发送邮件 |
| ~             | Soft Fail  | 一个较弱的声明，该发送方的机器似乎没通过检查                 |
| ?             | Neutral    | 本域的管理者未明确声明该发送方的机器是否通过检查             |

#### Mechanism

##### all

all 永远会成功匹配，鉴于这个原因，all 后边的 mechanism 将不会生效。all 一般作为最后一个 mechanism，配合 qualifier 用以配置「默认行为」——如果其他策略全部匹配失败了，本域对这些漏网之鱼的政策是什么。

以本站的 SPF 配置 `v=spf1 include:spf.mail.qq.com ~all` 为例：如果 include 这一项 mechanism 匹配失败，则最终来到 all 并匹配成功，根据其 qualifier 返回了「soft fail」结果——一般邮件接收方不会将这封邮件拒收，但是会将邮件归入垃圾邮箱之中。

##### include

include 的格式为 `include: *domain-spec*`，它将会触发一次递归的 SPF 校验过程，让邮件接收方去检查 *domain-spec* 所设置的 SPF 记录。只有当 *domain-spec* 的校验结果是 pass 时（注意：soft fail 也不行），本项 mechanism 才会被视为匹配成功。

include 机制被期望用于处理「跨行政边界」的情况，即所需要的 SPF 规则被置于不属于本域管辖的域名之下。它更像是「导入第三方依赖库」，而下边将提到的 redirect 则更像「公司内部的一段公共代码」。

##### exists

格式为 `exists: *domain-spec*`，接收方将向指定域名发送一条 A 记录查询（即便是 IPv6 也使用查询 A 记录），如果有任何返回则匹配成功。可以用来做一些比较复杂的校验。

其中，*domain-spec* 可以包括以下的宏：

| 宏   | 含义                                                         | 示例                    |
| ---- | ------------------------------------------------------------ | ----------------------- |
| s    | 发件人邮箱地址                                               | hsiaoxychen@example.com |
| l    | 发件人的「本地地址」                                         | hsiaoxychen             |
| o    | 发件人的域名部分                                             | example.com             |
| d    | 当前正在验证的 SPF 权威域名。一般与上边一致，但是在解析 include 时可能发生改变 | example.com             |
| i    | 发件方的 IP                                                  | 114.5.1.4               |
| v    | 如果是 IPv4 则为 `in-addr`，如果是 IPv6 则为 `ip6`           | in-addr                 |
| h    | HELO/EHLO 的域名                                             | mail.example.com        |

同时，如果在宏的后边附加上 r，可以使得取值被逆序。如，假设我们有以下 SPF 记录：



```log
v=spf1 exists:%{ir}.%{l}._spf.example.com -all
```

同时，在 _spf.example.com 子域下仅有一条 A 记录：



```log
4.1.5.114.noreply._spf.example.com IN A 127.0.0.1
```

则只有从 `114.5.1.4` 发送的来自 `noreply@example.com` 的邮件能通过 SPF 校验。

##### 其他的 Mechanism

其他的 mechanism 包括：a、mx、ip4、ip6、exists，他们的机制都比较相似且比较好理解，整理如下：

| a    | 若发送方 IP 命中了指定域名的任意一条 A 记录（或 AAAA 记录，根据这次发送行为经由 IPv4 还是 IPv6 而决定）IP 地址，则匹配成功 |
| ---- | ------------------------------------------------------------ |
| mx   | 若发送方 IP 命中了指定域名的任意一条 MX 记录，则匹配成功     |
| ip4  | 若发送方 IP 命中了指定的 IPv4 地址（段），则匹配成功         |
| ip6  | 若发送方 IP 命中了指定的 IPv6 地址（段），则匹配成功         |

### Modifier

modifier 的语法与 mechanism 稍有不同，其没有 qualifier，而且键值划分不是 `:` 而是 `=`。目前共有两种 modifier，分别是 redirect 跟 exp。exp 用以 SPF 校验失败后告知服务器如何生成解释文本，在此不作介绍；redirect 可以将后续的 SPF 校验过程「重定向」到目标域名。比如 gmail.com 的 SPF 记录：



```bash
➞  dig gmail.com txt +short
"globalsign-smime-dv=CDYX+XFHUw2wml6/Gb8+59BsH31KzUr6c1l2BPvqKX8="
"v=spf1 redirect=_spf.google.com"

➞  dig _spf.google.com txt +short
"v=spf1 include:_netblocks.google.com include:_netblocks2.google.com include:_netblocks3.google.com ~all"
```

虽然在不同的域名之下，但是 _spf.google.com 的 SPF 策略将可以代表 gmail.com。

注意 redirect 必须作为 SPF 记录的最后一个部分出现，并且当有 all 出现时 redirect 将必须被忽略。

## SPF 记录实例分析



```bash
➞  dig chenxy.me txt +short
"v=spf1 include:spf.mail.qq.com ~all"
# 检查 spf.mail.qq.com 的匹配结果，如果匹配失败，则返回 soft fail

➞  dig spf.mail.qq.com txt +short
"v=spf1 include:spf-a.mail.qq.com include:spf-b.mail.qq.com include:spf-c.mail.qq.com include:spf-d.mail.qq.com include:spf-e.mail.qq.com include:spf-f.mail.qq.com include:spf-g.mail.qq.com -all"
# 依次检查各个 include 的匹配结果，如果都匹配失败，则返回 fail

➞  dig spf-a.mail.qq.com txt +short
"v=spf1 ip4:203.205.251.0/24 ip4:103.7.29.0/24 ip4:59.36.129.0/24 ip4:113.108.23.0/24 ip4:113.108.11.0/24 ip4:119.147.193.0/24 ip4:119.147.194.0/24 ip4:59.78.209.0/24 ip4:113.96.223.0/24 ip4:183.3.226.0/24 ip4:183.3.255.0/24 ip4:59.36.132.0/24 -all"
# 如果发件方不在这些 ip 段之中则返回 fail
```

貌似实际应用的 SPF 记录中几乎都不使用 exists、exp 等机制，大多只是简单的划定合法 ip 段。

另外一种比较典型的 SPF 记录写法是：



```log
v=spf1 a mx ip4:114.5.1.4 -all
```

代表「只有本域名的 a、mx 记录中的 ip 以及 114.5.1.4 可以代表本域发出邮件」，常见于自建的私人邮件服务器。

## 拓展阅读

- Using SPF Macros to Solve the Operational Challenges of SPF
  - 如果你对 exists 及 SPF 中的宏感兴趣，这篇文章很值得一看
- [红蓝对抗之邮件伪造 - FreeBuf网络安全行业门户](https://www.freebuf.com/articles/network/264663.html)
- [2011.08420] Weak Links in Authentication Chains: A Large-scale Analysis of Email Sender Spoofing Attacks
  - 来自清华的论文，研究了多种绕过 SPF、DKIM、DMARC 等机制的伪造邮件攻击方式

## 参考资料

- [RFC 7208 - Sender Policy Framework (SPF) for Authorizing Use of Domains in Email, Version 1](https://tools.ietf.org/html/rfc7208)
- [RFC 4408 - Sender Policy Framework (SPF) for Authorizing Use of Domains in E-Mail, Version 1](https://tools.ietf.org/html/rfc4408) [OBSOLETE]
- [SPF 记录：原理、语法及配置方法简介 - Blog - Renfei Song](https://www.renfei.org/blog/introduction-to-spf.html)
- [Explaining SPF record | Postmark](https://postmarkapp.com/blog/explaining-spf)