---
hide:
  - toc
---

# C++ 字符串函数总结

### 头文件

```cpp
#include <iostream>
#include <string>
#include <algorithm>
using namespace std;
```

---

## 基础函数

### `to_string()`

**作用：** 数字 → 字符串

```cpp
string s = to_string(123);
string t = to_string(3.14);
```

**用途：**

* 拼接字符串
* 数字处理转字符串

---

### `stoi()`

**作用：** 字符串 → 整数

```cpp
int x = stoi("123");
```

**用途：**

* 字符串数字转整数
* 子串转数值

---

### `size()` / `length()`

**作用：** 求长度（完全等价，常用 `size()`）

```cpp
cout << s.size();
```

---

### `substr()`

**作用：** 截取子串

```cpp
s.substr(pos, len);
```

```cpp
string s = "abcdef";
cout << s.substr(2, 3); // cde
```

**注意：**

* 第二个参数是“长度”，不是结束位置

---

### `find()`

**作用：** 查找第一次出现位置

```cpp
s.find("abc");
s.find('a');
```

```cpp
if (s.find("abc") != string::npos)
```

**注意：**

* 找不到返回 `string::npos`（不是 -1）

---

### `erase()`

**作用：** 删除一段

```cpp
s.erase(pos, len);
```

---

### `insert()`

**作用：** 插入字符串

```cpp
s.insert(2, "XYZ");
```

---

### `replace()`

**作用：** 替换子串

```cpp
s.replace(pos, len, str);
```

---

### `push_back()` / `pop_back()`

```cpp
s.push_back('a'); // 添加
s.pop_back();     // 删除末尾
```

---

### `clear()` / `empty()`

```cpp
s.clear();   // 清空
s.empty();   // 判空
```

---

## 字符串操作

### 拼接

```cpp
string c = a + b;
s += "abc";
```

---

### 访问字符

```cpp
s[i]
```

```cpp
for (char c : s)
```

---

### `reverse()`

```cpp
reverse(s.begin(), s.end());
```

---

### `sort()`

```cpp
sort(s.begin(), s.end());
```

---

## 常用模板

### 遍历字符串

```cpp
for (int i = 0; i < s.size(); i++)
```

---

### 判断子串存在

```cpp
if (s.find("abc") != string::npos)
```

---

### 截取子串

```cpp
string t = s.substr(l, len);
```

---

### 反转

```cpp
reverse(s.begin(), s.end());
```

---

### 排序

```cpp
sort(s.begin(), s.end());
```

---

### 数字与字符串互转

```cpp
string s = to_string(x);
int x = stoi(s);
```

---

## 高频考点

### 回文判断

```cpp
string t = s;
reverse(t.begin(), t.end());
if (t == s)
```

---

### 统计字符

```cpp
int cnt = 0;
for (char c : s)
    if (c == 'a') cnt++;
```

---

### 判断包含

```cpp
if (s.find("2024") != string::npos)
```

---

### 按位处理数字串

```cpp
int x = s[i] - '0';
```

---

## 易错点

**1. find 不是返回 -1**

```cpp
s.find("abc") == string::npos
```

**2. substr 第二参数是长度**

**3. 字符转数字必须减 `'0'`**

```cpp
int x = s[i] - '0';
```

---

## 速查表

| 写法 | 含义 |
|------|------|
| to_string(x) | 数字 → 字符串 |
| stoi(s) | 字符串 → 整数 |
| s.size() | 长度 |
| s.substr(l, len) | 子串 |
| s.find(x) | 查找 |
| s.erase(l, len) | 删除 |
| s.insert(pos, str) | 插入 |
| s.replace(l, len, str) | 替换 |
| s.push_back(ch) | 尾插 |
| s.pop_back() | 尾删 |
| s.clear() | 清空 |
| s.empty() | 判空 |
| s[i] | 访问 |
| reverse(s.begin(), s.end()) | 反转 |
| sort(s.begin(), s.end()) | 排序 |
---

