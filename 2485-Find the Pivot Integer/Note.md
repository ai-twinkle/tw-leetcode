# 2485. Find the Pivot Integer

Given a positive integer `n`, find the pivot integer `x` such that:

- The sum of all elements between `1` and `x` inclusively equals the sum of all elements between `x` and `n` inclusively.

Return the pivot integer `x`. 
If no such integer exists, return `-1`. 
It is guaranteed that there will be at most one pivot index for the given input.

**Constraints:**

- `1 <= n <= 1000`

## 基礎思路

本題要求尋找一個整數 `x`，使得：

$$
1 + 2 + \cdots + x = x + (x+1) + \cdots + n
$$

這是一個兩側求和相等的問題，但若直接逐一求和會造成 $O(n)$ 的成本。
更好的方式是利用**等差級數的性質**進行化簡。

觀察可得：

* 左側求和為

  $$
  S_L = \frac{x(x+1)}{2}
  $$

* 右側求和為

  $$
  S_R = \frac{n(n+1)}{2} - \frac{(x-1)x}{2}
  $$

令兩側相等並化簡後會得到：

$$
x^2 = \frac{n(n+1)}{2}
$$

因此：

- 若總和 $\frac{n(n+1)}{2}$ 是**完全平方數**，答案即為 `x = √(總和)`。
- 否則不存在滿足條件的 pivot integer。

此方法可在常數時間 $O(1)$ 內完成。

## 解題步驟

### Step 1：計算 1 到 n 的總和

使用等差級數公式計算總和，作為後續檢查 pivot 是否可能存在的基礎。

```typescript
// 使用等差級數公式計算 1 到 n 的總和
const totalSumFromOneToN = (n * (n + 1)) / 2;
```

### Step 2：計算總和的平方根候選值

若 pivot integer 存在，其值必須是總和的平方根，因此先取整數平方根。

```typescript
// 計算總和的整數平方根作為 pivot 候選
const candidatePivot = Math.floor(Math.sqrt(totalSumFromOneToN));
```

### Step 3：檢查是否為完全平方數並返回結果

若平方根平方後等於總和，代表 pivot 存在並返回；否則回傳 -1。

```typescript
// 若平方後等於總和，表示為完全平方數
if (candidatePivot * candidatePivot === totalSumFromOneToN) {
  return candidatePivot;
}

// 若不符合，則不存在 pivot integer
return -1;
```

## 時間複雜度

- 所有計算皆為常數運算。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 僅使用常數額外變數。
- 總空間複雜度為 $O(1)$。

> $O(1)$
