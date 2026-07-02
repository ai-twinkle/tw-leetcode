# 3286. Find a Safe Walk Through a Grid

You are given an `m x n` binary matrix grid and an integer health.

You start on the upper-left corner `(0, 0)` and would like to get to the lower-right corner `(m - 1, n - 1)`.

You can move up, down, left, or right from one cell to another adjacent cell as long as your health remains positive.

Cells `(i, j)` with `grid[i][j] = 1` are considered unsafe and reduce your health by 1.

Return `true` if you can reach the final cell with a health value of 1 or more, and `false` otherwise.

**Constraints:**

- `m == grid.length`
- `n == grid[i].length`
- `1 <= m, n <= 50`
- `2 <= m * n`
- `1 <= health <= m + n`
- `grid[i][j]` is either `0` or `1`.

## 基礎思路

本題要求在一個二元矩陣中從左上角走到右下角，途中經過值為 `1` 的格子會消耗生命值，需判斷是否能在生命值大於 0 的情況下抵達終點。

在思考解法時，可掌握以下核心觀察：

- **路徑代價具有結構性**：
  每個格子的代價只有 `0` 或 `1`，這種邊權的二元特性使得標準 BFS 不夠精確，但也不需要完整的 Dijkstra 演算法。

- **0-1 BFS 是最自然的選擇**：
  當邊權只有 `0` 或 `1` 時，可使用雙端佇列（deque）模擬優先佇列：代價不增的移動（踩到安全格）放到隊首，代價增加的移動（踩到危險格）放到隊尾，使得佇列始終保持代價的單調性。

- **以「已消耗生命值」而非「剩餘生命值」作為追蹤量**：
  追蹤到達每個格子所需消耗的最小代價，可以更直觀地進行剪枝：若消耗已達 `health`，則路徑必然不可行。

- **提前終止可大幅加速**：
  一旦從佇列取出終點格，立刻可判斷當前代價是否滿足條件，無需等待整個搜尋完成。

依據以上特性，可以採用以下策略：

- **將格子以扁平索引表示**，利用 `Int32Array` 與 `Uint8Array` 提升記憶體存取效率。
- **以固定大小的環形緩衝區實作雙端佇列**，避免動態陣列的額外開銷。
- **維護每個格子的最小消耗代價陣列**，在發現更優路徑時才重新入隊，並在超出生命值時剪枝。

此策略能以接近線性的時間完成搜尋，同時在空間上保持高效。

## 解題步驟

### Step 1：記錄基本維度並將二維格子攤平為一維陣列

先從 `grid` 取得行列數與總格子數，再將二維格子逐格寫入一維的 `Uint8Array`，後續所有索引操作皆以扁平索引進行，有助於提升快取命中率。

```typescript
const rowCount = grid.length;
const columnCount = grid[0].length;
const cellCount = rowCount * columnCount;

// 將格子攤平為型別陣列，以提升快取友善的存取效率。
const flatGrid = new Uint8Array(cellCount);
for (let row = 0; row < rowCount; row++) {
  const currentRow = grid[row];
  const base = row * columnCount;
  for (let column = 0; column < columnCount; column++) {
    flatGrid[base + column] = currentRow[column];
  }
}
```

### Step 2：初始化最小代價陣列與雙端佇列

`minCost` 紀錄到達每個格子所消耗的最小生命值，初始化為極大值。雙端佇列以固定容量的環形緩衝區實作，`head` 與 `tail` 從緩衝區中央出發，使得向前插入（`--head`）有足夠的空間不會越界。

```typescript
// minCost[cell] 記錄到達該格子所消耗的最少生命值。
const minCost = new Int32Array(cellCount).fill(0x7fffffff);

// 以固定環形緩衝區實作的雙端佇列，大小足以容納多次推入。
const capacity = cellCount * 2 + 2;
const dequeCells = new Int32Array(capacity);
let head = capacity >> 1;
let tail = head;
```

### Step 3：以起點初始化搜尋狀態

將起點格（索引 `0`）的消耗代價設為其格子值，並推入佇列作為搜尋的起始節點。

```typescript
minCost[0] = flatGrid[0];
dequeCells[tail++] = 0;

const lastCell = cellCount - 1;
```

### Step 4：從佇列取出當前格子，解析座標並取得已消耗代價

