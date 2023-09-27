---
title: Shell语法
date: 2023-09-04 21:54:58
---
# Shell语法

## 文件描述符

`0`	标准输入

`1`	标准输出，指向屏幕

`2`	标准错误输出（log属于）

## 运算符

```
>`	输出重定向，右移，实际上是`1>` `将左边语句的输出覆盖写入到右边文件内，相当于`** | tee some_text.txt
>>`	输出追加重定向，右右移，将左边语句的输出添加到右边文件末尾，相当于`** | tee -a some_text.txt
```

`<`	输入重定向	`command < file`	从文件中读入

`<<`	输入追加重定向	`command << EOF`	读入后续输入直到`EOF`	（可以用作给指令添加退出条件）

```shell
 cat << EOF > tmp
 1
 2
 3
 EOF
 
 #则tmp中为
 1
 2
 3
```



`|`	管道，将左方语句输出作为右方语句输入

`||`	或或，左方语句执行失败才执行右方语句

`&`	与，左方语句无论执行是否失败都会执行右方语句，会执行所有与起来的语句。	放在结尾为则是让程序后台执行

`&&`	与与，左方语句执行失败则不会再执行右方语句，若成功则执行右方语句

`!` 	条件表达式的非



`>&`	文件操作符号,	eg:`2>&1`	, `2>1`会将错误输出重定向到名为1的文件中，`&`为了定义后面的`1`是文件描述符

```
&<
```

​	用法：`echo "hello" > a.log 2>&1`	1被重定向到a.log，2被重定向到a.log，等于2被重定向到1，目的是在log记录正常输出和错误输出

​			可以简写为`echo "hello" >&log`	或	`echo "hello" &>log`

*`2&>1 >log `	是无效输入，导致error被写入1文件中*



`-a`	条件表达式的并列（与）

`-o`	条件表达式的或

`$`	后面接变量名称整体表示一个变量

```
""
''
 `` ``   反引号，指令内部嵌套指令使用，可以用$(command)代替
```

`echo -e`	可以识别转义字符

## 条件

```shell
 if []; do command; done
```



## 循环

```shell
 #for循环
 for i in {1..5}; do command; done
 
 for 变量名（此处可以定义变量，未出现的变量会被定义） in 取值列表{1..10}
 do
     command
 done
 
 
 #while循环（出现条件一直执行）
 while[条件]
 do
     command
 done
 
 #until循环（出现条件结束）
 until[条件]
 do
     command
 done
```



## 权限

linux安全系统为SELinux（Security-Enhanced Linux），可管理文件权限

### `ls -lZht`

```bash
-rw-r--r--.  1 user group unconfined_u:object_r:user_home_t:s0 4096 Sep 27 10:30 file.txt
```

`unconfined_u:object_r:user_home_t:s0` 是文件和目录的安全上下文。它包含了有关文件或目录所属用户、角色、对象类以及安全级别的信息。

1. `unconfined_u`：表示该文件或目录所属的SELinux用户。`unconfined_u`是一个特殊的用户标识，表示未受限制的用户，即没有受到严格的SELinux策略限制。
2. `object_r`：表示该文件或目录所属的SELinux对象角色。对象角色定义了SELinux策略中允许操作该对象的角色集合。
3. `user_home_t`：表示该文件或目录的SELinux对象类型。对象类型定义了文件或目录的用途和允许的操作。`user_home_t`是一个常见的对象类型，用于表示用户的家目录。
4. `s0`：表示该文件或目录的SELinux安全级别。安全级别用于控制对象的访问权限，并根据访问规则进行限制。

eg:

`systemd_unit_file_t`是SELinux中的一个对象类型，用于表示systemd单元文件的安全上下文。



#### 更改SELinux文件权限`chcon`

1. 更改文件的安全上下文：

    ```bash
    chcon unconfined_u:object_r:user_home_t:s0 file.txt
    ```

2. 递归地更改目录及其所有子目录和文件的安全上下文：

    ```bash
    chcon -R unconfined_u:object_r:user_home_t:s0 directory/
    ```

3. 更改符号链接的安全上下文：

    ```bash
    chcon -h unconfined_u:object_r:user_home_t:s0 symlink
    ```

4. 设置目标安全上下文类型：

    ```bash
    chcon -t httpd_sys_content_t index.html
    ```



##### 与chown区别

`chown`用于更改基本的文件`所有者:组`权限，是基础文件系统的权限

`chcon`是在SELinux上更改文件权限
