# 2812. Find the Safest Path in a Grid

You are given a 0-indexed 2D matrix `grid` of size `n x n`, 
where `(r, c)` represents:

- A cell containing a thief if `grid[r][c] = 1`
- An empty cell if `grid[r][c] = 0`

You are initially positioned at cell `(0, 0)`. 
In one move, you can move to any adjacent cell in the grid, 
including cells containing thieves.

The safeness factor of a path on the grid is defined as the minimum manhattan distance 
from any cell in the path to any thief in the grid.

Return the maximum safeness factor of all paths leading to cell `(n - 1, n - 1)`.

An adjacent cell of cell `(r, c)`, is one of the cells `(r, c + 1)`, `(r, c - 1)`, `(r + 1, c)` and `(r - 1, c)` if it exists.

The Manhattan distance between two cells `(a, b)` and `(x, y)` is equal to `|a - x| + |b - y|`, 
where `|val|` denotes the absolute value of val.

**Constraints:**

- `1 <= grid.length == n <= 400`
- `grid[i].length == n`
- `grid[i][j]` is either `0` or `1`.
- There is at least one thief in the `grid`.

## 基礎思路

本題要求找出從格子左上角 `(0, 0)` 到右下角 `(n-1, n-1)` 的所有路徑中，「路徑上每個格子到最近竊賊的曼哈頓距離的最小值」最大的那條路徑，並回傳此最大安全係數。

在思考解法時，可掌握以下核心觀察：

- **安全係數是路徑的瓶頸值**：
  路徑的安全係數取決於路徑上距離最近竊賊最短的那個格子，因此本題的本質是「最大化路徑瓶頸」問題。

- **多源 BFS 可同時計算所有格子的最近竊賊距離**：
  將所有竊賊格子視為起點，同時展開 BFS，可以在一次 O(n²) 的遍歷中得到每個格子到最近竊賊的距離。

- **路徑安全係數有自然上界**：
  任何從起點到終點的路徑，其安全係數不可能超過起點與終點各自的竊賊距離中較小的那個，因此可以預先確定答案的搜尋上界。

- **由高安全閾值向低逐步開放格子，等同找最大可行閾值**：
  若以「桶排序」將格子依距離分組，從距離最大的格子開始依序啟用，並以 Union-Find 維護連通性，則第一個使起點與終點連通的閾值即為答案。

依據以上特性，可以採用以下策略：

- **多源 BFS 預計算每個格子的最近竊賊距離**，作為後續判斷的基礎。
- **以答案上界限制桶的數量**，將超過上界的格子統一視為上界，節省空間並簡化排序。
- **桶排序替代比較排序**，利用距離值域有限的特性，以線性時間完成排序。
- **從最高閾值向下掃描，搭配 Union-Find 動態合併相鄰已啟用格子**，一旦起點與終點連通即可回傳當前閾值。

此策略將整個過程控制在接近線性的時間複雜度內，適合處理最大 400×400 的格子大小。

## 解題步驟

### Step 1：初始化基本尺寸與距離陣列

宣告格子邊長與總格子數，並建立 `distanceToThief` 陣列以儲存每格到最近竊賊的距離，初始值設為 `-1` 表示尚未計算。

```typescript
const size = grid.length;
const cellCount = size * size;

// 每個格子到最近竊賊的距離，以多源 BFS 計算
const distanceToThief = new Int32Array(cellCount).fill(-1);
```

### Step 2：建立 BFS 佇列並以所有竊賊格子作為起點

宣告平坦化的 BFS 佇列，並將所有竊賊格子以距離 0 加入佇列，作為多源 BFS 的初始種子。

```typescript
// 使用平坦索引的佇列，層級展開保持 O(n²) 複雜度
const bfsQueue = new Int32Array(cellCount);
let queueHead = 0;
let queueTail = 0;

// 將所有竊賊格子以距離 0 加入 BFS 起點
for (let index = 0; index < cellCount; index++) {
  if (grid[(index / size) | 0][index % size] === 1) {
    distanceToThief[index] = 0;
    bfsQueue[queueTail++] = index;
  }
}
```

### Step 3：執行多源 BFS 以計算所有格子的最近竊賊距離

從佇列中依序取出格子，嘗試向上下左右四個方向擴展；若鄰格尚未計算距離，則設定其距離並加入佇列。

```typescript
// 使用平坦索引的標準格子 BFS，以避免 tuple 物件配置
while (queueHead < queueTail) {
  const current = bfsQueue[queueHead++];
  const row = (current / size) | 0;
  const column = current % size;
  const nextDistance = distanceToThief[current] + 1;

  if (row > 0 && distanceToThief[current - size] === -1) {
    distanceToThief[current - size] = nextDistance;
    bfsQueue[queueTail++] = current - size;
  }
  if (row < size - 1 && distanceToThief[current + size] === -1) {
    distanceToThief[current + size] = nextDistance;
    bfsQueue[queueTail++] = current + size;
  }
  if (column > 0 && distanceToThief[current - 1] === -1) {
    distanceToThief[current - 1] = nextDistance;
    bfsQueue[queueTail++] = current - 1;
  }
  if (column < size - 1 && distanceToThief[current + 1] === -1) {
    distanceToThief[current + 1] = nextDistance;
    bfsQueue[queueTail++] = current + 1;
  }
}
```

### Step 4：計算安全係數的搜尋上界

路徑安全係數是路徑的瓶頸值，因此其最大值不可能超過起點與終點的竊賊距離中較小的那個，以此作為後續桶排序的桶數上界。

