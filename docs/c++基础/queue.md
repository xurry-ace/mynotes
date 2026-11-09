# C++ STL 容器 `queue` 常见用法总结

`queue` 是 C++ STL 中的**队列容器适配器**，特点是：

- **先进先出（FIFO）**
    
- 只能在**队尾插入**
    
- 只能在**队头删除、访问**
    

`queue` 很常用于：

- BFS 广度优先搜索
    
- 模拟排队过程
    
- 按顺序处理任务
    
- 多源 BFS
    
- 分层遍历
    

---

## 1. 头文件与定义

```cpp
#include <queue>
using namespace std;
```

**基本定义**

```cpp
queue<int> q;
```

定义一个存放 `int` 的队列。

---

## 2. `queue` 的基本特点

队列遵循：

- 先进入的元素先出来
    
- 队尾插入
    
- 队头删除
    

例如：

```cpp
q.push(1);
q.push(2);
q.push(3);
```

此时队列从队头到队尾是：

```cpp
1 2 3
```

---

## 3. 常用操作

### 3.1 `push()`：入队

把元素加入队尾。

```cpp
queue<int> q;
q.push(10);
q.push(20);
q.push(30);
```

---

### 3.2 `pop()`：出队

删除队头元素。

```cpp
q.pop();
```

注意：

- `pop()` **没有返回值**
    
- 想先取值再删除，要先 `front()` 再 `pop()`
    

正确写法：

```cpp
int x = q.front();
q.pop();
```

---

### 3.3 `front()`：访问队头元素

```cpp
cout << q.front() << endl;
```

例如：

```cpp
queue<int> q;
q.push(5);
q.push(8);

cout << q.front() << endl;   // 5
```

---

### 3.4 `back()`：访问队尾元素

```cpp
cout << q.back() << endl;
```

例如：

```cpp
queue<int> q;
q.push(5);
q.push(8);

cout << q.back() << endl;   // 8
```

---

### 3.5 `empty()`：判断是否为空

```cpp
if (q.empty()) {
    cout << "队列为空" << endl;
}
```

返回值：

- 空：`true`
    
- 非空：`false`
    

---

### 3.6 `size()`：返回元素个数

```cpp
cout << q.size() << endl;
```

---

## 4. 基本示例

```cpp
#include <iostream>
#include <queue>
using namespace std;

int main() {
    queue<int> q;

    q.push(1);
    q.push(2);
    q.push(3);

    cout << q.front() << endl;  // 1
    cout << q.back() << endl;   // 3

    q.pop();
    cout << q.front() << endl;  // 2

    cout << q.size() << endl;   // 2

    return 0;
}
```

---

## 5. 遍历 `queue`

`queue` **不能像 `vector` 一样直接遍历**，因为它不提供迭代器。

如果想输出所有元素，只能一边访问一边弹出：

```cpp
while (!q.empty()) {
    cout << q.front() << " ";
    q.pop();
}
```

注意：

- 这样会破坏原队列
    

如果不想破坏原队列，可以先复制一份：

```cpp
queue<int> tmp = q;
while (!tmp.empty()) {
    cout << tmp.front() << " ";
    tmp.pop();
}
```

---

## 6. 常见应用 1：BFS 广度优先搜索

这是 `queue` 最经典的用途。

**图上 BFS 模板**

```cpp
#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;

    vector<vector<int>> g(n + 1);
    vector<bool> vis(n + 1, false);

    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        g[u].push_back(v);
        g[v].push_back(u);
    }

    queue<int> q;
    q.push(1);
    vis[1] = true;

    while (!q.empty()) {
        int u = q.front();
        q.pop();

        cout << u << " ";

        for (int v : g[u]) {
            if (!vis[v]) {
                vis[v] = true;
                q.push(v);
            }
        }
    }

    return 0;
}
```

---

## 7. 常见应用 2：网格最短路

二维地图最短路问题里，`queue` 非常常见。

**四方向 BFS 模板**

```cpp
#include <iostream>
#include <queue>
using namespace std;

const int N = 110;
char g[N][N];
int dista[N][N];
int dx[4] = {-1, 1, 0, 0};
int dy[4] = {0, 0, -1, 1};

struct Node {
    int x, y;
};

int main() {
    int n, m;
    cin >> n >> m;

    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            cin >> g[i][j];
            dista[i][j] = -1;
        }
    }

    queue<Node> q;
    q.push({0, 0});
    dista[0][0] = 0;

    while (!q.empty()) {
        Node t = q.front();
        q.pop();

        for (int k = 0; k < 4; k++) {
            int nx = t.x + dx[k];
            int ny = t.y + dy[k];

            if (nx < 0 || nx >= n || ny < 0 || ny >= m) continue;
            if (g[nx][ny] == '#') continue;
            if (dista[nx][ny] != -1) continue;

            dista[nx][ny] = dista[t.x][t.y] + 1;
            q.push({nx, ny});
        }
    }

    return 0;
}
```

