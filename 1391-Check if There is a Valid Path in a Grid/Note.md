# 1391. Check if There is a Valid Path in a Grid

You are given an `m x n` grid. 
Each cell of `grid` represents a street. 
The street of `grid[i][j]` can be:

- `1` which means a street connecting the left cell and the right cell.
- `2` which means a street connecting the upper cell and the lower cell.
- `3` which means a street connecting the left cell and the lower cell.
- `4` which means a street connecting the right cell and the lower cell.
- `5` which means a street connecting the left cell and the upper cell.
- `6` which means a street connecting the right cell and the upper cell.

You will initially start at the street of the upper-left cell `(0, 0)`. 
A valid path in the grid is a path that starts from the upper left cell `(0, 0)` and ends at the bottom-right cell `(m - 1, n - 1)`. 
The path should only follow the streets.

Notice that you are not allowed to change any street.

Return `true` if there is a valid path in the grid or `false` otherwise.

**Constraints:**

- `m == grid.length`
- `n == grid[i].length`
- `1 <= m, n <= 300`
- `1 <= grid[i][j] <= 6`

## 基礎思路

本題要求在一個由街道類型組成的網格中，判斷是否存在一條從左上角出發、抵達右下角的合法路徑。路徑只能沿著街道的連通方向移動，且不可改變任何格子的街道類型。

在思考解法時，可掌握以下核心觀察：

- **街道連通性是雙向的**：
  兩個相鄰格子能互相通行的前提是：當前格子的街道必須朝向鄰格方向開口，且鄰格的街道也必須朝向當前格子方向開口；任一方不滿足則無法通行。

- **六種街道可以用方向位元遮罩統一表示**：
  每種街道連通的方向固定，可預先將其編碼為四個方向位元的組合，後續只需位元運算即可快速判斷任意格子的連通狀態，無需逐一比對街道類型。

- **問題本質為圖的可達性問題**：
  格子與格子之間的連通性構成有向圖，判斷終點是否可達即為標準的圖搜尋問題，可以 BFS 逐層展開。

- **以一維索引取代二維座標能提升快取效率**：
  將二維格子壓平為一維索引後，拜訪紀錄、邊界行比對都可改用陣列存取，減少間接運算。

依據以上特性，可以採用以下策略：

- **預計算每種街道類型對應的方向位元遮罩**，讓移動合法性檢查只需兩次位元 AND 操作。
- **以 BFS 雙緩衝佇列逐層搜尋可達格子**，每次探索前先確認雙向連通，抵達終點即立刻回傳 `true`。
- **使用平坦一維索引搭配 `Uint8Array` 儲存拜訪狀態**，最大化記憶體存取效率並避免重複拜訪。

此策略能在最壞情況下線性走遍所有格子，並在找到終點時提前終止，兼顧正確性與效能。

## 解題步驟

### Step 1：定義四個方向的位元常數

每個方向以獨立位元表示，後續所有街道的連通性都將以這四個位元的 OR 組合編碼，讓方向判斷統一為位元運算。

```typescript
// 四個方向所使用的連通位元位置
// bit 0 = 左，bit 1 = 右，bit 2 = 上，bit 3 = 下
const LEFT_BIT = 1;
const RIGHT_BIT = 2;
const UP_BIT = 4;
const DOWN_BIT = 8;
```

### Step 2：預計算每種街道類型的連通位元遮罩

將六種街道類型各自連通的兩個方向預先 OR 組合並儲存，讓後續每次判斷只需查表，不需再逐一比對類型。索引 0 保留為未使用。

```typescript
// 每種街道類型的預計算連通位元遮罩（索引 0 未使用）
// 每個項目儲存該街道所連通的兩個方向的 OR 值。
// 在模組載入時計算一次，讓所有 hasValidPath 呼叫共用。
const STREET_CONNECTIONS = new Uint8Array([
  0,
  LEFT_BIT | RIGHT_BIT,    // 類型 1：連接左與右
  UP_BIT | DOWN_BIT,       // 類型 2：連接上與下
  LEFT_BIT | DOWN_BIT,     // 類型 3：連接左與下
  RIGHT_BIT | DOWN_BIT,    // 類型 4：連接右與下
  LEFT_BIT | UP_BIT,       // 類型 5：連接左與上
  RIGHT_BIT | UP_BIT,      // 類型 6：連接右與上
]);
```

