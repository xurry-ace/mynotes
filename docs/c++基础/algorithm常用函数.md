# C++ `algorithm` 常用函数

在 C++ 算法竞赛（如 ACM/ICPC、NOIP、蓝桥杯、LeetCode 等）中，`<algorithm>` 头文件是绝对主力。熟练掌握这些内置函数不仅能大幅提升敲代码的速度，还能有效减少手写逻辑带来的 Bug。

```cpp
#include <algorithm>
```

---

## 一、排序与查找（最核心）

### 先看操作保证，而不是只记函数名 { #algorithm-contracts }

| 要求的结果 | 对应操作 | 完成后仍不能假定 |
| --- | --- | --- |
| 整个范围按比较规则有序 | `sort` | 相等元素保持原来的先后顺序 |
| 只确定某个排名位置 | `nth_element` | 左右两边内部也已经排好序 |
| 合并连续的相邻重复项 | `unique` | 容器长度已经缩短，或所有非相邻重复都已消失 |
| 每次取当前优先级最高者 | `priority_queue` | 底层数组是全局有序序列 |

可对照 [快排的一轮分区](../洛谷题目/3_1/快速排序.md#partition-lab) 与 [堆的维护过程](priority_queue(优先队列).md#heap-lab)。

### 1. `sort()`

- **作用**：把整个区间按比较规则排好序。标准要求 $O(N \log N)$ 次比较，但不限定唯一底层实现，不能把 `sort` 等同于某一种手写快排。规则见 [C++ 标准草案](https://eel.is/c++draft/sort)。
- **用法**：默认升序，支持自定义比较函数（`cmp` 或 Lambda 表达式）。

```cpp
sort(a, a + n);                                              // 数组升序
sort(v.begin(), v.end(), greater<int>());                    // vector 降序
sort(v.begin(), v.end(), [](int x, int y) { return x > y; }); // Lambda 自定义
```

### 2. `lower_bound()` 与 `upper_bound()`

- **作用**：在**有序**序列中查找边界，比较次数为 $O(\log N)$。对于数组、`vector` 等随机访问区间，可据此按对数时间理解；非随机访问迭代器还可能需要线性次数的移动。
- **区别**：
  - `lower_bound`：返回第一个**大于等于（$\ge$）**目标值的迭代器/指针。
  - `upper_bound`：返回第一个**严格大于（$>$）**目标值的迭代器/指针。
- **竞赛技巧**：没有满足相应边界条件的元素时才返回尾迭代器（如 `v.end()` 或 `a + n`）。目标值不存在时，也可能返回中间的插入位置；要检查是否找到了目标，还需判断 `it != end && *it == x`。对于随机访问迭代器，可减去首地址获取下标：

```cpp
int idx1 = lower_bound(a, a + n, x) - a;                 // 找 >= x 的第一个位置
int idx2 = upper_bound(v.begin(), v.end(), x) - v.begin(); // 找 > x 的第一个位置
```

> **为什么 `auto` 常用？**  
> 若 `a` 是可修改的 `vector<int>`，`auto r = lower_bound(a.begin(), a.end(), t);` 会推导出相应迭代器类型；也可以显式写 `vector<int>::iterator`。迭代器支持类似指针的操作，但具体类型由实现决定，并不保证就是原始指针。

### 3. `nth_element()`

- **作用**：寻找第 $k$ 大/小的元素。它会将第 $k$ 个元素放在最终排好序的位置，且其左边的元素都不大于它，右边的元素都不小于它（但不保证左右两边内部有序）。
- **复杂度**：常规非并行重载平均为 $O(N)$，不是最坏线性时间保证。它适合只关心某个排名、不需要全排序的场景。规则见 [C++ 标准草案](https://eel.is/c++draft/alg.nth.element)。

```cpp
// 找出第 k 小的元素 (0-indexed)
nth_element(a, a + k, a + n);
```

若要读取 `a[k]`，需要先保证 `0 <= k < n`；空范围或末尾迭代器不能直接当作一个可读取的元素。

---

## 二、数组修改与去重

### 1. `unique()`

- **作用**：去除**相邻**的重复元素。
- **竞赛避坑**：不要求先排序。只折叠相邻重复时可直接使用，例如 `[1,1,2,1]` 的有效结果为 `[1,2,1]`；若要全局去重且允许改变顺序，常先排序。它把保留元素移到前面并返回新的逻辑末尾，`vector` 的长度还需通过 `erase` 缩短。规则见 [C++ 标准草案](https://eel.is/c++draft/alg.unique)。
- **经典组合（离散化必备）**：

```cpp
sort(v.begin(), v.end());
v.erase(unique(v.begin(), v.end()), v.end()); // 彻底删除多余元素
```

### 2. `reverse()`

- **作用**：翻转序列，常用于翻转字符串或数组。

```cpp
reverse(a, a + n);
reverse(s.begin(), s.end()); // 翻转字符串
```

### 3. `fill()`

- **作用**：将指定范围内的所有元素赋为同一个值。
- **与 `memset` 的区别**：`memset` 按字节填充，不能把任意数值直接当作对象的逐元素赋值；`fill` 按元素赋值，用于满足可写迭代器要求的范围，例如数组和 `vector`。不能因此认为 `set` 的键等不可修改元素也能直接填充。

```cpp
fill(a, a + n, 100);
fill(v.begin(), v.end(), 100);
```

---

## 三、极值与数学逻辑

### 1. `max()`、`min()`、`swap()`

- **作用**：求最大值、最小值与交换元素（注意 `swap` 在 C++11 后移到了 `<utility>`，但通常会一起包含）。
- **多变量极值（C++11 加入）**：

```cpp
int m = max({a, b, c, d}); // 配合大括号求多个数的最值，竞赛中极好用
```

### 2. `max_element()`、`min_element()`

- **作用**：返回区间内最大/最小元素的**迭代器/指针**，时间复杂度 $O(N)$。

```cpp
int max_val = *max_element(a, a + n);
int max_idx = max_element(v.begin(), v.end()) - v.begin();
```

### 3. `next_permutation()`、`prev_permutation()`

- **作用**：生成当前序列的下一个（或上一个）字典序排列。
- **应用场景**：全排列暴力枚举（当 $N \le 10$ 时）。如果要枚举所有排列，初始数组**必须先升序排序**。

```cpp
sort(a, a + n); // 先保证是最小字典序
do {
    // 处理当前的排列 a
} while (next_permutation(a, a + n));
```

---

## 四、其他实用函数

### 1. `count()` / `count_if()`

- **作用**：统计区间内等于某个值的个数 / 满足某个条件的个数，时间复杂度 $O(N)$。

```cpp
int cnt = count(v.begin(), v.end(), 5); // 统计 5 出现的次数
```

### 2. `__gcd()`（GCC 扩展）

- **作用**：求最大公约数。
- **注意**：虽然不是标准 `<algorithm>` 里的函数（C++17 在 `<numeric>` 中引入了标准 `std::gcd`），但在使用 GCC 编译器的竞赛环境中极为常用。
