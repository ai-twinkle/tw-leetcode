# 1559. Detect Cycles in 2D Grid

Given a 2D array of characters `grid` of size `m x n`, 
you need to find if there exists any cycle consisting of the same value in `grid`.

A cycle is a path of length 4 or more in the grid that starts and ends at the same cell. 
From a given cell, you can move to one of the cells adjacent to it - in one of the four directions (up, down, left, or right), 
if it has the same value of the current cell.

Also, you cannot move to the cell that you visited in your last move. 
For example, the cycle `(1, 1) -> (1, 2) -> (1, 1)` is invalid because from `(1, 2)` we visited `(1, 1)` 
which was the last visited cell.

Return `true` if any cycle of the same value exists in `grid`, otherwise, return `false`.

**Constraints:**

- `m == grid.length`
- `n == grid[i].length`
- `1 <= m, n <= 500`
- `grid` consists only of lowercase English letters.

## 基礎思路

本題要求在一個字元矩陣中，判斷是否存在任何由相同字元構成、長度至少為 4 的環形路徑。移動方向限定為上下左右四方向，且不允許立即折返至上一格。

在思考解法時，可掌握以下核心觀察：

- **環的本質是「兩條不同路徑連接同兩點」**：
  若同一字元的兩個相鄰格子已屬於同一連通分量，則加入當前邊後便形成環，這正是並查集（DSU）用來偵測環的標準條件。

- **2×2 同色方塊是最小環的充要條件**：
  任何 2×2 的同字元方塊必然構成長度恰為 4 的環，可在建立 DSU 之前以線性掃描提前偵測，作為快速退出路徑。

- **環偵測只需考慮向上與向左兩個方向**：
  逐格由左到右、由上到下掃描時，每格只需與「上方」和「左方」的已處理鄰格比較。若兩者皆與當前格同字元，便可判斷是否形成環；若僅一者相符，則合併兩集合即可。

- **並查集搭配路徑壓縮與按秩合併可保持接近常數的操作效率**：
  對 m×n 規模的矩陣而言，整體時間複雜度接近線性，效率遠優於 DFS 的遞迴呼叫開銷。

依據以上特性，可以採用以下策略：

- **先將二維字元矩陣攤平為一維整數編碼陣列**，同時以 2×2 方塊檢查作為快速提前返回的第一道篩選。
- **以並查集維護每個字元值的連通分量**，逐格掃描時僅向上與向左合併同字元鄰格。
- **每次合併前先查詢兩鄰格的根節點是否相同**，若相同即代表發現環，直接回傳 `true`；若掃描完整矩陣皆無環則回傳 `false`。

此策略充分利用了並查集偵測環的特性，並以早期退出機制降低整體運算量。

## 解題步驟

### Step 1：初始化矩陣維度與總格數常數

在進行任何運算之前，先從輸入矩陣取得列數、欄數與總格數，供後續所有步驟共用。

```typescript
const rowCount = grid.length;
const columnCount = grid[0].length;
const totalCells = rowCount * columnCount;
```

### Step 2：攤平字元矩陣並以 2×2 方塊快速偵測最小環

將二維字元矩陣轉換為一維字元編碼陣列以提升記憶體存取效率。
在填入每個格子的同時，立即檢查以該格為右下角的 2×2 方塊是否四格皆相同；若是，則該方塊本身即為一個長度為 4 的環，可直接回傳 `true`。

```typescript
// 將攤平後的字元編碼寫入；同時偵測 2×2 單色方塊作為快速提前退出
const codes = new Uint8Array(totalCells);
for (let row = 0; row < rowCount; row++) {
  const rowReference = grid[row];
  const baseIndex = row * columnCount;
  for (let column = 0; column < columnCount; column++) {
    const code = rowReference[column].charCodeAt(0);
    codes[baseIndex + column] = code;
    // 2×2 同色方塊是最小的可能環
    if (row > 0 && column > 0
      && code === codes[baseIndex + column - 1]
      && code === codes[baseIndex - columnCount + column]
      && code === codes[baseIndex - columnCount + column - 1]) {
      return true;
    }
  }
}
```

### Step 3：初始化並查集的父節點陣列與秩陣列

每個格子一開始各自為一個獨立的集合，父節點指向自身；
秩陣列用於按秩合併，初始皆為 0。

