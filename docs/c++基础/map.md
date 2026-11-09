# C++ STL 容器 `map` 常见用法总结

`map` 是 C++ STL 中的**关联容器**，用于存储 **键值对（key-value）**。  
它的特点是：

- 每个键 `key` **唯一**
    
- 会按照 `key` **自动排序**（默认从小到大）
    
- 可以通过 `key` 快速查找对应的 `value`
    
- 底层通常是**红黑树**
    
- 插入、删除、查找的时间复杂度通常是 **O(log n)**
    

`map` 常用于：

- 统计次数
    
- 建立映射关系
    
- 离散化辅助
    
- 记录状态
    
- 字符串 / 大整数 / 坐标映射
    

---

## 1. 头文件与定义

```cpp
#include <map>
using namespace std;
```

**基本定义**

```cpp
map<int, int> mp;
```

表示：

- 键类型是 `int`
    
- 值类型也是 `int`
    

也可以定义其他类型：

```cpp
map<string, int> cnt;
map<char, int> mp2;
map<int, string> name;
```

---

## 2. `map` 的基本特点

例如：

```cpp
map<int, int> mp;
mp[3] = 30;
mp[1] = 10;
mp[2] = 20;
```

遍历时会按 `key` 升序输出：

```cpp
1 10
2 20
3 30
```

说明：

- `map` 存的是键值对
    
- 排序依据是 `key`
    
- `key` 不能重复，重复赋值会覆盖原值
    

---

## 3. 元素访问

### 3.1 用 `[]` 访问

```cpp
map<int, int> mp;
mp[1] = 100;
mp[2] = 200;

cout << mp[1] << endl;   // 100
```

**注意**

如果访问一个不存在的键：

```cpp
cout << mp[5] << endl;
```

会发生两件事：

- 自动创建键 `5`
    
- 值默认初始化为 `0`（如果 value 是 `int`）
    

所以这句之后，`mp` 里就有了一个 `{5, 0}`。

---

### 3.2 用 `at()` 访问

```cpp
cout << mp.at(1) << endl;
```

特点：

- 键存在时正常访问
    
- 键不存在时会报异常
    
- 不会像 `[]` 那样自动插入新元素
    

比赛里一般更常用 `[]`。

---

## 4. 常用操作

### 4.1 插入元素

- 方法 1：直接赋值

```cpp
mp[1] = 10;
mp[2] = 20;
```

- 方法 2：`insert()`

```cpp
mp.insert({3, 30});
mp.insert(make_pair(4, 40));
```

注意：

- 如果键已存在，`insert()` 不会覆盖原值
    
- `[]` 赋值会覆盖原值
    

例如：

```cpp
mp[1] = 10;
mp[1] = 99;   // 覆盖
```

最终：

```cpp
mp[1] == 99
```

---

## 4.2 删除元素

- 按键删除

```cpp
mp.erase(1);
```

删除键为 `1` 的键值对。

- 按迭代器删除

```cpp
auto it = mp.find(2);
if (it != mp.end()) mp.erase(it);
```

---

### 4.3 查找元素

```cpp
auto it = mp.find(3);
if (it != mp.end()) {
    cout << it->first << " " << it->second << endl;
}
```

说明：

- `it->first` 是键
    
- `it->second` 是值
    

---

## 4.4 `count()`：判断键是否存在

```cpp
if (mp.count(3)) {
    cout << "存在" << endl;
}
```

对于 `map`：

- 存在返回 `1`
    
- 不存在返回 `0`
    

因为键不会重复。

---

### 4.5 `size()`：元素个数

```cpp
cout << mp.size() << endl;
```

---

### 4.6 `empty()`：判断是否为空

```cpp
if (mp.empty()) {
    cout << "空 map" << endl;
}
```

---

### 4.7 `clear()`：清空

```cpp
mp.clear();
```

---

## 5. 遍历 `map`

### 5.1 范围 `for`

```cpp
for (auto p : mp) {
    cout << p.first << " " << p.second << endl;
}
```

---

### 5.2 迭代器遍历

```cpp
for (auto it = mp.begin(); it != mp.end(); it++) {
    cout << it->first << " " << it->second << endl;
}
```

---

### 5.3 结构化绑定（C++17）

```cpp
for (auto [key, value] : mp) {
    cout << key << " " << value << endl;
}
```

---

## 6. 自动排序

`map` 默认按键从小到大排序。

```cpp
map<int, string> mp;
mp[3] = "c";
mp[1] = "a";
mp[2] = "b";

for (auto [k, v] : mp) {
    cout << k << " " << v << endl;
}
```

输出：

```cpp
1 a
2 b
3 c
```

---

## 7. 统计次数

这是 `map` 最经典的用途。

```cpp
vector<int> a = {1, 2, 2, 3, 3, 3};

map<int, int> cnt;
for (int x : a) {
    cnt[x]++;
}
```

结果：

```cpp
cnt[1] = 1
cnt[2] = 2
cnt[3] = 3
```

输出统计结果：

```cpp
for (auto [x, c] : cnt) {
    cout << x << " 出现了 " << c << " 次" << endl;
}
```

---

## 8. 统计字符出现次数

```cpp
string s = "abacaba";
map<char, int> cnt;

for (char c : s) cnt[c]++;

for (auto [ch, num] : cnt) {
    cout << ch << " " << num << endl;
}
```

---

## 9. 字符串映射

```cpp
map<string, int> mp;
mp["alice"] = 95;
mp["bob"] = 88;

cout << mp["alice"] << endl;
```

比赛里常用于：

- 单词计数
    
- 姓名映射编号
    
- 字符串状态记录
    

---

