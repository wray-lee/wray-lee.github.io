---
title: SSTI
date: 2023-09-04 21:48:57
---
# SSTI

## 变量和语句基本概念

`{%%}	声明变量`

`{{}}将表达式打印到模板输出`

`{##}未包含在模板中的注释`

## 访问变量属性

.或者[]

```python
{{"".__class__}}
{{""['__classs__']}}
```

## 过滤规则

```shell
_	\x5f

[]	attr()	request.args.	{{()|attr(request.args.x1)}}&x1=??&x2=??

.	\x2E	|attr()
'+'
```

SSTI中存在类似linux的管道|

可以用

```python
{{""|attr()}}代替.或[]
```







