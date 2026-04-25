# 3464. Maximize the Distance Between Points on a Square

You are given an integer `side`, 
representing the edge length of a square with corners at `(0, 0)`, `(0, side)`, `(side, 0)`, 
and `(side, side)` on a Cartesian plane.

You are also given a positive integer `k` and a 2D integer array `points`, 
where `points[i] = [x_i, y_i]` represents the coordinate of a point lying on the boundary of the square.

You need to select `k` elements among `points` such that the minimum Manhattan distance between any two points is maximized.

Return the maximum possible minimum Manhattan distance between the selected `k` points.

The Manhattan Distance between two cells `(x_i, y_i)` and `(x_j, y_j)` is `|x_i - x_j| + |y_i - y_j|`.

**Constraints:**

- `1 <= side <= 10^9`
- `4 <= points.length <= min(4 * side, 15 * 10^3)`
- `points[i] == [x_i, y_i]`
- The input is generated such that:
  - `points[i]` lies on the boundary of the square.
  - All `points[i]` are unique.
- `4 <= k <= min(25, points.length)`

## 基礎思路

本題要求從正方形邊界上的點中選出 `k` 個點，使得任意兩點間的最小曼哈頓距離盡可能大，本質上是一道「最大化最小距離」的最佳化問題。

在思考解法時，可掌握以下核心觀察：

- **邊界上的曼哈頓距離可轉換為一維距離**：
  正方形邊界是一條封閉的折線，邊界上任意兩點的曼哈頓距離等同於沿周長方向的較短路徑長度，因此可將二維座標線性化為一維周長座標，將問題降維。

- **「最大化最小距離」適合使用二分搜尋**：
  若能判斷「在最小間距為 `d` 的條件下，是否能選出至少 `k` 個點」，則可在答案的值域上進行二分，將最佳化問題轉換為可行性判斷問題。

- **可行性判斷可用貪心策略**：
  將邊界點按周長座標排序後，以貪心方式從某個起點出發，每次跳至距離至少 `d` 的下一個點，若繞一圈後能選出 `k` 個點，代表 `d` 可行。由於邊界為環形，需考慮跨越起點的情況。

- **「下一個合法點」可以預先建構指標圖**：
  對所有點建立「next 指標」——即從某點出發，沿周長方向第一個距離至少 `d` 的點。利用雙指標在排序後的陣列上以攤銷 $O(n)$ 建構這張指標圖，再透過環偵測計算可選點數。

依據以上特性，可以採用以下策略：

- **將邊界座標線性化並排序**，使點的相對順序對應其在周長上的位置。
- **對最小距離進行二分搜尋**，每次以貪心加環計數判斷可行性。
- **使用預分配的定長陣列**避免重複的堆積記憶體配置，提升實際執行效率。

此策略能在 $O(n \log n)$ 時間內求解，對本題的規模而言高效且穩定。

## 解題步驟

### Step 1：宣告可複用的全域緩衝區

為避免每次函數呼叫都重新配置堆積記憶體，預先在全域範圍分配固定大小的型別化陣列，分別用於儲存 next 指標與走訪旗標。

```typescript
// 預先分配可複用的型別化陣列緩衝區，避免每次呼叫時配置堆積記憶體
const nextPointIndex = new Uint16Array(15000);
const visitedFlag = new Uint8Array(15000);
```

### Step 2：定義 `solve` 函數並以雙指標建構 next 指標圖

`solve` 函數接收排序後的一維周長座標、完整周長與最小距離，對每個起點用雙指標找出「沿周長方向距離至少 `minDistance` 的第一個點」，並記錄於 `nextPointIndex`。由於掃描指標單調遞進，整體建構過程為攤銷 $O(n)$；同時以 `wrapCount` 追蹤掃描指標繞過起點的次數，並將跨圈的座標加上整圈長度以便比較。

```typescript
/**
 * 以貪心方式檢查在周長上至少間距 `minDistance` 的條件下，能選出多少點，
 * 將邊界視為環形路徑。透過雙指標建立 next 指標圖，再計算環的長度。
 * @param sortedPositions - 排序後的線性化周長座標
 * @param fullPerimeter - 完整周長長度（side * 4）
 * @param minDistance - 相鄰選取點所需的最小距離
 * @returns 貪心選取環中的點數
 */
function solve(sortedPositions: Int32Array, fullPerimeter: number, minDistance: number): number {
  const pointCount = sortedPositions.length;

  // 以雙指標建立 next 指標（整體攤銷 O(n)）
  let scanIndex = 0;
  let scanValue = sortedPositions[0];
  let wrapCount = 0;

  for (let originIndex = 0; originIndex < pointCount; originIndex++) {
    const target = sortedPositions[originIndex] + minDistance;
    // 推進掃描指標，直到找到距離至少 minDistance 的點
    while (scanValue < target) {
      scanIndex++;
      if (scanIndex === pointCount) {
        scanIndex = 0;
        wrapCount++;
      }
      scanValue = sortedPositions[scanIndex] + wrapCount * fullPerimeter;
      if (wrapCount > 1) {
        break;
      }
    }
    nextPointIndex[originIndex] = scanIndex;
  }

  // ...
}
```

