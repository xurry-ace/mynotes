# P1923 【深基9.例4】求第 k 小的数

## 题目描述

输入 $n$ 个数字 $a_i$，输出这些数字中第 $k$ 小的数。最小的数是第 $0$ 小。

请尽量不要使用 `nth_element` 来写本题，因为本题的重点在于练习分治算法。

## 输入格式

第一行有两个整数，分别表示 $n$ 和 $k$。

第二行有 $n$ 个整数，第 $i$ 个数表示 $a_i$。

## 输出格式

一个整数，表示第 $k$ 小的数。

## 输入输出样例 #1

### 输入 #1

```
5 1
4 3 2 1 5

```

### 输出 #1

```
2

```

## 说明/提示

对于 $100\%$ 的数据，$1\le a_i<{10}^9$，$1 \le n < 5\times 10^6$，且 $n$ 为奇数。

----
!!! tip
    [b站讲解](https://www.bilibili.com/video/BV17h4y1E73i/)


---

> **核心考点**：本题是快速排序的进阶版——**快速选择（QuickSelect）**，可在平均 $O(n)$ 时间内求出第 $k$ 小元素。

---

## 📌 题目分析

👉 本质：
在数组中找到：

```text
第 k 小的数（从 0 开始）
```

👉 类型：
**分治 + 快速选择（QuickSelect）**

---

## 🧠 解题思路

### 1️⃣ 核心建模

目标：

```text
排序后第 k 个位置的数
```

但注意：

```text
不需要真的排序整个数组！
```

👉 只需要找到第 k 小

### 2️⃣ 性质分析（关键）

快排每次会做：

```text
划分（partition）：
左边 ≤ pivot
右边 ≥ pivot
```

👉 那么：

```text
pivot 最终会在“正确位置”
```

### 3️⃣ 核心思想（精髓🔥）

假设划分后：

```text
左区间：[l ... j]
右区间：[i ... r]
```

判断：

```text
k 在哪一边？
```

### 4️⃣ 三种情况

#### ✅ 情况1：k 在左边

```cpp
k <= j → 去左边找
```

#### ✅ 情况2：k 在右边

```cpp
k >= i → 去右边找
```

#### ✅ 情况3：k 在中间

```text
说明 pivot 就是答案
```

### 5️⃣ 为什么比快排快？

👉 快排：

```text
左右都递归 → O(n log n)
```

👉 快速选择：

```text
只递归一边 → O(n)
```

### 6️⃣ 时间复杂度

* 平均：`O(n)` ✅
* 最坏：`O(n^2)`（极少）

---

## 💻 C++代码（QuickSelect）

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 5e6 + 5;
int a[N];
int n, k;

int quick_select(int l, int r, int k) {
    if (l == r) return a[l];

    int i = l, j = r;
    int pivot = a[(l + r) >> 1];

    while (i <= j) {
        while (a[i] < pivot) i++;
        while (a[j] > pivot) j--;
        if (i <= j) {
            swap(a[i], a[j]);
            i++, j--;
        }
    }

    // k 在左边
    if (k <= j) return quick_select(l, j, k);

    // k 在右边
    if (k >= i) return quick_select(i, r, k);

    // k 在中间
    return a[k];
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n >> k;
    for (int i = 0; i < n; i++) cin >> a[i];

    cout << quick_select(0, n - 1, k);

    return 0;
}
```

---

## ⚠️ 易错点（这题非常容易挂）

### ❌ 1. k 搞错（0-based）

```text
题目：最小的是第 0 小
```

👉 不需要 `k--` ❗


### ❌ 2. 条件写错

```cpp
if (k < j) ❌
```

✅ 正确：

```cpp
if (k <= j)
if (k >= i)
```


### ❌ 3. 返回值写错

```cpp
return pivot ❌
```

✅ 正确：

```cpp
return a[k]
```

### ❌ 4. 数组太大（5e6）

👉 必须：

```cpp
ios::sync_with_stdio(false);
cin.tie(nullptr);
```

🚀 一句话总结

```text
每次只递归一边 → 快速找到第 k 小
```

---
