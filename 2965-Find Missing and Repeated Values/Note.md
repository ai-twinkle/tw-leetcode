# 2965. Find Missing and Repeated Values

You are given a 0-indexed 2D integer matrix `grid` of size `n * n` with values in the range `[1, n^2]`. 
Each integer appears exactly once except `a` which appears twice and `b` which is missing. 
The task is to find the repeating and missing numbers `a` and `b`.

Return a 0-indexed integer array `ans` of size `2` where `ans[0]` equals to `a` and `ans[1]` equals to `b`.

## 基礎思路

這題可以巧妙地利用數學方式來解。我們知道，理論上在數字範圍 $[1, n^2]$ 內，每個數字都應該只出現一次，但題目中矩陣中卻有一個數 $a$ 重複出現，同時另一個數 $b$ 缺失，這會導致矩陣的總和與平方和產生偏差。  

因此，我們可以先計算矩陣中所有數字的總和與平方和，再分別與理論上的總和與平方和比較，得到 $a-b$ 以及 $a^2-b^2$ 的差值。利用這兩個結果，我們能夠構造出聯立方程，最終求得 $a$ 與 $b$ 的值。

### 數學證明

首先，理論上在數字範圍 $[1, n^2]$ 內，所有數字的總和應為  
$$
\text{total} = \frac{n^2 \times (n^2+1)}{2}
$$  
以及平方和應為  
$$
\text{total_square} = \frac{n^2 \times (n^2+1) \times (2n^2+1)}{6}
$$

由於矩陣中有一個數 $a$ 重複出現，另一個數 $b$ 缺失，因此實際矩陣的總和 $\text{sum}$ 與平方和 $\text{sum_square}$ 與理論值之間存在以下偏差：

1. **計算差值：**
    - 總和的差值為  
      $$
      \text{diff} = \text{sum} - \text{total} = a - b
      $$
    - 平方和的差值為  
      $$
      \text{diff_square} = \text{sum_square} - \text{total_square} = a^2 - b^2
      $$

2. **利用平方差公式：**  
   根據公式  
   $$
   a^2 - b^2 = (a - b)(a + b)
   $$  
   可得  
   $$
   a + b = \frac{\text{diff_square}}{a - b} = \frac{\text{sum_square} - \text{total_square}}{\text{diff}}
   $$

3. **聯立方程求解 $a$ 與 $b$：**  
   我們得到聯立方程：
   $$
   \begin{cases}
   a - b = \text{diff} \\
   a + b = \frac{\text{sum_square} - \text{total_square}}{\text{diff}}
   \end{cases}
   $$
   進而可求得：
   $$
   a = \frac{(a+b) + (a-b)}{2} \quad\text{及}\quad b = \frac{(a+b) - (a-b)}{2}
   $$

## 解題步驟

### Step 1: 計算總和與平方和

首先，我們需要計算矩陣中所有數字的總和與平方和，這樣才能得知實際的 $\text{sum}$ 與 $\text{sumSq}$：

```typescript
const n = grid.length;
let sum = 0, sumSq = 0;

for (let i = 0; i < n; i++) {
  for (let j = 0; j < n; j++) {
    const num = grid[i][j];
    sum += num;
    sumSq += num * num;
  }
}
```

### Step 2: 計算 $a$ 與 $b$ 的值

接下來，根據數學證明，我們計算理論上的總和與平方和，然後利用上述公式求出 $a$ 與 $b$ 的值：

```typescript
// 理論上的總和與平方和 (數字範圍為 [1, n^2])
const total = (n * n * (n * n + 1)) / 2;
const totalSq = (n * n * (n * n + 1) * (2 * n * n + 1)) / 6;

// 計算差值
const diff = sum - total;         // a - b
const diffSquare = sumSq - totalSq; // a^2 - b^2 = (a - b)(a + b)

// 計算 a + b
const sumAB = diffSquare / diff;

// 利用 a + b 與 a - b 求得 a 與 b
const a = (sumAB + diff) / 2;
const b = (sumAB - diff) / 2;
```

## 時間複雜度

- 需要遍歷整個 $n \times n$ 的矩陣，因此時間複雜度為 $O(n^2)$。
- 數學運算的時間複雜度為 $O(1)$。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 由於只使用常數個額外變量，空間複雜度為 $O(1)$。
- 總空間複雜度為 $O(1)$。

> $O(1)$
