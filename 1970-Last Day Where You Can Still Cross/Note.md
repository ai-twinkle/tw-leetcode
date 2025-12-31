# 1970. Last Day Where You Can Still Cross

There is a 1-based binary matrix where `0` represents land and `1` represents water. 
You are given integers `row` and `col` representing the number of rows and columns in the matrix, respectively.

Initially on day `0`, the entire matrix is land. 
However, each day a new cell becomes flooded with water. 
You are given a 1-based 2D array `cells`, where `cells[i] = [r_i, c_i]` represents that on the $i^{th}$ day, 
the cell on the $r_i^{th}$ row and $c_i^{th}$ column (1-based coordinates) will be covered with water (i.e., changed to `1`).

You want to find the last day that it is possible to walk from the top to the bottom by only walking on land cells. 
You can start from any cell in the top row and end at any cell in the bottom row. 
You can only travel in the four cardinal directions (left, right, up, and down).

Return the last day where it is possible to walk from the top to the bottom by only walking on land cells.

**Constraints:**

- `2 <= row, col <= 2 * 10^4`
- `4 <= row * col <= 2 * 10^4`
- `cells.length == row * col`
- `1 <= r_i <= row`
- `1 <= c_i <= col`
- All the values of cells are unique.

## 基礎思路

本題每天會把一格陸地淹成水，詢問「最後一天仍能從最上列走到最下列（只能走陸地）」是哪一天。若從第 0 天開始正向模擬，每天都要檢查是否仍存在一條從上到下的陸路，檢查一次通常需要圖搜尋，會導致總成本過高。

關鍵轉換在於：

* **正向是「陸地越來越少」**，連通性只會變差；
* 反過來看，若我們從「全是水」開始，**每天把一格水變回陸地**，連通性只會變好；
* 因此「正向最後能走的那天」等價於「反向第一次出現上下連通的那天」的對應日子。

為了高效維護連通性，我們採用：

* **並查集（DSU）維護陸地連通塊**：每次新增一格陸地，只需要把它和四個方向上已是陸地的鄰居合併。
* **兩個虛擬節點（virtual top / bottom）**：把第一列的陸地都連到 virtual top，把最後一列的陸地都連到 virtual bottom。如此只要檢查 virtual top 和 virtual bottom 是否同一集合，就能判斷是否存在從上到下的路徑。
* **反向逐日加入陸地**：一旦 virtual top 與 virtual bottom 連通，代表當天（反向）已可走通；換回正向，就是答案日。

這樣每一天只做常數次合併與查找，整體能在題目上限內完成。

## 解題步驟

### Step 1：建立總格數與虛擬節點編號

先把 2D 格子壓平成 1D 節點編號，並額外準備兩個虛擬節點用於上下連通檢查。

```typescript
const totalCellCount = row * col;
const virtualTopNodeIndex = totalCellCount;
const virtualBottomNodeIndex = totalCellCount + 1;
```

### Step 2：初始化 DSU 結構（parent 與 size）

使用 `parent` 與 `componentSize` 做並查集，並用 union-by-size 讓樹保持淺，提升查找效率。

```typescript
// DSU 陣列：parent 連結 + 以 size 合併，讓樹保持淺（find 更快）
const parent = new Int32Array(totalCellCount + 2);
const componentSize = new Int32Array(totalCellCount + 2);
for (let index = 0; index < totalCellCount + 2; index++) {
  parent[index] = index;
  componentSize[index] = 1;
}
```

### Step 3：建立陸地啟用狀態表（反向過程使用）

反向模擬中，`isLand[nodeIndex] = 1` 表示該格已被「加回」成陸地，才能參與合併。

```typescript
// 反向過程的陸地啟用位圖（0 = 水/未啟用，1 = 陸地/已啟用）
const isLand = new Uint8Array(totalCellCount);
```

### Step 4：預先把每天的座標轉成 0-based 並計算壓平節點編號

為了讓主迴圈更快，先把 `cells` 每天對應的 `(r, c)` 轉成 0-based，並算出 1D nodeIndex。

