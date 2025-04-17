# 2176. Count Equal and Divisible Pairs in an Array

Given a 0-indexed integer array `nums` of length `n` and an integer `k`, 
return the number of pairs `(i, j)` where `0 <= i < j < n`, such that `nums[i] == nums[j]` and `(i * j)` is divisible by `k`.

## 基礎思路

本題要求計算所有索引對 `(i, j)`，滿足：

1. `0 ≤ i < j < n`；
2. `nums[i] === nums[j]`；
3. `(i * j) % k === 0`。

由於題目最大長度僅為 100，故可考慮使用雙重迴圈枚舉所有可能的 `(i, j)`，並檢查上述條件，這樣可以簡化實作過程。
雖然這樣的時間複雜度雖為 $O(n^2)$，但在本題中會比較複雜的資料結構更為高效。

## 解題步驟

### Step 1：初始化與資料結構

首先，我們獲取陣列長度 `n`，並初始化計數變數 `total` 為 `0`。同時，為了減少在內層迴圈中重複存取 `nums[i]` 的開銷，將其暫存至 `vi`。

```typescript
const n = nums.length;
let total = 0;
```

### Step 2：雙重迴圈枚舉並條件判斷

接著，我們從 `i = 0` 開始，利用兩層迴圈枚舉所有可能的 `(i, j)`。對於每一組：

- **值相等檢查**：`vi === nums[j]`；
- **索引乘積可被整除檢查**：`(i * j) % k === 0`。

若條件同時成立，便將 `total` 自增。

```typescript
for (let i = 0; i < n; ++i) {
  const vi = nums[i];
  for (let j = i + 1; j < n; ++j) {
    if (vi === nums[j] && (i * j) % k === 0) {
      ++total;
    }
  }
}
```

- **第一層迴圈**：固定第一個索引 `i`；
- **第二層迴圈**：從 `j = i + 1` 到 `n - 1`，確保 `i < j`；
- **條件判斷**：同時檢驗值相等及乘積可被 `k` 整除。

### Step 3：返回最終結果

所有合法的對都累加至 `total`，最終直接回傳：

```typescript
return total;
```

## 時間複雜度

- **雙重迴圈**：總共需檢查約 `n*(n-1)/2` 組 `(i, j)`，時間複雜度為 $O\bigl(\tfrac{n(n-1)}{2}\bigr) = O(n^2)$。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 只使用了常數級額外變數（`n`、`total`、`vi`、`i`、`j`），空間複雜度為 $O(1)$。
- 總空間複雜度為 $O(1)$。

> $O(1)$
