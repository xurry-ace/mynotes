---
description: xurry 的个人笔记，记录编程、算法、计算机系统、模式识别和生活中的思考。
hide:
  - navigation
  - toc
---

<div class="learning-home" markdown="1">

<header class="home-intro" markdown="1">

<div class="home-intro__copy" markdown="1">

# xurry 的代码空间

我把学习编程时的笔记、做过的题和平时的思考记在这里。

[按栏目阅读](#knowledge-map){ .md-button .md-button--primary } [为什么建站](#about-this-site){ .home-jump }

</div>

<figure class="home-feature" markdown="1">

<figcaption markdown="1">

**同一棵树，两种搜索顺序**

</figcaption>

<svg class="home-tree" viewBox="0 0 280 130" role="img" aria-label="A 的孩子是 B 和 C；B 的孩子是 D 和 E；C 的孩子是 F。">
  <path d="M140 21 86 63 41 107 M86 63 127 107 M140 21 202 63 244 107" />
  <g><circle cx="140" cy="21" r="15" /><text x="140" y="21">A</text></g>
  <g><circle cx="86" cy="63" r="15" /><text x="86" y="63">B</text></g>
  <g><circle cx="202" cy="63" r="15" /><text x="202" y="63">C</text></g>
  <g><circle cx="41" cy="107" r="15" /><text x="41" y="107">D</text></g>
  <g><circle cx="127" cy="107" r="15" /><text x="127" y="107">E</text></g>
  <g><circle cx="244" cy="107" r="15" /><text x="244" y="107">F</text></g>
</svg>

<div class="home-orders" markdown="1">

**BFS · 逐层** `A → B → C → D → E → F`

**DFS · 沿分支** `A → B → D → E → C → F`

</div>

[打开实验，逐步观察](洛谷题目/8_1/bfs.md#search-demo){ .home-feature__link }

</figure>

</header>

<section class="home-section" aria-labelledby="knowledge-map" markdown="1">

## 笔记索引 { #knowledge-map }

<div class="home-index" markdown="1">

<section markdown="1">

### 编程语言

从变量、函数到容器，用代码表达想法。

[C++ 容器](c++基础/index.md) · [Python 基础](python基础/引言.md)

</section>

<section markdown="1">

### 算法与题解

从题意找出递推状态、搜索路径和边界。

[算法知识地图](洛谷题目/引言.md#algorithm-map) · [二分演示](洛谷题目/1_1/二分查找.md#binary-demo)

</section>

<section markdown="1">

### 计算机系统

一边看硬件怎样执行指令，一边看系统怎样管理资源。

[计算机组成原理](计算机组成原理/引言.md) · [操作系统](操作系统/index.md#os-map)

</section>

<section markdown="1">

### 课程与随笔

一条线学习数据和模型，一条线记录生活里的思考。

[模式识别](模式识别/引言.md) · [人生思考](人生思考/引言.md)

</section>

</div>

<div class="home-routes" markdown="1">

### 跨栏目的两条阅读路线

- [容器与访问规则](c++基础/index.md) → [算法与状态变化](洛谷题目/引言.md#algorithm-map) → [指令怎样执行](计算机组成原理/第5章：中央处理器.md#pipeline-lab)
- [Python 对象](python基础/引言.md#python-map) → [数据与数组](python基础/第7章：重点突破--Numpy库.ipynb) → [模型与评估](模式识别/引言.md#pattern-map)

</div>

</section>

<section class="home-section home-experiments" aria-labelledby="start-with-a-question" markdown="1">

## 图解实验 { #start-with-a-question }

- [Cache 明明还有空行，为什么照样冲突？](计算机组成原理/第3章：存储系统.md#cache-lab)

    同样的容量，两种映射；看一块数据究竟能放在哪里。

- [只改了一个列表，为什么三个名字都变了？](python基础/第2章：字符串、列表、字典、元组.md#reference-lab)

    把变量绑定、外层复制与内层共享分开画出来。

- [降低分类阈值，得到的都是真正例吗？](模式识别/考试复习.md#metrics-lab)

    从四个样本出发，联动看预测、混淆矩阵和 ROC。

- [同一棵树，队列和递归会先处理谁？](洛谷题目/8_1/bfs.md#search-demo)

    不只看访问顺序，还看队列与调用链怎样变化。

- [TLB 未命中，页面就一定不在内存吗？](操作系统/03-内存管理/内存管理基础.md#paging-lab)

    输入虚拟地址，沿页号、偏移与页表找到访问结果。

- [文件里相邻的字节，为什么会落在不相邻的数据块？](操作系统/04-文件管理/文件系统.md#fileindex-lab)

    从文件偏移出发，追踪直接指针、索引块与正文的位置。

[查看图解实验室全部主题](图解实验室.md){ .md-button }

</section>

<section class="home-section" aria-labelledby="about-this-site" markdown="1">

## 为什么建立这个空间？ { #about-this-site }

!!! abstract "初衷与愿景：我需要一个外置大脑"
    **“好记性不如烂笔头，好代码不如常复盘。”**

    一直以来，知识总是零散地分布在不同的文档和收藏夹里。我建立这个网站，是为了：

    1. **构建知识体系**：将零碎的代码片段、踩过的坑、和底层逻辑体系化地沉淀下来。
    2. **打磨技术深度**：无论是底层的 C++ 架构，还是复杂的算法逻辑，用自己的话写出来才是真的懂了。
    3. **开源与交流**：希望这些笔记不仅能成为我未来的参考书，也能偶尔帮助到路过这里的开发者。

</section>

<section class="home-section home-progress" aria-labelledby="site-roadmap" markdown="1">

## 施工计划 { #site-roadmap }

这个空间会随着我的学习进度持续迭代，目前正在进行和计划整理的内容包括：

- <span class="home-status home-status--ready">已初步整理</span>

    **[C++ 基础核心](c++基础/index.md)**：STL 容器的常用用法、常用算法与语法细节。

- <span class="home-status home-status--ready">已初步整理</span>

    **[算法竞赛](洛谷题目/引言.md)**：童晶老师算法课算法模板与洛谷刷题题解。

- <span class="home-status home-status--ready">已初步整理</span>

    **[计算机组成原理](计算机组成原理/引言.md)**：8 章课堂笔记、习题与 PDF 讲义。

- <span class="home-status home-status--ongoing">整理中</span>

    **[操作系统](操作系统/index.md)**：第 1 章视频题已上线，第 2～5 章已补入部分机制图解与教学算例。

- <span class="home-status home-status--ready">已初步整理</span>

    **[人生思考](人生思考/引言.md)**：我习惯于在独处时反思与复盘，长久以来，我对万事万物的观察与思考，大多静静地躺在 Obsidian 的本地仓库中。但我深知，知识与思想不该是一座孤岛。在这个专栏里，我会将那些或许具有普适意义的碎片整理、“开源”出来。我自认是个略显笨拙、不善言辞的人，但也正因如此，我无比期待能在这里与认知维度更广阔的灵魂相遇，借由你们的视角，帮我打破思维的局限，拓宽眼前的世界。

- <span class="home-status home-status--ready">已初步整理</span>

    **[模式识别](模式识别/引言.md)**：课程应试要点与复习题。

- <span class="home-status">计划中</span>

    **AIGC 与视觉探索**：计算机视觉方向的动手实践。

!!! tip "动态更新"
    这里记录的是网站内容的整理进度，具体以各栏目首页为准。

</section>

<section class="home-section home-signoff" aria-labelledby="parting-note" markdown="1">

## 共勉 { #parting-note }

> 人生就像一段没有回退键的程序，或许会有 Bug，会有死循环，但只要一直在 Run，总能跑出属于自己的美丽花束。
>
> 怕什么真理无穷，进一寸有进一寸的欢喜

</section>

</div>
