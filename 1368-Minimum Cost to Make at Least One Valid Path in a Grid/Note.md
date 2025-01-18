# 1368. Minimum Cost to Make at Least One Valid Path in a Grid

Given an `m x n` grid. Each cell of the grid has a sign pointing to the next cell 
you should visit if you are currently in this cell. 
The sign of `grid[i][j]` can be:

* 1 which means go to the cell to the right. (i.e go from `grid[i][j]` to `grid[i][j + 1]`)
* 2 which means go to the cell to the left. (i.e go from `grid[i][j]` to `grid[i][j - 1]`)
* 3 which means go to the lower cell. (i.e go from `grid[i][j]` to `grid[i + 1][j]`)
* 4 which means go to the upper cell. (i.e go from `grid[i][j]` to `grid[i - 1][j]`)

Notice that there could be some signs on the cells of the grid that point outside the grid.

You will initially start at the upper left cell (0, 0). 
A valid path in the grid is a path that starts from the upper left cell (0, 0) and ends at the bottom-right cell (m - 1, n - 1) 
following the signs on the grid. 
The valid path does not have to be the shortest.

You can modify the sign on a cell with cost = 1. You can modify the sign on a cell one time only.

Return the minimum cost to make the grid have at least one valid path.

## 基礎思路

這是一個計算最小代價的問題，並不要求走最短路徑，而是要以最小的修改次數到達終點 `(m-1, n-1)`。我們採用 BFS（廣度優先搜尋）來解決問題。

可以將問題抽象成這樣：
- 想像你現在是一個機器人，站在格子 A 的位置。你可以選擇向右、向左、向上、向下移動到鄰近的格子 B。
- 如果 A 格子的箭頭方向剛好指向 B，那麼移動的代價是 `0`；
- 如果 A 格子的箭頭方向與你想走的方向不同，你需要付出代價 `1` 來修改箭頭方向。

### 演算法操作
1. **初始化**：
    - 起點 `(0, 0)` 的代價初始化為 0，並將其加入隊列。
    - 使用一個二維數組 `cost` 記錄到達每個格子的最小代價，初始值設為無限大 `Infinity`，無限大表示未訪問過。
    - 使用雙端隊列（deque），方便根據代價將新節點加入隊列的前端或後端。

2. **探索相鄰格子**：
    - 從當前格子 A 出發，檢查所有可能移動的方向：
        - 如果目標格子 B 超出邊界，跳過。
        - 根據箭頭方向與實際移動方向的對比，計算新的代價。
    - 如果新的代價比之前紀錄的代價小，更新 `cost`，並將 B 加入隊列：
        - 如果代價為 `0`，將 B 加入隊列的**前端**，代表該格子會被優先處理；
        - 如果代價為 `1`，將 B 加入隊列的**後端**，會較晚處理。

3. **保證正確性**：
    - 雙端隊列保證了優先處理代價較低的路徑（`0` 的路徑先處理）。
    - BFS 的層次遍歷保證了，每次到達某個格子時，都是用最小代價到達的。

4. **結束條件**：
    - 當隊列為空時，說明所有路徑都已經探索完成，此時終點 `(m-1, n-1)` 的 `cost` 值即為最小代價。

這個演算法能確保優先選定代價為 `0` 的路徑，並且保證了到達每個格子的代價都是最小的，那麼當抵達終點時，終點的代價就是最小代價。

## 解題步驟

### Step 1: 先暫存行與列的數量與定義方向

```typescript
// 依照題意定義四個方向，我們用 Delta 來表示
const DIRECTIONS = [
  { dx: 0, dy: 1 },
  { dx: 0, dy: -1 },
  { dx: 1, dy: 0 },
  { dx: -1, dy: 0 }
];

const m = grid.length;    // 行數
const n = grid[0].length; // 列數
```

### Step 2: 初始化代價數組 `cost` 與雙端隊列 `deque`

```typescript
// 用 2 維數組記錄到達每個格子的最小代價
const cost: number[][] = Array.from({ length: m }, () => Array(n).fill(Infinity));
// 我們是出發自 (0, 0) 的，所以代價為 0
cost[0][0] = 0;

// 初始化雙端隊列
const deque: { x: number; y: number; c: number }[] = [];
// 將起點加入隊列
deque.push({ x: 0, y: 0, c: 0 });
```

### Step 3: 開始 BFS 探索

```typescript
// 我們使用雙端隊列來實現 BFS，直到隊列為空
while (deque.length > 0) {
  // 取出隊列的第一個要處理的格子，為了方便解釋，我們稱之為 A
  const { x, y, c } = deque.shift()!;

  // 探索四個方向
  for (let i = 0; i < 4; i++) {
    // 獲取方向的增量
    const { dx, dy } = DIRECTIONS[i];
    // 計算相鄰格子的坐標
    const nx = x + dx;
    const ny = y + dy;

    // 如果相鄰格子超出邊界，跳過
    if (nx < 0 || nx >= m || ny < 0 || ny >= n) {
      continue;
    }

    // 計算由 A 格子到 B 格子的代價
    // A 格子的代價為 c，B 格子的代價取決於箭頭方向是否與移動方向一致 (須注意: 箭頭是 1~4，而索引是 0~3)
    const newCost = c + (grid[x][y] === i + 1 ? 0 : 1);

    // 如果 A 格子到 B 格子的代價大於等於 B 格子的代價，跳過
    if (newCost >= cost[nx][ny]) {
      continue;
    }

    // 更新 B 格子的代價
    cost[nx][ny] = newCost;

    // 如果移動代價為 0，我們將格子加入隊列的前端 (unshift) (同樣須注意: 箭頭是 1~4，而索引是 0~3)
    // 這樣可以保證代價為 0 的格子優先處理
    if (grid[x][y] === i + 1) {
      deque.unshift({ x: nx, y: ny, c: newCost });
    } else {
      deque.push({ x: nx, y: ny, c: newCost });
    }
  }
}
```

### Step 4: 返回終點 `(m-1, n-1)` 的最小代價

```typescript
return cost[m - 1][n - 1];
```

## 時間複雜度
網格的大小是 $m×n$，每個節點在最壞情況下會被處理一次。
雙端隊列（deque）在每次操作中，插入或刪除的時間複雜度為 $O(1)$。即使所有節點都進入隊列多次，仍然是線性的。
因此，總的時間複雜度為 $O(m×n)$。

> $O(m×n)$

## 空間複雜度
我們使用了一個二維數組 `cost` 來記錄到達每個格子的最小代價，因此空間複雜度為 $O(m×n)$。
雙端隊列 `deque` 最壞情況下會包含所有節點，因此空間複雜度為 $O(m×n)$。
因此，總的空間複雜度為 $O(m×n)$。

> $O(m×n)$
