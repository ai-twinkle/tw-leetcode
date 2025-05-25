# 2017. Grid Game

You are given a 0-indexed 2D array `grid` of size `2 x n`, 
where `grid[r][c]` represents the number of points at position `(r, c)` on the matrix. 
Two robots are playing a game on this matrix.

Both robots initially start at `(0, 0)` and want to reach `(1, n-1)`. 
Each robot may only move to the right `((r, c)` to `(r, c + 1))` or 
down `((r, c)` to `(r + 1, c))`.

At the start of the game, the first robot moves from `(0, 0)` to `(1, n-1)`, 
collecting all the points from the cells on its path. 
For all cells `(r, c)` traversed on the path, `grid[r][c]` is set to 0. 
Then, the second robot moves from `(0, 0)` to `(1, n-1)`, 
collecting the points on its path. 
Note that their paths may intersect with one another.

The first robot wants to minimize the number of points collected by the second robot. 
In contrast, the second robot wants to maximize the number of points it collects. 
If both robots play optimally, return the number of points collected by the second robot.

**Constraints:**

- `grid.length == 2`
- `n == grid[r].length`
- `1 <= n <= 5 * 10^4`
- `1 <= grid[r][c] <= 10^5`

## 基礎思路

此題核心在於：兩台機器人在同一條 $2\times n$ 的矩陣上從左上角走到右下角，且第一台機器人會改變它走過的格子分數（將其設為 0），第二台機器人則在剩下的分數中盡可能拿最多分。

觀察可知，對於第一台機器人，由於只能往右或往下，它轉折（由上排到下排）的列位置 $i$ 決定了：

- **剩餘頂排分數** = 頂排在列 $i+1$ 到 $n-1$ 的所有格子之和（第一機器人將列 $0\ldots i$ 的頂排格子清零）。
- **已收集底排分數** = 底排在列 $0$ 到 $i-1$ 的所有格子之和（第一機器人在轉折前會沿底排走過這些格子）。

第二台機器人面對同樣的限制，也會在轉折列 $i$ 選擇能拿到更多分的一條路徑，因此它的得分為

$$
\max(\text{剩餘頂排分數},\;\text{已收集底排分數}).
$$

而第一台機器人要**最小化**這個最大值，故只要對所有可能的轉折列 $i$ 計算上述兩個分數並取最小的那個即為答案。利用一次從左到右的掃描，動態維護**頂排後綴和**與**底排前綴和**，即可在 $O(n)$ 時間內完成。

## 解題步驟

### Step 1：初始化與設定列數及行快取

```typescript
// 欄位數    
const columns = grid[0].length;

// 快取頂排與底排
const topRow = grid[0];
const bottomRow = grid[1];
```

### Step 2：計算頂排分數總和（後綴總和初始值）

將頂排所有格子的分數累加到 `remainingTopPoints`，此時即代表轉折前第一台機器人尚未走任何列時，頂排的後綴和。

```typescript
// 計算頂排剩餘分數總和
let remainingTopPoints = 0;
for (let columnIndex = 0; columnIndex < columns; columnIndex++) {
  remainingTopPoints += topRow[columnIndex];
}
```
### Step 3：初始化底排累計分數與結果變數

```typescript
// 底排已收集分數
let collectedBottomPoints = 0;
// 第一機器人希望最小化第二機器人得分，初始化為無限大
let bestSecondRobotPoints = Infinity;
```

### Step 4：從左到右掃描，模擬每個轉折點並更新最佳結果

這個 for 迴圈從左到右掃描每個欄位，模擬第一台機器人在每個欄位往下的情況，我們需要：

- 扣掉當前欄頂排分數（表示這格被第一台機器人拿走）。
- 計算第二台機器人此情境下最大可能拿到的分數，必為「剩餘頂排分數」與「已拿到底排分數」的最大值。
- 記錄這些最大分數中的最小值。
- 將當前欄底排分數加進前綴和。

```typescript
// 從左往右掃描，每個位置模擬 Robot1 在此處轉折
for (let columnIndex = 0; columnIndex < columns; columnIndex++) {
  // Robot1 跳過此頂排格子，減少剩餘頂排分數
  remainingTopPoints -= topRow[columnIndex];

  // 第二機器人能獲取較大值：剩餘頂排或已收集底排
  const secondRobotPoints =
    remainingTopPoints > collectedBottomPoints
      ? remainingTopPoints
      : collectedBottomPoints;

  // Robot1 以最小化第二機器人得分為目標
  if (secondRobotPoints < bestSecondRobotPoints) {
    bestSecondRobotPoints = secondRobotPoints;
  }

  // Robot1 收集此底排格子的分數
  collectedBottomPoints += bottomRow[columnIndex];
}
```

### Step 5：回傳最終結果

回傳第一台機器人能讓第二台機器人拿到的最小分數。

```typescript
return bestSecondRobotPoints;
```

## 時間複雜度

- 頂排分數初始化一次 $O(n)$，模擬所有欄位一次 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅用到固定數量變數記錄累加和、答案。
- 總空間複雜度為 $O(1)$

> $O(1)$
