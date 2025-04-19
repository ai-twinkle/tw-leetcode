# 2563. Count the Number of Fair Pairs

Given a 0-indexed integer array `nums` of size `n` and two integers `lower` and `upper`, 
return the number of fair pairs.

A pair (i, j) is fair if:

- `0 <= i < j < n`, and
- `lower <= nums[i] + nums[j] <= upper`

## 基礎思路

題目要求計算給定整數陣列中，有多少對數字 `(i, j)`（且滿足條件 `i < j`）的和位於指定的範圍 `[lower, upper]` 內。

我們可以透過以下步驟有效地解決這個問題：

1. **排序陣列**：  
   將陣列排序，這樣可透過雙指標技巧（two-pointer）高效計算滿足特定條件的數字對數量。

2. **計算符合條件的對數**：  
   設計一個輔助函式，計算「所有數字對和 ≤ limit」的數量。

3. **計算最終結果**：  
   透過兩次輔助函式呼叫，分別計算出和 ≤ `upper` 與和 < `lower` 的對數，再將兩者相減，即為答案。

## 解題步驟

### Step 1：初始化與排序

首先，將原始輸入陣列轉換為 `Int32Array` 以利用內建數值排序功能，並獲得陣列長度以利後續操作：

```typescript
// 將輸入數字轉為 Int32Array 以便進行高效的數值排序
const sortedNumbers = Int32Array.from(nums);
sortedNumbers.sort();

// 紀錄陣列長度，供後續雙指標使用
const lengthOfNumbers = sortedNumbers.length;
```

### Step 2：設計雙指標輔助函式

接著，我們建立輔助函式 `countPairsAtMost(limit)`，使用雙指標計算所有數字對 `(i, j)`（`i < j`）的和不超過 `limit` 的數量：

```typescript
function countPairsAtMost(limit: number): number {
  let pairCount = 0;
  let leftIndex = 0;
  let rightIndex = lengthOfNumbers - 1;

  // 使用雙指標從兩端向內逼近
  while (leftIndex < rightIndex) {
    const sumOfPair = sortedNumbers[leftIndex] + sortedNumbers[rightIndex];

    if (sumOfPair <= limit) {
      // 此時，[leftIndex+1...rightIndex] 的所有數字與 leftIndex 配對皆有效
      pairCount += rightIndex - leftIndex;
      leftIndex++;  // 左側往右移動，尋找下一組有效配對
    } else {
      rightIndex--; // 和過大，右側往左移動以降低總和
    }
  }

  return pairCount;
}
```

- **初始狀態**：
  - `pairCount` 計算有效對數。
  - `leftIndex` 指向陣列頭部。
  - `rightIndex` 指向陣列尾部。

- **迴圈條件**：
  - 當兩個指標尚未交錯 (`leftIndex < rightIndex`)，持續檢查。

- **邏輯判斷**：
  - 若當前的數字對總和 `sumOfPair` 小於或等於限制值 `limit`，表示從 `leftIndex` 到 `rightIndex` 之間的所有元素與 `leftIndex` 均可形成合法配對，增加 `rightIndex - leftIndex` 對數，並移動 `leftIndex` 往右。
  - 若總和超過限制值，則表示右邊的數字太大，需將 `rightIndex` 左移。

### Step 3：計算最終答案

我們透過兩次調用上述輔助函式，分別取得和 ≤ `upper` 與和 < `lower` 的對數，並計算差值，即得出位於 `[lower, upper]` 範圍內的數字對總數：

```typescript
// 計算和 ≤ upper 的數字對總數
const countUpToUpper = countPairsAtMost(upper);

// 計算和 < lower 的數字對總數 (即 ≤ lower - 1)
const countBelowLower = countPairsAtMost(lower - 1);

// 最終答案為兩者之差
return countUpToUpper - countBelowLower;
```

## 時間複雜度

- **排序操作**：
  使用內建的排序函式進行排序，時間複雜度為 $O(n \log n)$。

- **雙指標操作**：
  每次調用輔助函式 `countPairsAtMost()` 時，僅需掃描整個陣列一次，時間複雜度為 $O(n)$。由於總共調用兩次，因此整體仍為 $O(n)$。

- 總時間複雜度為 $O(n \log n) + O(n) = O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- **排序使用的額外陣列**：
  轉換輸入數字為 `Int32Array` 會產生額外空間，空間複雜度為 $O(n)$。

- **輔助函式內部使用空間**：
  雙指標與計數器僅需常數空間 $O(1)$。

- 總空間複雜度主要為 $O(n)$。

> $O(n)$
