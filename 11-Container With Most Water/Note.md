# 11. Container With Most Water

You are given an integer array `height` of length `n`. 
There are `n` vertical lines drawn such that the two endpoints of the $i^th$ line are `(i, 0)` and `(i, height[i])`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.

Notice that you may not slant the container.

**Constraints:**

- `n == height.length`
- `2 <= n <= 10^5`
- `0 <= height[i] <= 10^4`

## 基礎思路

本題要求在一維座標上，找出兩條直線與 x 軸構成的「容器」，使其能盛裝最多的水。每條直線的高度由陣列 `height[i]` 表示，其座標為 `(i, height[i])`。

在思考解法時，我們需要特別注意幾個重點：

- 任兩條線可以構成一個容器，其可裝水量為 **寬度 × 較矮高度**；
- 若暴力枚舉所有 $(i, j)$，時間複雜度為 $O(n^2)$，在 $n \le 10^5$ 時會超時；
- 所以我們需設計一種線性時間內能遍歷所有可能候選的策略。

為了解決這個問題，我們可以採用以下策略：

- **雙指標夾逼**：從兩端開始，初始指標 `left = 0`、`right = n - 1`；
- **單次計算當前面積**：每次計算由 `left` 與 `right` 構成的容器面積；
- **縮小寬度以換取更高高度**：移動較矮的一側，才有可能提高面積；
- **持續更新最大面積**：過程中隨時記錄最大值，最終即為答案。

透過雙指標策略，我們能在 $O(n)$ 時間內找出最大面積，並有效避開暴力窮舉。

## 解題步驟

### Step 1：處理邊界輸入

若陣列長度小於等於 1，無法構成容器，直接回傳 0。

```typescript
// 若陣列過短，無法構成容器，直接回傳 0
const elementCount = height.length;
if (elementCount <= 1) {
  return 0;
}
```

### Step 2：初始化雙指標與最大值

從兩端開始設置 `leftIndex` 與 `rightIndex`，初始最大面積為 0。

```typescript
// 初始化雙指標與最大面積
let leftIndex = 0;
let rightIndex = elementCount - 1;
let maximumArea = 0;
```

### Step 3：雙指標掃描並計算最大面積

每一步計算目前 `left` 與 `right` 所構成的面積，並更新最大值；接著移動較矮的那一側，以嘗試找出更高的邊界。

```typescript
// 進行雙指標掃描，直到兩端交會
while (leftIndex < rightIndex) {
  // 分別取得左右高度，避免重複存取陣列
  const leftHeight = height[leftIndex];
  const rightHeight = height[rightIndex];

  // 計算寬度與限高（以較矮為準），求得目前面積
  const width = rightIndex - leftIndex;
  const limitingHeight = leftHeight < rightHeight ? leftHeight : rightHeight;
  const currentArea = limitingHeight * width;

  // 若目前面積較大，則更新最大面積
  if (currentArea > maximumArea) {
    maximumArea = currentArea;
  }

  // 移動較矮的一側指標，嘗試尋找更高邊界
  if (leftHeight < rightHeight) {
    leftIndex++;
  } else {
    rightIndex--;
  }
}
```

### Step 4：返回最大面積

所有情況處理完後，回傳記錄的最大面積。

```typescript
// 掃描結束後，回傳最大面積
return maximumArea;
```

## 時間複雜度

- 每一次迴圈移動一個指標，最多移動 $n$ 次；
- 每一步皆為常數操作（不含排序、不含巢狀迴圈）；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 只使用固定數量的變數（指標與整數）；
- 不使用額外陣列或映射表；
- 總空間複雜度為 $O(1)$。

> $O(1)$
