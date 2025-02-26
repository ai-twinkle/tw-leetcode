# 1749. Maximum Absolute Sum of Any Subarray

You are given an integer array `nums`. 
The absolute sum of a subarray $[\text{nums}_l, \text{nums}_{l+1}, ..., \text{nums}_{r-1}, \text{nums}_r]$ is 
$abs(\text{nums}_l + \text{nums}_{l+1} + ... + \text{nums}_{r-1} + \text{nums}_r)$.

Return the maximum absolute sum of any (possibly empty) subarray of `nums`.

Note that `abs(x)` is defined as follows:

- If `x` is a negative integer, then `abs(x) = -x`.
- If `x` is a non-negative integer, then `abs(x) = x`.

## 基礎思路
這題最佳方法是利用前綴和的概念，觀察任一子陣列的和都可以表示為兩個前綴和之差，也就是：  
$$
\text{sum}[i,j] = \text{prefix}[j+1] - \text{prefix}[i]
$$  

當我們計算前綴和時，同時也可以找到前綴和中的最大值與最小值，而絕對值最大的子陣列和就等於這兩者之差。

### 數學證明

假設給定一個長度為 $ n $ 的陣列 $\text{nums}$，定義前綴和 $P(k)$ 為：

$$
P(0) = 0,\quad P(k) = \sum_{i=0}^{k-1} \text{nums}[i] \quad (1 \leq k \leq n)
$$

那麼，任意子陣列 $\text{nums}[i \dots j]$ 的和可以寫成：

$$
S(i, j) = P(j+1) - P(i)
$$

定義：

$$
M = \max_{0 \le k \le n} P(k) \quad \text{與} \quad m = \min_{0 \le k \le n} P(k)
$$

**證明步驟：**

1. **上界證明：**  
   對於任意滿足 $0 \leq i < j+1 \leq n$ 的子陣列，其和為  
   $$
   S(i, j) = P(j+1) - P(i)
   $$  
   因為對所有 $k$ 都有 $m \leq P(k) \leq M$，所以  
   $$
   S(i, j) \leq M - m
   $$
   同時，由於 $|S(i,j)| = |P(j+1) - P(i)|$ 且絕對值運算滿足對調性（即 $|a-b| = |b-a|$），因此無論 $P(j+1)$ 大於或小於 $P(i)$，都有：  
   $$
   |P(j+1) - P(i)| \leq M - m
   $$

2. **下界證明（存在達到上界的子陣列）：**  
   由於 $M$ 與 $m$ 分別是所有前綴和的最大值與最小值，存在指標 $j_0$ 與 $i_0$ 使得：  
   $$
   P(j_0) = M,\quad P(i_0) = m
   $$
   注意到若 $i_0 < j_0$，則考慮子陣列 $\text{nums}[i_0 \dots (j_0 - 1)]$ 得：  
   $$
   S(i_0, j_0-1) = P(j_0) - P(i_0) = M - m
   $$
   如果反過來 $j_0 < i_0$，我們也可以取對調順序，因為絕對值滿足對稱性，此時  
   $$
   |P(i_0) - P(j_0)| = M - m
   $$
   因此，總能找到一對前綴和使得子陣列和的絕對值等於 $M - m$。

結合以上兩點，我們證明了：

$$
\max_{0 \leq i < j \leq n} |P(j) - P(i)| = M - m
$$

這正是我們所需要的，也就是說，**所有子陣列和的絕對值的最大值就等於前綴和中的最大值與最小值之差**。

> Tips  
> 利用前綴和的性質，可以將所有子陣列和的問題化簡為求前綴和序列中兩數之差的最大值，這樣就能避免枚舉所有子陣列，從而大幅提升運算效率。

## 解題步驟

### Step 1: 初始化變數

```typescript
let runningSum = 0;  // 用來累加前綴和
let maxSum = 0;      // 目前遇到的最大前綴和
let minSum = 0;      // 目前遇到的最小前綴和
```

### Step 2: 累積前綴和並更新最大與最小值

我們透過一次遍歷陣列，累加前綴和，並在過程中持續更新遇到的最大值與最小值。

```typescript
for (const num of nums) {
  runningSum += num;    
  
  // 更新前綴和中的最大值與最小值
  maxSum = runningSum > maxSum ? runningSum : maxSum;
  minSum = runningSum < minSum ? runningSum : minSum;
}
```

### Step 3: 回傳最大絕對子陣列和

絕對子陣列和的最大值等於前綴和中的最大值與最小值之差。

```typescript
return maxSum - minSum;
```

## 時間複雜度

- 只需一次遍歷陣列，時間複雜度為 $O(n)$
- 總時間複雜度為 $O(n)$

> $O(n)$

## 空間複雜度
- 僅使用常數個變數進行計算，不需額外的資料結構，空間複雜度為 $O(1)$
- 總空間複雜度為 $O(1)$

> $O(1)$
