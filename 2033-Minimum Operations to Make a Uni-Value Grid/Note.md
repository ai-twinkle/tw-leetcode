# 2033. Minimum Operations to Make a Uni-Value Grid

You are given a 2D integer `grid` of size `m x n` and an integer `x`. 
In one operation, you can add `x` to or subtract `x` from any element in the `grid`.

A uni-value grid is a grid where all the elements of it are equal.

Return the minimum number of operations to make the grid uni-value. 
If it is not possible, return `-1`.

## 基礎思路

這道題要求將給定的二維整數矩陣（grid）透過加或減一個固定的數字 `x`，讓所有數字變得完全相同（稱為「統一矩陣」）。
要解決此問題，我們有兩個核心觀察：

1. **檢查是否可能統一**  
   我們想要將所有數字調整為相同的值，每個數字之間的差值必須是 `x` 的倍數。
   因此，我們必須先檢查 grid 中所有數字除以 `x` 的餘數是否一致。
   若存在任一數字的餘數不同，代表不可能透過調整達成統一，直接回傳 `-1`。

2. **計算最小的操作次數**  
   當我們確認能統一後，下一步就是計算最少要操作幾次才能讓所有數字一致。
   透過數學上的觀察可知，如果我們將每個數字都除以 `x` 做歸一化，則將所有數字調整為這些歸一化數字的中位數時，能達成最少的操作次數（因為中位數最小化了所有數字之間的絕對差總和）。

最後，我們只需將所有數字調整為中位數所需的操作次數加總，即可得到最終答案。

## 解題步驟

### Step 1：確認可行性與歸一化處理

- **可行性檢查**  
  我們取出 grid 中第一個數字的餘數作為基準，遍歷整個 grid。若發現任何一個數字除以 `x` 的餘數與基準不同，就代表不可能統一，直接回傳 `-1`。

- **歸一化處理**  
  在可行性檢查時，順便將每個數字除以 `x`（向下取整數），計算各個歸一化數字的出現次數。這有助於我們之後快速找出最合適的統一目標值。

```typescript
const n = grid.length;
const m = grid[0].length;
const total = n * m;
const freq = new Uint16Array(10001); // 根據題目歸一化後的數值最大為10000

// 以第一個數字餘數作為基準
const remainder = grid[0][0] % x;

for (let i = 0; i < n; ++i) {
  const row = grid[i];
  for (let j = 0; j < m; ++j) {
    const val = row[j];
    if (val % x !== remainder) {
      return -1; // 出現不同餘數，無法統一
    }
    // 計算歸一化數字頻率
    const norm = (val / x) >> 0;
    freq[norm]++;
  }
}
```

### Step 2：找出最適合的中位數

- **利用累計頻率找中位數**  
  總共有 `total` 個數字，中位數會位於 `(total + 1) / 2` 的位置。我們透過累計頻率逐步加總，當累計次數首次超過或等於這個位置時，當前的數值即是歸一化數字的中位數。

```typescript
const medianIndex = (total + 1) >> 1;
let cumCount = 0;
let medianNorm = 0;
for (let i = 0; i < freq.length; i++) {
  cumCount += freq[i];
  if (cumCount >= medianIndex) {
    medianNorm = i;
    break;
  }
}
```

### Step 3：計算最少的操作次數

- **計算總操作次數**  
  最後，我們計算將每個數字調整到中位數所需的步數。對每個歸一化數字而言，操作次數即是該數字與中位數的絕對差值乘以其出現的頻率，將所有次數加總後即為最終答案。

```typescript
let operations = 0;
for (let i = 0; i < freq.length; i++) {
  if (freq[i] > 0) {
    operations += freq[i] * Math.abs(i - medianNorm);
  }
}

return operations;
```

## 時間複雜度

- **可行性與歸一化**：遍歷整個 `m × n` 的矩陣，因此需要 $O(m × n)$ 的時間。
- **找中位數與計算操作次數**：頻率陣列大小固定（最大 10001），因此這些步驟可視為常數時間 $O(1)$。
- 總時間複雜度為 $O(m × n)$。

> $O(m \times n)$

## 空間複雜度

- **頻率陣列**：大小固定（最多 10001 個元素），可視為常數級別 $O(1)$。
- **其他變數**：僅需常數空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
