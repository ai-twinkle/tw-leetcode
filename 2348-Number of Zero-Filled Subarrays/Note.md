# 2348. Number of Zero-Filled Subarrays

Given an integer array `nums`, return the number of subarrays filled with `0`.

A subarray is a contiguous non-empty sequence of elements within an array.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `-10^9 <= nums[i] <= 10^9`

## 基礎思路

本題要求計算陣列中所有元素皆為 $0$ 的連續子陣列數量。
若直接暴力枚舉所有區間，時間複雜度會達到 $O(n^2)$，在 $n$ 很大時難以接受。
因此我們考慮**線性掃描**的方式：
只要遇到 $0$，就統計「以該 $0$ 結尾」的所有全零子陣列數量，利用**連續 0 的長度累加**，即可在線性時間內求解。

其中關鍵在於：

- 掃描陣列，維護當前連續 0 的長度 $k$。
- 每遇到一個 $0$，就表示又多了一個新結尾的全零子陣列，數量為目前的連續 0 長度。
- 每遇到非 0，則將連續 0 長度歸零。

## 解題步驟

### Step 1：初始化累加器與狀態變數

- 建立一個 `totalSubarrays` 來累加答案。
- 用 `consecutiveZeros` 追蹤目前連續的 $0$ 長度。

```typescript
let totalSubarrays = 0;
let consecutiveZeros = 0;
```

### Step 2：遍歷陣列並動態統計連續 0

- 從左到右逐一檢查陣列每個元素。

```typescript
for (let index = 0, length = nums.length; index < length; index++) {
```

### Step 3：根據元素值更新連續 0 並累加答案

- 若當前元素為 $0$，將連續 0 長度加 1，並將其加到總數（代表新出現的全零子陣列）。
- 若不是 $0$，則將連續 0 長度歸零。

```typescript
  if (nums[index] === 0) {
    consecutiveZeros++;
    totalSubarrays += consecutiveZeros;
  } else {
    consecutiveZeros = 0;
  }
```

### Step 4：返回最終結果

- 所有全零子陣列數量已累加於 `totalSubarrays`，直接回傳。

```typescript
return totalSubarrays;
```

## 時間複雜度

- 單一 for 迴圈遍歷陣列，對每個元素僅進行常數次操作。
- 無任何巢狀迴圈或遞迴。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅用到常數數量變數，不需額外陣列或結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
