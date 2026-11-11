# Dijkstra 单源最短路径算法

!!! tip "参考资料"
    - [B站讲解](https://www.bilibili.com/video/BV1MU4y1D729)
    - [CSDN 博客详解](https://blog.csdn.net/SWEENEY_HE/article/details/81368342)

## 1. Dijkstra 算法简介

Dijkstra 是一种用于求 **单源最短路径** 的经典算法。

意思是：

> 从一个起点出发，求它到其他所有点的最短距离。

例如：

```text
1号点到2号点最短多远
1号点到3号点最短多远
1号点到n号点最短多远
```

都可以用 Dijkstra。

## 2. 适用条件

Dijkstra 适用于：

> 边权值非负（不能有负边）

例如：

```text 
A -> B 花费 5
A -> C 花费 2
```

权值表示：

* 距离
* 时间
* 花费
* 代价

只要不出现负数，一般可用 Dijkstra。

## 3. 核心思想

每次从当前未确定的点中，选出：

> 距离起点最近的点

然后用它去更新其他点距离。

就像石子落水：

* 起点距离是 0
* 最近点先确定
* 再不断向外扩展

## 4. 举例理解

图：

```text 
1 --2--> 2
1 --5--> 3
2 --1--> 3
```

从 `1` 出发。

初始：

```text 
dis[1]=0
dis[2]=∞
dis[3]=∞
```

先更新：

```text 
dis[2]=2
dis[3]=5
```

再选最近点 `2`，通过它更新：

```text 
dis[3]=min(5, 2+1)=3
```

最终：

```text 
1 到 3 最短路 = 3
```

## 动手看：发现一条路，不等于确定最短路 { #dijkstra-demo }

将上面的三个点画出来。箭头表示有向边，边旁数字是权值；每一步**选择一个距离最小的未确定节点，再检查它的出边**。更新为更小的距离，称为“松弛”。

<div class="study-viz" data-study-viz="dijkstra">
<p class="study-viz__fallback">静态读图：有向边为 1→2（权 2）、1→3（权 5）、2→3（权 1）。初始距离为 [0, ∞, ∞]；确定节点 1 后为 [0, 2, 5]；确定节点 2 后，节点 3 的暂定距离从 5 改为 3；最后确定节点 3，结果为 [0, 2, 3]。启用 JavaScript 后可逐步操作。</p>
</div>

!!! question "节点 3 第一次得到距离 5，为什么还不能结束？"
    此时只是发现了路径 `1 → 3`。经过节点 `2` 后，路径 `1 → 2 → 3` 的长度是 `2 + 1 = 3`，还能更短。Dijkstra 保证的是：**在非负边权条件下，每次选出的最小暂定距离可以确定为最终距离**。不要把“第一次被发现”和“最短路已确定”混为一谈。

这里画的是三个点的抽象距离变化；下方的堆优化实现还会出现重复入堆和跳过已确定节点的操作。两者使用相同的贪心依据。可对照 [优先队列](../../c++基础/priority_queue(优先队列).md) 与 [单源最短路径题解](单源最短路径.md)。

## 5. 基础版（邻接矩阵）

适合稠密图、小数据。

```cpp 
#include <iostream>   // 输入输出流库，提供 cin / cout
#include <cstring>    // 提供 memset 等函数
using namespace std;  // 使用标准命名空间，省去 std::

const int INF = 1e9;  // 定义无穷大，表示两点之间不可达

int g[105][105];      // 邻接矩阵，g[i][j] 表示 i -> j 的边权
int dis[105];         // dis[i] 表示起点到 i 的当前最短距离
bool vis[105];        // vis[i] = true 表示该点最短路已确定

int n, m;             // n = 点数，m = 边数

// Dijkstra 算法，求起点 s 到所有点的最短路
void dijkstra(int s)
{
    // 初始化所有距离为无穷大
    for(int i = 1; i <= n; i++)
        dis[i] = INF;

    dis[s] = 0;   // 起点到自身距离为 0

    // 总共进行 n 次操作，每次确定一个点的最短路
    for(int i = 1; i <= n; i++)
    {
        int u = -1;   // 当前要选出的最近点

        // 找一个未访问过，并且距离最小的点 u
        for(int j = 1; j <= n; j++)
        {
            if(!vis[j] && (u == -1 || dis[j] < dis[u]))
                u = j;
        }

        vis[u] = true;   // 标记该点最短路已确定

        // 用 u 更新其他点的距离（松弛操作）
        for(int v = 1; v <= n; v++)
        {
            dis[v] = min(dis[v], dis[u] + g[u][v]);
        }
    }
}
```

复杂度：

```text 
O(n²)
```

## 6. 堆优化版（最常用）

适合大数据、稀疏图。

使用：

```cpp 
priority_queue
```

复杂度：

```text 
O((n+m)logn)
```

## 7. 堆优化模板（竞赛常用）

```cpp 
#include <iostream>   // 输入输出
#include <vector>     // 动态数组 vector
#include <queue>      // 优先队列 priority_queue
using namespace std;

const int INF = 1e9;       // 无穷大，表示距离未知
const int N = 100005;      // 最大点数

// 邻接表：g[u] 存储点 u 连出去的边
// pair<终点, 权值>
vector<pair<int,int>> g[N];

int dis[N];    // dis[i] = 起点到 i 的最短距离
bool vis[N];   // vis[i] = true 表示该点最短路已确定

int n, m;      // n 个点，m 条边

// 堆优化 Dijkstra
void dijkstra(int s)
{
    // 初始化所有距离为无穷大
    for(int i = 1; i <= n; i++)
        dis[i] = INF;

    // 小根堆：
    // pair<距离, 点编号>
    // 距离最小的点优先弹出
    priority_queue<
        pair<int,int>,
        vector<pair<int,int>>,
        greater<pair<int,int>>
    > q;

    dis[s] = 0;          // 起点到自己距离为 0
    q.push({0, s});      // 把起点放入堆中

    while(!q.empty())
    {
        int u = q.top().second; // 取出当前最近的点
        q.pop();

        // 如果该点已经处理过，跳过
        if(vis[u]) continue;

        vis[u] = true;   // 标记最短路已确定

        // 枚举 u 的所有邻边
        for(auto e : g[u])
        {
            int v = e.first;   // 邻点
            int w = e.second;  // 边权

            // 松弛操作：
            // 如果经过 u 到 v 更短，就更新
            if(dis[v] > dis[u] + w)
            {
                dis[v] = dis[u] + w;

                // 新距离入堆
                q.push({dis[v], v});
            }
        }
    }
}
```

## 8. 为什么要用优先队列

因为每次都要找：

> 当前距离最小的点

普通找法：

```text 
O(n)
```

优先队列找最小值更快。

## 9. 常见题型

**最短路径**

起点到终点最短距离。

**最少花费**

最小费用到达目标。

**最短时间**

城市交通、地铁路线。

**多次询问单源最短路**

先跑一次，再回答多个点。

## 10. 常见错误

**图有负边还用 Dijkstra**

会出错。

负边应用 Bellman-Ford / SPFA。

**数组没初始化**

```cpp 
dis[i] = INF
```

必须初始化。

**重复入堆不会处理**

堆优化版要写：

```cpp 
if(vis[u]) continue;
```

**无向图只加单边**

无向图应加两次边。

## 11. 如何判断使用 Dijkstra

看到这些关键词：

* 最短路
* 最少花费
* 最快到达
* 边权非负
* 单个起点

通常考虑 Dijkstra。

## 12. 一句话理解

> Dijkstra = 每次确定离起点最近的点，并更新周围距离。

## 13. 总结

Dijkstra 是图论最重要算法之一。

记住三点：

* 求单源最短路
* 不能有负边
* 堆优化最常用

蓝桥杯、算法课、竞赛题中非常高频。
