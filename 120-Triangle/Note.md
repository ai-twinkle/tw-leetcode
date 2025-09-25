# 120. Triangle

Given a `triangle` array, return the minimum path sum from top to bottom.

For each step, you may move to an adjacent number of the row below. 
More formally, if you are on index `i` on the current row, you may move to either index `i` or index `i + 1` on the next row.

**Constraints:**

- `1 <= triangle.length <= 200`
- `triangle[0].length == 1`
- `triangle[i].length == triangle[i - 1].length + 1`
- `-10^4 <= triangle[i][j] <= 10^4`

## 基礎思路

本題給定一個數字三角形 `triangle`，我們要從頂端走到底端，找出一條路徑，使得**所有經過的數字和最小**。

在思考解法時，我們需注意幾個重點：

- 每一步只能走到下一層**相鄰的位置**，也就是從第 `i` 列的第 `j` 個元素，只能走到第 `i+1` 列的第 `j` 或 `j+1` 個元素。
- 三角形結構逐層展開，第 `i` 層有 `i+1` 個數字。
- 因為每層只能往下一層走，不會回頭，我們可以考慮 **自底向上（bottom-up）** 或 **自頂向下（top-down）** 的動態規劃方法。

為了解決這個問題，我們可以採用以下策略：

- **動態規劃轉移關係**：從上一層的某個位置走到本層的 `j`，只可能來自上層的 `j-1` 或 `j`。
- **狀態壓縮**：由於每一層只需要上一層的資訊即可，因此可以只用一維陣列記錄目前的最小路徑和。
- **就地更新**：我們從右到左更新每一層的動態規劃陣列，以避免覆蓋掉還未使用的上一層資訊。

## 解題步驟

### Step 1：初始化與邊界判斷

若只有一層，直接回傳頂點；否則初始化 `dp` 陣列並設為三角形頂點。

```typescript
// 取得三角形的層數
const rowCount = triangle.length;

// 特殊情況：若只有一層，直接回傳該值
if (rowCount === 1) {
  return triangle[0][0] | 0;
}

// 建立一維 DP 陣列，儲存每一層的最小路徑和
const dp = new Int32Array(rowCount);

// 將頂端數字作為初始狀態
dp[0] = triangle[0][0] | 0;
```

### Step 2：逐層處理三角形，使用右到左更新方式

從第二層開始（index = 1），對每層每個位置計算當前的最小累積路徑和，並就地更新 `dp` 陣列。

```typescript
// 從第二層開始往下處理每一層
for (let rowIndex = 1; rowIndex < rowCount; rowIndex++) {
  const row = triangle[rowIndex];

  // 從右往左更新 dp，以保留上一層狀態
  for (let colIndex = rowIndex; colIndex >= 0; colIndex--) {
    const cellValue = row[colIndex] | 0;

    if (colIndex === rowIndex) {
      // 最右側只能從 dp[colIndex - 1] 來
      dp[colIndex] = (dp[colIndex - 1] + cellValue) | 0;
    } else if (colIndex === 0) {
      // 最左側只能從 dp[0] 來
      dp[0] = (dp[0] + cellValue) | 0;
    } else {
      // 中間的格子：從左或右父節點取最小者
      const leftParent = dp[colIndex - 1];
      const rightParent = dp[colIndex];
      const minParent = leftParent < rightParent ? leftParent : rightParent;
      dp[colIndex] = (minParent + cellValue) | 0;
    }
  }
}
```

### Step 3：找出最小的最終結果

完成所有層的處理後，`dp` 陣列中的每個值就是從頂端走到該終點的最小總和，取其中最小值即為答案。

```typescript
// 最後在 dp 中找到最小值作為最短路徑和
let result = dp[0];
for (let i = 1; i < rowCount; i++) {
  if (dp[i] < result) {
    result = dp[i];
  }
}

// 回傳結果（位元或轉為整數，為效能處理）
return result | 0;
```

## 時間複雜度

- 每層最多有 $n$ 個元素，每個元素最多更新一次。
- 共 $n$ 層，因此總共最多更新 $\frac{n(n+1)}{2}$ 個格子。
- 採用就地更新，每層為 $O(n)$。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 使用一個長度為 $n$ 的一維陣列儲存中間狀態。
- 沒有額外的矩陣或遞迴堆疊。
- 總空間複雜度為 $O(n)$。

> $O(n)$