```typescript
// 預先計算每天的索引，避免主迴圈重複做陣列索引 / 算術運算的開銷
const dayRowIndex = new Int32Array(totalCellCount);
const dayColIndex = new Int32Array(totalCellCount);
const dayNodeIndex = new Int32Array(totalCellCount);
for (let dayIndex = 0; dayIndex < totalCellCount; dayIndex++) {
  const cell = cells[dayIndex];
  const rowIndex = cell[0] - 1;
  const colIndex = cell[1] - 1;

  dayRowIndex[dayIndex] = rowIndex;
  dayColIndex[dayIndex] = colIndex;
  dayNodeIndex[dayIndex] = rowIndex * col + colIndex;
}
```

### Step 5：輔助函式 `findRoot` — 路徑壓縮查找根節點

用 path halving 做查找，能把攤銷成本壓到非常接近常數。

```typescript
/**
 * 以路徑壓縮找出節點的根代表。
 * @param nodeIndex DSU 節點編號。
 * @returns 根代表的編號。
 */
function findRoot(nodeIndex: number): number {
  // 路徑折半：隨時間大幅降低深度，使查找具攤銷近似 O(1) 的效果
  while (parent[nodeIndex] !== nodeIndex) {
    parent[nodeIndex] = parent[parent[nodeIndex]];
    nodeIndex = parent[nodeIndex];
  }
  return nodeIndex;
}
```

### Step 6：輔助函式 `unionWithBaseRoot` — 以 size 合併集合

固定以 root 合併、並把小樹接到大樹下，保持結構淺。

```typescript
/**
 * 將已知 root 的集合與另一節點所屬集合合併（以 size 合併）。
 * @param baseRootIndex 一個根代表（必須是 root）。
 * @param otherNodeIndex 另一個節點（不一定是 root）。
 * @returns 合併後的新根代表。
 */
function unionWithBaseRoot(baseRootIndex: number, otherNodeIndex: number): number {
  // 僅以 root 代表進行合併，避免不必要的工作
  let otherRootIndex = findRoot(otherNodeIndex);
  if (baseRootIndex === otherRootIndex) {
    return baseRootIndex;
  }

  // 小樹接到大樹下，維持 DSU 結構淺
  if (componentSize[baseRootIndex] < componentSize[otherRootIndex]) {
    const temporary = baseRootIndex;
    baseRootIndex = otherRootIndex;
    otherRootIndex = temporary;
  }

  parent[otherRootIndex] = baseRootIndex;
  componentSize[baseRootIndex] += componentSize[otherRootIndex];
  return baseRootIndex;
}
```

### Step 7：反向主迴圈骨架 — 逐日把水加回成陸地

反向從最後一天開始往前，逐步啟用陸地，並嘗試與周圍陸地合併。

```typescript
// 反向模擬：從全淹水開始，每天加回一格陸地。
// 反向第一次連通上下，等價於正向最後仍可通行的那一天。
for (let dayIndex = totalCellCount - 1; dayIndex >= 0; dayIndex--) {
  const nodeIndex = dayNodeIndex[dayIndex];
  const rowIndex = dayRowIndex[dayIndex];
  const colIndex = dayColIndex[dayIndex];

  // ...
}
```

### Step 8：啟用當天陸地，並連接到虛擬頂/底節點

若該格在第一列，與 virtual top 合併；若在最後一列，與 virtual bottom 合併。

```typescript
for (let dayIndex = totalCellCount - 1; dayIndex >= 0; dayIndex--) {
  // Step 7：反向主迴圈骨架 — 逐日把水加回成陸地

  const nodeIndex = dayNodeIndex[dayIndex];
  const rowIndex = dayRowIndex[dayIndex];
  const colIndex = dayColIndex[dayIndex];

  // 啟用此格為陸地，並與相鄰陸地集合合併
  isLand[nodeIndex] = 1;

  // 記錄目前集合 root，減少多次 union 時重複 find 的呼叫
  let baseRootIndex = nodeIndex;

  // 第一列的陸地連到虛擬頂節點，方便用一次連通檢查判斷是否可通行
  if (rowIndex === 0) {
    baseRootIndex = unionWithBaseRoot(baseRootIndex, virtualTopNodeIndex);
  }

  // 最後一列的陸地連到虛擬底節點
  if (rowIndex === row - 1) {
    baseRootIndex = unionWithBaseRoot(baseRootIndex, virtualBottomNodeIndex);
  }

  // ...
}
```

