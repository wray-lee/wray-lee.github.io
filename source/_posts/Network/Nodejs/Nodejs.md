---
title: Nodejs
date: 2023-09-04 21:48:57
---
# Nodejs

## npm

### 存储路径

`C:\Users\Wray\.npmrc` / `%userprofile%\.npmrc`

```
registry=https://registry.npm.taobao.org/	#default:	https://registry.npmjs.org/
prefix=F:\nodejs
cache=F:\nodejs\npm_cache
```



> one-click

`npm config set prefix 'F:\nodejs' && npm config set prefix 'F:\nodejs\npm_cache'   `

## Pnpm

### 存储路径

`%appdata%\Local\pnpm\config\rc`	|	`C:\Users\Wray\AppData\Local\pnpm\config\rc`

```shell
prefix=F:\nodejs
store-dir=F:\nodejs\store\v3
```

 

> one-click

`pnpm config set prefix 'F:\nodejs' && npm config set store-dir 'F:\nodejs\store\v3'`
