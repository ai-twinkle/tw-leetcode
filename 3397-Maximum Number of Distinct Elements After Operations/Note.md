# 3397. Maximum Number of Distinct Elements After Operations

You are given an integer array nums and an integer `k`.

You are allowed to perform the following operation on each element of the array at most once:

- Add an integer in the range `[-k, k]` to the element.

Return the maximum possible number of distinct elements in `nums` after performing the operations.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^9`
- `0 <= k <= 10^9`

## 基礎思路

本題要求在每個元素上最多加上一個範圍在 `[-k, k]` 的整數後，使整個陣列中「不同元素」的數量最大化。

在思考解法時，我們需要注意幾個核心觀察：

- **每個元素可調整的範圍有限**：對於 `nums[i]`，可變動區間為 `[nums[i] - k, nums[i] + k]`。
- **元素之間可能重疊**：若兩個數的可變範圍有交集，必須選擇不同的值以避免重複。
- **目標為最大化 distinct 數量**：這表示我們應該**盡量讓每個元素取到一個唯一的值**，並且這些值彼此不重疊。

為達此目標，可以採用以下策略：

- **排序後貪心選擇**：將 `nums` 排序後，依序處理每個元素。對於當前元素，其可調整區間為 `[base - k, base + k]`，我們希望為其分配一個「尚未使用的最小可行值」，以保留空間給後續元素。
- **維護上次選取的值**：記錄上一個被放置的數字 `previousPlacedValue`，確保下一個選取值必須嚴格大於它。
- **範圍判斷**：若最小可行值在 `[leftBound, rightBound]` 範圍內，則可以選擇該值並計入 distinct；若超出範圍，則跳過此元素。

此策略能以線性掃描方式求得最優解，因為每次都選擇**最小可能的合法值**，不會影響後續元素的可行性。

## 解題步驟

### Step 1：轉換並排序輸入

先將輸入轉為 `Int32Array` 以加速排序，並以升序排列，確保之後能從小到大依序放置元素。

```typescript
// 將輸入轉為 Int32Array，加速排序
const data = Int32Array.from(nums);

// 升序排列，確保後續貪心策略可行
data.sort(); 
```

### Step 2：初始化變數

準備計數器與追蹤前一個放置值的變數，方便後續維護嚴格遞增序列。

```typescript
// 計數不同值的數量
let countDistinct = 0;

// 紀錄上一個已放置的值
let previousPlacedValue = 0;

// 標記是否已有放置值（首個元素特殊處理）
let hasPreviousPlaced = false;

// 取陣列長度以避免重複計算
const length = data.length;
```

### Step 3：逐一處理每個元素並計算可行範圍

對每個元素，計算其能調整的範圍 `[leftBound, rightBound]`，並依此決定能否放置新值。

```typescript
for (let index = 0; index < length; index++) {
  // 當前基準值
  const base = data[index];

  // 計算該數能被調整的範圍
  const leftBound = base - k;
  const rightBound = base + k;

  // ...
}
```

### Step 4：選取最小合法可放值（貪心核心）

從該元素可行範圍內，選出「最小可行且未重複」的值。
若存在上一個已放置值，需確保結果比其大至少 1。

```typescript
for (let index = 0; index < length; index++) {
  // Step 3：逐一處理每個元素並計算可行範圍

  // 初始候選值為可調整範圍左界
  let candidateValue = leftBound;

  // 若已有先前放置值，需至少比它大 1
  if (hasPreviousPlaced && candidateValue <= previousPlacedValue) {
    candidateValue = previousPlacedValue + 1;
  }

  // ...
}
```

### Step 5：檢查是否可放入合法範圍內

若候選值仍位於 `[leftBound, rightBound]` 範圍內，即可將此值視為成功放置。

```typescript
for (let index = 0; index < length; index++) {
  // Step 3：逐一處理每個元素並計算可行範圍
  
  // Step 4：選取最小合法可放值（貪心核心）
  
  // 若候選值仍在可調整範圍內，則可成功放置
  if (candidateValue <= rightBound) {
    countDistinct += 1;              // 累計不同值數量
    previousPlacedValue = candidateValue; // 更新上一個放置值
    hasPreviousPlaced = true;        // 標記已有放置
  }
  // 若超出範圍，則跳過（無法放置新值）
}
```

### Step 6：回傳結果

遍歷結束後，`countDistinct` 即為可達到的最大不同元素數量。

```typescript
// 回傳最大可達不同元素數量
return countDistinct;
```

## 時間複雜度

- 排序花費 $O(n \log n)$；
- 主迴圈線性掃描，每個元素處理 $O(1)$；
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- 額外使用一個 `Int32Array` 儲存輸入（$O(n)$）；
- 其餘變數皆為常數級額外空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$

