# C++ STL 容器 `stack` 常见用法总结

`stack` 是 C++ STL 中的**栈容器适配器**，特点是：

- **先进后出（FILO / LIFO）**
    
- 只能在**栈顶**进行插入、删除、访问
    
- 不支持随机访问、遍历
    

在蓝桥杯里，`stack` 常用于：

- 括号匹配
    
- 表达式求值
    
- 单调栈
    
- DFS 非递归写法
    
- 撤销 / 回退类问题
    

---

## 1. 头文件与定义

```cpp
#include <stack>
using namespace std;
```

**基本定义**

```cpp
stack<int> st;
```

定义一个存放 `int` 的栈。

---

## 2. `stack` 的基本特点

栈的规则是：

- 后进去的元素先出来
    
- 只能操作栈顶元素
    

比如：

```cpp
st.push(1);
st.push(2);
st.push(3);
```

此时栈顶到栈底是：

```cpp
3 2 1
```

---

## 3. 常用操作

## 3.1 `push()`：入栈

把元素压入栈顶。

```cpp
stack<int> st;
st.push(10);
st.push(20);
st.push(30);
```

此时栈顶元素是 `30`。

---

## 3.2 `pop()`：出栈

删除栈顶元素。

```cpp
st.pop();
```

执行后，原来的栈顶元素被删除。

注意：

- `pop()` **没有返回值**
    
- 如果想先取值再删除，要先 `top()` 再 `pop()`
    

正确写法：

```cpp
int x = st.top();
st.pop();
```

---

## 3.3 `top()`：访问栈顶元素

```cpp
cout << st.top() << endl;
```

返回当前栈顶元素。

例如：

```cpp
stack<int> st;
st.push(5);
st.push(8);

cout << st.top() << endl;   // 8
```

---

## 3.4 `empty()`：判断栈是否为空

```cpp
if (st.empty()) {
    cout << "栈为空" << endl;
}
```

返回值：

- 空：`true`
    
- 非空：`false`
    

---

## 3.5 `size()`：返回元素个数

```cpp
cout << st.size() << endl;
```

---

## 4. 基本示例

```cpp
#include <iostream>
#include <stack>
using namespace std;

int main() {
    stack<int> st;

    st.push(1);
    st.push(2);
    st.push(3);

    cout << st.top() << endl;  // 3

    st.pop();
    cout << st.top() << endl;  // 2

    cout << st.size() << endl; // 2

    return 0;
}
```

---

## 5. 遍历 `stack`

`stack` **不能像 `vector` 一样直接遍历**，因为它不提供迭代器。

如果想输出所有元素，只能一边访问一边弹出：

```cpp
while (!st.empty()) {
    cout << st.top() << " ";
    st.pop();
}
```

注意：

- 这样会破坏原栈
    

如果不想破坏原栈，可以先复制一份：

```cpp
stack<int> tmp = st;
while (!tmp.empty()) {
    cout << tmp.top() << " ";
    tmp.pop();
}
```

---

## 6. 常见应用 1：括号匹配

这是 `stack` 最经典的题型之一。

**思路**

遇到左括号入栈，遇到右括号就检查栈顶是否匹配。

**示例代码**

```cpp
#include <iostream>
#include <stack>
#include <string>
using namespace std;

int main() {
    string s;
    cin >> s;

    stack<char> st;
    bool ok = true;

    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') {
            st.push(c);
        } else {
            if (st.empty()) {
                ok = false;
                break;
            }
            char t = st.top();
            st.pop();

            if ((c == ')' && t != '(') ||
                (c == ']' && t != '[') ||
                (c == '}' && t != '{')) {
                ok = false;
                break;
            }
        }
    }

    if (!st.empty()) ok = false;

    if (ok) cout << "合法" << endl;
    else cout << "不合法" << endl;

    return 0;
}
```

---

## 7. 常见应用 2：字符串逆序

因为栈是后进先出，所以很适合做逆序。

```cpp
#include <iostream>
#include <stack>
#include <string>
using namespace std;

int main() {
    string s;
    cin >> s;

    stack<char> st;
    for (char c : s) st.push(c);

    while (!st.empty()) {
        cout << st.top();
        st.pop();
    }

    return 0;
}
```

---

## 8. 常见应用 3：表达式求值

在中缀表达式、后缀表达式、前缀表达式问题中，通常都会用到栈。

例如后缀表达式求值思路：

- 遇到数字：入栈
    
