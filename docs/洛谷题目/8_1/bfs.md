# BFS（广度优先搜索）

!!! tip
    [B站讲解](https://www.bilibili.com/video/BV16C4y1s7EF/)      
    [CSDN](https://blog.csdn.net/m0_73633807/article/details/141162183)

## 1. BFS（广度优先搜索）

BFS 全称：

> Breadth First Search

中文叫：

> 广度优先搜索

它的核心思想是：

> 从起点开始，一层一层向外扩展。

就像水波纹一样：

```text
中心点
→ 第一层
→ 第二层
→ 第三层
```

先搜索近的，再搜索远的。

## 动手看：同一棵树，两种搜索顺序 { #search-demo }

下面是自拟的无权树示例，从 `A` 出发，同一节点的孩子按图中从左到右的顺序访问。BFS 的每一步表示**取出队头，再把未发现的孩子入队**；发现时就标记，避免重复加入。

<div class="study-viz" data-study-viz="search" data-mode="bfs">
<p class="study-viz__fallback">静态读图：A 的孩子是 B、C；B 的孩子是 D、E；C 的孩子是 F。BFS 出队顺序为 A、B、C、D、E、F；递归 DFS 首次进入节点的顺序为 A、B、D、E、C、F。启用 JavaScript 后可切换两种方式并逐步查看。</p>
</div>

这里的“层”对应从起点走过的边数，因此适用于**无权图或各边代价相同的图**。若边的代价不同，仅按步数扩展不能保证总代价最小，参见 [Dijkstra 的距离更新](../10_1/dijkstra算法.md#dijkstra-demo)。队列操作可回看 [queue](../../c++基础/queue.md)。

## 2. BFS 能解决什么问题

最常见用途：

* 最短路径（无权图）
* 迷宫最少步数
* 连通块搜索
* 状态转换问题
* 多源扩散问题

例如：

```text 
从 A 走到 B 最少几步？
```

BFS 非常适合。

## 3. BFS 为什么能求最短路

因为 BFS 按层扩展：

```text 
第1层：走1步能到的位置
第2层：走2步能到的位置
第3层：走3步能到的位置
```

第一次到达终点时，一定是最少步数。

这就是 BFS 最重要的性质。

## 4. BFS 核心数据结构

BFS 使用：

> 队列（queue）

特点：

* 先进先出
* 先加入的点先搜索

非常符合“一层一层扩展”。

## 5. BFS 基本模板（图 / 网格通用）

```cpp 
queue<节点> q;

q.push(起点);
vis[起点] = true;

while(!q.empty())
{
    节点 cur = q.front();
    q.pop();

    for(所有下一步位置)
    {
        if(合法 && 未访问)
        {
            vis[新点] = true;
            q.push(新点);
        }
    }
}
```

核心流程：

* 起点入队
* 取队头
* 扩展邻居
* 新点入队
* 重复直到队空

## 6. 迷宫最短步数例题

地图：

```text 
S . .
# # .
. . E
```

要求：

```text 
从 S 到 E 最少走几步
```

做法：

* S 入队
* 向四周走
* 记录步数
* 第一次到 E 即答案

## 7. 二维网格 BFS 模板

```cpp 
#include <iostream>
#include <queue>
using namespace std;

struct Node
{
    int x, y, step;
};

char g[105][105];
bool vis[105][105];
int n, m;

int dx[4] = {-1, 1, 0, 0};
int dy[4] = {0, 0, -1, 1};

int bfs(int sx, int sy)
{
    queue<Node> q;
    q.push({sx, sy, 0});
    vis[sx][sy] = true;

    while(!q.empty())
    {
        Node cur = q.front();
        q.pop();

        if(g[cur.x][cur.y] == 'E')
            return cur.step;

        for(int i = 0; i < 4; i++)
        {
            int nx = cur.x + dx[i];
            int ny = cur.y + dy[i];

            if(nx >= 0 && nx < n &&
               ny >= 0 && ny < m &&
               !vis[nx][ny] &&
               g[nx][ny] != '#')
            {
                vis[nx][ny] = true;
                q.push({nx, ny, cur.step + 1});
            }
        }
    }

    return -1;
}
```

## 8. BFS 和 DFS 的区别

| 算法  | 搜索方式      | 常见用途  |
| --- | --------- | ----- |
| DFS | 一条路走到底再回退 | 枚举、回溯 |
| BFS | 一层一层扩展    | 最短路   |

简单理解：

* DFS 更像钻洞
* BFS 更像扩散

## 9. 常见题型

**迷宫最短路**

从起点到终点最少步数。

**图最短路径**

无权图中两点距离。

**状态变换**

例如数字变化、字符串变换。

**多源 BFS**

多个起点同时扩散。

**泛洪搜索**

统计连通块。

## 10. 常见错误

**忘记标记访问**

会重复入队，甚至死循环。

**出队后才标记**

容易重复加入多个相同点。

正确做法：

```cpp 
入队时标记 vis
```

**边界判断错误**

二维地图题最常见。

**把 BFS 当 DFS 写**

使用栈或递归就不是 BFS。

## 11. 如何判断用 BFS

看到这些关键词时优先考虑：

* 最少步数
* 最短路径
* 几次操作到达目标
* 扩散传播
* 无权图距离

通常 BFS 非常合适。

## 12. 一句话理解

> BFS = 从起点开始，一层一层向外搜索。

## 13. 总结

BFS 是搜索题核心算法之一。

记住三点：

* 用队列
* 按层扩展
* 第一次到终点就是最优答案

这是迷宫题、图论入门题、最短路径题的高频算法。
