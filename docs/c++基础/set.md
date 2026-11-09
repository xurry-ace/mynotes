# C++ STL 容器 `set` 常见用法总结

`set` 是 C++ STL 中的**关联容器**，特点是：

- **自动有序**（默认从小到大）
    
- **元素唯一，不允许重复**
    
- 底层通常是**红黑树**
    
- 插入、删除、查找的时间复杂度通常是 **O(log n)**
    

`set` 常用于：

- 去重
    
- 自动排序
    
- 快速查找某个数是否存在
    
- 维护动态有序序列
    
- 查找前驱 / 后继
    

---

## 1. 头文件与定义

```cpp
#include <set>
using namespace std;
```

**基本定义**

```cpp
set<int> s;
```

定义一个存放 `int` 的集合。

---

## 2. `set` 的基本特点

例如：

```cpp
set<int> s;
s.insert(3);
s.insert(1);
s.insert(5);
s.insert(3);
```

结果中只会保留：

```cpp
1 3 5
```

说明：

- 自动升序排列
    
- 重复元素 `3` 不会被插入第二次
    

---

## 3. 常用操作

## 3.1 `insert()`：插入元素

```cpp
set<int> s;
s.insert(10);
s.insert(20);
s.insert(10);
```

结果只有：

```cpp
10 20
```

因为 `set` 不允许重复元素。

---

## 3.2 `erase()`：删除元素

**按值删除**

```cpp
s.erase(10);
```

删除值为 `10` 的元素。

**按迭代器删除**

```cpp
auto it = s.find(20);
if (it != s.end()) s.erase(it);
```

---

## 3.3 `find()`：查找元素

```cpp
auto it = s.find(3);
if (it != s.end()) {
    cout << "存在" << endl;
} else {
    cout << "不存在" << endl;
}
```

---

## 3.4 `count()`：统计某个元素出现次数

```cpp
cout << s.count(3) << endl;
```

对于 `set`：

- 存在则返回 `1`
    
- 不存在则返回 `0`
    

因为 `set` 不会有重复元素。

---

## 3.5 `size()`：元素个数

```cpp
cout << s.size() << endl;
```

---

## 3.6 `empty()`：判断是否为空

```cpp
if (s.empty()) {
    cout << "空集合" << endl;
}
```

---

## 3.7 `clear()`：清空集合

```cpp
s.clear();
```

---

## 4. 遍历 `set`

因为 `set` 是有序的，所以遍历结果默认从小到大。

**方式 1：范围 `for`**

```cpp
for (int x : s) {
    cout << x << " ";
}
```

---

**方式 2：迭代器**

```cpp
for (set<int>::iterator it = s.begin(); it != s.end(); it++) {
    cout << *it << " ";
}
```

C++11 可简写为：

```cpp
for (auto it = s.begin(); it != s.end(); it++) {
    cout << *it << " ";
}
```

---

## 5. `begin()` 和 `end()`

```cpp
cout << *s.begin() << endl;
```

- `begin()`：指向第一个元素
    
- `end()`：指向最后一个元素的下一个位置，不能直接解引用
    

例如：

```cpp
set<int> s = {2, 4, 6};
cout << *s.begin() << endl;   // 2
```

---

## 6. 取最大值和最小值

**最小值**

```cpp
cout << *s.begin() << endl;
```

**最大值**

```cpp
cout << *prev(s.end()) << endl;
```

或者：

```cpp
auto it = s.end();
it--;
cout << *it << endl;
```

注意：

- 前提是 `set` 非空
    

---

## 7. 自动去重

这是 `set` 最经典的用途之一。

```cpp
vector<int> a = {1, 2, 2, 3, 3, 3, 4};
set<int> s(a.begin(), a.end());

for (int x : s) cout << x << " ";
```

输出：

```cpp
1 2 3 4
```

---

## 8. 判断某元素是否存在

```cpp
if (s.find(x) != s.end()) {
    cout << "存在" << endl;
}
```

也可以写：

```cpp
if (s.count(x)) {
    cout << "存在" << endl;
}
```

比赛里这两种都常见。

---

## 9. 前驱和后继

这是 `set` 很重要的竞赛用法。

### 9.1 `lower_bound(x)`

返回**第一个大于等于 `x` 的位置**

```cpp
auto it = s.lower_bound(4);
if (it != s.end()) cout << *it << endl;
```

---

### 9.2 `upper_bound(x)`

返回**第一个大于 `x` 的位置**

```cpp
auto it = s.upper_bound(4);
if (it != s.end()) cout << *it << endl;
```

---

### 9.3 查找前驱

前驱：小于 `x` 的最大元素。

```cpp
auto it = s.lower_bound(x);
if (it != s.begin()) {
    it--;
    cout << *it << endl;
}
```

---

### 9.4 查找后继

后继：大于等于 `x` 的最小元素（常用 `lower_bound`）

```cpp
auto it = s.lower_bound(x);
if (it != s.end()) {
    cout << *it << endl;
}
```

---

## 10. 降序 `set`

