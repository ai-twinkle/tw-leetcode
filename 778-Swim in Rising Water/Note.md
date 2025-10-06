# 778. Swim in Rising Water

You are given an `n x n` integer matrix `grid` where each value `grid[i][j]` represents the elevation at that point `(i, j)`.

It starts raining, and water gradually rises over time. 
At time `t`, the water level is `t`, meaning any cell with elevation less than equal to `t` is submerged or reachable.

You can swim from a square to another 4-directionally adjacent square if and only if the elevation of both squares individually are at most `t`. 
You can swim infinite distances in zero time. 
Of course, you must stay within the boundaries of the grid during your swim.

Return the minimum time until you can reach the bottom right square `(n - 1, n - 1)` if you start at the top left square `(0, 0)`.

**Constraints:**

- `n == grid.length`
- `n == grid[i].length`
- `1 <= n <= 50`
- `0 <= grid[i][j] < n^2`
- Each value `grid[i][j]` is unique.

## 基礎思路

本題要求我們在一個給定的高程矩陣中，找出水位上升到多少時，從左上角 `(0, 0)` 能夠游到右下角 `(n-1, n-1)`。在時間 `t` 時，水位等於 `t`，意味著高程 ≤ `t` 的格子是「可到達的」。

問題的核心可以轉化為：「找出最早的時間點，使得 `(0,0)` 與 `(n-1,n-1)` 所在格子在水下能連通。」

在思考解法時，需要特別注意以下幾點：

- **水位時間對應格子可行性**：水位 `t` 表示所有高程 ≤ `t` 的格子都可進入；
- **移動限制**：只能在上下左右相鄰、且水位覆蓋的格子間移動；
- **搜尋條件動態變化**：水位是從 0 開始逐漸上升，每格在時間點等於其高程時才會變為可通過；
- **結果為最小時間**：要求的是最早能從起點游到終點的時間點。

為了解決這個問題，我們可以採用以下策略：

- **按水位時間排序啟用格子**：依水位時間從 0 開始，每次啟用一個新格子（高程為當前時間的格子）；
- **連通檢查採用並查集（Union-Find）**：每啟用一個格子，就與其已啟用的相鄰格子合併集合；
- **即時監控連通狀態**：當 `(0,0)` 與 `(n-1,n-1)` 同屬一個集合時，即表示能連通，可立即回傳當前時間；
- **使用索引映射加速啟用流程**：由於高程唯一，可用陣列記錄每個高程對應的位置，避免排序或搜尋開銷。

透過這種水位逐格啟用 + 並查集合併的方式，我們能高效模擬整個過程，並找到最小的連通時間。

## 解題步驟

### Step 1：定義並查集（Union-Find）結構

為了高效維護哪些格子已在水下並可互通，我們使用 Union-Find 結構進行集合合併與連通判斷。

```typescript
/**
 * 使用 TypedArray 建構的並查集資料結構，用於連通性判斷與集合合併。
 */
class UnionFind {
  private readonly parent: Int32Array;
  private readonly componentSize: Int16Array;

  /**
   * 初始化時，每個元素為自己父節點，初始集合大小為 1。
   */
  constructor(totalElements: number) {
    this.parent = new Int32Array(totalElements);
    this.componentSize = new Int16Array(totalElements);
    for (let elementIndex = 0; elementIndex < totalElements; elementIndex += 1) {
      this.parent[elementIndex] = elementIndex;     // 每個節點初始為自己的根
      this.componentSize[elementIndex] = 1;         // 每個集合初始大小為 1
    }
  }

  /**
   * 使用路徑壓縮查找某元素的集合根節點。
   */
  find(element: number): number {
    let root = element;
    while (this.parent[root] !== root) {
      root = this.parent[root];
    }

    // 路徑壓縮：將過程中所有節點直接接到根
    while (this.parent[element] !== element) {
      const next = this.parent[element];
      this.parent[element] = root;
      element = next;
    }

    return root;
  }

  /**
   * 將兩個集合合併，按集合大小優先合併至較大的集合，保持樹淺。
   */
  union(a: number, b: number): void {
    let rootA = this.find(a);
    let rootB = this.find(b);

    if (rootA === rootB) {
      return; // 已連通，無需合併
    }

    // 合併小集合至大集合
    if (this.componentSize[rootA] < this.componentSize[rootB]) {
      const temp = rootA;
      rootA = rootB;
      rootB = temp;
    }

    this.parent[rootB] = rootA;
    this.componentSize[rootA] += this.componentSize[rootB];
  }

  /**
   * 判斷兩個節點是否屬於同一集合。
   */
  connected(a: number, b: number): boolean {
    return this.find(a) === this.find(b);
  }
}
```

