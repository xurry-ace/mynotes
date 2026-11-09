# C++ STL 容器 `priority_queue`（优先队列）常见用法总结

`priority_queue` 是 C++ STL 中的**优先队列**，本质上通常是用**堆**实现的。  
它和普通 `queue` 不同：

- 普通 `queue`：先进先出
    
- `priority_queue`：**优先级高的元素先出**
    

默认情况下，`priority_queue` 是一个**大根堆**：

- 最大的元素在队顶
    
- 每次取出的都是当前最大的元素
    

在蓝桥杯中，它常用于：

- 堆排序思想
    
- 动态维护最大值 / 最小值
    
- 贪心
    
- Dijkstra 最短路
    
- Top K 问题
    
- 模拟“每次取最优”的过程
    

---

## 1. 头文件与定义

```cpp
#include <queue>
using namespace std;
```

**默认定义：大根堆**

```cpp
priority_queue<int> q;
```

表示：

- 队顶元素最大
    
- 每次弹出最大值
    

---

## 2. 基本特点

例如：

```cpp
priority_queue<int> q;
q.push(3);
q.push(1);
q.push(5);
q.push(2);
```

队列内部不是按插入顺序排列，而是按优先级组织。

此时：

```cpp
q.top() == 5
```

因为默认最大元素优先。

---

## 3. 常用操作

### 3.1 `push()`：插入元素

```cpp
priority_queue<int> q;
q.push(10);
q.push(30);
q.push(20);
```

---

### 3.2 `top()`：访问队顶元素

```cpp
cout << q.top() << endl;
```

输出当前优先级最高的元素。

默认大根堆中就是最大值。

---

### 3.3 `pop()`：删除队顶元素

```cpp
q.pop();
```

注意：

- `pop()` **没有返回值**
    
- 想取值再删除，要先 `top()` 再 `pop()`
    

正确写法：

```cpp
int x = q.top();
q.pop();
```

---

### 3.4 `empty()`：判断是否为空

```cpp
if (q.empty()) {
    cout << "空" << endl;
}
```

---

### 3.5 `size()`：返回元素个数

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
    priority_queue<int> q;

    q.push(4);
    q.push(1);
    q.push(7);
    q.push(3);

    cout << q.top() << endl;  // 7

    q.pop();
    cout << q.top() << endl;  // 4

    return 0;
}
```

---

## 5. 遍历 `priority_queue`

`priority_queue` **不能直接遍历**，因为它没有迭代器。

如果想输出所有元素，只能一边取队顶一边弹出：

```cpp
while (!q.empty()) {
    cout << q.top() << " ";
    q.pop();
}
```

输出结果是：

```cpp
从大到小
```

如果不想破坏原队列，可以先复制：

```cpp
priority_queue<int> tmp = q;
while (!tmp.empty()) {
    cout << tmp.top() << " ";
    tmp.pop();
}
```

---

## 6. 默认是大根堆

这是最常考的地方。

```cpp
priority_queue<int> q;
```

等价理解为：

- 最大值优先
    
- `top()` 返回最大元素
    

示例：

```cpp
priority_queue<int> q;
q.push(2);
q.push(9);
q.push(5);

cout << q.top() << endl;   // 9
```

---

## 7. 小根堆写法

比赛中也非常常用。

**写法**

```cpp
priority_queue<int, vector<int>, greater<int>> q;
```

解释：

- 第一个 `int`：元素类型
    
- 第二个 `vector<int>`：底层容器
    
- 第三个 `greater<int>`：比较规则，表示小的优先
    

这样就是**小根堆**，队顶是最小值。

**示例**

```cpp
priority_queue<int, vector<int>, greater<int>> q;
q.push(4);
q.push(1);
q.push(7);

cout << q.top() << endl;   // 1
```

---

## 8. 大根堆和小根堆对比

**大根堆**

```cpp
priority_queue<int> q;
```

特点：

- `top()` 是最大值
    

**小根堆**

```cpp
priority_queue<int, vector<int>, greater<int>> q;
```

特点：

- `top()` 是最小值
    

---

## 9. 存储 `pair`

蓝桥杯里很常见，特别是图论、最短路。

```cpp
priority_queue<pair<int, int>> q;
```

`pair` 默认按**字典序**比较：

- 先比较 `first`
    
- 如果 `first` 相同，再比较 `second`
    

**示例**

```cpp
priority_queue<pair<int, int>> q;
q.push({2, 10});
q.push({5, 3});
q.push({5, 8});

cout << q.top().first << " " << q.top().second << endl;
```

输出：

```cpp
5 8
```

因为：

- 先比 `first`
    
- `5 > 2`
    
- 在 `{5,3}` 和 `{5,8}` 中，比较 `second`
    
- `8 > 3`
    

---

## 10. 小根堆存 `pair`

```cpp
priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> q;
```

例如：

```cpp
priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> q;

q.push({3, 100});
q.push({1, 200});
q.push({2, 300});

cout << q.top().first << " " << q.top().second << endl;   // 1 200
```

这在 Dijkstra 中很常见，比如：

```cpp
{距离, 节点编号}
```

让距离最小的状态先出来。

---

## 11. 常见应用 1：动态维护最大值

```cpp
priority_queue<int> q;
q.push(5);
q.push(2);
q.push(9);

cout << q.top() << endl;   // 当前最大值 9
```

适合需要反复取最大值的题。

---

## 12. 常见应用 2：动态维护最小值

```cpp
priority_queue<int, vector<int>, greater<int>> q;
q.push(5);
q.push(2);
q.push(9);

