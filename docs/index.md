---
description: xurry 的个人笔记网站：用知识地图、机制图解与交互实验连接 C++、Python、算法、计算机系统和模式识别。
hide:
  - navigation
  - toc
---

<div class="learning-home" markdown="1">

<div class="home-hero" markdown="1">

<div class="home-hero__copy" markdown="1">

<span class="home-eyebrow">代码 · 系统 · 思考</span>

# xurry 的代码空间

<p class="home-hero__lead">把零散知识，连成能解释问题的线索。</p>

这是一个纯粹的、用于记录技术成长与思考的个人数字花园。

<div class="home-actions" markdown="1">

[进入图解实验室](图解实验室.md){ .md-button .md-button--primary }
[查看知识地图](#knowledge-map){ .md-button }

</div>

<span class="home-hero__note">9 个交互主题 · 从原笔记出发 · 一步步观察机制</span>

</div>

<div class="home-hero__art" markdown="1">

![书页、树状节点、书籍和电路组成的知识花园插画](assets/illustrations/knowledge-garden.webp){ width="1536" height="1024" loading="eager" fetchpriority="high" }

</div>

</div>

## 先带着一个问题来 { #start-with-a-question }

抽象概念读起来容易相似，真正拉开差别的是**条件、状态和变化过程**。从一个具体问题出发，看清机制，再回到完整笔记。

<div class="lab-catalog home-experiments" markdown="1">

- <span class="lab-tag">计算机组成 · 可交互</span>

    **Cache 明明还有空行，为什么照样冲突？**

    同样的容量，两种映射；看一块数据究竟能放在哪里。

    [观察 Cache 落点 →](计算机组成原理/第3章：存储系统.md#cache-lab)

- <span class="lab-tag">Python · 可交互</span>

    **只改了一个列表，为什么三个名字都变了？**

    把变量绑定、外层复制与内层共享分开画出来。

    [观察对象引用 →](python基础/第2章：字符串、列表、字典、元组.md#reference-lab)

- <span class="lab-tag">模式识别 · 可交互</span>

    **降低分类阈值，得到的都是真正例吗？**

    从四个样本出发，联动看预测、混淆矩阵和 ROC。

    [移动阈值看看 →](模式识别/考试复习.md#metrics-lab)

- <span class="lab-tag">算法 · 可交互</span>

    **同一棵树，队列和递归会先处理谁？**

    不只看访问顺序，还看队列与调用链怎样变化。

    [对照 BFS / DFS →](洛谷题目/8_1/bfs.md#search-demo)

</div>

## 按知识地图阅读 { #knowledge-map }

语言和容器是表达工具，算法组织求解步骤，计算机系统解释程序怎样运行。它们可以交叉阅读，不必等一门学完再看下一门。

<div class="knowledge-atlas" markdown="1">

<section class="knowledge-lane" markdown="1">

<span class="knowledge-lane__label">01 / 表达与实现</span>

### 把想法写成程序

变量、控制流、函数，再到常用容器。

[C++ 容器](c++基础/index.md) · [Python 基础](python基础/引言.md)

<span class="knowledge-lane__bridge">↓ 为算法提供实现工具</span>

</section>

<section class="knowledge-lane" markdown="1">

<span class="knowledge-lane__label">02 / 建模与求解</span>

### 从题意找到算法

缩小范围、递推状态、搜索路径。

[算法知识地图](洛谷题目/引言.md#algorithm-map) · [二分逐步演示](洛谷题目/1_1/二分查找.md#binary-demo)

<span class="knowledge-lane__bridge">↔ 用代码验证推理过程</span>

</section>

<section class="knowledge-lane" markdown="1">

<span class="knowledge-lane__label">03 / 运行与管理</span>

### 看懂程序背后的系统

硬件执行指令，操作系统管理资源。

[计算机组成原理](计算机组成原理/引言.md) · [操作系统](操作系统/index.md)

<span class="knowledge-lane__bridge">↔ 把软件行为与硬件机制接起来</span>

</section>

<section class="knowledge-lane" markdown="1">

<span class="knowledge-lane__label">04 / 数据与思考</span>

### 从观察走向理解

一条线学习数据与模型，一条线记录生活中的思考。

[模式识别](模式识别/引言.md) · [人生思考](人生思考/引言.md)

<span class="knowledge-lane__bridge">两条阅读支线，可按兴趣进入</span>

</section>

</div>


<div class="learning-route" markdown="1">

<span class="learning-route__label">把栏目连起来</span>

[容器与访问规则](c++基础/index.md) → [算法与状态变化](洛谷题目/引言.md#algorithm-map) → [指令怎样执行](计算机组成原理/第5章：中央处理器.md#pipeline-lab)

[Python 对象](python基础/引言.md#python-map) → [数据与数组](python基础/第7章：重点突破--Numpy库.ipynb) → [模型与评估](模式识别/引言.md#pattern-map)

</div>

<details class="home-about" markdown="1">
<summary>关于这个空间：初衷、施工计划与内容进度</summary>

## 🎯 为什么建立这个空间？

!!! abstract "初衷与愿景：我需要一个外置大脑"
    **“好记性不如烂笔头，好代码不如常复盘。”**
    
    一直以来，知识总是零散地分布在不同的文档和收藏夹里。我建立这个网站，是为了：

    1. **构建知识体系**：将零碎的代码片段、踩过的坑、和底层逻辑体系化地沉淀下来。
    2. **打磨技术深度**：无论是底层的 C++ 架构，还是复杂的算法逻辑，用自己的话写出来才是真的懂了。
    3. **开源与交流**：希望这些笔记不仅能成为我未来的参考书，也能偶尔帮助到路过这里的开发者。

---

## 🚧 施工计划

这个空间会随着我的学习进度持续迭代，目前正在进行和计划整理的内容包括：

- [x] **C++ 基础核心**：STL 容器的常用用法、常用算法与语法细节。
- [x] **算法竞赛**：童晶老师算法课算法模板与洛谷刷题题解。
- [x] **[计算机组成原理](计算机组成原理/引言.md)**：8 章课堂笔记、习题与 PDF 讲义。
- [ ] **[操作系统](操作系统/index.md)**：第 1 章视频题已上线，其余章节正在整理。
- [x] **[人生思考](人生思考/引言.md)**：我习惯于在独处时反思与复盘，长久以来，我对万事万物的观察与思考，大多静静地躺在 Obsidian 的本地仓库中。但我深知，知识与思想不该是一座孤岛。在这个专栏里，我会将那些或许具有普适意义的碎片整理、“开源”出来。我自认是个略显笨拙、不善言辞的人，但也正因如此，我无比期待能在这里与认知维度更广阔的灵魂相遇，借由你们的视角，帮我打破思维的局限，拓宽眼前的世界。
- [x] **[模式识别](模式识别/引言.md)**：课程应试要点与复习题。
- [ ] **AIGC 与视觉探索**：计算机视觉方向的动手实践，计划中。


!!! tip "动态更新"
    带有 `[x]` 的表示已经初步整理并在左侧导航栏上线，带有 `[ ]` 的模块还在整理中；具体进度以各栏目首页为准。

</details>

## 💡 共勉

!!! quote "写在最后"
    **“人生就像一段没有回退键的程序，或许会有 Bug，会有死循环，但只要一直在 Run，总能跑出属于自己的美丽花束。”**
    
    怕什么真理无穷，进一寸有进一寸的欢喜

</div>