### Step 9：嘗試與四方向已啟用陸地合併

只要鄰居是陸地（已啟用），就合併到同一連通塊。

```typescript
for (let dayIndex = totalCellCount - 1; dayIndex >= 0; dayIndex--) {
  // Step 7：反向主迴圈骨架 — 逐日把水加回成陸地

  // Step 8：啟用當天陸地，並連接到虛擬頂/底節點

  // 若上方鄰居已是陸地，合併
  if (rowIndex > 0) {
    const upNodeIndex = nodeIndex - col;
    if (isLand[upNodeIndex] === 1) {
      baseRootIndex = unionWithBaseRoot(baseRootIndex, upNodeIndex);
    }
  }

  // 若下方鄰居已是陸地，合併
  if (rowIndex + 1 < row) {
    const downNodeIndex = nodeIndex + col;
    if (isLand[downNodeIndex] === 1) {
      baseRootIndex = unionWithBaseRoot(baseRootIndex, downNodeIndex);
    }
  }

  // 若左方鄰居已是陸地，合併
  if (colIndex > 0) {
    const leftNodeIndex = nodeIndex - 1;
    if (isLand[leftNodeIndex] === 1) {
      baseRootIndex = unionWithBaseRoot(baseRootIndex, leftNodeIndex);
    }
  }

  // 若右方鄰居已是陸地，合併
  if (colIndex + 1 < col) {
    const rightNodeIndex = nodeIndex + 1;
    if (isLand[rightNodeIndex] === 1) {
      baseRootIndex = unionWithBaseRoot(baseRootIndex, rightNodeIndex);
    }
  }

  // ...
}
```

### Step 10：檢查上下是否已連通，若是則回傳答案日

當 virtual top 與 virtual bottom 同屬一個集合，代表已存在一條陸路；此時反向的 dayIndex 對應正向的「最後可通行日」。

```typescript
for (let dayIndex = totalCellCount - 1; dayIndex >= 0; dayIndex--) {
  // Step 7：反向主迴圈骨架 — 逐日把水加回成陸地

  // Step 8：啟用當天陸地，並連接到虛擬頂/底節點

  // Step 9：嘗試與四方向已啟用陸地合併

  // 若虛擬頂與虛擬底在同一集合，代表存在從上到下的陸路
  if (findRoot(virtualTopNodeIndex) === findRoot(virtualBottomNodeIndex)) {
    return dayIndex;
  }
}

return 0;
```

## 時間複雜度

- 設 `n = row * col`，且 `cells.length = n`，初始化 DSU（長度 `n + 2` 的陣列與迴圈）：$O(n)$。
- 預處理每天座標轉換（掃過 `cells` 一次）：$O(n)$。
- 反向主迴圈執行 `n` 次；每次最多做：
    - 常數次鄰居檢查（至多 4 次）；
    - 常數次合併（至多 6 次：頂/底 + 四方向）；
    - 每次合併包含 `findRoot`，且 DSU（路徑壓縮 + union by size）之攤銷成本為 $\alpha(n)$；
    - 另外每次還做 2 次 `findRoot` 用於連通性判斷，攤銷亦為 $\alpha(n)$。
- 因此總 DSU 操作數為 $O(n)$ 次，每次攤銷 $\alpha(n)$，總時間為 **$O(n \alpha(n))$**。
- 總時間複雜度為 $O(n \alpha(n))$。

> $O(n \alpha(n))$

## 空間複雜度

- 設 `n = row * col`，`parent`、`componentSize`：各長度 `n + 2`，為 $O(n)$。
- `isLand`：長度 `n`，為 $O(n)$。
- `dayRowIndex`、`dayColIndex`、`dayNodeIndex`：各長度 `n`，合計 $O(n)$。
- 其餘皆為常數額外空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
