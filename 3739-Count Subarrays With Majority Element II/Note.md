# 3739. Count Subarrays With Majority Element II

You are given an integer array `nums` and an integer `target`.

Return the number of subarrays of `nums` in which `target` is the majority element.

The majority element of a subarray is the element that appears strictly more than half of the times in that subarray.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^9`
- `1 <= target <= 10^9`

## 基礎思路

本題要求計算所有子陣列中，`target` 是多數元素（出現次數嚴格超過子陣列長度一半）的子陣列數量。

在思考解法時，可掌握以下核心觀察：

- **多數元素條件可轉化為「平衡值」問題**：
  將 `target` 視為 `+1`，其他元素視為 `-1`，則一段子陣列的加總若為正，即代表 `target` 出現次數超過一半。

- **子陣列平衡值等同於前綴差**：
  一個子陣列 `[l, r]` 的平衡值，等於前綴平衡值 `prefix[r+1] - prefix[l]`，只要此差值大於 0，該子陣列就滿足條件。

- **對所有右端點，需高效統計合法的左端點數量**：
  固定右端點 `r`，需統計有多少左端點 `l` 使得 `prefix[r+1] > prefix[l]`，即 `prefix[l] < prefix[r+1]`。

- **累積計數可以在走訪過程中維護**：
  若以 `runningPositiveCount` 紀錄目前所有「平衡值嚴格小於當前平衡值」的前綴數量，每次遇到 `target` 時可直接整批加入，遇到非 `target` 則整批移除，從而在 $O(1)$ 時間內更新。

依據以上特性，可以採用以下策略：

- **以帶偏移的前綴頻率陣列追蹤各平衡值出現次數**，偏移量為陣列長度，使索引保持非負。
- **逐步維護 `runningPositiveCount`**：遇到 `target` 時，當前平衡值上升前的那一格計數整批納入；遇到非 `target` 時，當前平衡值下降到的那一格計數整批移除。
- **每個位置將 `runningPositiveCount` 累加進最終答案**，即可在單次線性走訪中完成統計。

此策略將問題壓縮至 $O(n)$ 時間，無須對每個子陣列重複計算。

## 解題步驟

### Step 1：初始化前綴頻率陣列與偏移起點

建立一個長度為 `length * 2 + 1` 的整數陣列 `prefixFrequency`，以偏移量 `length` 表示平衡值為 0 的前綴（即空前綴），並將其初始頻率設為 1。

```typescript
const length = nums.length;

// 型別陣列可避免裝箱，並提供連續的快取友善儲存。
const prefixFrequency = new Int32Array(length * 2 + 1);

// 索引 'length' 對應到平衡值為 0 的起始（空前綴）。
prefixFrequency[length] = 1;
```

### Step 2：初始化追蹤用的狀態變數

`balanceIndex` 是當前平衡值加上偏移量後的索引；
`runningPositiveCount` 追蹤有多少較早的前綴可與當前位置構成正平衡子陣列；
`majoritySubarrayCount` 為最終答案的累計值。

```typescript
// 'balanceIndex' 是當前平衡值加上 'length' 後的索引，以保持非負。
let balanceIndex = length;

// 'runningPositiveCount' 追蹤到目前為止，有多少前綴能與此處形成正平衡子陣列。
let runningPositiveCount = 0;
let majoritySubarrayCount = 0;
```

### Step 3：遇到 `target` 時，更新平衡值並整批納入合法前綴

若當前元素等於 `target`，平衡值上升；
在上升前，舊平衡值對應的頻率整批加入 `runningPositiveCount`（因為它們對新的更高平衡值而言皆為合法左端點），再遞增 `balanceIndex` 並記錄新前綴。

```typescript
for (let i = 0; i < length; ++i) {
  if (nums[i] === target) {
    // 平衡值上升：原本在頂端的前綴計數全數成為合法左端點。
    runningPositiveCount += prefixFrequency[balanceIndex];
    ++balanceIndex;
    ++prefixFrequency[balanceIndex];
  } else {
    // ...
  }

  // ...
}
```

### Step 4：遇到非 `target` 時，更新平衡值並整批移除失效前綴

若當前元素不是 `target`，平衡值下降；
必須先遞減 `balanceIndex` 移至新位置，再將該位置的頻率從 `runningPositiveCount` 中移除（這些前綴已不再構成正平衡），最後記錄新前綴。

```typescript
for (let i = 0; i < length; ++i) {
  if (nums[i] === target) {
    // Step 3：平衡值上升時，整批納入合法前綴
  } else {
    // 平衡值下降：即將落到的那一格不再具有正平衡貢獻。
    --balanceIndex;
    runningPositiveCount -= prefixFrequency[balanceIndex];
    ++prefixFrequency[balanceIndex];
  }

  // ...
}
```

### Step 5：將當前合法子陣列數累加至答案

每處理完一個位置後，`runningPositiveCount` 即為以當前位置為右端點的合法子陣列數，將其加入 `majoritySubarrayCount`。

```typescript
for (let i = 0; i < length; ++i) {
  if (nums[i] === target) {
    // Step 3：平衡值上升時，整批納入合法前綴
  } else {
    // Step 4：平衡值下降時，整批移除失效前綴
  }

  majoritySubarrayCount += runningPositiveCount;
}
```

### Step 6：回傳最終結果

走訪結束後，`majoritySubarrayCount` 即為所有滿足條件的子陣列總數，直接回傳。

```typescript
return majoritySubarrayCount;
```

## 時間複雜度

- 單次線性走訪整個 `nums`，每個位置僅做常數次運算；
- 前綴頻率陣列的讀寫皆為 $O(1)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- `prefixFrequency` 陣列長度為 $2n + 1$；
- 其餘僅使用固定數量的輔助變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