---

## 8. 常见应用 3：模拟排队

例如按顺序处理任务：

```cpp
queue<int> q;
for (int i = 1; i <= 5; i++) q.push(i);

while (!q.empty()) {
    int x = q.front();
    q.pop();
    cout << "处理任务 " << x << endl;
}
```

---

## 9. 常见应用 4：多源 BFS

多个起点一起入队。

```cpp
queue<pair<int, int>> q;

// 把多个起点都放进去
q.push({x1, y1});
q.push({x2, y2});
q.push({x3, y3});
```

这种做法常用于：

- 多个火源扩散
    
- 多个感染点传播
    
- 求离最近源点的距离
    

---

## 10. `queue<pair<int,int>>` 的用法

比赛里特别常见。

```cpp
queue<pair<int, int>> q;

q.push({1, 2});
q.push({3, 4});

auto t = q.front();
q.pop();

cout << t.first << " " << t.second << endl;
```

也可以直接写：

```cpp
int x = q.front().first;
int y = q.front().second;
q.pop();
```

---

## 11. 常见注意事项

### 11.1 使用 `front()`、`back()`、`pop()` 前要先判空

错误写法：

```cpp
queue<int> q;
cout << q.front() << endl;   // 错误
```

正确写法：

```cpp
if (!q.empty()) {
    cout << q.front() << endl;
}
```

---

### 11.2 `pop()` 没有返回值

错误写法：

```cpp
int x = q.pop();   // 错误
```

正确写法：

```cpp
int x = q.front();
q.pop();
```

---

### 11.3 `queue` 不能随机访问

错误理解：

```cpp
q[0]
q.begin()
```

这些都不存在。

`queue` 只能访问：

- 队头 `front()`
    
- 队尾 `back()`
    

---

### 11.4 `queue` 不适合查找中间元素

如果题目需要：

- 遍历查找
    
- 删除中间元素
    
- 按下标访问
    

那通常不适合用 `queue`，更适合：

- `vector`
    
- `deque`
    
- `list`
    

---

## 12. 蓝桥杯常见模板

### 12.1 基础模板

```cpp
queue<int> q;

q.push(1);
q.push(2);
q.push(3);

while (!q.empty()) {
    cout << q.front() << " ";
    q.pop();
}
```

---

### 12.2 BFS 模板

```cpp
queue<int> q;
q.push(s);
vis[s] = true;

while (!q.empty()) {
    int u = q.front();
    q.pop();

    for (int v : g[u]) {
        if (!vis[v]) {
            vis[v] = true;
            q.push(v);
        }
    }
}
```

---

### 12.3 存坐标模板

```cpp
queue<pair<int, int>> q;
q.push({sx, sy});

while (!q.empty()) {
    int x = q.front().first;
    int y = q.front().second;
    q.pop();

    // 扩展相邻状态
}
```

---

## 13. 一份完整示例代码

```cpp
#include <iostream>
#include <queue>
using namespace std;

int main() {
    queue<int> q;

    q.push(10);
    q.push(20);
    q.push(30);

    cout << "队头元素: " << q.front() << endl;
    cout << "队尾元素: " << q.back() << endl;
    cout << "队列大小: " << q.size() << endl;

    q.pop();

    cout << "出队后队头: " << q.front() << endl;

    while (!q.empty()) {
        cout << q.front() << " ";
        q.pop();
    }
    cout << endl;

    return 0;
}
```

---

## 14. `queue` 和 `stack` 的区别

|容器|规则|访问位置|删除位置|
|---|---|---|---|
|`stack`|后进先出|栈顶|栈顶|
|`queue`|先进先出|队头|队头|

你可以这样记：

- `stack`：像一摞盘子，最后放上去的先拿
    
- `queue`：像排队打饭，先来的先处理
    

---

## 15. 总结

`queue` 的核心特点：

- **先进先出**
    
- **队尾插入，队头删除**
    
- 常用函数：`push()`、`pop()`、`front()`、`back()`、`empty()`、`size()`
    

蓝桥杯里最常见的使用方向：

- **BFS**
    
- **网格最短路**
    
- **状态扩展**
    
- **模拟排队**
    

---

## 16. 必背内容

```cpp
queue<int> q;

q.push(x);      // 入队
q.pop();        // 出队
q.front();      // 队头
q.back();       // 队尾
q.empty();      // 判空
q.size();       // 元素个数
```

以及最重要的一句：

```cpp
int x = q.front();
q.pop();
```

因为 `pop()` 本身不返回值。

---
