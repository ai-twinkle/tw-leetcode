# 1254. Number of Closed Islands

Given a 2D `grid` consists of `0s` (land) and `1s` (water).
An island is a maximal 4-directionally connected group of `0s` and a closed island is an island totally 
(all left, top, right, bottom) surrounded by `1s`.

Return the number of closed islands.

**Constraints:**

- `1 <= grid.length, grid[0].length <= 100`
- `0 <= grid[i][j] <=1`

## 基礎思路

本題要求計算網格中「封閉島嶼」的數量。島嶼是由陸地以上下左右方向相連而成的最大區塊；封閉島嶼則是四周皆被水完全包圍的島嶼。

在思考解法時，可掌握以下核心觀察：

- **觸及邊界的島嶼必定不封閉**：
  只要島嶼中有任何一格位於網格最外圈，該島嶼在邊界方向上就沒有被水包圍，因此不可能是封閉島嶼。

- **不封閉的島嶼可以先行排除**：
  從邊界上的陸地出發，將所有與其相連的陸地一併消除後，網格中剩下的陸地都不會與邊界相連。

- **剩餘的每個連通區塊皆為封閉島嶼**：
  排除邊界相連的陸地後，內部每遇到一塊尚未處理的陸地，就代表一個新的封閉島嶼。只要將整塊區域消除，即可避免重複計數。

- **網格過小時不存在內部區域**：
  若行數或列數不足三，所有格子都位於邊界上，不可能存在封閉島嶼。

依據以上特性，可以採用以下策略：

- **以深度優先搜尋實作「淹沒」操作**，將一整塊相連的陸地全部改為水，同時完成標記與去重。
- **先沿著四條邊界淹沒所有與邊界相連的陸地**，排除不封閉的島嶼。
- **再掃描內部區域**，每遇到一塊陸地就計數一次，並將其所屬的整座島嶼淹沒。

此策略只需對網格進行常數次掃描，每一格最多被淹沒一次，簡潔且高效。

## 解題步驟

### Step 1：初始化計數器與網格尺寸

先準備封閉島嶼的計數器，並取得網格的行數與列數。

```typescript
let result = 0;

const rows = grid.length;
const cols = grid[0].length;
```

### Step 2：處理網格過小的邊界情況

若行數或列數小於 3，網格中沒有任何非邊界的格子，不可能存在封閉島嶼，直接回傳 0。

```typescript
// 若沒有內部區域，則不存在任何非邊界格子，因此不可能有封閉島嶼
if (rows < 3 || cols < 3) {
  return 0;
}
```

### Step 3：記錄最後一行與最後一列的索引

預先計算最後一行與最後一列的索引，供後續的邊界判斷與遍歷使用。

```typescript
const lastRow = rows - 1;
const lastCol = cols - 1;
```

### Step 4：定義淹沒相連陸地的深度優先搜尋函數

此內部函數先將目前格子改為水，代表已處理過。接著依序檢查右、下、上、左四個相鄰格子，若相鄰格位於網格內且為陸地，才遞迴淹沒該格。先檢查再遞迴，可避免產生無效的遞迴呼叫。

```typescript
/**
 * 以深度優先搜尋將與指定格子相連的所有陸地淹沒為水。
 * @param row 目前格子的行索引。
 * @param col 目前格子的列索引。
 */
function flipZero(row: number, col: number) {
  grid[row][col] = 1;

  // 先檢查相鄰格子再遞迴，避免產生會被直接捨棄的呼叫
  if (col < lastCol && grid[row][col + 1] === 0) {
    flipZero(row, col + 1);
  }

  if (row < lastRow && grid[row + 1][col] === 0) {
    flipZero(row + 1, col);
  }

  if (row > 0 && grid[row - 1][col] === 0) {
    flipZero(row - 1, col);
  }

  if (col > 0 && grid[row][col - 1] === 0) {
    flipZero(row, col - 1);
  }
}
```

### Step 5：淹沒與左右邊界相連的陸地

逐行檢查第一列與最後一列。若該格為陸地，就淹沒其所屬的整座島嶼，排除這些不封閉的島嶼。

```typescript
for (let row = 0; row < rows; row++) {
  if (grid[row][0] === 0) {
    flipZero(row, 0);
  }

  if (grid[row][lastCol] === 0) {
    flipZero(row, lastCol);
  }
}
```

### Step 6：淹沒與上下邊界相連的陸地

逐列檢查第一行與最後一行，同樣淹沒所有與邊界相連的陸地。完成後，網格中剩下的陸地皆不與邊界相連。

```typescript
for (let col = 0; col < cols; col++) {
  if (grid[0][col] === 0) {
    flipZero(0, col);
  }

  if (grid[lastRow][col] === 0) {
    flipZero(lastRow, col);
  }
}
```

### Step 7：掃描內部區域並計算封閉島嶼

遍歷所有非邊界格子。每遇到一塊陸地，就代表發現一座新的封閉島嶼，此時將整座島嶼淹沒以避免重複計數，並將計數加一。

```typescript
for (let row = 1; row < lastRow; row++) {
  for (let col = 1; col < lastCol; col++) {
    if (grid[row][col] === 0) {
      flipZero(row, col);
      result++;
    }
  }
}
```

### Step 8：回傳封閉島嶼的數量

所有封閉島嶼皆已計數完畢，直接回傳結果。

```typescript
return result;
```

## 時間複雜度

- 邊界掃描需 $O(m + n)$，內部掃描需 $O(m \cdot n)$；
- 每個格子最多被淹沒一次，所有深度優先搜尋的總成本為 $O(m \cdot n)$；
- 總時間複雜度為 $O(m \cdot n)$。

> $O(m \cdot n)$

## 空間複雜度

- 直接在原網格上標記，不需額外的訪問陣列；
- 深度優先搜尋的遞迴深度在最壞情況下可達所有格子數量，即 $O(m \cdot n)$；
- 總空間複雜度為 $O(m \cdot n)$。

> $O(m \cdot n)$
