---
title: markdown语法
date: 2023-09-04 21:54:58
---
# 一级标题

## 二级标题

### 三级标题

#### 四级标题（以此类推最高六级）





# 换行语法

第一行<br>第二行<br>第三行



直接回车也可以



# 强调语法

 *斜体*

**粗体**

***斜粗体***



# 列表

## 有序列表

1. 1
2. 2
3. 3

## 无序列表

+ 第一
+ 第二
+ 第三

加号

也可以用减号和星号



## 分割线

---

---

---

三条分割线

---

---

---

再来三条

### 竖分割线

用于附言

`>`

>dsds
>
>dsds

## 饼图

```mermaid
pie
	title pie
	"50%":50
	"30%":30
	"20%":20
```



## 甘特图

```mermaid
gantt
	dateFormat 2022-09-20
	title gantt
	section A
	task1	:done,dest1,2022-09-20,3d
	task2	:active,dest2,2022-09-21,3d
	task3	:crit,active,after des2,5d
	
	
```

## 流程图

- TB - 从上到下			top-bottom
- BT - 从下到上
- RL - 从右到左            right-left 
- LR - 从左到右
- TD - 与TB相同

```mermaid
graph LR
	id1((start圆形))--直线-->A
	A-.虚线.->B
	A-->C[\平行四边形\]-->D[/平行四边形/]-->E[/梯形\]-->F[\梯形/]
	A-->G{菱形}
	B---|无箭头直线|i(圆角矩形)
	G-->|直线注释另一种写法|H{{六边形}}-->I>标签]
	
```

```mermaid
graph TD
	id1(纵向)-->A
	
```





















---









# markdown语法

## 标题语法

` # 一级标题`

`## 二级标题`

`### 三级标题`

以此类推

## 强调语法

` ~~内容~~`中划线

`*内容*`斜体

`**内容**`粗体

`***内容***`斜粗体

## 列表语法

### 有序列表

```markdown
1. 内容
2. 会自动生成（记得空格）
```

### 无序列表

```markdown
- 内容
+ 内容
* 内容
```

都可以生成无序列表

## markdown可以内嵌html

```html
<p></p>
<font color=></font>
<u></u>
<tr></tr>
<td></td>
..............
```

## 分割线

```markdown
---				减号
\*\*\*			星号
\_\_\_			下划线
```

均可以

## 代码语法

````markdown
`your_codes`


```select_language
your codes
```
````



## 标注

### 上标

`[^标注内容]`

你好[^1]

`html内嵌`

<sup>1</sup>

### 下标

`~标注内容~`

你好~1~

## 划线

### 删除线

`~~内容~~`

~~你好~~

### 下划线

`html内嵌语法：<u>内容</u>`

<u>你好</u>

### 上划线

`latex内嵌语法: $代码$`

```latex
$\overline{A}$
$\widehat$
$\hat{A}$
$\widetilde{A}$
$\dot{A}$
$\ddot{A}$
```

$\overline{A}$
$\widehat{A}$
$\hat{A}$
$\widetilde{A}$
$\dot{A}$
$\ddot{A}$

