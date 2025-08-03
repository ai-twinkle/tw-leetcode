# 2106. Maximum Fruits Harvested After at Most K Steps

Fruits are available at some positions on an infinite x-axis. 
You are given a 2D integer array `fruits` where `fruits[i] = [position_i, amount_i]` depicts `amount_i` fruits at the position `position_i`. 
`fruits` is already sorted by `position_i` in ascending order, and each `position_i` is unique.

You are also given an integer `startPos` and an integer `k`. 
Initially, you are at the position `startPos`. 
From any position, you can either walk to the left or right. 
It takes one step to move one unit on the x-axis, and you can walk at most `k` steps in total. 
For every position you reach, you harvest all the fruits at that position, and the fruits will disappear from that position.

Return the maximum total number of fruits you can harvest.

**Constraints:**

- `1 <= fruits.length <= 10^5`
- `fruits[i].length == 2`
- `0 <= startPos, positioni <= 2 * 10^5`
- `position_i-1 < position_i for any i > 0 (0-indexed)`
- `1 <= amounti <= 10^4`
- `0 <= k <= 2 * 10^5`


## 基礎思路

本題的核心是決定如何透過有限次的移動步數 ($k$ 步以內)，從起始位置 (`startPos`) 出發，在 x 軸上採集最多的水果。
由於每個位置的水果只能被採集一次，因此問題轉化成了尋找在限定範圍內（最多移動 $k$ 步），能採集水果數量最大的區間。

我們可以使用「滑動窗口（Sliding Window）」的技巧來解決這個問題。
具體可以分為以下幾個步驟：

- 首先將所有水果的位置與數量單獨抽出，便於快速處理。
- 使用「滑動窗口（Sliding Window）」方式，逐步擴展右端點，並根據當前區間是否超過步數限制，調整左端點位置，以維持合法區間。
- 在維持窗口合法（移動步數不超過 $k$）的前提下，持續更新最大水果採集數量。

由於走動路徑可能有以下三種情況：

- 完全在起始位置左側
- 完全在起始位置右側
- 左右混合路徑 (先往左再往右或先往右再往左)

因此每次調整窗口時，都要計算三種路徑情境，從中選取步數最少的路徑作為窗口合法性的判斷標準。

## 解題步驟

### Step 1：初始化輔助陣列與變數

首先從輸入中取出水果位置與數量，放入型別化陣列（`Int32Array`），加快後續訪問速度：

```typescript
const totalFruitsCount = fruits.length;
// 將位置與數量存入 Int32Array 以提升訪問速度
const positions = new Int32Array(totalFruitsCount);
const counts = new Int32Array(totalFruitsCount);
for (let index = 0; index < totalFruitsCount; index++) {
  positions[index] = fruits[index][0];
  counts[index] = fruits[index][1];
}

const startPosition = startPos;  // 起始位置
const maximumSteps = k;          // 可移動的最大步數

let maxFruitsCollected = 0;      // 最多採集的水果數
let leftPointer = 0;             // 滑動窗口的左端點指標
let currentWindowSum = 0;        // 當前窗口內的水果總數
```

### Step 2：使用滑動窗口策略遍歷所有水果位置

逐步將右端點向右延伸，並調整左端點位置，以保證總步數不超過 $k$：

```typescript
// 使用右指標逐步擴展窗口
for (let rightPointer = 0; rightPointer < totalFruitsCount; rightPointer++) {
  // 將當前右端點水果數量加入窗口總數
  currentWindowSum += counts[rightPointer];

  // 當窗口不合法時，向右移動左端點
  while (leftPointer <= rightPointer) {
    const leftPosition = positions[leftPointer];
    const rightPosition = positions[rightPointer];
    let stepsNeeded: number;

    // 判斷三種情境下的步數需求
    if (rightPosition <= startPosition) {
      // 所有水果均位於起始點左側
      stepsNeeded = startPosition - leftPosition;
    } else if (leftPosition >= startPosition) {
      // 所有水果均位於起始點右側
      stepsNeeded = rightPosition - startPosition;
    } else {
      // 左右混合情境，需判斷兩種順序（先左後右或先右後左）的最短步數
      const distanceLeft = startPosition - leftPosition;
      const distanceRight = rightPosition - startPosition;
      const stepsLeftThenRight = distanceLeft * 2 + distanceRight;
      const stepsRightThenLeft = distanceRight * 2 + distanceLeft;
      stepsNeeded =
        stepsLeftThenRight < stepsRightThenLeft
          ? stepsLeftThenRight
          : stepsRightThenLeft;
    }

    // 如果當前窗口步數符合條件，停止向右調整左端點
    if (stepsNeeded <= maximumSteps) {
      break;
    }

    // 否則，將左端點水果數量移出窗口，並將左端點右移
    currentWindowSum -= counts[leftPointer];
    leftPointer++;
  }

  // 每次調整後更新全局最大採集數量
  if (currentWindowSum > maxFruitsCollected) {
    maxFruitsCollected = currentWindowSum;
  }
}
```

### Step 3：返回最終結果

當滑動窗口遍歷結束後，回傳最終採集的最大水果數：

```typescript
return maxFruitsCollected;
```

## 時間複雜度

- 滑動窗口的每個位置最多被訪問兩次（一次右端點擴展，一次左端點收縮），因此整體複雜度為 $O(n)$。
- 每次窗口調整計算步數所需為常數時間 $O(1)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用了兩個型別化陣列（`positions`、`counts`），每個大小為輸入的 $n$，因此為 $O(n)$。
- 其餘使用的變數皆為常數級別。
- 總空間複雜度為 $O(n)$。

> $O(n)$
