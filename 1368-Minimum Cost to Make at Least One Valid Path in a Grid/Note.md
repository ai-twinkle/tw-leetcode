# 1368. Minimum Cost to Make at Least One Valid Path in a Grid

Given an `m x n` grid. Each cell of the grid has a sign pointing to the next cell 
you should visit if you are currently in this cell. 
The sign of `grid[i][j]` can be:

- `1` which means go to the cell to the right. (i.e go from `grid[i][j]` to `grid[i][j + 1]`)
- `2` which means go to the cell to the left. (i.e go from `grid[i][j]` to `grid[i][j - 1]`)
- `3` which means go to the lower cell. (i.e go from `grid[i][j]` to `grid[i + 1][j]`)
- `4` which means go to the upper cell. (i.e go from `grid[i][j]` to `grid[i - 1][j]`)

Notice that there could be some signs on the cells of the grid that point outside the grid.

You will initially start at the upper left cell `(0, 0)`. 
A valid path in the grid is a path that starts from the upper left cell `(0, 0)` and ends at the bottom-right cell `(m - 1, n - 1)` 
following the signs on the grid. 
The valid path does not have to be the shortest.

You can modify the sign on a cell with `cost = 1`. 
You can modify the sign on a cell one time only.

Return the minimum cost to make the grid have at least one valid path.

**Constraints:**

- `m == grid.length`
- `n == grid[i].length`
- `1 <= m, n <= 100`
- `1 <= grid[i][j] <= 4`

## 基礎思路

本題的核心在於求解從左上角 `(0,0)` 到右下角 `(m-1,n-1)` 的一條「有效路徑」，而每個格子上的箭頭決定了若不修改就只能沿箭頭方向前進。
修改一次箭頭方向的花費為 1，否則為 0。

由於花費僅有 0 或 1，可使用 **0–1 BFS**（雙端佇列 BFS）來高效地計算最小修改花費：

- 對於額外花費為 0 的移動，將鄰居節點推到佇列前端；
- 對於額外花費為 1 的移動，將鄰居節點推到佇列後端。

如此一來，即可在 $O(m \times n)$ 時間內找到從起點到終點的最小修改次數。

## 解題步驟

### Step 1：初始化與常數定義

程式開始時，先取得格子的行數 `rowCount`、列數 `columnCount`，以及總格子數 `totalCells`，並定義四個方向的偏移陣列，方便之後遍歷。

```typescript
// 1. 初始化與常數定義
const rowCount = grid.length;
const columnCount = grid[0].length;
const totalCells = rowCount * columnCount;

// 方向：右、左、下、上
const rowOffsets = new Int8Array([0,  0,  1, -1]);
const colOffsets = new Int8Array([1, -1,  0,  0]);
```

### Step 2：將格子預處理為一維陣列

為了提升存取效率並利用快取局部性，將二維的 `grid` 攤平成長度為 `totalCells` 的 `Uint8Array`。

```typescript
// 2. 預處理格子（攤平成一維陣列以加速存取）
const flattenedGrid = new Uint8Array(totalCells);
for (let row = 0; row < rowCount; row++) {
  const baseIndex = row * columnCount;
  for (let col = 0; col < columnCount; col++) {
    flattenedGrid[baseIndex + col] = grid[row][col];
  }
}
```

### Step 3：設置花費追蹤結構

使用 `Uint16Array` 儲存從起點到每個格子的最小修改次數，並以 `sentinelCost`（大於可能最大花費）初始化。起點索引 `0` 的花費設為 `0`。

```typescript
// 3. 設置花費追蹤（使用哨兵值初始化，並將起點花費設為 0）
const sentinelCost = totalCells + 1;
const costGrid = new Uint16Array(totalCells);
for (let i = 0; i < totalCells; i++) {
  costGrid[i] = sentinelCost;
}
costGrid[0] = 0; // 起點格子的花費為 0
```

### Step 4：初始化 0–1 BFS 專用的雙端佇列

使用固定大小為 `totalCells + 1` 的 `Uint32Array` 作為環形緩衝區，並透過 `head`、`tail` 指標構建雙端佇列，將起點推入。

```typescript
// 4. 0-1 BFS 雙端佇列初始化（環形緩衝區）
const capacity = totalCells + 1;
const dequeBuffer = new Uint32Array(capacity);
let head = 0;
let tail = 1;
dequeBuffer[0] = 0; // 從左上角格子的序號 0 開始
```

### Step 5：執行 0–1 BFS 主迴圈

反覆從佇列前端取出目前格子，解析其座標與原始箭頭方向，並嘗試四個可能方向的移動。

- 若移動方向與原箭頭相同，額外花費 `0`，否則為 `1`。
- 更新鄰居格子的最小花費後，依額外花費分別推入佇列前端或後端。

```typescript
// 5. 0-1 BFS 主迴圈
while (head !== tail) {
  // 從前端彈出當前索引
  const currentIndex = dequeBuffer[head];
  head = head + 1 < capacity ? head + 1 : 0;

  // 解析當前狀態
  const currentCost = costGrid[currentIndex];
  const currentRow = (currentIndex / columnCount) | 0;
  const currentCol = currentIndex - currentRow * columnCount;
  const currentSign = flattenedGrid[currentIndex];

  // 嘗試所有四個方向
  for (let directionIndex = 0; directionIndex < 4; directionIndex++) {
    const newRow = currentRow + rowOffsets[directionIndex];
    const newCol = currentCol + colOffsets[directionIndex];

    // 如果越界就跳過
    if (newRow < 0 || newRow >= rowCount || newCol < 0 || newCol >= columnCount) {
      continue;
    }
    const neighborIndex = newRow * columnCount + newCol;

    // 計算移動花費：若原箭頭方向相符則為 0，否則為 1
    const additionalCost = (currentSign === directionIndex + 1 ? 0 : 1);
    const newCost = currentCost + additionalCost;

    // 若找到更小花費，則更新並依花費類型選擇推入佇列前端或後端
    if (newCost < costGrid[neighborIndex]) {
      costGrid[neighborIndex] = newCost;
      if (additionalCost === 0) {
        head = head - 1 >= 0 ? head - 1 : capacity - 1;
        dequeBuffer[head] = neighborIndex;
      } else {
        dequeBuffer[tail] = neighborIndex;
        tail = tail + 1 < capacity ? tail + 1 : 0;
      }
    }
  }
}
```

### Step 6：回傳結果

當佇列處理完畢後，右下角格子的索引為 `totalCells - 1`，其對應的 `costGrid` 值即為最小修改花費，直接回傳。

```typescript
// 6. 回傳到達右下角的最小花費
return costGrid[totalCells - 1];
```

## 時間複雜度

- 每個格子最多進入佇列 $1$ 次（因為只會用更低的花費更新），對每個格子最多考察 $4$ 個方向。
- BFS 遍歷所有 $m \times n$ 格子，操作均為 $O(1)$，主流程為 $O(m \times n)$。
- 佇列推入/彈出操作皆為常數時間。
- 總時間複雜度為 $O(m \times n)$。

> $O(m \times n)$

## 空間複雜度

- 額外使用了一維陣列 `flattenedGrid`、`costGrid` 以及雙端佇列 `dequeBuffer`，長度皆與格子總數成正比。
- 未產生多餘遞迴或深度堆疊。
- 總空間複雜度為 $O(m \times n)$。

> $O(m \times n)$