### Step 3：在函數圖上以走訪標記找到環的入口節點

建好 next 指標圖後，從節點 0 出發，持續跟隨 next 指標並標記已走訪的節點，直到第一次抵達已標記的節點為止，該節點即為環的入口。

```typescript
function solve(sortedPositions: Int32Array, fullPerimeter: number, minDistance: number): number {
  // Step 2：以雙指標建構 next 指標圖

  // 以走訪標記在函數圖上找出環的入口節點
  visitedFlag.fill(0, 0, pointCount);
  let cycleEntryNode = 0;
  while (visitedFlag[cycleEntryNode] === 0) {
    visitedFlag[cycleEntryNode] = 1;
    cycleEntryNode = nextPointIndex[cycleEntryNode];
  }

  // ...
}
```

### Step 4：從環入口出發計算環的節點數並回傳

從環入口節點開始繞環一圈，計算其中的節點數量；以 `wrapDetector` 偵測指標往回跳（即周長繞圈）的情形，若超過一次則表示已確認完整繞環，跳出迴圈後回傳節點計數。

```typescript
function solve(sortedPositions: Int32Array, fullPerimeter: number, minDistance: number): number {
  // Step 2：以雙指標建構 next 指標圖

  // Step 3：以走訪標記找到環入口節點

  // 計算環中的節點數
  let wrapDetector = 0;
  let cycleNodeCount = -1;
  for (let currentNode = cycleEntryNode; wrapDetector === 0 || currentNode <= cycleEntryNode; currentNode = nextPointIndex[currentNode]) {
    cycleNodeCount++;
    // 指標向後或自指表示發生了周長繞圈
    if (nextPointIndex[currentNode] <= currentNode) {
      wrapDetector++;
    }
    if (wrapDetector > 1) {
      break;
    }
  }

  return cycleNodeCount;
}
```

### Step 5：將邊界點線性化為一維周長座標並排序

在主函數中，將每個邊界點依其所在邊映射為一維周長座標：右邊與下邊的點映射為正值 `x + y`，左邊與上邊的點映射為負值 `-(x + y)`，使得座標值天然反映沿周長的相對順序，最後排序以備後續二分與雙指標使用。

```typescript
const pointCount = points.length;

// 將邊界點線性化為一維周長座標
const sortedPositions = new Int32Array(pointCount);
for (let pointIndex = 0; pointIndex < pointCount; pointIndex++) {
  const x = points[pointIndex][0];
  const y = points[pointIndex][1];
  // 右邊與下邊映射為 x+y；左邊與上邊映射為 -(x+y)
  sortedPositions[pointIndex] = (x === side || y === 0) ? x + y : -x - y;
}
sortedPositions.sort();
```

### Step 6：對最小距離進行二分搜尋並回傳最大可行解

設定二分搜尋的上下界，以完整周長除以 `k` 作為理論上限；每次取中間值呼叫 `solve` 判斷是否能選出至少 `k` 個點，若可行則更新最大可行距離並縮小下界，否則縮小上界，最終回傳最大可行距離。

```typescript
const fullPerimeter = side * 4;

// 對最小距離進行二分搜尋
let lowDistance = 1;
let highDistance = (fullPerimeter / k) | 0;
let maxFeasibleDistance = 0;

while (lowDistance <= highDistance) {
  const candidateDistance = (lowDistance + highDistance) >>> 1;
  if (solve(sortedPositions, fullPerimeter, candidateDistance) >= k) {
    lowDistance = candidateDistance + 1;
    maxFeasibleDistance = candidateDistance;
  } else {
    highDistance = candidateDistance - 1;
  }
}

return maxFeasibleDistance;
```

## 時間複雜度

- 設邊界點總數為 $n$，將點線性化並排序需 $O(n \log n)$；
- 二分搜尋的值域為 $O(\text{side})$，共進行 $O(\log(\text{side}))$ 次迭代；
- 每次迭代呼叫 `solve`，雙指標建構 next 指標圖為 $O(n)$，環偵測與計數亦為 $O(n)$；
- 因此二分搜尋整體為 $O(n \log(\text{side}))$。
- 總時間複雜度為 $O(n \log n + n \log(\text{side}))$。

> $O(n \log n + n \log(\text{side}))$

## 空間複雜度

- 全域預分配的兩個長度為 $15000$ 的型別化陣列為常數空間；
- 線性化座標陣列佔用 $O(n)$ 空間；
- 排序所需的輔助空間為 $O(\log n)$；
- 其餘變數皆為常數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
