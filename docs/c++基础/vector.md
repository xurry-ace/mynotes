---
hide:
  - toc
---

# C++ STL 容器 `vector` 常见用法总结

`vector` 是 C++ STL 中最常用的顺序容器之一，本质上可以理解为**动态数组**。  
它支持：

- 按下标随机访问
    
- 尾部高效插入删除
    
- 自动扩容
    

在蓝桥杯、算法竞赛、OJ 题目中，`vector` 使用非常频繁。

---

## 1. 头文件与定义

```cpp
#include <vector>
using namespace std;
```

**基本定义方式**

```cpp
vector<int> a;                  // 空 vector
vector<int> b(5);               // 5 个元素，默认值为 0
vector<int> c(5, 2);            // 5 个元素，每个都是 2
vector<int> d = {1, 2, 3, 4};   // 初始化列表
vector<int> e(a);               // 用 a 拷贝构造
```

---

## 2. 元素访问

**通过下标访问**

```cpp
vector<int> v = {10, 20, 30};
cout << v[0] << endl;   // 10
cout << v[1] << endl;   // 20
```

**使用 `at()`**

```cpp
cout << v.at(2) << endl;   // 30
```

`at()` 和 `[]` 的区别：

- `[]` 不检查越界   
- `at()` 会检查越界，更安全，但稍慢
    

**访问首尾元素**

```cpp
cout << v.front() << endl;   // 第一个元素
cout << v.back() << endl;    // 最后一个元素
```

---

## 3. 常用操作

---

### 3.1 `push_back()`：尾部插入元素

```cpp
vector<int> v;
v.push_back(1);
v.push_back(2);
v.push_back(3);
```

结果：

```cpp
v = {1, 2, 3}
```

这是 `vector` 最常用的操作之一。

---

### 3.2 `pop_back()`：删除尾部元素

```cpp
v.pop_back();
```

删除最后一个元素。

注意：

- 不能对空 `vector` 调用 `pop_back()`
    
!!! danger
    pop_back() = 删除最后一个元素（无返回值）
    back()     = 获取最后一个元素（不删除）


---

### 3.3 `size()`：返回元素个数

```cpp
cout << v.size() << endl;
```

注意返回值类型是 `size_t`，比赛里通常直接用即可。

---

### 3.4 `empty()`：判断是否为空

```cpp
if (v.empty()) {
    cout << "空" << endl;
}
```

---

### 3.5 `clear()`：清空所有元素

```cpp
v.clear();
```

清空后：

- `v.size() == 0`
    

---

### 3.6 `resize()`：改变大小

```cpp
vector<int> v = {1, 2, 3};

v.resize(5);      // 扩大为 5 个元素，多出来的默认补 0
// v = {1, 2, 3, 0, 0}

v.resize(7, 9);   // 扩大为 7 个元素，多出来补 9
// v = {1, 2, 3, 0, 0, 9, 9}

v.resize(2);      // 缩小为 2 个元素
// v = {1, 2}
```

---

### 3.7 `assign()`：重新赋值

```cpp
vector<int> v;
v.assign(5, 8);   // 赋值为 5 个 8
```

结果：

```cpp
v = {8, 8, 8, 8, 8}
```

---

## 4. 遍历 `vector`

---

### 4.1 下标遍历

```cpp
vector<int> v = {1, 2, 3, 4};

for (int i = 0; i < v.size(); i++) {
    cout << v[i] << " ";
}
```

---

### 4.2 范围 `for` 遍历

```cpp
for (int x : v) {
    cout << x << " ";
}
```

如果要修改元素：

```cpp
for (int &x : v) {
    x *= 2;
}
```

---

### 4.3 迭代器遍历

```cpp
for (vector<int>::iterator it = v.begin(); it != v.end(); it++) {
    cout << *it << " ";
}
```

C++11 可简写为：

```cpp
for (auto it = v.begin(); it != v.end(); it++) {
    cout << *it << " ";
}
```

---

## 5. 插入与删除

---

### 5.1 `insert()`：指定位置插入

```cpp
vector<int> v = {1, 2, 4};
v.insert(v.begin() + 2, 3);
```

结果：

```cpp
v = {1, 2, 3, 4}
```

也可以插入多个相同元素：

```cpp
v.insert(v.begin(), 2, 9);   // 开头插入 2 个 9
```

---

### 5.2 `erase()`：删除指定位置元素

```cpp
vector<int> v = {1, 2, 3, 4};
v.erase(v.begin() + 1);   // 删除下标 1 的元素
```

结果：

```cpp
v = {1, 3, 4}
```

删除区间：

```cpp
v.erase(v.begin() + 1, v.begin() + 3);
```

表示删除 `[1, 3)` 区间元素。

---

## 6. 排序与翻转

这些通常配合 `<algorithm>` 使用。

```cpp
#include <algorithm>
```

### 6.1 升序排序

```cpp
vector<int> v = {4, 2, 5, 1, 3};
sort(v.begin(), v.end());
```

结果：

