# 1458. Max Dot Product of Two Subsequences

Given two arrays `nums1` and `nums2`.

Return the maximum dot product between non-empty subsequences of `nums1` and `nums2` with the same length.

A subsequence of a array is a new array which is formed from the original array by deleting some (can be none) of the characters 
without disturbing the relative positions of the remaining characters. 
(ie, `[2,3,5]` is a subsequence of `[1,2,3,4,5]` while `[1,5,3]` is not).

**Constraints:**

- `1 <= nums1.length, nums2.length <= 500`
- `-1000 <= nums1[i], nums2[i] <= 1000`

## 基礎思路

本題要在兩個陣列 `nums1`、`nums2` 中各選出**非空**且**長度相同**的子序列，最大化它們的點積總和。
子序列允許刪除元素但需保留相對順序，因此每一步選擇都會影響後續可選的元素範圍，屬於典型的動態規劃問題。

在思考解法時，需要注意幾個重點：

* **子序列必須非空**：這使得「答案不能是 0（代表什麼都不選）」這種情況必須被排除，初始化時需要確保狀態不會被空集合污染。
* **點積由成對選取構成**：每次若選 `(nums1[i], nums2[j])` 作為一對，則接下來只能選 `i`、`j` 之後的位置，符合 DP 的「前綴最優」結構。
* **選或不選是核心轉移**：
    * 選取一對：會得到 `nums1[i] * nums2[j]`，並可接在先前某個有效狀態之後形成更長子序列。
    * 不選：可以跳過 `nums1[i]` 或跳過 `nums2[j]`，以保留更好的結果。
* **負數情境需要特別處理**：若先前最佳狀態是負數，硬把它延伸反而會變差，因此延伸只在「有利」時才進行。

因此可以用 DP 設計：每個狀態代表「考慮到某個前綴時，能得到的最大點積」，並以「選配對 / 跳過元素」的方式轉移；再透過滾動陣列把空間壓到與較短陣列同階。

## 解題步驟

### Step 1：對齊維度以降低 DP 記憶體

先確保用來當 DP 第二維的陣列較短，降低滾動列長度並減少快取未命中。

```typescript
// 確保第二維較小，以減少 DP 記憶體與快取未命中
let firstNumbers = nums1;
let secondNumbers = nums2;

if (secondNumbers.length > firstNumbers.length) {
  const swapNumbers = firstNumbers;
  firstNumbers = secondNumbers;
  secondNumbers = swapNumbers;
}
```

### Step 2：轉為 Int32Array 並取得長度

將輸入轉為 `Int32Array` 以避免熱迴圈中的 boxed number 成本，並取得長度。

```typescript
// 轉成 Int32Array 以避免熱迴圈中 boxed number 的額外負擔
const firstArray = new Int32Array(firstNumbers);
const secondArray = new Int32Array(secondNumbers);

const firstLength = firstArray.length;
const secondLength = secondArray.length;
```

### Step 3：初始化負無限與滾動 DP 列

用 32-bit 最小整數作負無限，並用兩列滾動陣列將 DP 空間壓到與較短陣列同階。

```typescript
// 使用 32 位元最小整數作為負無限，用於 DP 初始化
const integerMinimum = -2147483648;

// 使用兩列滾動陣列，將空間從 O(n*m) 降為 O(min(n,m))
let previousRow = new Int32Array(secondLength);
let currentRow = new Int32Array(secondLength);

// 以負無限初始化，確保子序列必須非空
previousRow.fill(integerMinimum);
```

### Step 4：外層迴圈 — 枚舉第一個陣列的位置

外層逐一固定 `firstIndex`，內層會掃描第二個陣列並更新 `currentRow`。

```typescript
for (let firstIndex = 0; firstIndex < firstLength; firstIndex++) {
  const firstValue = firstArray[firstIndex];

  // ...
}
```

### Step 5：內層迴圈 — 計算當前配對乘積並建立起始候選

每個 `(firstIndex, secondIndex)` 先以 `product` 作為「至少選 1 對」的基礎，並用 `bestValue` 維護該格 DP 最佳值。

```typescript
for (let firstIndex = 0; firstIndex < firstLength; firstIndex++) {
  // Step 4：外層迴圈 — 枚舉第一個陣列的位置

  const firstValue = firstArray[firstIndex];

  for (let secondIndex = 0; secondIndex < secondLength; secondIndex++) {
    const secondValue = secondArray[secondIndex];

    // 將當前配對乘積視為最小有效子序列（至少選 1 對）
    const product = firstValue * secondValue;

    let bestValue = product;

    // ...
  }

  // ...
}
```

