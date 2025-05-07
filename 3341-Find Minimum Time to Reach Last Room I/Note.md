# 3341. Find Minimum Time to Reach Last Room I

There is a dungeon with `n x m` rooms arranged as a grid.

You are given a 2D array `moveTime` of size `n x m`, 
where `moveTime[i][j]` represents the minimum time in seconds 
when you can start moving to that room. 
You start from the room `(0, 0)` at time `t = 0` and can move to an adjacent room. 
Moving between adjacent rooms takes exactly one second.

Return the minimum time to reach the room `(n - 1, m - 1)`.

Two rooms are adjacent if they share a common wall, either horizontally or vertically.

**Constraints:**

- `2 <= n == moveTime.length <= 50`
- `2 <= m == moveTime[i].length <= 50`
- `0 <= moveTime[i][j] <= 10^9`

## 基礎思路

題目要求在一個大小為 $n \times m$ 的迷宮中，從房間 $(0, 0)$ 移動到房間 $(n-1, m-1)$ 的最短到達時間。每個房間有一個最早可進入時間限制，從一個房間移動至相鄰房間恰好花費 $1$ 秒。

這個問題本質上為帶有節點訪問限制（等待時間）的最短路徑問題，適合使用 SPFA（Shortest Path Faster Algorithm）演算法來解決。我們定義 `distance[i]` 為從起點到第 $i$ 個房間的最短到達時間，透過不斷地鬆弛相鄰房間的最短距離，最終求出抵達終點房間的最短時間。

## 解題步驟

### Step 1：將二維房間時間陣列扁平化

為了能有效率地存取各房間的時間資訊，將二維陣列轉為一維的 `Int32Array`：

```typescript
const n = moveTime.length;
const m = moveTime[0].length;
const totalCells = n * m;

// 將 moveTime 扁平化成一維陣列
const flattenedMoveTime = new Int32Array(totalCells);
for (let row = 0; row < n; row++) {
  const rowStartIndex = row * m;
  const thisRow = moveTime[row];
  for (let col = 0; col < m; col++) {
    flattenedMoveTime[rowStartIndex + col] = thisRow[col];
  }
}
```

### Step 2：初始化距離陣列與 SPFA 佇列

初始化所有房間的距離為無窮大，起點距離設定為 $0$，再準備 SPFA 使用的佇列：

```typescript
// 初始化距離陣列為 Infinity，起點 (0,0) 設定為 0
const distance = new Float64Array(totalCells);
distance.fill(Infinity);
distance[0] = 0;

// SPFA 使用陣列模擬佇列
const nodeQueue: number[] = [0];
```

### Step 3：進行 SPFA 迴圈與鬆弛操作

使用 SPFA 遍歷迷宮，對相鄰節點進行鬆弛，求出最短時間：

```typescript
for (let headIndex = 0; headIndex < nodeQueue.length; headIndex++) {
  const currentIndex = nodeQueue[headIndex];
  const currentTime = distance[currentIndex];
  const currentRow = (currentIndex / m) | 0;
  const currentCol = currentIndex % m;

  // 嘗試四個移動方向（上、下、左、右）
  for (let direction = 0; direction < 4; direction++) {
    const nextRow = direction === 0 ? currentRow :
      direction === 1 ? currentRow + 1 : direction === 2 ? currentRow : currentRow - 1;
    const nextCol = direction === 0 ? currentCol + 1 :
      direction === 1 ? currentCol : direction === 2 ? currentCol - 1 : currentCol;

    // 檢查邊界是否合法
    if (nextRow < 0 || nextRow >= n || nextCol < 0 || nextCol >= m) {
      continue;
    }

    // 計算進入鄰居房間的索引
    const neighborIndex = nextRow * m + nextCol;

    // 計算最早可移動時間
    const departureTime = Math.max(currentTime, flattenedMoveTime[neighborIndex]);
    const arrivalTime = departureTime + 1;

    // 若找到更快的抵達方式，更新距離並加入佇列
    if (arrivalTime < distance[neighborIndex]) {
      distance[neighborIndex] = arrivalTime;
      nodeQueue.push(neighborIndex);
    }
  }
}
```

### Step 4：返回最終抵達時間

SPFA 計算完成後，若終點距離仍為無窮大表示無法抵達，返回 `-1`，否則返回最終抵達終點的時間：

```typescript
const finalTime = distance[totalCells - 1];
return finalTime === Infinity ? -1 : finalTime;
```

## 時間複雜度

- **SPFA 最壞情況**：每個節點可能入隊多次，節點數為 $nm$，每次處理約 $4$ 個方向（邊），最壞情況下時間複雜度為 $O(n^2 m^2)$。
- 總時間複雜度為 $O(n^2 m^2)$。

> $O(n^2 m^2)$

## 空間複雜度

- 扁平化房間陣列：$O(nm)$
- 距離陣列：$O(nm)$
- SPFA 佇列最壞情況：$O(nm)$
- 總空間複雜度為 $O(nm)$。

> $O(nm)$
