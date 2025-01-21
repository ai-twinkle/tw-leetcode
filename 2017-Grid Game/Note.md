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

## 基礎思路

我們可以將問題轉換為分析 `grid` 的兩個獨立一維陣列：`grid[0]` 和 `grid[1]`。  
考慮 **第一機器人**的行動邏輯：

1. **第一機器人轉移點**：  
   當第一機器人在第 `index` 位置從 `grid[0]` 切換到 `grid[1]` 時：
    - `grid[0]`：第 `index` 位置之前（包含 `index`）的所有分數會被清空。
    - `grid[1]`：第 `index` 位置之後（包含 `index`）的所有分數會被清空。

2. **剩餘的有效分數**：  
   經過上述清空後：
    - `grid[0]` 有效分數範圍為第 `index + 1` 之後的部分。
    - `grid[1]` 有效分數範圍為第 `index - 1` 之前的部分。

**機器人二**的目標是最大化分數，根據剩餘分數，其得分可能來自以下兩種情況：
1. **選擇剩餘的 `grid[0]` 分數**：吃完 `grid[0]` 的所有分數。
2. **選擇剩餘的 `grid[1]` 分數**：吃完 `grid[1]` 的所有分數。

由於機器人二會選擇最大化得分的路徑，因此其最終得分為上述兩者中的較大值。

我們的目標是檢索所有可能的 `index`，對每個 `index` 計算機器人二的得分，並在所有情況中選擇 **最小化機器人二得分** 的情況。最小值即為答案。

> 小技巧:
> - 一個節省空間的方法是先紀錄 topSum 是整個 `grid[0]` 加總。並先把 bottomSum 的設為 `0`。
> - 當是 index 時，此時的上方的分數是 topSum 減去 `grid[0][index]`，下方的分數是 bottomSum 加上 `grid[1][index]`。
> - 這樣能大幅減少計算量與所需暫存空間。

## 解題步驟

### Step 1: 紀錄 N 長度

```typescript
const n = grid[0].length;
```

### Step 2: 初始化 `topSum` 以及 `bottomSum`

```typescript
let topSum = grid[0].reduce((a, b) => a + b, 0);  // 紀錄 topSum 是整個 `grid[0]` 加總
let bottomSum = 0;                                // 初始化 bottomSum為 `0`
```

### Step 3: 計算每個 `index` 的得分並記錄最小值

```typescript
// 初始化最小值
let minSecondRobotScore = Infinity;

// 模擬每個 index 的情況
for (let i = 0; i < n; i++) {
  // 先減去 當前 index 在 grid[0] 的分數
  // 因為對於 topSum 來說，需要的是 index 之後的累積分數
  topSum -= grid[0][i];

  // 計算第二機器人再該 index 分割下的能獲取的最大分數
  const secondRobotScore = Math.max(topSum, bottomSum);

  // 更新第二機器人可能獲取的最小分數
  minSecondRobotScore = Math.min(minSecondRobotScore, secondRobotScore);

  // 移動到下一個 index 須把當前 index 的分數加入 bottomSum
  // 因為 bottomSum 是從計算 index 之前的累積分數
  bottomSum += grid[1][i];
}
```

## 時間複雜度
- 計算加總需要 $O(n)$ 時間
- 計算每個 index 的得分需要 $O(n)$ 時間
- 因此總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度
- 我們只使用了常數額外空間，因此空間複雜度為 $O(1)$。
- 這是一個非常高效的解決方案。

> $O(1)$