cout << q.top() << endl;   // 当前最小值 2
```

适合每次取最小值的题。

---

## 13. 常见应用 3：Top K 问题

例如：求前 `k` 大或前 `k` 小。

### 维护前 k 大：用小根堆

思路：

- 堆中始终保留当前最大的 `k` 个数
    
- 堆顶就是这 `k` 个数里最小的那个
    

```cpp
priority_queue<int, vector<int>, greater<int>> q;

for (int x : a) {
    q.push(x);
    if (q.size() > k) q.pop();
}
```

最后堆里就是前 `k` 大。

---

## 14. 常见应用 4：合并果子 / 哈夫曼思想

非常经典。

思路：

- 每次取最小的两个数合并
    
- 把新值再放回去
    
- 重复直到只剩一个
    

所以要用**小根堆**。

```cpp
priority_queue<int, vector<int>, greater<int>> q;

while (q.size() > 1) {
    int a = q.top(); q.pop();
    int b = q.top(); q.pop();
    int s = a + b;
    ans += s;
    q.push(s);
}
```

---

## 15. 常见应用 5：Dijkstra 最短路

优先队列在图论中很重要。

通常写成小根堆：

```cpp
priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> q;
```

其中：

```cpp
{当前距离, 节点编号}
```

距离最小的状态优先弹出。

示意代码：

```cpp
q.push({0, s});

while (!q.empty()) {
    auto t = q.top();
    q.pop();

    int d = t.first;
    int u = t.second;

    // 用 u 去更新其他点
}
```

---

## 16. 自定义结构体排序

有些题目要存结构体，这时就需要自定义比较规则。

**方法一：在结构体里重载 `<`**

```cpp
struct Node {
    int x;
    bool operator < (const Node &other) const {
        return x < other.x;
    }
};

priority_queue<Node> q;
```

注意：

`priority_queue` 默认会让“较大”的元素先出来。

---

**方法二：自定义比较器**

```cpp
struct cmp {
    bool operator()(int a, int b) {
        return a > b;
    }
};

priority_queue<int, vector<int>, cmp> q;
```

这相当于小根堆。

---

## 17. 常见注意事项

### 17.1 默认是大根堆，不是小根堆

很多人容易写错。

```cpp
priority_queue<int> q;
```

这是最大值优先。

如果要最小值优先，必须写：

```cpp
priority_queue<int, vector<int>, greater<int>> q;
```

---

### 17.2 `pop()` 没有返回值

错误写法：

```cpp
int x = q.pop();
```

正确写法：

```cpp
int x = q.top();
q.pop();
```

---

### 17.3 使用 `top()` 和 `pop()` 前要判空

```cpp
if (!q.empty()) {
    cout << q.top() << endl;
}
```

---

### 17.4 不能随机访问，不能遍历中间元素

错误理解：

```cpp
q[0]
q.begin()
```

这些都不存在。

`priority_queue` 只能访问队顶。

---

### 17.5 优先队列内部不一定“整体有序”

这是一个很重要的点。

`priority_queue` 只能保证：

- 队顶元素是当前最优先的
    

但不能保证内部所有元素按顺序排列。

---

## 18. 蓝桥杯常见模板

### 18.1 大根堆模板

```cpp
priority_queue<int> q;

q.push(3);
q.push(1);
q.push(5);

while (!q.empty()) {
    cout << q.top() << " ";
    q.pop();
}
```

输出：

```cpp
5 3 1
```

---

### 18.2 小根堆模板

```cpp
priority_queue<int, vector<int>, greater<int>> q;

q.push(3);
q.push(1);
q.push(5);

while (!q.empty()) {
    cout << q.top() << " ";
    q.pop();
}
```

输出：

```cpp
1 3 5
```

---

### 18.3 `pair` 小根堆模板

```cpp
priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> q;

q.push({2, 5});
q.push({1, 3});
q.push({4, 8});

while (!q.empty()) {
    auto t = q.top();
    q.pop();
    cout << t.first << " " << t.second << endl;
}
```

---

## 19. 一份完整示例代码

```cpp
#include <iostream>
#include <queue>
using namespace std;

int main() {
    priority_queue<int> q;

    q.push(10);
    q.push(30);
    q.push(20);
    q.push(5);

    cout << "队顶元素: " << q.top() << endl;  // 30
    cout << "元素个数: " << q.size() << endl;

    q.pop();

    cout << "弹出后队顶: " << q.top() << endl; // 20

    while (!q.empty()) {
        cout << q.top() << " ";
        q.pop();
    }
    cout << endl;

    return 0;
}
```

---

## 20. 必背内容

**大根堆**

```cpp
priority_queue<int> q;
```

**小根堆**

```cpp
priority_queue<int, vector<int>, greater<int>> q;
```

**常用操作**

```cpp
q.push(x);    // 插入
q.top();      // 取堆顶
q.pop();      // 删除堆顶
q.empty();    // 判空
q.size();     // 元素个数
```

**最重要的一句**

```cpp
int x = q.top();
q.pop();
```

---

## 21. 总结

`priority_queue` 的核心特点：

- 本质上是堆
    
- 默认大根堆
    
- 每次都能快速取出当前最大 / 最小元素
    
- 很适合“反复取最优”的题目
    

蓝桥杯里最常见的几个方向：

- **维护最大值 / 最小值**
    
- **Top K**
    
- **贪心**
    
- **合并果子**
    
- **Dijkstra 最短路**
    

---
