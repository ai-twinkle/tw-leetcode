# 1674. Minimum Moves to Make Array Complementary

You are given an integer array `nums` of even length `n` and an integer `limit`. 
In one move, you can replace any integer from `nums` with another integer between 1 and limit, inclusive.

The array `nums` is complementary if for all indices `i` (0-indexed), `nums[i] + nums[n - 1 - i]` equals the same number. 
For example, the array `[1,2,3,4]` is complementary because for all indices `i`, `nums[i] + nums[n - 1 - i] = 5`.

Return the minimum number of moves required to make `nums` complementary.

**Constraints:**

- `n == nums.length`
- `2 <= n <= 10^5`
- `1 <= nums[i] <= limit <= 10^5`
- `n` is even.

## 基礎思路

本題要求找出一種方式，對陣列進行最少次數的元素修改，使得每一對對稱位置的元素之和均等於某個相同的目標值。每次修改可以將任意元素更改為 `[1, limit]` 範圍內的任意整數。

在思考解法時，可掌握以下核心觀察：

- **配對結構**：
  陣列由頭尾對稱的元素對構成，每一對的和必須等於目標值。因此問題本質是：選定一個目標和，使所有配對需要的修改次數總和最小。

- **每對的修改次數取決於目標值與當前和的關係**：
  對於一對元素，若目標和恰好等於當前和，則需要 0 次修改；若目標和落在「只改一個元素即可達成」的範圍內，則需要 1 次修改；否則需要 2 次修改。這三種情況的分界點可以精確計算。

- **目標值為離散整數，暴力枚舉代價過高**：
  目標和的合法範圍為 `[2, 2 * limit]`，若對每個目標值逐一計算所有配對的修改次數，時間複雜度過高。需要更有效率的方式批次計算。

- **差分陣列可將區間更新轉為常數操作**：
  每一對元素對應的「修改次數隨目標值的變化」是分段線性的，可以用差分陣列記錄各段邊界的變化量，最後透過前綴和一次性還原每個目標值對應的總修改次數。

依據以上特性，可以採用以下策略：

- **以「最壞情況需 2 次修改」為基準**，並用差分陣列記錄對應目標值可以節省的修改次數。
- **對每一對元素，計算出可節省 1 次與可節省 2 次的目標值區間**，並在差分陣列上標記邊界。
- **對差分陣列做前綴和**，同時追蹤所有合法目標值中的最小修改次數。

此策略將時間複雜度從暴力枚舉的 $O(n \cdot \text{limit})$ 降至 $O(n + \text{limit})$，適合在大範圍限制下高效求解。

## 解題步驟

### Step 1：初始化基本維度與差分陣列

計算陣列長度、配對數量與目標和的合法上界，並配置差分陣列。差分陣列的大小需多 2，以安全容納右邊界的加回操作。

```typescript
const arrayLength = nums.length;
const halfLength = arrayLength >> 1;
const maxTarget = limit << 1;

// 差分陣列大小為 maxTarget + 2，以安全處理右邊界的回補操作
const differenceArray = new Int32Array(maxTarget + 2);
```

### Step 2：對每一對元素計算可節省的修改次數並寫入差分陣列

對每一對對稱元素，分析其當前和與目標值之間的關係：
- 若目標落在「只改一個元素」的範圍內，可節省 1 次（相對於基準的 2 次）；
- 若目標恰好等於當前和，可再節省 1 次（共節省 2 次）。

透過差分陣列標記這兩段節省的邊界，而非逐一更新每個目標值。

```typescript
// 建立差分陣列：每對以 +2 為基準，在單次修改可達成的範圍內 -1，在精確和位置再 -1
for (let pairIndex = 0; pairIndex < halfLength; pairIndex++) {
  const leftValue = nums[pairIndex];
  const rightValue = nums[arrayLength - 1 - pairIndex];

  // 內聯 min/max 以避免 Math 函數呼叫的額外開銷
  const smaller = leftValue < rightValue ? leftValue : rightValue;
  const larger = leftValue < rightValue ? rightValue : leftValue;

  const pairSum = leftValue + rightValue;
  const singleMoveLow = smaller + 1;
  const singleMoveHigh = larger + limit;

  // 在單次修改可達成的範圍內減 1（全域基準 2 在迴圈結束後加入）
  differenceArray[singleMoveLow] -= 1;
  differenceArray[singleMoveHigh + 1] += 1;

  // 在精確的 pairSum 位置再減 1（此處無需任何修改）
  differenceArray[pairSum] -= 1;
  differenceArray[pairSum + 1] += 1;
}
```

### Step 3：對差分陣列做前綴和並找出最小修改次數

以「每對都需要修改 2 次」作為初始基準成本，接著對差分陣列進行前綴和還原，逐步累加每個目標值實際對應的成本調整量，同時追蹤整個合法範圍 `[2, maxTarget]` 中的最小值。

```typescript
// 前綴和的同時追蹤合法目標範圍 [2, maxTarget] 內的最小成本
// 基準成本為 2 * halfLength（每對皆需修改兩個元素的最壞情況）
let runningCost = halfLength << 1;
let minimumMoves = runningCost;
for (let targetSum = 2; targetSum <= maxTarget; targetSum++) {
  runningCost += differenceArray[targetSum];
  if (runningCost < minimumMoves) {
    minimumMoves = runningCost;
  }
}
```

### Step 4：回傳最終最小修改次數

```typescript
return minimumMoves;
```

## 時間複雜度

- 遍歷所有配對建立差分陣列，共 $n / 2$ 對，每對操作為常數時間，共 $O(n)$；
- 對差分陣列進行前綴和掃描，範圍為 $[2, 2 \cdot \text{limit}]$，共 $O(\text{limit})$；
- 總時間複雜度為 $O(n + \text{limit})$。

> $O(n + \text{limit})$

## 空間複雜度

- 差分陣列大小為 $2 \cdot \text{limit} + 2$；
- 其餘變數皆為常數個；
- 總空間複雜度為 $O(\text{limit})$。

> $O(\text{limit})$