### Step 6：在內層迴圈中嘗試延伸對角狀態

若左上角（對角）狀態為正，延伸才可能更好；否則不延伸，避免把負數拖累結果。

```typescript
for (let firstIndex = 0; firstIndex < firstLength; firstIndex++) {
  // Step 4：外層迴圈 — 枚舉第一個陣列的位置

  const firstValue = firstArray[firstIndex];

  for (let secondIndex = 0; secondIndex < secondLength; secondIndex++) {
    // Step 5：內層迴圈 — 計算當前配對乘積並建立起始候選

    // 只有在能提升結果時，才延伸先前有效子序列
    if (firstIndex > 0 && secondIndex > 0) {
      const diagonalValue = previousRow[secondIndex - 1];
      if (diagonalValue > 0) {
        const extendedValue = product + diagonalValue;
        if (extendedValue > bestValue) {
          bestValue = extendedValue;
        }
      }
    }

    // ...
  }

  // ...
}
```

### Step 7：在內層迴圈中比較「跳過元素」的轉移並寫入 DP

用上方（跳過第一陣列當前元素）與左方（跳過第二陣列當前元素）承接最佳值，最後寫入 `currentRow[secondIndex]`。

```typescript
for (let firstIndex = 0; firstIndex < firstLength; firstIndex++) {
  // Step 4：外層迴圈 — 枚舉第一個陣列的位置

  const firstValue = firstArray[firstIndex];

  for (let secondIndex = 0; secondIndex < secondLength; secondIndex++) {
    // Step 5：內層迴圈 — 計算當前配對乘積並建立起始候選

    // Step 6：在內層迴圈中嘗試延伸對角狀態

    // 跳過 nums1 當前元素，承接上一列最佳值
    const upperValue = previousRow[secondIndex];
    if (upperValue > bestValue) {
      bestValue = upperValue;
    }

    // 跳過 nums2 當前元素，承接本列左側最佳值
    if (secondIndex > 0) {
      const leftValue = currentRow[secondIndex - 1];
      if (leftValue > bestValue) {
        bestValue = leftValue;
      }
    }

    currentRow[secondIndex] = bestValue;
  }

  // ...
}
```

### Step 8：每完成一列後交換滾動列

一列算完後交換 `previousRow` 與 `currentRow`，避免重新配置造成 GC 壓力。

```typescript
for (let firstIndex = 0; firstIndex < firstLength; firstIndex++) {
  // Step 4：外層迴圈 — 枚舉第一個陣列的位置

  for (let secondIndex = 0; secondIndex < secondLength; secondIndex++) {
    // Step 5：內層迴圈 — 計算當前配對乘積並建立起始候選

    // Step 6：在內層迴圈中嘗試延伸對角狀態

    // Step 7：在內層迴圈中比較「跳過元素」的轉移並寫入 DP
  }

  // 交換兩列以避免重新配置，降低 GC 壓力
  const swapRow = previousRow;
  previousRow = currentRow;
  currentRow = swapRow;
}
```

### Step 9：回傳最終答案

DP 最後一格即為兩陣列中可取得的「非空」最大點積。

```typescript
// 最終格子包含非空子序列的最大點積
return previousRow[secondLength - 1];
```

## 時間複雜度

- 令 `n = nums1.length`，`m = nums2.length`。
- 程式會先交換兩者使 `secondLength = min(n, m)`、`firstLength = max(n, m)`。
- 主要計算為雙層迴圈：
    - 外層執行 `firstLength = max(n, m)` 次。
    - 內層執行 `secondLength = min(n, m)` 次。
    - 內層每次僅進行常數次運算（乘法、加法、比較、讀寫陣列），無額外巢狀迴圈。
- 因此總操作次數精確為 `max(n, m) * min(n, m)` 的常數倍。
- 總時間複雜度為 $O(n \times m)$。

> $O(n \times m)$

## 空間複雜度

- 令 `n = nums1.length`，`m = nums2.length`，且交換後 `firstLength = max(n, m)`、`secondLength = min(n, m)`。
- 會配置：
    - `firstArray`：長度 `max(n, m)` 的 `Int32Array`
    - `secondArray`：長度 `min(n, m)` 的 `Int32Array`
    - `previousRow`、`currentRow`：各長度 `min(n, m)` 的 `Int32Array`
- 額外空間總量為：
    - `max(n, m) + min(n, m) + 2 * min(n, m) = max(n, m) + 3 * min(n, m)`
    - 且 `max(n, m) + min(n, m) = n + m`
- 總空間複雜度為 $O(n + m)$。

> $O(n + m)$
