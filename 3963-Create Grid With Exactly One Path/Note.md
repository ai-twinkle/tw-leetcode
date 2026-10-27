# 3963. Create Grid With Exactly One Path

You are given two integers `m` and `n`, 
representing the number of rows and columns of a grid.

Construct any `m x n` grid consisting only of the characters `'.'` and `'#'`, where:

- `'.'` represents a free cell.
- `'#'` represents an obstacle cell.

A valid path is a sequence of free cells that:

- Starts at the top-left cell `(0, 0)`.
- Ends at the bottom-right cell `(m - 1, n - 1)`.
- Moves only:
  - Right, from `(i, j)` to `(i, j + 1)`, or
  - Down, from `(i, j)` to `(i + 1, j)`.

Return any grid such that there is exactly one valid path from the top-left cell to the bottom-right cell.

**Constraints:**

- `1 <= m, n <= 25`

## 基礎思路

本題要求建構一個 `m x n` 的網格，使得從左上角到右下角、只能向右或向下移動的合法路徑恰好只有一條。
由於題目只要求回傳任意一個符合條件的網格，重點在於設計一種結構簡單、能保證路徑唯一的固定圖樣。

在思考解法時，可掌握以下核心觀察：

- **移動方向受限使路徑具單調性**：
  只能向右或向下移動，路徑上的列索引與行索引都不會減少。因此只要限制每一列可走的格子，就能直接決定路徑的形狀。

- **唯一路徑可由「先走到底、再往下」構成**：
  若第一列全部開放，其餘每一列只開放最後一格，則從起點出發只能沿第一列一路向右走到最後一行，再沿最後一行一路向下到終點，沒有其他分岔。

- **其他格子一律設為障礙即可封鎖所有替代路徑**：
  下方各列除最後一格外皆為障礙，因此任何提早向下的嘗試都會走進障礙格，必然失敗，路徑唯一性因此成立。

- **圖樣僅取決於寬度，且種類極少**：
  整個網格只由「全開放列」與「僅末格開放列」兩種列組成，且兩者只與寬度有關。由於寬度上限很小，可預先建好所有寬度的兩種列字串，讓多列共用同一份字串。

依據以上特性，可以採用以下策略：

- **預先為每一種可能的寬度建立兩種列字串**，以遞增方式累加字元，讓每種寬度只需一次串接。
- **建構網格時，第一列使用全開放列，其餘列共用同一條僅末格開放的列**，形成「先右後下」的唯一路徑。
- **以尺寸組合作為鍵值快取已完成的網格**，相同尺寸的重複查詢可直接回傳結果。

此策略不需任何搜尋或驗證，即能直接構造出保證只有一條合法路徑的網格，且實作簡潔高效。

## 解題步驟

### Step 1：定義維度上限與快取鍵步距常數

先依約束條件定義網格維度的最大值，並據此定義將 `(m, n)` 打包成單一整數鍵值時所需的步距。

```typescript
/** 由約束條件得出的網格最大維度（1 <= m, n <= 25）。 */
const MAXIMUM_DIMENSION = 25;

/** 將 (m, n) 組合打包成單一整數快取鍵時所使用的步距。 */
const CACHE_STRIDE = MAXIMUM_DIMENSION + 1;
```

### Step 2：宣告依寬度索引的兩種列字串表

宣告兩張以寬度為索引的字串表。一張存放全為空格的頂列，另一張存放只有最後一格為空格、其餘皆為障礙的下降列。

```typescript
/**
 * 預先建立並共用的列字串，以寬度作為索引。
 * FULL_FREE_ROW[width] 為全部可通行的頂列："....".
 * TAIL_FREE_ROW[width] 為僅最後一格可通行的封鎖列："###.".
 */
const FULL_FREE_ROW: string[] = new Array(CACHE_STRIDE);
const TAIL_FREE_ROW: string[] = new Array(CACHE_STRIDE);
```

### Step 3：遞增建構每種寬度的兩種列字串

使用兩個前綴字串逐步累加字元。每輪先在可通行前綴後補上一個 `'.'` 作為該寬度的全開放列，再以目前的障礙前綴接上一個 `'.'` 作為僅末格開放列，最後將障礙前綴延長一格。如此每種寬度只需一次串接。

```typescript
// 以遞增方式建構兩種列的形狀，使每種寬度只需一次字串串接。
let freePrefix = '';
let blockedPrefix = '';

for (let width = 1; width <= MAXIMUM_DIMENSION; width++) {
  freePrefix += '.';
  FULL_FREE_ROW[width] = freePrefix;
  TAIL_FREE_ROW[width] = blockedPrefix + '.';
  blockedPrefix += '#';
}
```

### Step 4：宣告已完成網格的快取表

宣告一張以 `m * CACHE_STRIDE + n` 為鍵值的快取表，用來儲存已建構完成的網格。

```typescript
/** 已完成網格的備忘表，鍵值為 m * CACHE_STRIDE + n。 */
const GRID_CACHE: Array<string[] | undefined> = new Array(CACHE_STRIDE * CACHE_STRIDE);
```

### Step 5：計算快取鍵並嘗試直接回傳快取結果

進入主函數後，先將 `(m, n)` 打包成快取鍵。若該尺寸的網格已建構過，直接回傳快取內容。

```typescript
const cacheKey = m * CACHE_STRIDE + n;
const cachedGrid = GRID_CACHE[cacheKey];

// 相同尺寸的重複查詢可在 O(1) 內完成。
if (cachedGrid !== undefined) {
  return cachedGrid;
}
```

### Step 6：建立網格並設定全開放的頂列

配置長度為 `m` 的列陣列，並將第一列設為全開放列，讓路徑能沿著頂列一路向右走到最後一行。

```typescript
const grid: string[] = new Array(m);

// 頂列全部可通行：路徑沿著它一路向右走到最後一行。
grid[0] = FULL_FREE_ROW[n];
```

### Step 7：將其餘各列設為僅末格開放的下降列

其餘每一列都共用同一條「僅最後一格可通行」的列字串。這會迫使路徑只能沿最後一行直線向下，同時封鎖所有提早向下的替代路徑。

```typescript
// 其餘每一列只開放最後一格，迫使路徑直線向下。
const descentRow = TAIL_FREE_ROW[n];

for (let row = 1; row < m; row++) {
  grid[row] = descentRow;
}
```

### Step 8：寫入快取並回傳網格

將建構完成的網格存入快取，供後續相同尺寸的查詢直接使用，最後回傳結果。

```typescript
GRID_CACHE[cacheKey] = grid;

return grid;
```

## 時間複雜度

- 預建列字串表只與固定的維度上限有關，為一次性的常數成本。
- 每次建構網格需逐列指派字串參考，共 `m` 列，為 $O(m)$。
- 若命中快取，可在 $O(1)$ 內直接回傳。
- 總時間複雜度為 $O(m)$。

> $O(m)$

## 空間複雜度

- 預建列字串表與快取表的大小皆由固定維度上限決定，為常數空間。
- 每個網格需一個長度為 `m` 的列陣列，各列共用預建字串而不另外複製，為 $O(m)$。
- 總空間複雜度為 $O(m)$。

> $O(m)$