### Step 2：處理特殊情況：單格網格

若網格大小為 1x1，表示起點即為終點，直接回傳該格的高程值。

```typescript
// 特例處理：若為單一格子，直接回傳其高程
if (dimension === 1) {
  return grid[0][0];
}
```

### Step 3：建立高程對應格子索引表

由於所有高程值唯一，可直接建立 `elevation → index` 的對應，避免額外排序。

```typescript
// 建立高程對應的一維索引（row * n + col），加速啟用查找
const indexByElevation = new Int32Array(totalCells);
for (let row = 0; row < dimension; row += 1) {
  const rowData = grid[row];
  for (let column = 0; column < dimension; column += 1) {
    const elevation = rowData[column] | 0;
    indexByElevation[elevation] = row * dimension + column;
  }
}
```

### Step 4：初始化並查集與啟用狀態追蹤

使用並查集結構管理格子之間的連通關係，並記錄哪些格子已被水覆蓋（啟用）。

```typescript
// 初始化並查集（Union-Find）
const unionFind = new UnionFind(totalCells);

// 建立布林陣列，記錄哪些格子已啟用（即在當前水位下可走）
const isActivated = new Uint8Array(totalCells);
```

### Step 5：設定移動方向（上下左右）

定義四個移動方向，方便後續統一處理相鄰格子。

```typescript
// 定義四個方向：上、下、左、右
const deltaRow = new Int8Array([-1, 1, 0, 0]);
const deltaColumn = new Int8Array([0, 0, -1, 1]);
```

### Step 6：模擬水位上升並逐步啟用格子

從時間 `t = 0` 開始，每次啟用當前水位對應的格子，並將其與已啟用的相鄰格子合併集合。

```typescript
// 模擬水位從 0 上升，逐格啟用
for (let currentTime = 0; currentTime < totalCells; currentTime += 1) {
  const cellIndex = indexByElevation[currentTime];
  isActivated[cellIndex] = 1; // 標記當前格子為啟用

  // 將一維 index 還原為二維座標
  const row = (cellIndex / dimension) | 0;
  const column = cellIndex - row * dimension;

  // 檢查四個方向，與已啟用的相鄰格子合併集合
  for (let direction = 0; direction < 4; direction += 1) {
    const nextRow = row + deltaRow[direction];
    const nextColumn = column + deltaColumn[direction];

    if (nextRow >= 0 && nextRow < dimension && nextColumn >= 0 && nextColumn < dimension) {
      const neighborIndex = nextRow * dimension + nextColumn;

      if (isActivated[neighborIndex] === 1) {
        // 若鄰格已啟用，則合併集合
        unionFind.union(cellIndex, neighborIndex);
      }
    }
  }

  // 每次啟用後檢查起點與終點是否已連通
  if (unionFind.connected(0, lastIndex)) {
    return currentTime;
  }
}
```

### Step 7：保底返回（理論上不會觸發）

若全部水位都上升後才連通，回傳最大高程即可。

```typescript
// 若直到最高水位才連通（理論不會進入此行），回傳最大索引
return lastIndex;
```

## 時間複雜度

- 每個格子只會啟用一次，合併與連通查詢皆為均攤 $O(\alpha(n^2))$；
- 整體模擬過程最多處理 $n^2$ 個格子與最多 $4n^2$ 次合併；
- 總時間複雜度為 $O(n^2 \cdot \alpha(n^2))$，其中 $\alpha$ 為 Ackermann 函數的反函數。

> $O(n^2 \cdot \alpha(n^2))$

## 空間複雜度

- 並查集儲存 parent 與 size 陣列，為 $O(n^2)$；
- 額外記錄已啟用格子與高程對應索引，也為 $O(n^2)$；
- 總空間複雜度為 $O(n^2)$。

> $O(n^2)$