- 遇到运算符：弹出两个数计算，再把结果入栈
    

示意代码：

```cpp
stack<int> st;

// 读到数字 x
st.push(x);

// 读到运算符 op
int b = st.top(); st.pop();
int a = st.top(); st.pop();

if (op == '+') st.push(a + b);
if (op == '-') st.push(a - b);
if (op == '*') st.push(a * b);
if (op == '/') st.push(a / b);
```

---

## 9. 常见应用 4：单调栈

蓝桥杯和算法题中非常重要。

**常见用途**

- 求每个数左边 / 右边第一个比它大 / 小的元素
    
- 求柱状图最大矩形
    
- 求下一个更大元素
    

**例子：求每个元素左边第一个比它小的数**

```cpp
#include <iostream>
#include <stack>
using namespace std;

int main() {
    int n;
    cin >> n;
    stack<int> st;

    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;

        while (!st.empty() && st.top() >= x) st.pop();

        if (st.empty()) cout << -1 << " ";
        else cout << st.top() << " ";

        st.push(x);
    }

    return 0;
}
```

这里的栈保持**单调递增**。

---

## 10. 常见应用 5：非递归 DFS

递归本质上就用到了函数调用栈，因此也可以手动写栈实现 DFS。

示意代码：

```cpp
stack<int> st;
st.push(1);

while (!st.empty()) {
    int u = st.top();
    st.pop();

    cout << u << " ";

    // 把相邻节点压栈
}
```

---

## 11. 常见注意事项

## 11.1 使用 `top()` 或 `pop()` 前要先判空

错误写法：

```cpp
stack<int> st;
cout << st.top() << endl;   // 错误，空栈
```

正确写法：

```cpp
if (!st.empty()) {
    cout << st.top() << endl;
}
```

---

## 11.2 `pop()` 没有返回值

错误写法：

```cpp
int x = st.pop();   // 错误
```

正确写法：

```cpp
int x = st.top();
st.pop();
```

---

## 11.3 `stack` 不能随机访问

错误理解：

```cpp
st[0]
st.begin()
```

这些都不存在。

`stack` 只能访问栈顶。

---

## 11.4 `stack` 不适合需要遍历或查找的场景

如果题目需要：

- 遍历所有元素
    
- 查找某个元素
    
- 按下标访问
    

那通常不该用 `stack`，更适合：

- `vector`
    
- `deque`
    
- `set`
    
- `map`
    

---

## 12. 蓝桥杯中常见模板

## 12.1 基础模板

```cpp
stack<int> st;

st.push(1);
st.push(2);

while (!st.empty()) {
    cout << st.top() << " ";
    st.pop();
}
```

---

## 12.2 括号匹配模板

```cpp
stack<char> st;

for (char c : s) {
    if (c == '(') st.push(c);
    else if (c == ')') {
        if (st.empty()) {
            // 不匹配
        } else {
            st.pop();
        }
    }
}
```

---

## 12.3 单调栈模板

```cpp
stack<int> st;

for (int i = 0; i < n; i++) {
    while (!st.empty() && st.top() >= a[i]) st.pop();

    // 此时 st.top() 就是左边第一个比 a[i] 小的元素（如果存在）

    st.push(a[i]);
}
```

---

## 13. 一份完整示例代码

```cpp
#include <iostream>
#include <stack>
using namespace std;

int main() {
    stack<int> st;

    st.push(10);
    st.push(20);
    st.push(30);

    cout << "栈顶元素: " << st.top() << endl;
    cout << "栈大小: " << st.size() << endl;

    st.pop();

    cout << "弹出后栈顶: " << st.top() << endl;

    while (!st.empty()) {
        cout << st.top() << " ";
        st.pop();
    }
    cout << endl;

    return 0;
}
```

---

## 14. 总结

`stack` 的核心特点：

- **后进先出**
    
- **只能操作栈顶**
    
- 常用函数只有几个：`push()`、`pop()`、`top()`、`empty()`、`size()`
    

蓝桥杯里最常见的几个使用方向：

- **括号匹配**
    
- **表达式求值**
    
- **单调栈**
    
- **DFS 非递归**
    

---

## 15. 必背内容

```cpp
stack<int> st;

st.push(x);      // 入栈
st.pop();        // 出栈
st.top();        // 取栈顶
st.empty();      // 判空
st.size();       // 元素个数
```

以及最重要的一句：

```cpp
int x = st.top();
st.pop();
```

因为 `pop()` 本身不返回值。

---
