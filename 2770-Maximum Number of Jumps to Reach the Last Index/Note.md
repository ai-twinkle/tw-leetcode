# 2770. Maximum Number of Jumps to Reach the Last Index

You are given a 0-indexed array `nums` of `n` integers and an integer `target`.

You are initially positioned at index `0`. 
In one step, you can jump from index `i` to any index `j` such that:

- `0 <= i < j < n`
- `-target <= nums[j] - nums[i] <= target`

Return the maximum number of jumps you can make to reach index `n - 1`.

If there is no way to reach index `n - 1`, return `-1`.

**Constraints:**

- `2 <= nums.length == n <= 1000`
- `-10^9 <= nums[i] <= 10^9`
- `0 <= target <= 2 * 10^9`

## 基礎思路

本題要求從索引 0 出發，每次可以向右跳至任意滿足值差條件的位置，求抵達最後一個索引的最大跳躍次數。若無法抵達終點則回傳 `-1`。

在思考解法時，可掌握以下核心觀察：

- **跳躍具有單向性與最優子結構**：
  每次只能向右跳，且每個位置的最大跳躍次數僅取決於其所有合法前驅的最大跳躍次數，因此適合以動態規劃由左至右逐步推導。

- **合法跳躍條件可轉化為值域範圍檢查**：
  跳躍合法性條件 `|nums[j] - nums[i]| <= target` 等同於 `nums[j]` 落在以 `nums[i]` 為中心、寬度為 `target` 的區間之內，可直接用兩個邊界比較取代絕對值運算。

- **不可達狀態需明確標記並剪枝**：
  若某個前驅位置本身無法被抵達，則以其為出發點的跳躍毫無意義，應在遍歷時直接跳過，以減少無效計算。

- **最大跳躍次數由所有合法前驅中的最優者決定**：
  對於每個目標位置，遍歷其所有合法前驅並追蹤其中跳躍次數最大者，加一即為該位置的最大跳躍次數。

依據以上特性，可以採用以下策略：

- **建立一維動態規劃陣列**，索引 0 初始化為 0，其餘位置初始化為 `-1` 表示尚不可達。
- **由左至右遍歷每個位置**，對每個位置再往回掃描所有合法前驅，從中選出最大跳躍次數並加一。
- **若掃描結束後仍無合法前驅**，保留 `-1` 表示此位置不可達，最終直接回傳終點的狀態值。

此策略能以 $O(n^2)$ 的時間正確求出最大跳躍次數，邏輯清晰且易於實作。

## 解題步驟

### Step 1：初始化動態規劃陣列

建立長度為 `n` 的陣列儲存每個位置的最大跳躍次數；索引 0 為出發點，其跳躍次數為 0；其餘位置皆初始化為 `-1`，代表目前尚不可達。

```typescript
const length = nums.length;

// 使用 Int16Array，因 n <= 1000，最大跳躍次數可輕易容納；-1 表示不可達
const dp = new Int16Array(length);
dp[0] = 0;
for (let index = 1; index < length; index++) {
  dp[index] = -1;
}
```

### Step 2：對每個位置計算其合法值域範圍，並初始化當前最優前驅

從索引 1 開始向右遍歷每個目標位置；對每個位置預先計算允許跳入的值域上下界，並以 `bestJumps = -1` 表示尚未找到任何合法前驅。

```typescript
for (let i = 1; i < length; i++) {
  // 快取當前值並預先計算合法範圍邊界，以避免重複呼叫 Math.abs
  const currentValue = nums[i];
  const lowerBound = currentValue - target;
  const upperBound = currentValue + target;
  let bestJumps = -1;

  // ...
}
```

### Step 3：往回掃描所有前驅，跳過不可達者並進行範圍篩選

在內層迴圈中遍歷所有索引小於 `i` 的前驅位置；若前驅本身不可達（跳躍次數為負），則直接略過；若前驅的值不在允許範圍內，同樣略過。

```typescript
for (let i = 1; i < length; i++) {
  // Step 2：計算合法值域範圍並初始化最優前驅

  for (let j = 0; j < i; j++) {
    const previousJumps = dp[j];

    // 跳過不可達的前驅以縮減搜尋範圍
    if (previousJumps < 0) {
      continue;
    }

    const previousValue = nums[j];

    // 以兩個直接比較取代 Math.abs 以提升速度
    if (previousValue < lowerBound || previousValue > upperBound) {
      continue;
    }

    // ...
  }

  // ...
}
```

### Step 4：追蹤所有合法前驅中的最大跳躍次數

通過範圍篩選後，將該前驅的跳躍次數與目前記錄的最優值比較，若更大則更新；此步驟在內層迴圈中以直接比較取代 `Math.max` 呼叫。

```typescript
for (let i = 1; i < length; i++) {
  // Step 2：計算合法值域範圍並初始化最優前驅

  for (let j = 0; j < i; j++) {
    // Step 3：跳過不可達及範圍外的前驅

    // 以內聯比較追蹤最大跳躍次數，取代呼叫 Math.max
    if (previousJumps > bestJumps) {
      bestJumps = previousJumps;
    }
  }

  // ...
}
```

### Step 5：根據最優前驅結果更新當前位置的跳躍次數

內層迴圈結束後，若 `bestJumps` 仍為 `-1`，表示此位置無任何合法前驅，保持不可達狀態；否則將最優前驅次數加一寫入當前位置。

```typescript
for (let i = 1; i < length; i++) {
  // Step 2：計算合法值域範圍並初始化最優前驅

  for (let j = 0; j < i; j++) {
    // Step 3：跳過不可達及範圍外的前驅

    // Step 4：追蹤最大跳躍次數
  }

  // 若未找到任何合法前驅，bestJumps 保持 -1，代表此位置不可達
  if (bestJumps >= 0) {
    dp[i] = bestJumps + 1;
  }
}
```

### Step 6：回傳終點的最大跳躍次數

整個陣列處理完畢後，終點位置的值即為答案：若可達則為最大跳躍次數，若不可達則為 `-1`。

```typescript
return dp[length - 1];
```

## 時間複雜度

- 外層迴圈遍歷 $n$ 個位置，內層迴圈對每個位置往回掃描最多 $n$ 個前驅；
- 每次迭代內的操作皆為常數時間。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 使用長度為 $n$ 的動態規劃陣列；
- 其餘皆為固定數量的輔助變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
