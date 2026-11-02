# P1102 A-B 数对

## 题目背景

出题是一件痛苦的事情！

相同的题目看多了也会有审美疲劳，于是我舍弃了大家所熟悉的 A+B Problem，改用 A-B 了哈哈！

## 题目描述

给出一串正整数数列以及一个正整数 $C$，要求计算出所有满足 $A - B = C$ 的数对的个数（不同位置的数字一样的数对算不同的数对）。

## 输入格式

输入共两行。

第一行，两个正整数 $N,C$。

第二行，第 $i$ 个数为 $a_i$，数字之间用一个空格隔开，共 $N$ 个正整数，作为要求处理的那串数。

## 输出格式

一行，表示该串正整数中包含的满足 $A - B = C$ 的数对的个数。

## 输入输出样例 #1

### 输入 #1

```
4 1
1 1 2 3

```

### 输出 #1

```
3
```

## 说明/提示

对于 $75\%$ 的数据，$1 \leq N \leq 2000$。

对于 $100\%$ 的数据，$1 \leq N \leq 2 \times 10^5$，$0 \leq a_i <2^{30}$，$1 \leq C < 2^{30}$。

2017/4/29 新添数据两组

---

!!! tip
    [b站讲解](https://www.bilibili.com/video/BV1HnPVerEK1/)  
    




---

## 解题思路（二分做法）

### 1️⃣ 先排序

```text
把数组排序
```



### 2️⃣ 枚举 B，查找 A

对每个 `a[i]`（当作 B）：

```text
目标值：target = a[i] + C
```

👉 在数组中用二分查找：

* 找 `target` 的**出现次数**



### 3️⃣ 如何统计个数？

用两个二分：

* `lower_bound(target)` → 第一个 ≥ target
* `upper_bound(target)` → 第一个 > target

```text
个数 = upper_bound - lower_bound
```



### 4️⃣ 总答案

```text
ans += 每个 a[i] 对应的个数
```



## ⚠️ 注意

* 不会重复计数（因为只统计 a[i] → a[i]+C）
* 支持重复元素 ✅

## 时间复杂度

```text
排序：O(n log n)
每次查找：O(log n)
总：O(n log n)
```

---

## C++代码（二分版本）

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    long long C;
    cin >> n >> C;

    vector<long long> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];

    sort(a.begin(), a.end());

    long long ans = 0;

    for (int i = 0; i < n; i++) {
        long long target = a[i] + C;

        auto l = lower_bound(a.begin(), a.end(), target);
        auto r = upper_bound(a.begin(), a.end(), target);

        ans += (r - l);
    }

    cout << ans;
    return 0;
}
```

---

!!! danger
    那么这个时候就有人要问了这道题完全是利用了cpp里algorithm库，和二分思想一点关系都没有，其实algorithm库里的lower_bound()和upper_bound()函数本质上可以用二分法重新写一下，或者不引入这个库，自己定义这两个函数，一个是找到数组中第一个>=target的位置下标索引，一个是找到一个>target的下标索引，详细见[二分查找](二分查找.md)