默认是升序，如果想降序排列：

```cpp
set<int, greater<int>> s;
```

示例：

```cpp
set<int, greater<int>> s;
s.insert(3);
s.insert(1);
s.insert(5);

for (int x : s) cout << x << " ";
```

输出：

```cpp
5 3 1
```

---

## 11. 删除区间元素

```cpp
auto l = s.lower_bound(3);
auto r = s.upper_bound(7);
s.erase(l, r);
```

表示删除区间 `[3, 7]` 内的元素。

注意这里实际删除的是迭代器区间 `[l, r)`。

---

## 12. `set<pair<int,int>>` 的用法

比赛中也很常见。

```cpp
set<pair<int, int>> s;
s.insert({2, 3});
s.insert({1, 5});
s.insert({2, 1});
```

`pair` 会按字典序排序：

- 先比较 `first`
    
- 再比较 `second`
    

遍历结果：

```cpp
1 5
2 1
2 3
```

---

## 13. 常见应用场景

### 13.1 去重 + 排序

```cpp
vector<int> a = {4, 2, 2, 1, 3, 3};
set<int> s(a.begin(), a.end());
```

---

### 13.2 动态查重

```cpp
set<int> vis;

if (vis.count(x)) {
    cout << "重复出现" << endl;
} else {
    vis.insert(x);
}
```

---

### 13.3 维护有序集合

例如随时需要：

- 插入元素
    
- 删除元素
    
- 查询最小值 / 最大值
    
- 查询某个值是否存在
    

这时 `set` 比 `vector` 更方便。

---

### 13.4 查找最接近某个值的元素

利用 `lower_bound()`：

```cpp
auto it = s.lower_bound(x);
```

然后比较：

- `it`
    
- `prev(it)`
    

即可找到最接近 `x` 的值。

---

## 14. 常见注意事项

### 14.1 `set` 中元素不能通过迭代器直接修改

错误写法：

```cpp
auto it = s.find(3);
*it = 10;   // 错误
```

原因：

- 修改元素会破坏内部有序性
    

如果要改，通常做法是：

- 先删
    
- 再插
    

```cpp
s.erase(3);
s.insert(10);
```

---

### 14.2 `find()` 返回的是迭代器

```cpp
auto it = s.find(x);
if (it != s.end()) {
    cout << *it << endl;
}
```

不是返回下标。

---

### 14.3 `end()` 不能解引用

错误写法：

```cpp
cout << *s.end() << endl;   // 错误
```

正确取最大值要写：

```cpp
cout << *prev(s.end()) << endl;
```

---

### 14.4 `set` 不支持下标访问

错误理解：

```cpp
s[0]
```

不存在这种写法。

因为 `set` 不是顺序容器。

---

### 14.5 插入重复元素不会报错，但不会成功插入

```cpp
s.insert(5);
s.insert(5);
```

最后仍然只有一个 `5`。

---

## 15. 蓝桥杯常见模板

### 15.1 判重模板

```cpp
set<int> s;
if (s.count(x)) {
    cout << "已经出现过" << endl;
} else {
    s.insert(x);
}
```

---

### 15.2 去重排序模板

```cpp
vector<int> a = {4, 2, 2, 1, 3};
set<int> s(a.begin(), a.end());

for (int x : s) cout << x << " ";
```

---

### 15.3 查找前驱后继模板

```cpp
auto it = s.lower_bound(x);

// 后继
if (it != s.end()) cout << *it << endl;

// 前驱
if (it != s.begin()) {
    --it;
    cout << *it << endl;
}
```

---

## 16. 一份完整示例代码

```cpp
#include <iostream>
#include <set>
using namespace std;

int main() {
    set<int> s;

    s.insert(3);
    s.insert(1);
    s.insert(5);
    s.insert(3);

    for (int x : s) cout << x << " ";
    cout << endl;   // 1 3 5

    if (s.count(3)) cout << "3 存在" << endl;

    s.erase(3);

    if (s.find(3) == s.end()) cout << "3 已被删除" << endl;

    cout << "最小值: " << *s.begin() << endl;
    cout << "最大值: " << *prev(s.end()) << endl;

    return 0;
}
```

---

## 17. 必背内容

### 定义

```cpp
set<int> s;
```

### 常用操作

```cpp
s.insert(x);          // 插入
s.erase(x);           // 删除
s.find(x);            // 查找
s.count(x);           // 是否存在
s.lower_bound(x);     // 第一个 >= x
s.upper_bound(x);     // 第一个 > x
s.empty();            // 判空
s.size();             // 元素个数
```

### 遍历

```cpp
for (int x : s) cout << x << " ";
```

---

## 18. 总结

`set` 的核心特点：

- **自动排序**
    
- **元素唯一**
    
- **查找 / 插入 / 删除效率高**
    
- **非常适合动态维护有序不重复集合**
    

蓝桥杯中最常见的几个方向：

- **去重**
    
- **判重**
    
- **有序维护**
    
- **前驱后继**
    
- **查找某数是否存在**
    

---
