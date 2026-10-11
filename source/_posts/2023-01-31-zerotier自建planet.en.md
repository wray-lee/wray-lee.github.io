---
title: ZeroTier self-hosted planet
date: 2023-01-31 22:18:08
tags: ["web"]
lang: en
slug: zerotier自建planet
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

# ZeroTier self-hosted planet

Using the author's Docker, the final central node is displayed as leaf; tested latency on China Mobile 4G and China Telecom broadband is 500 ms, and to the central node is 120 ms and 40 ms respectively; in practice, traffic did not go through the custom node.
**After research, additional configuration is required**. Here is the approach:

1. The compose file needs to add ports: '9993:9993' and '9993:9993/udp'; the server and firewall must also allow them
2. Enter the container and generate moon.json
3. Copy moon.json to the host and modify stableEndpoints
4. On the host, use [mkmoonworld-x86](https://github.com/kaaass/ZeroTierOne/releases/download/mkmoonworld-1.0/mkmoonworld-x86) to generate the planet file
5. Copy the modified moon.json back to the container, generate the moon file inside the container, create a moons.d folder, and put it in. Copy one to the host as a backup
6. Replace the planet file back into the container
7. Restart the container
8. Replace the client's planet file
9. For Android, in testing, loading planet alone does not take effect. Load the moon file and disable the official planet node, then it takes effect

For details, refer to the code implementation in https://github.com/xubiaolin/docker-zerotier-planet and various moon generation tutorials

\######## For reference only #########

1. Download

    ```
    git clone https://github.com/Jonnyan404/zerotier-planet
    cd zerotier-planet
    vim docker-compose.yml
    ```

2. Modify

    ```
    ###　参考
    ### date:2021年11月29日
    ### author: www.mrdoc.fun | jonnyan404
    ### 转载请保留来源
    version: '2.0'
    services:
        ztncui:
            container_name: ztncui
            restart: always
            environment:
                # - MYADDR=公网地址(不设置该项自动获取)
                - MYADDR=127.0.0.1  # 改成自己的服务器公网ip
                - HTTP_PORT=3443
                - HTTP_ALL_INTERFACES=yes
                - ZTNCUI_PASSWD=root
            ports:
                - '3443:3443'  # 设置网页的端口
                - '9993:9993'  # 作为中心节点，提供9993端口给客户端用，一般是9993
                - '9993:9993/udp'
            volumes:
                - './zerotier-one:/var/lib/zerotier-one'
                - './ztncui/etc:/opt/key-networks/ztncui/etc'
                # 按实际路径挂载卷， 冒号前面是宿主机的， 支持相对路径
            image: keynetworks/ztncui
    ```

3. Run

    ```
    docker-compose up -d
    
    docker images #　查看镜像
    docker container ps -a # 查看容器
    
    docker exec -it ztncui bash # 进入容器
    # 在容器内操作
    cd /var/lib/zerotier-one
    ls -l
    # 生成moon配置文件
    zerotier-idtool initmoon identity.public > moon.json
    chmod 777 moon.json
    ```

4. Create a new terminal, and outside the **container** modify `moon.json`, at the location corresponding to the mount location

    Modify `stableEndpoints`, paying attention to the format and actual public IP

    ```
    {
     "id": "b72b5e9e1a",
     "objtype": "world",
     "roots": [
      {
       "identity": "b72b5e9e1a:0:a892e51d2ef94ef941e4c499af01fbc2903f7ad2fd53e9370f9ac6260c2f5d2484fd90756bec0c410675a81b7cf61d2bb885783bd6a8c28bce83bcab5f03fe14",
       "stableEndpoints": ["127.0.0.1/9993"]
      }
     ],
     "signingKey": "45f0613e569a0549c74293c39b30495b594a003534290e8ade9ef82877aa7505d7a73eeabfc22c97c404e4caaf9f3c9eed2b134d696935c966e28f523364f15f",
     "signingKey_SECRET": "cc6afd67e7b7f84a92e2c8d3c2e7212c71e2ad0a4f5b3c03bf60ab1cd3b99281b57d9a2958d2bd8fc2bc77fdf2a1160099c2c61d3d9acc8cb311673ee120b4a6",
     "updatesMustBeSignedBy": "45f0613e569a0549c74293c39b30495b594a003534290e8ade9ef82877aa7505d7a73eeabfc22c97c404e4caaf9f3c9eed2b134d696935c966e28f523364f15f",
     "worldType": "moon"
    }
    ```

5. Generate the moon file inside the **container**

    ```
    zerotier-idtool genmoon moon.json
    mkdir moons.d
    cp *.moon moons.d/
    ```

6. Generate the planet file outside the **container**

    - Copy the moon file; the client can use it

    - Download [mkmoonworld](https://github.com/kaaass/ZeroTierOne/releases/tag/mkmoonworld-1.0), copy moon.json, and place them in one directory

    - ```
        ./mkmoonworld-x86_64 ./moon.json
        mv world.bin planet
        ```

    - ```
        # 复制到容器内
        docker cp ./planet ztncui:/var/lib/zerotier-one
        ```

7. Restart the container

    ```
    docker restart ztncui
    docker exec -it ztncui bash # 进入容器
    # 在容器内操作
    cd /var/lib/zerotier-one
    #　查看ｍoon
    zerotier-cli listmoons
    ```

8. Visit the settings page corresponding to `ip+端口`

9. Replace the client's planet file and restart the service, then join the network and authorize it on the web page

## Attachments

- [moon node settings.zip](moon%E8%8A%82%E7%82%B9%E8%AE%BE%E7%BD%AE.zip)
- [zerotier setup moon.pdf](zerotier%E6%90%AD%E5%BB%BAmoon.pdf)
- [zerotier configuration.pdf](zerotier%E9%85%8D%E7%BD%AE.pdf)