---
title: Git教程
date: 2023-09-04 21:54:58
---
# Git教程

git像一个可排序的栈，栈顶在最底端，只能对最近的提交进行更改，如果要更改之前的数据就需要排序

 所有操作除了switch,checkout都是在引用当前所在位置进行

提交记录本身的名字为hash值

## commit

`git commit`创建一个新的版本（不是完全copy,只会记录不同）

`git commit --amend`对提交记录进行修改

## branch

- ```git branch <branch_name> <branch_position>```

​		branch指向一个commit

- ```git branch -f main head~3```    ` 	git branch -f main c0`    `git branch -f` 可以变更分支指向

- `git switch <branch_name>`

​		切换到某一分支

使用分支移动分支也会跟随者移动

## merge/rebase

### merge

拉取合并

`git merge 1`

此时branch在main则拉取1的代码到main，branch仍在main

### rebase

合并到，并复制提交记录

`git rebase 1`

则把main合并到1的开发路线上，branch在main

rebase不会移动下层的版本，只会移动引用当前所在的版本

---

`git rebase -i head~3`			选中包含head引用位置3个commit,通过gui进行删减，排序，处理后的结果会出现在一条新的路线上（基为head~3）

`-i`变动当前版本到基版本的所有版本

`git rebase -参数 基版本	`



## head

即为当前引用所在位置

`git checkout 1`

将head指向1

head指向一次提交记录commit

head作为引用使用要大写HEAD

## checkout

`git checkout -b totallyNotMain o/main`

`git checkout -b 选择分支 追踪分支`（会创建分支，不需要提前创建好）

可以使某一分支追踪远程某一分支，相当于替换了main

---

也可以使用

`git branch -u 追踪分支 选择分支`（不会创建分支，需要提前创建）

## 相对引用

^向上移动一个提交记录

~num 向上移动num个移动记录

`git checkout main^`

==可以使用分支代表提交记录commit==



^2可以选择第二个父提交



指令支持链式操作

`git checkout HEAD~^2~2`





## 撤销变更

`git reset`	`git revert`

`git reset head^`是commit退回到前一个记录，删除当前记录，引用变更到前一个记录

`git revert head^`在此路线上添加一个新的commit，但是新的commit实际上和前一个相同



==两条命令都是对当前引用所在位置进行操作==



## 整理分支

`git cherry-pick c2 c4`	将c2,c4按顺序复制到引用当前所在分支下



## Tag（避免分支移动造成混乱）

`git tag v1 c1`

在c1上添加v1	tag



## describe

`git describe <引用>`

output：<tag>\_<numCommits>\_g<hash>



---

---



# 远程

## clone

`git clone`复制远程仓库

首次clone会自动将main和o/main引用到同一位置



## main和o/main

checkout o/main 再进行commit时，由于未下载远程仓库数据，会造成HEAD分离，即o/main只有同步时才会发生指向变化

远程分支o/main（o/*）实际上是远程main分支的位置

## fetch

`git fetch`

不会更新main分支，只是将远程仓库代码下载，更新了o/main引用

不需要参数，会自动比对下载

`git fetch origin <远程选定分支:本地选定分支>`(可以使用相对引用)

`git fetch origin <:本地分支>`会创建本地分支

## pull

就是`fetch+merge`

`git pull`

实际上就是`git fetch ; git merge o/main`

会拉取代码自动合并

是在当前分支下进行拉取，所以o/main不在当前位置会因不同步而无法拉取



`git pull --rebase`以变基形式拉取代码合并main分支，利用此特性可以实现整条分支的变基

可以使用类似fetch的`git pull <远程分支:本地分支>`		`git pull <:本地分支>`

## push

与pull相反，会上传代码，无自动合并，如果本地仓库旧版需要更新后再push

`git push origin <选定分支>`

​	将HEAD定位到头部，自动追踪选定分支上传

`git push origin <本地选定分支:远程选定分支>`

将本地选定分支上传到远程选定分支，若远程不存在则会创建

可以使用相对引用不上传整条分支`git push origin <本地选定分支^:远程选定分支>`

​	只会上传到本地选定的上方

`git push <:远程分支>`

​	会删除远程分支