## 10. `map<pair<int,int>, int>` 的用法

有些题会把坐标、状态二元组作为键。

```cpp
map<pair<int, int>, int> mp;
mp[{1, 2}] = 5;
mp[{3, 4}] = 10;

cout << mp[{1, 2}] << endl;
```

这在以下场景常见：

- 网格状态
    
- 坐标压缩
    
- 二维状态记录
    

---

## 11. `lower_bound()` 和 `upper_bound()`

和 `set` 类似，`map` 也支持按键查找范围。

- `lower_bound(x)`

返回第一个 `key >= x` 的位置。

```cpp
auto it = mp.lower_bound(5);
if (it != mp.end()) {
    cout << it->first << " " << it->second << endl;
}
```

- `upper_bound(x)`

返回第一个 `key > x` 的位置。

```cpp
auto it = mp.upper_bound(5);
if (it != mp.end()) {
    cout << it->first << " " << it->second << endl;
}
```

---

## 12. 降序 `map`

默认升序，如果想按键降序：

```cpp
map<int, int, greater<int>> mp;
```

示例：

```cpp
map<int, int, greater<int>> mp;
mp[3] = 30;
mp[1] = 10;
mp[2] = 20;

for (auto [k, v] : mp) {
    cout << k << " " << v << endl;
}
```

输出：

```cpp
3 30
2 20
1 10
```

---

## 13. 常见应用场景

### 13.1 计数器

```cpp
map<int, int> cnt;
for (int x : a) cnt[x]++;
```

---

### 13.2 建立编号映射

```cpp
map<string, int> id;
id["Tom"] = 1;
id["Jack"] = 2;
```

---

### 13.3 判重

```cpp
map<int, int> vis;
if (vis[x]) {
    cout << "出现过" << endl;
} else {
    vis[x] = 1;
}
```

不过纯判重时通常 `set` 更合适。

---

### 13.4 记录状态值

```cpp
map<int, int> dp;
dp[100] = 3;
dp[200] = 7;
```

适合键值不连续、范围很大时。

---

## 14. 常见注意事项

### 14.1 `mp[x]` 会自动创建元素

这是最容易忽略的点。

```cpp
map<int, int> mp;
cout << mp[100] << endl;
```

执行后，`mp` 中会多出：

```cpp
{100, 0}
```

如果你只是想判断是否存在，建议用：

```cpp
mp.find(x)
mp.count(x)
```

---

### 14.2 `key` 不能重复

```cpp
mp[1] = 10;
mp[1] = 20;
```

最终只保留：

```cpp
1 -> 20
```

后面的赋值会覆盖前面的值。

---

### 14.3 `find()` 返回迭代器，不是值

```cpp
auto it = mp.find(x);
if (it != mp.end()) {
    cout << it->second << endl;
}
```

---

### 14.4 `map` 不支持下标位置访问

错误理解：

```cpp
mp[0]   // 这是按 key 访问，不是第 0 个元素
```

`map` 不是顺序容器，不能按“第几个元素”访问。

---

### 14.5 遍历时修改键是不允许的

`map` 中键值对的键部分不能直接改。

错误理解：

```cpp
it->first = 10;
```

这是不允许的。

如果要改键，通常做法是：

- 删除旧键
    
- 插入新键
    

---

## 15. 蓝桥杯常见模板

### 15.1 统计次数模板

```cpp
map<int, int> cnt;
for (int x : a) cnt[x]++;
```

---

### 15.2 字符统计模板

```cpp
map<char, int> cnt;
for (char c : s) cnt[c]++;
```

---

### 15.3 字符串编号模板

```cpp
map<string, int> id;
int tot = 0;

if (!id.count(name)) {
    id[name] = ++tot;
}
```

---

### 15.4 遍历输出模板

```cpp
for (auto [k, v] : mp) {
    cout << k << " " << v << endl;
}
```

---

## 16. 一份完整示例代码

```cpp
#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    map<string, int> mp;

    mp["apple"] = 3;
    mp["banana"] = 5;
    mp["apple"]++;

    for (auto [fruit, cnt] : mp) {
        cout << fruit << " " << cnt << endl;
    }

    if (mp.count("apple")) {
        cout << "apple 存在，数量为 " << mp["apple"] << endl;
    }

    mp.erase("banana");

    return 0;
}
```

---

## 17. 必背内容

### 定义

```cpp
map<int, int> mp;
```

### 常用操作

```cpp
mp[key] = value;      // 赋值 / 插入
mp.erase(key);        // 删除
mp.find(key);         // 查找
mp.count(key);        // 是否存在
mp.lower_bound(key);  // 第一个 >= key
mp.upper_bound(key);  // 第一个 > key
mp.size();            // 元素个数
mp.empty();           // 判空
mp.clear();           // 清空
```

### 遍历

```cpp
for (auto [k, v] : mp) {
    cout << k << " " << v << endl;
}
```

---

## 18. `set` 和 `map` 的区别

|容器|存储内容|是否有值 `value`|是否自动排序|键是否唯一|
|---|---|---|---|---|
|`set`|只有元素本身|否|是|是|
|`map`|键值对 `key-value`|是|是（按 key）|是|

你可以这样理解：

- `set`：只关心“这个元素在不在”
    
- `map`：关心“这个键对应什么值”
    

---

## 19. 总结

`map` 的核心特点：

- **存键值对**
    
- **键唯一**
    
- **按键自动排序**
    
- **查找 / 插入 / 删除效率高**
    

蓝桥杯中最常见的几个方向：

- **计数**
    
- **映射**
    
- **状态记录**
    
- **字符串编号**
    
- **有序键查询**
    

---