### Step 3：處理單格網格的邊界情況並初始化 BFS 所需結構

若網格只有一個格子，起點即為終點，直接回傳 `true`。
否則計算格子總數與終點索引，並建立 `Uint8Array` 拜訪陣列與雙緩衝佇列，將起點加入第一層佇列並標記為已拜訪。

```typescript
const rowCount = grid.length;
const columnCount = grid[0].length;

// 單格網格：起始格即為終點
if (rowCount === 1 && columnCount === 1) {
  return true;
}

const totalCells = rowCount * columnCount;
const lastIndex = totalCells - 1;

// Uint8Array 提供最小且對快取友善的拜訪位元陣列
const visited = new Uint8Array(totalCells);

// 兩個普通陣列作為 BFS 的當前層與下一層佇列。
// 在此使用普通陣列而非預先配置的 Int32Array，是因為大多數 BFS 搜尋
// 在接觸少數格子後即提前結束，無須承擔預先清零大緩衝區的成本。
let currentFrontier: number[] = [0];
let nextFrontier: number[] = [];
visited[0] = 1;
```

### Step 4：逐層展開 BFS，對每個當前格子解析其列與行座標及連通遮罩

進入主迴圈後，依序取出當前層的每個格子索引，
由一維索引還原出列與行座標，再查表取得該格子的連通位元遮罩，作為後續四個方向探索的依據。

```typescript
while (currentFrontier.length > 0) {
  const frontierSize = currentFrontier.length;
  for (let i = 0; i < frontierSize; i++) {
    const currentIndex = currentFrontier[i];
    const currentRow = (currentIndex / columnCount) | 0;
    const currentColumn = currentIndex - currentRow * columnCount;
    const currentConnections = STREET_CONNECTIONS[grid[currentRow][currentColumn]];

    // ...
  }

  // ...
}
```

### Step 5：嘗試向左移動，檢查雙向連通後加入下一層或提前回傳

當前格子需開口朝左，且左側鄰格需開口朝右，兩者皆滿足且鄰格未曾拜訪時，才可合法移動。
若鄰格即為終點則立即回傳 `true`，否則標記並加入下一層佇列。

```typescript
while (currentFrontier.length > 0) {
  const frontierSize = currentFrontier.length;
  for (let i = 0; i < frontierSize; i++) {
    // Step 4：解析座標與連通遮罩

    // 向左移動：當前格須開口朝左，鄰格須開口朝右
    if ((currentConnections & LEFT_BIT) !== 0 && currentColumn > 0) {
      const neighborIndex = currentIndex - 1;
      if (visited[neighborIndex] === 0 &&
        (STREET_CONNECTIONS[grid[currentRow][currentColumn - 1]] & RIGHT_BIT) !== 0) {
        if (neighborIndex === lastIndex) {
          return true;
        }
        visited[neighborIndex] = 1;
        nextFrontier.push(neighborIndex);
      }
    }

    // ...
  }

  // ...
}
```

### Step 6：嘗試向右移動，檢查雙向連通後加入下一層或提前回傳

向右移動的條件與向左對稱：當前格須開口朝右，右側鄰格須開口朝左。

```typescript
while (currentFrontier.length > 0) {
  const frontierSize = currentFrontier.length;
  for (let i = 0; i < frontierSize; i++) {
    // Step 4：解析座標與連通遮罩

    // Step 5：向左移動

    // 向右移動：當前格須開口朝右，鄰格須開口朝左
    if ((currentConnections & RIGHT_BIT) !== 0 && currentColumn < columnCount - 1) {
      const neighborIndex = currentIndex + 1;
      if (visited[neighborIndex] === 0 &&
        (STREET_CONNECTIONS[grid[currentRow][currentColumn + 1]] & LEFT_BIT) !== 0) {
        if (neighborIndex === lastIndex) {
          return true;
        }
        visited[neighborIndex] = 1;
        nextFrontier.push(neighborIndex);
      }
    }

    // ...
  }

  // ...
}
```