```cpp
v = {1, 2, 3, 4, 5}
```

---

### 6.2 降序排序

```cpp
sort(v.begin(), v.end(), greater<int>());
```

---

### 6.3 反转

```cpp
reverse(v.begin(), v.end());
```

---

## 7. 查找

### 7.1 `find()`

```cpp
auto it = find(v.begin(), v.end(), 3);
if (it != v.end()) {
    cout << "找到了" << endl;
}
```

---

### 7.2 `count()`

```cpp
int cnt = count(v.begin(), v.end(), 2);
cout << cnt << endl;
```

统计某个值出现次数。

---

## 8. 二维 `vector`

在题目中经常用于存图、矩阵、二维数组。

### 定义二维 `vector`

```cpp
vector<vector<int>> a(3, vector<int>(4, 0));
```

表示：

- 3 行
    
- 4 列
    
- 初始值全为 0
    

### 访问二维 `vector`

```cpp
a[1][2] = 5;
cout << a[1][2] << endl;
```

### 遍历二维 `vector`

```cpp
for (int i = 0; i < a.size(); i++) {
    for (int j = 0; j < a[i].size(); j++) {
        cout << a[i][j] << " ";
    }
    cout << endl;
}
```

---

## 9. 常见应用场景

### 9.1 代替普通数组

```cpp
vector<int> a(n);
for (int i = 0; i < n; i++) cin >> a[i];
```

适合大小运行时才知道的情况。

---

### 9.2 邻接表存图

```cpp
int n, m;
vector<vector<int>> g(n + 1);

for (int i = 0; i < m; i++) {
    int u, v;
    cin >> u >> v;
    g[u].push_back(v);
}
```

---

### 9.3 存储结果序列

```cpp
vector<int> ans;
ans.push_back(10);
ans.push_back(20);
```

最后统一输出：

```cpp
for (int x : ans) cout << x << " ";
```

---

## 10. 容量相关函数

### 10.1 `capacity()`

```cpp
cout << v.capacity() << endl;
```

表示当前已分配空间能容纳多少元素。

### 10.2 `reserve()`

```cpp
v.reserve(1000);
```

提前申请空间，减少扩容次数。

在数据量较大、频繁 `push_back` 时有一定优化作用。

---

## 11. 常见注意事项

### 11.1 下标不要越界

错误示例：

```cpp
vector<int> v(5);
cout << v[5] << endl;   // 越界
```

合法下标范围：

```cpp
0 ~ v.size() - 1
```

---

### 11.2 `erase()` 后迭代器可能失效

删除元素后，后面的元素位置会前移，所以原有迭代器、下标逻辑要小心。

---

### 11.3 `vector` 尾插效率高，但头插较慢

- `push_back()`：快
    
- `insert(v.begin(), x)`：慢
    

因为头部插入会导致大量元素后移。

---

### 11.4 清空不一定释放容量

```cpp
v.clear();
```

只是清空元素，未必释放内存。

如果想尽量释放空间，可以写：

```cpp
vector<int>().swap(v);
```

---

## 12. 蓝桥杯常见模板

**输入一个长度为 `n` 的数组**

```cpp
int n;
cin >> n;
vector<int> a(n);
for (int i = 0; i < n; i++) cin >> a[i];
```

---

**输出 `vector`**

```cpp
for (int i = 0; i < v.size(); i++) {
    cout << v[i] << " ";
}
cout << endl;
```

---

**排序去重**

```cpp
sort(v.begin(), v.end());
v.erase(unique(v.begin(), v.end()), v.end());
```

说明：

- `unique()` 只是把重复元素移到后面
    
- 真正删除要配合 `erase()`
    

---

**倒序输出**

```cpp
for (int i = v.size() - 1; i >= 0; i--) {
    cout << v[i] << " ";
}
```

更稳妥的写法：

```cpp
for (int i = (int)v.size() - 1; i >= 0; i--) {
    cout << v[i] << " ";
}
```

因为 `v.size()` 是无符号类型。

---

## 13. 一份常用示例代码

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> v = {3, 1, 4, 1, 5};

    v.push_back(9);          // 尾插
    v.pop_back();            // 删除尾部
    sort(v.begin(), v.end()); // 排序

    for (int x : v) {
        cout << x << " ";
    }
    cout << endl;

    v.erase(unique(v.begin(), v.end()), v.end()); // 去重

    for (int x : v) {
        cout << x << " ";
    }
    cout << endl;

    return 0;
}
```

---

## 14. 总结

`vector` 的核心特点可以概括为：

- **动态数组**
    
- **支持随机访问**
    
- **尾部插入删除高效**
    
- **非常适合比赛中存储序列、数组、邻接表、结果集**
    

最常用的操作一般就是这些：

- 定义：`vector<int> v;`
    
- 尾插：`push_back()`
    
- 遍历：下标 / 范围 `for`
    
- 排序：`sort()`
    
- 删除：`erase()`
    
- 去重：`sort + unique + erase`
    
- 二维数组：`vector<vector<int> > arr`
