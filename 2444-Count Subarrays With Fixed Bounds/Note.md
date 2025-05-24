# 2444. Count Subarrays With Fixed Bounds

You are given an integer array nums and two integers `minK` and `maxK`.

A fixed-bound subarray of `nums` is a subarray that satisfies the following conditions:

- The minimum value in the subarray is equal to `minK`.
- The maximum value in the subarray is equal to `maxK`.

Return the number of fixed-bound subarrays.

A subarray is a contiguous part of an array.

**Constraints:**

- `2 <= nums.length <= 10^5`
- `1 <= nums[i], minK, maxK <= 10^6`

## 基礎思路

題目要求計算陣列中滿足以下條件的「固定上下界子陣列」（fixed-bound subarray）數量：

- 子陣列的最小值剛好等於 `minK`。
- 子陣列的最大值剛好等於 `maxK`。

為了解決這個問題，我們可透過單次線性掃描（one-pass scan）解決。核心思路如下：

- 我們維護三個索引位置：
  - `lastMinKIndex`：最後一次出現 `minK` 的位置。
  - `lastMaxKIndex`：最後一次出現 `maxK` 的位置。
  - `lastInvalidIndex`：最後一次出現超出 `[minK, maxK]` 範圍的無效元素位置。

對於每個位置 `i`，考慮以該位置為結尾的子陣列：

- 必須同時包含至少一次的 `minK` 與 `maxK`。
- 起點必須大於上一次的無效位置 (`lastInvalidIndex`)。

因此，滿足條件的子陣列起始位置範圍為：

$$
\max(0,\; \min(\text{lastMinKIndex},\, \text{lastMaxKIndex}) - \text{lastInvalidIndex})
$$

將這個結果累加即為答案。

## 解題步驟

### Step 1：初始化變數與資料結構

首先取得陣列長度，並初始化三個追蹤索引與答案累加器：

- `totalCount`：記錄符合條件子陣列的總數量。
- `lastMinKIndex`：最後一次遇到值為 `minK` 的索引位置，初始為 `-1`。
- `lastMaxKIndex`：最後一次遇到值為 `maxK` 的索引位置，初始為 `-1`。
- `lastInvalidIndex`：最後一次遇到超出範圍元素的索引位置，初始為 `-1`。

```typescript
const n = nums.length;

let totalCount = 0;
let lastMinKIndex = -1;
let lastMaxKIndex = -1;
let lastInvalidIndex = -1;
```

### Step 2：線性掃描並更新狀態

從陣列頭到尾掃描每個元素：
1. 讀取當前元素
2. 若當前元素不在有效範圍內，更新無效索引
3. 若元素等於邊界值，則更新相應索引位置
4. 計算以當前位置為結尾的合法子陣列最早起點
5. 若合法起點位置在最後一次無效位置之後，則更新總數

```typescript
for (let i = 0; i < n; ++i) {
  const v = nums[i];

  // 檢查是否為無效元素，並更新無效位置索引
  if (v < minK || v > maxK) {
    lastInvalidIndex = i;
  }

  // 更新minK與maxK最新位置
  if (v === minK) lastMinKIndex = i;
  if (v === maxK) lastMaxKIndex = i;

  // 計算合法子陣列最早起始位置
  const earliestStart = lastMinKIndex < lastMaxKIndex
    ? lastMinKIndex
    : lastMaxKIndex;

  // 累加符合條件的子陣列數量
  if (earliestStart > lastInvalidIndex) {
    totalCount += earliestStart - lastInvalidIndex;
  }
}
```

### Step 3：返回最終結果

完成掃描後，直接回傳累加的總數：

```typescript
return totalCount;
```

## 時間複雜度

- **單次線性掃描**：只需要遍歷陣列一次，每個元素做常數次操作，複雜度為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- **使用常數個額外變數**：只需固定數量變數，無須額外陣列儲存資料，空間複雜度為 $O(1)$。
- 總空間複雜度為 $O(1)$。

> $O(1)$