### Step 7：嘗試向上移動，檢查雙向連通後加入下一層或提前回傳

向上移動要求當前格開口朝上，且上方鄰格開口朝下。

```typescript
while (currentFrontier.length > 0) {
  const frontierSize = currentFrontier.length;
  for (let i = 0; i < frontierSize; i++) {
    // Step 4：解析座標與連通遮罩

    // Step 5：向左移動

    // Step 6：向右移動

    // 向上移動：當前格須開口朝上，鄰格須開口朝下
    if ((currentConnections & UP_BIT) !== 0 && currentRow > 0) {
      const neighborIndex = currentIndex - columnCount;
      if (visited[neighborIndex] === 0 &&
        (STREET_CONNECTIONS[grid[currentRow - 1][currentColumn]] & DOWN_BIT) !== 0) {
        if (neighborIndex === lastIndex) {
          return true;
        }
        visited[neighborIndex] = 1;
        nextFrontier.push(neighborIndex);
      }
    }

    // ...
  }

  // ...
}
```

### Step 8：嘗試向下移動，檢查雙向連通後加入下一層或提前回傳

向下移動要求當前格開口朝下，且下方鄰格開口朝上。此為四個方向中的最後一個。

```typescript
while (currentFrontier.length > 0) {
  const frontierSize = currentFrontier.length;
  for (let i = 0; i < frontierSize; i++) {
    // Step 4：解析座標與連通遮罩

    // Step 5：向左移動

    // Step 6：向右移動

    // Step 7：向上移動

    // 向下移動：當前格須開口朝下，鄰格須開口朝上
    if ((currentConnections & DOWN_BIT) !== 0 && currentRow < rowCount - 1) {
      const neighborIndex = currentIndex + columnCount;
      if (visited[neighborIndex] === 0 &&
        (STREET_CONNECTIONS[grid[currentRow + 1][currentColumn]] & UP_BIT) !== 0) {
        if (neighborIndex === lastIndex) {
          return true;
        }
        visited[neighborIndex] = 1;
        nextFrontier.push(neighborIndex);
      }
    }
  }

  // ...
}
```

### Step 9：每一層結束後交換佇列，準備下一層展開

當前層所有格子處理完畢後，將兩個佇列對調，並清空原當前層佇列以供下一層使用，避免重新配置記憶體。

```typescript
while (currentFrontier.length > 0) {
  const frontierSize = currentFrontier.length;
  for (let i = 0; i < frontierSize; i++) {
    // Step 4：解析座標與連通遮罩

    // Step 5：向左移動

    // Step 6：向右移動

    // Step 7：向上移動

    // Step 8：向下移動
  }

  // 交換兩個佇列，並重新利用底層陣列儲存空間供下一層使用
  const swapHelper = currentFrontier;
  currentFrontier = nextFrontier;
  nextFrontier = swapHelper;
  nextFrontier.length = 0;
}
```

### Step 10：BFS 結束後仍未抵達終點，回傳 false

若 BFS 耗盡所有可達格子後仍未觸及終點，代表不存在合法路徑，回傳 `false`。

```typescript
return false;
```

## 時間複雜度

- 每個格子最多被加入佇列並處理一次，共 $m \times n$ 個格子；
- 每個格子的四個方向探索皆為常數時間的位元運算與陣列查表；
- 總時間複雜度為 $O(m \times n)$。

> $O(m \times n)$

## 空間複雜度

- 拜訪陣列佔用 $O(m \times n)$ 空間；
- 雙緩衝佇列在最壞情況下合計儲存 $O(m \times n)$ 個索引；
- 總空間複雜度為 $O(m \times n)$。

> $O(m \times n)$
