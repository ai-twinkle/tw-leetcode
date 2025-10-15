# 3350. Adjacent Increasing Subarrays Detection II

Given an array nums of `n` integers, 
your task is to find the maximum value of `k` for which there exist two adjacent subarrays of length `k` each, 
such that both subarrays are strictly increasing. 
Specifically, check if there are two subarrays of length `k` starting at indices `a` and `b` (`a < b`), where:

- Both subarrays `nums[a..a + k - 1]` and `nums[b..b + k - 1]` are strictly increasing.
- The subarrays must be adjacent, meaning `b = a + k`.

Return the maximum possible value of `k`.

A subarray is a contiguous non-empty sequence of elements within an array.

**Constraints:**

- `2 <= nums.length <= 2 * 10^5`
- `-10^9 <= nums[i] <= 10^9`

## 基礎思路

本題要求在整數陣列中，找出最大的整數 `k`，使得存在兩段**相鄰**且**長度皆為 `k`** 的子陣列，且這兩段子陣列都**嚴格遞增**。
也就是說，對某個起點 `a`，需要同時滿足：

- `nums[a .. a+k-1]` 嚴格遞增；
- `nums[a+k .. a+2k-1]` 嚴格遞增；
- 兩段緊鄰（第二段的起點為第一段的尾端之後）。

在思考解法時，我們需要特別注意幾個重點：

- **嚴格遞增「連續段」的長度（run length）**：若我們一路線性掃描陣列並維護當前嚴格遞增段的長度，就能快速知道「一段內能切出兩段長度為 `k` 的子陣列」的上限（因為同一段內可切成兩段相鄰子段的最大 `k` 為 `⌊run/2⌋`）。
- **跨邊界相鄰段**：當嚴格遞增關係中斷時，前一段與新一段在邊界相鄰；此時能形成的 `k` 受限於兩段中**較短的一段**（因為兩段都必須長度至少 `k` 才能湊成相鄰的兩段）。
- **單次線性掃描即可**：在每個位置更新目前遞增段長度、前一段長度，並在兩種情境下（同一長段內切兩段、跨段邊界湊兩段）更新候選答案的最大值。

綜合以上，線性掃描一遍陣列，同步維護「當前遞增段長度」與「前一遞增段長度」，在每一步計算兩種候選 `k` 並取最大，即可得到答案。

## 解題步驟

### Step 1：變數宣告、邊界快速返回與初始狀態

先處理長度不足的情況；接著準備掃描所需的狀態變數：目前遞增段長度、前一遞增段長度、最佳答案、與上一個元素值。

```typescript
const length = nums.length;

// 簡單早退：至少需要兩個元素才可能形成任何嚴格遞增關係
if (length < 2) {
  return 0;
}

let currentRunLength = 1;     // 以 index 為結尾的當前嚴格遞增段長度
let previousRunLength = 0;    // 當前段之前、緊鄰的一段嚴格遞增段長度
let bestK = 0;                // 目前為止的最佳答案
let previousValue = nums[0];  // 快取上一個元素，減少屬性讀取
```

### Step 2：單次線性掃描 — 維護遞增段長度並更新兩種候選答案

逐一讀取元素，若嚴格遞增則延長當前段，否則遇到邊界就把當前段移到「前一段」，並重設當前段。
於每一步，同時計算兩種候選 `k`：

- **跨邊界**：`k = min(previousRunLength, currentRunLength)`；
- **同段內切兩段**：`k = ⌊currentRunLength / 2⌋`。

兩者取較大者更新答案。

```typescript
// 單趟掃描；在每一步更新段長與候選答案
for (let index = 1; index < length; index += 1) {
  const value = nums[index];

  // 延長或重置當前嚴格遞增段
  if (value > previousValue) {
    currentRunLength += 1;
  } else {
    // 段落邊界：把當前段長移到 previous，並重置當前段為 1
    previousRunLength = currentRunLength;
    currentRunLength = 1;
  }

  // 候選 1：跨段邊界（兩段相鄰），k 受限於兩段中較短者
  const candidateAcrossBoundary =
    previousRunLength < currentRunLength ? previousRunLength : currentRunLength;

  if (candidateAcrossBoundary > bestK) {
    bestK = candidateAcrossBoundary;
  }

  // 候選 2：同一長段內切兩段（可切成兩個長度為 floor(run/2) 的相鄰子段）
  // 以無號位移實作 floor(currentRunLength / 2)
  const candidateWithinRun = (currentRunLength >>> 1);

  if (candidateWithinRun > bestK) {
    bestK = candidateWithinRun;
  }

  // 前進滑動視窗
  previousValue = value;
}
```

### Step 3：回傳結果

掃描完成後回傳目前記錄到的最大 `k`。

```typescript
return bestK;
```

## 時間複雜度

- 單次線性掃描陣列，每個元素僅被處理一次，更新段長與答案為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的狀態變數（常數額外空間）。
- 總空間複雜度為 $O(1)$。

> $O(1)$
