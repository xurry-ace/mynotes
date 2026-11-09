# A*（A-Star）启发式搜索算法

!!! tip "参考资料"
    - [B站讲解](https://www.bilibili.com/video/BV1wM41137vm/)
    - [CSDN 博客详解](https://blog.csdn.net/weixin_65256277/article/details/143493212)

## 1. 🗺️ A* 算法简介

A*（A-Star）是一种用于求**单源最短路径（特别是已知终点时）**的启发式搜索算法，用于在庞大的地图或状态空间中寻找从起点到终点的最优路线。典型场景包括：

- 游戏中 NPC 自动寻路
- 地图导航的最短路线
- 解决八数码（15 数码）拼图复原

## 2. ✅ 适用条件

A* 适用于以下场景：

- **边权值非负**（与 Dijkstra 一样，不能有负权边）
- **明确知道起点和终点**
- **搜索空间巨大**，普通盲目搜索（BFS / Dijkstra）会超时或超内存

只要能为目标设计出合理的“预估距离”，一般都可用 A*。

## 3. 🧠 核心思想

每次从当前未确定的点中，选出**综合预估总代价最小的点**，然后用它去扩展周围的点。核心评估公式为：

$$
F = G + H
$$

- $G$：从起点走到当前点的**实际代价**
- $H$：从当前点走到终点的**预估代价（启发函数）**
- $F$：总评估代价（优先选择 $F$ 值最小的节点向外扩展）

## 4. 📏 启发函数（$H$ 值）

启发函数是 A* 区别于其他盲目搜索算法的灵魂，常见距离度量包括：

- **曼哈顿距离**：适用于网格图，只能上下左右四向移动（$|x_1 - x_2| + |y_1 - y_2|$）
- **欧几里得距离**：适用于可以沿任意方向移动的直线距离（$\sqrt{(x_1 - x_2)^2 + (y_1 - y_2)^2}$）
- **切比雪夫距离**：适用于网格图，允许八向移动（$\max(|x_1 - x_2|, |y_1 - y_2|)$）

## 5. 🍎 举例理解

在网格图中找路，起点到终点中间有一堵墙：

- **Dijkstra**：像水波一样向四面八方均匀蔓延，直到碰到终点。
- **A\***：像装了雷达一样直奔终点方向走，碰到墙再尝试绕路——因为 $H$ 值的存在，算法有了明确的“方向感”。

## 6. ⚙️ 基础逻辑（Open / Closed 表）

- **Open 表（待检查队列）**：存放已发现、但还没扩展邻居的节点。
- **Closed 表（已检查集合）**：存放已经彻底扩展完的节点。
- **执行过程**：
  1. 每次从 Open 表取出 $F$ 最小的节点，放入 Closed 表；
  2. 检查它的所有邻居，计算新的 $G$ 和 $F$ 并放入 Open 表。

## 7. 💻 堆优化模板（竞赛常用）

适合网格寻路与状态空间搜索，使用 `priority_queue` 维护最小 $F$ 值：

```cpp
#include <iostream>
#include <queue>
#include <vector>
using namespace std;

const int INF = 1e9;

struct Node {
    int x, y, g, h, f;
    bool operator<(const Node& a) const {
        return f > a.f; // 优先队列，F值小的优先出队
    }
};

void astar(Node start, Node end) {
    priority_queue<Node> q;
    
    start.g = 0;
    start.h = get_h(start, end); // 计算启发值
    start.f = start.g + start.h;
    q.push(start);

    while(!q.empty()) {
        Node u = q.top();
        q.pop();

        if(u.x == end.x && u.y == end.y) {
            // 找到终点
            return;
        }

        if(vis[u.x][u.y]) continue;
        vis[u.x][u.y] = true;

        for(auto next : get_neighbors(u)) {
            int new_g = u.g + cost(u, next);
            
            if(new_g < dis[next.x][next.y]) {
                dis[next.x][next.y] = new_g;
                next.g = new_g;
                next.h = get_h(next, end);
                next.f = next.g + next.h;
                q.push(next);
            }
        }
    }
}
```

```cpp
#include <iostream>
#include <queue>
#include <vector>
#include <cstring>
#include <cmath>
using namespace std;

const int INF = 1e9;
const int N = 105;

int n = 5, m = 5;          // 地图大小
bool vis[N][N];            // 是否访问过
int dis[N][N];             // 最短距离
int mp[N][N];              // 地图，0可走，1障碍

struct Node {
    int x, y, g, h, f;
    bool operator<(const Node& a) const {
        return f > a.f;   // f小的优先
    }
};

/// 启发函数：曼哈顿距离
int get_h(Node a, Node b) {
    return abs(a.x - b.x) + abs(a.y - b.y);
}

/// 移动代价：走一步花费1
int cost(Node a, Node b) {
    return 1;
}

/// 获取邻居（上下左右）
vector<Node> get_neighbors(Node u) {
    vector<Node> res;

    int dx[4] = {1,-1,0,0};
    int dy[4] = {0,0,1,-1};

    for(int i=0;i<4;i++) {
        int nx = u.x + dx[i];
        int ny = u.y + dy[i];

        if(nx < 1 || nx > n || ny < 1 || ny > m) continue;
        if(mp[nx][ny] == 1) continue; // 障碍物不能走

        res.push_back({nx, ny, 0, 0, 0});
    }

    return res;
}

void astar(Node start, Node end) {
    priority_queue<Node> q;

    memset(vis, false, sizeof(vis));

    for(int i=1;i<=n;i++)
        for(int j=1;j<=m;j++)
            dis[i][j] = INF;

    start.g = 0;
    start.h = get_h(start, end);
    start.f = start.g + start.h;

    dis[start.x][start.y] = 0;
    q.push(start);

    while(!q.empty()) {
        Node u = q.top();
        q.pop();

        if(u.x == end.x && u.y == end.y) {
            cout << "最短距离 = " << u.g << endl;
            return;
        }

        if(vis[u.x][u.y]) continue;
        vis[u.x][u.y] = true;

        for(auto next : get_neighbors(u)) {
            int new_g = u.g + cost(u, next);

            if(new_g < dis[next.x][next.y]) {
                dis[next.x][next.y] = new_g;

                next.g = new_g;
                next.h = get_h(next, end);
                next.f = next.g + next.h;

                q.push(next);
            }
        }
    }

    cout << "无法到达终点\n";
}

int main() {
    Node start = {1,1,0,0,0};
    Node end   = {5,5,0,0,0};

    mp[3][3] = 1; // 障碍物

    astar(start, end);

    return 0;
}
```

**示例迷宫**
```cpp
#include <bits/stdc++.h>
using namespace std;

struct Node{
    int x,y,g,h,f;
    bool operator<(const Node& a)const{
        return f>a.f;
    }
};

int n,m;
char mp[105][105];
int dis[105][105];
bool vis[105][105];

int dx[4]={1,-1,0,0};
int dy[4]={0,0,1,-1};

int h(int x,int y,int ex,int ey){
    return abs(x-ex)+abs(y-ey);
}

int astar(int sx,int sy,int ex,int ey){
    priority_queue<Node> q;
    memset(dis,0x3f,sizeof dis);

    q.push({sx,sy,0,h(sx,sy,ex,ey),h(sx,sy,ex,ey)});
    dis[sx][sy]=0;

    while(!q.empty()){
        Node u=q.top(); q.pop();

        if(vis[u.x][u.y]) continue;
        vis[u.x][u.y]=1;

        if(u.x==ex&&u.y==ey) return u.g;

        for(int i=0;i<4;i++){
            int nx=u.x+dx[i];
            int ny=u.y+dy[i];

            if(nx<1||ny<1||nx>n||ny>m) continue;
            if(mp[nx][ny]=='#') continue;

            int ng=u.g+1;

            if(ng<dis[nx][ny]){
                dis[nx][ny]=ng;
                int hh=h(nx,ny,ex,ey);
                q.push({nx,ny,ng,hh,ng+hh});
            }
        }
    }
    return -1;
}
```

## 8. 🚀 为什么比 Dijkstra 快

- **Dijkstra 属于盲目搜索**：会探索很多背离终点的无用方向。
- **A\* 带有启发性**：优先探索离终点“看起来更近”的方向，在广阔地图中遍历的节点数量大幅减少。

## 9. 🎯 常见题型

- **迷宫寻路**：起点到终点的最少步数（带复杂障碍物）。
- **状态压缩与转化**：八数码（15 数码）问题求最少还原步数。
- **$K$ 短路问题**：A* 配合其他图论算法求前 $K$ 条最短路径。

## 10. ⚠️ 常见错误

1. **$H$ 值高估实际距离**：如果预估的 $H$ 大于实际距离，A* 可能找不到最优解，退化为普通贪心。记住：**$H$ 值必须小于或等于实际代价（可采纳性）**。
2. **没有使用优先队列**：每次找最小 $F$ 变成 $O(n)$，导致严重超时。
3. **未处理节点更新**：如果在 Open 表中发现同一个点有更短的 $G$ 值，必须用新的状态更新入堆。

## 11. 🔍 如何判断使用 A*

看到以下特征时通常考虑 A*：

- 单起点到单终点（明确了具体目标）
- 地图/网格寻路或状态转移求最少步数
- 普通 BFS / Dijkstra 空间或时间爆炸

## 12. 💡 一句话理解

> **A\*** $=$ **Dijkstra 的求稳**（实际走过的距离 $G$）$+$ **贪心算法的直觉**（预估剩下的距离 $H$）。

## 13. 📝 总结

A* 是人工智能和游戏开发中最常用的启发式寻路算法之一，核心记住三点：

1. 用于**单点到单点**最优解；
2. 核心评估公式为 $F = G + H$；
3. 启发函数 $H$ 值**绝对不能高估实际距离**。