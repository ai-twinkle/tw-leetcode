# 1295. Find Numbers with Even Number of Digits

Given an array `nums` of integers, return how many of them contain an even number of digits.

**Constraints:**

- `1 <= nums.length <= 500`
- `1 <= nums[i] <= 10^5`

## 基礎思路

題目要求從給定的整數陣列中，計算有多少個數字的位數是偶數。

一個數字若為偶數位數，則位數必為 $2, 4, 6, \dots$，可以透過簡單的數值範圍比較快速判斷：

- 2位數：$10 \leq x < 100$
- 4位數：$1,000 \leq x < 10,000$
- 6位數：$100,000 \leq x < 1,000,000$

因此，我們可透過一次遍歷陣列，對每個數字透過上述區間判斷，即可得知該數是否為偶數位數。

## 解題步驟

### Step 1：初始化與資料結構

首先，取得數字陣列的長度，並初始化一個變數 `totalEvenDigitCount` 來儲存最終符合偶數位數條件的數量：

```typescript
const n = nums.length;
let totalEvenDigitCount = 0;
```

### Step 2：遍歷並檢查每個數字

我們從陣列的第一個元素開始遍歷，每次檢查當前元素的位數是否符合偶數條件。

```typescript
for (let i = 0; i < n; i++) {
  const value = nums[i];

  if (
    (value >= 10 && value < 100) ||         // 2 位數範圍
    (value >= 1_000 && value < 10_000) ||   // 4 位數範圍
    (value >= 100_000 && value < 1_000_000) // 6 位數範圍
  ) {
    totalEvenDigitCount++;
  }
}
```

### Step 3：返回最終結果

完成遍歷後，返回 `totalEvenDigitCount` 即為答案：

```typescript
return totalEvenDigitCount;
```

## 時間複雜度

- **遍歷陣列一次**：對每個元素進行常數時間的位數檢查，因此總時間複雜度為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- **僅使用常數額外空間**：除了原始輸入外，僅額外使用一個計數器和數個常數變數，因此總空間複雜度為 $O(1)$。
- 總空間複雜度為 $O(1)$。

> $O(1)$
