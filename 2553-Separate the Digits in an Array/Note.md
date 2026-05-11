# 2553. Separate the Digits in an Array

Given an array of positive integers `nums`, return an array `answer` 
that consists of the digits of each integer in `nums` after separating them in the same order they appear in `nums`.

To separate the digits of an integer is to get all the digits it has in the same order.

- For example, for the integer `10921`, the separation of its digits is `[1,0,9,2,1]`.

**Constraints:**

- `1 <= nums.length <= 1000`
- `1 <= nums[i] <= 10^5`

## 基礎思路

本題要求將一個正整數陣列中的每個整數拆解為個別數字，並依照原始順序展平成一個一維陣列輸出。問題本身並不複雜，但若追求效能，需要特別留意動態擴展與除法運算的成本。

在思考解法時，可掌握以下核心觀察：

- **預先知道總長度可以避免動態擴展**：
  若直接逐個推入結果陣列，每次擴容都有額外成本；若能先計算出所有數字的總位數，便可一次性配置精確大小的陣列。

- **位數判斷可以用閾值比較替代對數運算**：
  計算一個整數的位數，最直觀的方式是取 log10，但透過一系列與 10 的冪次的大小比較，可以在常數時間內完成，且效率更高。

- **從最高位開始擷取可以免去反轉步驟**：
  若從最低位（個位數）開始擷取，最後需要將結果反轉；若改從最高位開始，搭配遞減的 10 次方除數，即可直接按正確順序寫入輸出，省去一次線性反轉。

- **整數除法截斷可以用位元運算加速**：
  對浮點數使用 `| 0` 進行位元截斷，效果等同於 `Math.floor`（對正數），但在 JavaScript 引擎中通常更快。

依據以上特性，可以採用以下策略：

- **兩次線性掃描**：第一次統計總位數以配置精確大小的輸出陣列，第二次實際擷取並寫入數字。
- **預計算 10 的冪次表**，避免在擷取過程中重複計算除數。
- **從高位到低位逐一剝離數字**，確保輸出順序正確，無需任何後處理。

此策略能以兩次線性掃描完成，在常數空間的輔助下達到最佳效能。

## 解題步驟

### Step 1：建立預計算的 10 次方查找表

在函式外部預先建立一個固定大小的整數陣列，索引 `N` 對應 `10^N`，讓後續擷取數字時能直接查表取得除數，避免重複乘法運算。

```typescript
// 預計算 10 的次方以加速數字擷取（儲存於函式外部）
// 索引 N 存放 10^N — 用作 (N+1) 位數數字擷取最高位時的除數
const POWERS_OF_TEN = new Int32Array([1, 10, 100, 1000, 10000, 100000]);
```

### Step 2：初始化基本尺寸變數

讀取輸入陣列的長度，供後續兩次掃描使用。

```typescript
const numsLength = nums.length;
```

### Step 3：第一次掃描，統計所有整數的總位數

遍歷整個輸入陣列，對每個數值以閾值比較判斷其位數，並累加至總計數中。此步驟的目的是得知輸出陣列的精確大小，以便後續一次性配置，避免動態擴展的額外成本。

```typescript
// 第一次掃描：計算總位數以配置精確大小的輸出陣列
let totalDigitCount = 0;
for (let index = 0; index < numsLength; index++) {
  const value = nums[index];
  // 閾值比較比 Math.log10 或重複除法更快
  if (value < 10) {
    totalDigitCount += 1;
  } else if (value < 100) {
    totalDigitCount += 2;
  } else if (value < 1000) {
    totalDigitCount += 3;
  } else if (value < 10000) {
    totalDigitCount += 4;
  } else if (value < 100000) {
    totalDigitCount += 5;
  } else {
    totalDigitCount += 6;
  }
}
```

### Step 4：依據總位數預先配置輸出陣列

以第一次掃描所得的總位數為長度，建立精確大小的結果陣列，並初始化寫入指標。

```typescript
// 預先配置精確長度的結果陣列 — 避免動態擴展／push 的額外成本
const result: number[] = new Array(totalDigitCount);
let writeIndex = 0;
```

### Step 5：第二次掃描，對每個數值判斷位數

進行第二次遍歷，對每個數值再次用相同的閾值梯形判斷其位數，為後續從高位到低位擷取做準備。

```typescript
// 第二次掃描：從最高位到最低位依序擷取數字
for (let index = 0; index < numsLength; index++) {
  let value = nums[index];

  // 使用相同的閾值梯形判斷位數
  let digitCount: number;
  if (value < 10) {
    digitCount = 1;
  } else if (value < 100) {
    digitCount = 2;
  } else if (value < 1000) {
    digitCount = 3;
  } else if (value < 10000) {
    digitCount = 4;
  } else if (value < 100000) {
    digitCount = 5;
  } else {
    digitCount = 6;
  }

  // ...
}
```

### Step 6：從高位到低位逐一擷取數字並寫入結果

在確定位數之後，使用遞減的 10 次方除數，從最高位開始剝離每一位數字，依序寫入輸出陣列，避免後置反轉步驟。

```typescript
for (let index = 0; index < numsLength; index++) {
  // Step 5：判斷當前數值的位數

  // 使用遞減的 10 次方從左到右擷取數字
  // 此方式避免擷取後還需要反轉的步驟
  for (let digitPosition = digitCount - 1; digitPosition >= 0; digitPosition--) {
    const divisor = POWERS_OF_TEN[digitPosition];
    // 位元 OR 0 比 Math.floor 更快地截斷為整數
    const leadingDigit = (value / divisor) | 0;
    result[writeIndex++] = leadingDigit;
    // 減去最高位的貢獻，以便下一輪處理次高位
    value -= leadingDigit * divisor;
  }
}
```

### Step 7：回傳完整的數字展平結果

所有整數的數字均已按正確順序寫入結果陣列，直接回傳即可。

```typescript
return result;
```

## 時間複雜度

- 設 `n` 為 `nums` 的長度，每個整數最多有 6 位（因為 `nums[i] <= 10^5`），位數判斷與擷取均為常數時間；
- 第一次掃描遍歷 `n` 個元素：$O(n)$；
- 第二次掃描遍歷 `n` 個元素，每個元素內層迴圈最多執行 6 次：$O(n)$；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 預計算的 10 次方查找表為固定大小（6 個元素）：$O(1)$；
- 輸出陣列大小等於所有數字的總位數，最多為 $6n$；
- 總空間複雜度為 $O(n)$。

> $O(n)$
