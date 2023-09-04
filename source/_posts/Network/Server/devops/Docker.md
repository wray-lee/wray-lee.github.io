---
title: Docker
date: 2023-09-05 00:53:01
---
# Docker

## 仓库

**登录**：`docker login`

**登出**：`docker logout`

**查找镜像**：`docker search [镜像名]`

## 镜像

**查看镜像**：`docker images`

**使用镜像生成容器**：`docker run [镜像名]`

```shell
#docker run 参数
-v [主机路径]:[容器路径]	#将容器路径挂载到主机
-P #容器内部端口随机映射到主机端口
-p [主机端口]:[容器端口]	#将特定容器端口映射到特定主机端口
--name [容器名字]	#容器命名
```

**删除镜像**：`docker rmi [镜像名]`

## 容器

**查看容器**：`docker ps -a`

**删除容器**：`docker rm [容器名]`

**进入容器**：`docker exec -it [容器序号/容器名字] /bin/bash` / `docker exec -it [容器序号] /bin/sh`

```shell
-i:interact 交互操作
-t:terminal 终端
-d:down 后台运行
```

**启动已有容器**：`docker restart [container]`

**停止已有容器运行**：`docker stop [container]`		`sudo aa-remove-unknown(遇到permission denied)`

## 容器链接（容器网络）

### 网络创建与加入

**创建网络**：

- `docker network create -d bridge [网络桥名字]`
- `docker network create -d overlay [网络隧道名]`

**加入网络**：

- 创建容器时：

`docker run -itd --name [容器名] --network [网络名] [镜像名] [/bin/bash(终端环境)]`

- 已有容器时加入：

`docker network connect [network_name] [container_name] `

### 网络dns配置

主机的`/etc/docker/daemon.json`可以配置容器默认dns配置

**查看容器dns**：

`docker run -it --rm  [container]  cat etc/resolv.conf`

**手动指定容器dns**：

`docker run -it --rm -h [容器主机名]  --dns=[dns_ip] --dns-search=test.com [container]`

---

参数：

```shell
--rm：容器退出时自动清理容器内部的文件系统。

-h HOSTNAME 或者 --hostname=HOSTNAME： 设定容器的主机名，它会被写到容器内的 /etc/hostname 和 /etc/hosts。

--dns=IP_ADDRESS： 添加 DNS 服务器到容器的 /etc/resolv.conf 中，让容器用这个服务器来解析所有不在 /etc/hosts 中的主机名。

--dns-search=DOMAIN： 设定容器的搜索域，当设定搜索域为 .example.com 时，在搜索一个名为 host 的主机时，DNS 不仅搜索 host，还会搜索 host.example.com。
```



​					