```typescript
// 初始化 DSU 父節點陣列（每個格子各自為一個集合）以及秩陣列
const parent = new Int32Array(totalCells);
const rank = new Uint8Array(totalCells);
for (let i = 0; i < totalCells; i++) {
  parent[i] = i;
}
```

### Step 4：實作帶路徑壓縮的迭代式 find 函數

`find` 函數採用兩段式迭代實作：第一段沿父節點鏈走到根節點，第二段將路徑上所有節點直接指向根節點，確保後續操作效率接近常數時間。

```typescript
/**
 * 帶雙段路徑壓縮的迭代式 find。
 * @param node 欲查詢所屬根節點的格子索引
 * @return 包含 node 的連通分量根節點
 */
const find = (node: number): number => {
  let root = node;
  // 第一段：沿樹向上尋找根節點
  while (parent[root] !== root) {
    root = parent[root];
  }
  // 第二段：將路徑上每個節點直接指向根節點
  let current = node;
  while (parent[current] !== root) {
    const next = parent[current];
    parent[current] = root;
    current = next;
  }
  return root;
};
```

### Step 5：逐格掃描並計算上方與左方鄰格的索引與字元匹配狀態

對矩陣中每個格子，計算其一維索引與字元編碼，
並判斷上方鄰格與左方鄰格是否存在且與當前格字元相同。

```typescript
for (let row = 0; row < rowCount; row++) {
  for (let column = 0; column < columnCount; column++) {
    const currentIndex = row * columnCount + column;
    const currentCode = codes[currentIndex];

    // 上方與左方鄰格的索引；超出邊界時為 -1
    const upIndex = row > 0 ? currentIndex - columnCount : -1;
    const leftIndex = column > 0 ? currentIndex - 1 : -1;

    const upMatches = upIndex !== -1 && codes[upIndex] === currentCode;
    const leftMatches = leftIndex !== -1 && codes[leftIndex] === currentCode;

    // ...
  }
}
```

### Step 6：當上方與左方鄰格皆同字元時，檢查是否形成環並執行合併

若兩個同字元鄰格已位於相同連通分量，代表加入當前格後形成環，立即回傳 `true`。
否則依秩合併兩分量，並將當前格併入合併後的分量。

```typescript
for (let row = 0; row < rowCount; row++) {
  for (let column = 0; column < columnCount; column++) {
    // Step 5：計算索引、編碼與鄰格匹配狀態

    if (upMatches && leftMatches) {
      const rootUp = find(upIndex);
      const rootLeft = find(leftIndex);
      // 兩個同字元鄰格已在同一分量中，代表存在環
      if (rootUp === rootLeft) {
        return true;
      }
      // 以按秩合併合併兩分量，再將當前格加入
      if (rank[rootUp] < rank[rootLeft]) {
        parent[rootUp] = rootLeft;
        parent[currentIndex] = rootLeft;
      } else if (rank[rootUp] > rank[rootLeft]) {
        parent[rootLeft] = rootUp;
        parent[currentIndex] = rootUp;
      } else {
        parent[rootLeft] = rootUp;
        rank[rootUp]++;
        parent[currentIndex] = rootUp;
      }
    } else if (upMatches) {
      // 僅上方鄰格匹配：將當前格加入其分量
      parent[currentIndex] = find(upIndex);
    } else if (leftMatches) {
      // 僅左方鄰格匹配：將當前格加入其分量
      parent[currentIndex] = find(leftIndex);
    }
    // 無匹配鄰格：當前格維持自身為根（無須動作）
  }
}
```

### Step 7：掃描完整矩陣後若無環則回傳 false

若所有格子皆處理完畢，始終未觸發環偵測條件，則矩陣中不存在任何合法環。

```typescript
return false;
```

## 時間複雜度

- 攤平與 2×2 預檢掃描整個矩陣，耗時 $O(m \cdot n)$；
- 初始化並查集耗時 $O(m \cdot n)$；
- 逐格掃描對每個格子最多執行兩次 `find` 與一次 `union`，每次操作近似 $O(\alpha(m \cdot n))$，$\alpha$ 為反阿克曼函數，實務上視為常數；
- 總時間複雜度為 $O(m \cdot n)$。

> $O(m \cdot n)$

## 空間複雜度

- 一維字元編碼陣列佔用 $O(m \cdot n)$；
- 並查集的父節點陣列與秩陣列各佔 $O(m \cdot n)$；
- 總空間複雜度為 $O(m \cdot n)$。

> $O(m \cdot n)$