主迴圈持續從佇列首端取出格子，並將扁平索引還原為行列座標，同時讀取目前該格的最小消耗代價。

```typescript
while (head < tail) {
  const cell = dequeCells[head++];
  const row = (cell / columnCount) | 0;
  const column = cell - row * columnCount;
  const cost = minCost[cell];

  // ...
}
```

### Step 5：若已抵達終點，立即判斷並回傳結果

當取出的格子為終點時，判斷已消耗的代價是否嚴格小於 `health`；若成立則表示抵達時仍有剩餘生命值，回傳 `true`。

```typescript
while (head < tail) {
  // Step 4：取出格子並解析座標與代價

  // 若已到達終點且剩餘生命值足夠，回傳成功。
  if (cell === lastCell) {
    return cost < health;
  }

  // ...
}
```

### Step 6：枚舉四個方向的相鄰格子並跳過越界者

針對上、下、左、右四個方向逐一計算相鄰格子的座標，若超出矩陣邊界則跳過。

```typescript
while (head < tail) {
  // Step 4：取出格子並解析座標與代價

  // Step 5：提前終止判斷

  // 探索四個正交方向的相鄰格子。
  for (let direction = 0; direction < 4; direction++) {
    let neighborRow = row;
    let neighborColumn = column;

    if (direction === 0) {
      neighborRow = row - 1;
    } else if (direction === 1) {
      neighborRow = row + 1;
    } else if (direction === 2) {
      neighborColumn = column - 1;
    } else {
      neighborColumn = column + 1;
    }

    // 跳過超出邊界的相鄰格子。
    if (neighborRow < 0 || neighborRow >= rowCount) {
      continue;
    }
    if (neighborColumn < 0 || neighborColumn >= columnCount) {
      continue;
    }

    // ...
  }
}
```

### Step 7：計算相鄰格子的代價，並在超出生命值時剪枝

計算移動到相鄰格子後的累積消耗代價；若代價已達 `health`，表示抵達時生命值恰好歸零或更低，必然不可行，直接跳過。

```typescript
while (head < tail) {
  // Step 4：取出格子並解析座標與代價

  // Step 5：提前終止判斷

  for (let direction = 0; direction < 4; direction++) {
    // Step 6：計算相鄰座標並跳過越界者

    const neighborCell = neighborRow * columnCount + neighborColumn;
    const neighborCost = cost + flatGrid[neighborCell];

    // 剪枝：若路徑代價已耗盡生命值，捨棄此路徑。
    if (neighborCost >= health) {
      continue;
    }

    // ...
  }
}
```

### Step 8：若發現更優代價則更新並依邊權決定入隊方向

只有在找到比已知更小的消耗代價時才更新並重新入隊；踩到值為 `0` 的格子（零代價邊）插入佇列前端，踩到值為 `1` 的格子（有代價邊）附加至佇列尾端，維持代價的單調性。

```typescript
while (head < tail) {
  // Step 4：取出格子並解析座標與代價

  // Step 5：提前終止判斷

  for (let direction = 0; direction < 4; direction++) {
    // Step 6：計算相鄰座標並跳過越界者

    // Step 7：計算相鄰代價並剪枝

    // 只在發現更低代價時才更新並重新入隊。
    if (neighborCost < minCost[neighborCell]) {
      minCost[neighborCell] = neighborCost;

      // 零代價邊放到佇列前端，有代價邊放到佇列後端。
      if (flatGrid[neighborCell] === 0) {
        dequeCells[--head] = neighborCell;
      } else {
        dequeCells[tail++] = neighborCell;
      }
    }
  }
}
```

### Step 9：佇列耗盡後仍未抵達終點，回傳失敗

若整個搜尋過程中始終未在合法代價下觸及終點，則代表無可行路徑，回傳 `false`。

```typescript
return false;
```

## 時間複雜度

- 網格共有 $m \times n$ 個格子，每個格子最多被更新並入隊常數次；
- 每次入隊與出隊操作皆為 $O(1)$；
- 對四個方向的探索為常數倍展開。
- 總時間複雜度為 $O(m \times n)$。

> $O(m \times n)$

## 空間複雜度

- `flatGrid` 與 `minCost` 各佔 $O(m \times n)$ 空間；
- 雙端佇列緩衝區大小固定為 $O(m \times n)$。
- 總空間複雜度為 $O(m \times n)$。

> $O(m \times n)$
