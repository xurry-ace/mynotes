---
description: 按访问方式与数据关系选择 C++ STL 容器：vector、stack、queue、priority_queue、set 与 map。
---

# C++ 容器学习地图

记住接口之前，先问两个问题：**数据之间是什么关系？下一步最常取哪一个元素？** 容器的差别首先体现在这些操作规则上，不在于名字长短。

## 先按需要选入口

=== "按位置访问"

    ```mermaid
    flowchart TD
        A[需要按下标访问] --> B{主要存什么}
        B -->|一般元素序列| C[vector]
        B -->|文本字符| D[string]
    ```

=== "按处理顺序"

    ```mermaid
    flowchart TD
        A[下一步取谁] -->|最后加入| B[stack]
        A -->|最先加入| C[queue]
        A -->|当前优先级最高| D[priority_queue]
    ```

=== "按键组织"

    ```mermaid
    flowchart TD
        A[按键组织数据] --> B{需要关联的值吗}
        B -->|只保存键| C[set]
        B -->|键对应值| D[map]
    ```

这是本专栏所整理容器的选用线索。实际选择还要看操作频率、数据规模和迭代器失效规则；这里只画出起点。

## 把接口和算法接起来

<div class="lab-catalog" markdown="1">

- **连续序列**

    [vector：下标与动态容量](vector.md) · [string：文本操作](string.md)

    [观察 vector 扩容](vector.md#vector-lab)：区分已有元素与预留空间。

- **处理顺序**

    [stack：后进先出](stack.md) · [queue：先进先出](queue.md)

    [BFS / DFS 对照](../洛谷题目/8_1/bfs.md#search-demo)：理解容器怎样影响访问顺序。

- **优先级**

    [priority_queue](priority_queue(优先队列).md) 默认取当前最大元素，也可定义小根堆。

    [观察堆的上浮与下沉](priority_queue(优先队列).md#heap-lab)，再看 [Dijkstra](../洛谷题目/10_1/dijkstra算法.md#dijkstra-demo) 为什么需要小根堆。

- **有序键与键值关系**

    [set：有序且键不重复](set.md) · [map：键关联值](map.md)

    常规插入、查找、删除为对数复杂度；有序遍历的顺序由比较规则决定。

</div>

## 三个容易混淆的边界

| 容易混淆 | 应该分清 |
| --- | --- |
| `queue` 与 `priority_queue` | 一个保留先来后到，一个按比较规则取队顶 |
| `vector::size()` 与 `capacity()` | 一个数现有元素，一个表示不重新分配时能容纳的元素数 |
| 容器有序与整个存储区域排好序 | 堆只要求父子之间满足堆序，不保证全局顺序 |

基础接口熟悉后，可以继续看 [algorithm 常用函数](algorithm常用函数.md)、[cmath 常用函数](cmath常用函数.md) 和 [语法易错点](语法易错点（个人向）.md)。
