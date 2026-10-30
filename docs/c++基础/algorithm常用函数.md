# C++ `algorithm` 常用函数

在C++算法竞赛（如ACM/ICPC, NOIP, LeetCode等）中，`<algorithm>` 头文件是你的绝对主力。熟练掌握这些内置函数不仅能大幅提升敲代码的速度，还能有效减少自己手写逻辑带来的Bug。

头文件包含
```cpp
#include <algorithm>
```


## 一、 排序与查找 (最核心)

**1. `sort()`**

* **作用：** 快速排序（底层为IntroSort，最坏时间复杂度严格保证 $O(N \log N)$）。

* **用法：** 默认升序。支持自定义比较函数（`cmp` 或 Lambda 表达式）。

* **代码示例：**
    ```cpp
    sort(a, a + n); // 数组升序
    sort(v.begin(), v.end(), greater<int>()); // vector降序
    sort(v.begin(), v.end(), [](int x, int y){ return x > y; }); // Lambda自定义
    ```

**2. `lower_bound()` 与 `upper_bound()`**

* **作用：** 在**有序**序列中进行二分查找。时间复杂度 $O(\log N)$。

* **区别：**
    * `lower_bound`: 返回第一个 **大于等于 (>=)** 目标值的迭代器/指针。
    * `upper_bound`: 返回第一个 **严格大于 (>)** 目标值的迭代器/指针。

* **竞赛技巧：** 找不到时会返回尾迭代器（如 `v.end()` 或 `a+n`）。通常减去首地址获取下标。
    ```cpp
    int idx1 = lower_bound(a, a + n, x) - a; // 找 >=x 的第一个位置
    int idx2 = upper_bound(v.begin(), v.end(), x) - v.begin(); // 找 >x 的第一个位置
    ```
    为什么 auto 常用？

    先看这句：

    auto r = lower_bound(a.begin(), a.end(), t);
    👉 实际返回类型是：
    vector<int>::iterator

    也就是一个“指针类型的迭代器”。

    如果不用 auto，你必须写：

    vector<int>::iterator r = lower_bound(a.begin(), a.end(), t);

**3. `nth_element()`**

* **作用：** 寻找第 $k$ 大/小的元素。它会将第 $k$ 个元素放在最终排好序的位置，且其左边的元素都不大于它，右边的元素都不小于它（但不保证左右两边内部有序）。

* **优势：** 时间复杂度为 $O(N)$，比全量排序快，非常适合求中位数或Top-K问题。
    ```cpp
    // 找出第 k 小的元素 (0-indexed)
    nth_element(a, a + k, a + n);
    ```

## 二、 数组修改与去重

**1. `unique()`**

* **作用：** 去除**相邻**的重复元素。

* **竞赛避坑：** 使用前**必须先排序**。它实际上并没有真正删除元素，而是把不重复的元素移到前面，返回去重后最后一个有效元素的下一个位置（迭代器）。

* **经典组合（离散化必备）：**
    ```cpp
    sort(v.begin(), v.end());
    v.erase(unique(v.begin(), v.end()), v.end()); // 彻底删除多余元素
    ```

**2. `reverse()`**

* **作用：** 翻转序列。经常用于翻转字符串或数组。
    ```cpp
    reverse(a, a + n);
    reverse(s.begin(), s.end()); // 翻转字符串
    ```

**3. `fill()`**

* **作用：** 将指定范围内的所有元素赋为同一个值。

* **与 `memset` 的区别：** `memset` 按字节赋值，只能安全地赋 `0` 或 `-1`（或 `0x3f` 等特殊值）。`fill` 支持赋任何值（如 `1`），且支持所有容器。
    ```cpp
    fill(a, a + n, 100);
    fill(v.begin(), v.end(), 100);
    ```

## 三、 极值与数学逻辑

**1. `max()`, `min()`, `swap()`**

* **作用：** 顾名思义。注意 `swap` 在 C++11 后实际上移到了 `<utility>`，但通常会一起包含。

* **多变量极值（C++11加入）：**
    ```cpp
    int m = max({a, b, c, d}); // 配合大括号求多个数的最值，竞赛中极好用
    ```

**2. `max_element()`, `min_element()`**

* **作用：** 返回区间内最大/最小元素的**迭代器/指针**。时间复杂度 $O(N)$。
    ```cpp
    int max_val = *max_element(a, a + n);
    int max_idx = max_element(v.begin(), v.end()) - v.begin();
    ```

**3. `next_permutation()`, `prev_permutation()`**

* **作用：** 生成当前序列的下一个（或上一个）字典序排列。

* **应用场景：** 全排列暴力枚举（当 $N \le 10$ 时）。如果是找所有排列，初始数组**必须升序**。

* **代码示例：**
    ```cpp
    sort(a, a + n); // 先保证是最小字典序
    do {
        // 处理当前的排列 a
    } while (next_permutation(a, a + n));
    ```

## 四、 其他实用函数

**1. `count()` / `count_if()`**

* **作用：** 统计区间内等于某个值的个数 / 满足某个条件的个数。时间复杂度 $O(N)$。
    ```cpp
    int cnt = count(v.begin(), v.end(), 5); // 统计5出现的次数
    ```

**2. `__gcd()` (GCC 扩展)**

* **作用：** 求最大公约数。

* **注意：** 虽然不是标准 `<algorithm>` 里的（C++17 引入了 `<numeric>` 中的 `std::gcd`），但在非严格C++标准的竞赛环境（如使用 GCC 编译器）中，这个隐藏函数极为常用。

---
