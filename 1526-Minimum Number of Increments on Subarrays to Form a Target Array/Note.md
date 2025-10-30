# 1526. Minimum Number of Increments on Subarrays to Form a Target Array

You are given an integer array `target`. 
You have an integer array `initial` of the same size as `target` with all elements initially zeros.

In one operation you can choose any subarray from `initial` and increment each value by one.

Return the minimum number of operations to form a `target` array from `initial`.

The test cases are generated so that the answer fits in a 32-bit integer.

**Constraints:**

- `1 <= target.length <= 10^5`
- `1 <= target[i] <= 10^5`

## 基礎思路

本題要求我們從一個初始全為 0 的陣列 `initial` 經由多次操作轉換為目標陣列 `target`。
每次操作可選擇任意連續子陣列，將其中所有元素加 1，問最少需要多少次操作。

在思考時可觀察到以下特性：

1. **第一個元素的形成必須獨立完成**：
   因為一開始所有元素為 0，若 `target[0] = x`，則至少需執行 `x` 次操作。
2. **遞增變化的區段才需要額外操作**：
   若後一元素比前一元素大，代表這個位置需要額外的遞增操作；
   若後一元素小於或等於前一元素，則不需額外操作（因為可以被前面的大區段覆蓋）。
3. **整體操作次數可分解為「所有上升幅度之和」**：
   將每次從低到高的上升部分加總，即為最小操作數。

因此策略如下：

- **初始貢獻**：`target[0]` 為第一格上升所需的操作數；
- **逐步差分**：對每個位置計算 `target[i] - target[i-1]`，若為正則加入總和；
- **單次線性掃描**：透過一次遍歷即可完成加總，時間與空間皆為線性。

## 解題步驟

### Step 1：處理防禦性邊界條件

若輸入為空陣列（雖題目保證不會發生），則直接回傳 0。

```typescript
// 若目標陣列為空，無需任何操作
const length = target.length;
if (length === 0) {
  return 0;
}
```

### Step 2：初始化基礎操作次數與前一元素記錄

第一個元素必須從 0 遞增至 `target[0]`，因此初始操作次數為 `target[0]`。

```typescript
// 初始化操作次數：第一個元素需執行 target[0] 次加一
let totalOperations = target[0];

// 記錄前一個元素，用於後續差分比較
let previousValue = target[0];
```

### Step 3：線性遍歷並累加正向上升差值

從第二個元素開始遍歷，若當前值大於前一值，表示需要額外的加總操作。

```typescript
// 單次線性遍歷，僅在值上升時累加差值
for (let index = 1; index < length; index += 1) {
  const currentValue = target[index];

  // 若出現上升，加入上升幅度
  if (currentValue > previousValue) {
    totalOperations += (currentValue - previousValue);
  }

  // 更新前一元素
  previousValue = currentValue;
}
```

### Step 4：回傳最終結果

完成遍歷後，`totalOperations` 即為形成目標陣列所需的最少操作數。

```typescript
// 回傳最終最小操作次數
return totalOperations;
```

## 時間複雜度

- 單次線性掃描陣列，僅執行基本運算與比較；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用常數變數儲存計數與暫存值；
- 總空間複雜度為 $O(1)$。

> $O(1)$