```typescript
const targetCell = cellCount - 1;

// 安全係數為路徑瓶頸，不可能超過兩端點距離的較小值
const maxSafeness = Math.min(distanceToThief[0], distanceToThief[targetCell]);
```

### Step 5：統計各距離的格子數量，準備桶排序

建立桶計數陣列，對每個格子的距離值進行計數；超過 `maxSafeness` 的格子一律歸入上界桶，以避免建立不必要的桶。

```typescript
// 以距離作為桶索引，超出上界的格子歸入最大桶
const bucketCount = new Int32Array(maxSafeness + 1);
for (let index = 0; index < cellCount; index++) {
  const clamped = distanceToThief[index] > maxSafeness ? maxSafeness : distanceToThief[index];
  bucketCount[clamped]++;
}
```

### Step 6：計算各桶的起始偏移量

透過前綴和計算每個距離桶在排序後陣列中的起始位置，供後續寫入時使用。

```typescript
// 前綴偏移量，供格子依距離排入平坦陣列
const bucketStart = new Int32Array(maxSafeness + 2);
for (let distance = 1; distance <= maxSafeness + 1; distance++) {
  bucketStart[distance] = bucketStart[distance - 1] + bucketCount[distance - 1];
}
```

### Step 7：將所有格子依距離填入排序後的陣列

建立 `orderedCells` 儲存排序結果，並複製 `bucketStart` 作為寫入游標，依序將每個格子寫入對應距離的桶位置。

```typescript
const orderedCells = new Int32Array(cellCount);
const writeCursor = bucketStart.slice();
for (let index = 0; index < cellCount; index++) {
  const clamped = distanceToThief[index] > maxSafeness ? maxSafeness : distanceToThief[index];
  orderedCells[writeCursor[clamped]++] = index;
}
```

### Step 8：初始化 Union-Find 結構

建立 `parent` 陣列使每個格子初始為自身的代表元，並建立 `activated` 陣列記錄每個格子是否已被啟用。

```typescript
// 以 Union-Find 管理格子連通性，從最高距離向下合併
const parent = new Int32Array(cellCount);
for (let index = 0; index < cellCount; index++) {
  parent[index] = index;
}
const activated = new Uint8Array(cellCount);
```

### Step 9：實作帶路徑壓縮的 Union-Find 查詢函式

`findRoot` 函式先以迴圈找到根節點，再以第二次迴圈將路徑上所有節點直接指向根，實現路徑壓縮。

```typescript
/**
 * 找到某格子的代表根節點，並套用路徑壓縮。
 * @param node - 要查詢的格子索引。
 * @returns 根節點的索引。
 */
function findRoot(node: number): number {
  let root = node;
  while (parent[root] !== root) {
    root = parent[root];
  }
  while (parent[node] !== root) {
    const next = parent[node];
    parent[node] = root;
    node = next;
  }
  return root;
}
```

### Step 10：從最高安全閾值向下啟用格子並嘗試合併鄰格

從 `maxSafeness` 往 0 遞減掃描，每輪從對應桶中取出格子並標記為已啟用，接著嘗試與四個方向中已啟用的鄰格進行 Union 合併。

```typescript
// 從最大安全距離向下啟用格子，直到起點與終點連通
for (let threshold = maxSafeness; threshold >= 0; threshold--) {
  const from = bucketStart[threshold];
  const to = bucketStart[threshold + 1];

  for (let position = from; position < to; position++) {
    const cell = orderedCells[position];
    activated[cell] = 1;
    const row = (cell / size) | 0;
    const column = cell % size;

    // 僅與已啟用的鄰格進行合併
    if (row > 0 && activated[cell - size] === 1) {
      parent[findRoot(cell)] = findRoot(cell - size);
    }
    if (row < size - 1 && activated[cell + size] === 1) {
      parent[findRoot(cell)] = findRoot(cell + size);
    }
    if (column > 0 && activated[cell - 1] === 1) {
      parent[findRoot(cell)] = findRoot(cell - 1);
    }
    if (column < size - 1 && activated[cell + 1] === 1) {
      parent[findRoot(cell)] = findRoot(cell + 1);
    }
  }

  // 一旦起點與終點共享同一根節點，即為答案
  if (findRoot(0) === findRoot(targetCell)) {
    return threshold;
  }
}
```

### Step 11：若無法連通則回傳 0

若迴圈結束後起點與終點始終無法連通（例如起點或終點本身即為竊賊格子），則安全係數為 0。

```typescript
return 0;
```

## 時間複雜度

- 多源 BFS 遍歷所有 $n^2$ 個格子，每格最多處理一次，時間為 $O(n^2)$；
- 桶排序統計、前綴和與填入共三次線性掃描，時間為 $O(n^2)$；
- Union-Find 初始化為 $O(n^2)$，每次 `findRoot` 均攤接近 $O(1)$，最多執行 $O(n^2)$ 次合併；
- 從高閾值向下掃描，每個格子最多啟用一次，閾值迴圈總操作為 $O(n^2 \cdot \alpha(n^2))$，其中 $\alpha$ 為反阿克曼函數，實務上視為常數。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- `distanceToThief`、`bfsQueue`、`orderedCells`、`parent`、`activated` 等陣列各佔 $O(n^2)$ 空間；
- `bucketCount`、`bucketStart`、`writeCursor` 的大小由 `maxSafeness` 決定，最壞為 $O(n)$，遠小於 $O(n^2)$；
- 遞迴深度為 $O(1)$（`findRoot` 以迴圈實作，無遞迴）。
- 總空間複雜度為 $O(n^2)$。

> $O(n^2)$
