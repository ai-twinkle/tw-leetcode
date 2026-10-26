# 3619. Count Islands With Total Value Divisible by K

You are given an `m x n` matrix grid and a positive integer `k`. 
An island is a group of positive integers (representing land) that are 4-directionally connected (horizontally or vertically).

The total value of an island is the sum of the values of all cells in the island.

Return the number of islands with a total value divisible by `k`.

**Constraints:**

- `m == grid.length`
- `n == grid[i].length`
- `1 <= m, n <= 1000`
- `1 <= m * n <= 10^5`
- `0 <= grid[i][j] <= 10^6`
- `1 <= k <= 10^6`

## 基礎思路

本題要求在一個非負整數矩陣中，找出所有由正整數構成、以四方向相連的島嶼，並統計其中「島嶼總值可被 `k` 整除」的島嶼數量。
由於矩陣格子總數最多可達 `10^5`，必須確保每個格子只被處理常數次，才能在時限內完成。

在思考解法時，可掌握以下核心觀察：

- **島嶼即為連通分量**：
  每座島嶼是由正值格子以上下左右相連所形成的連通區塊，因此只要從任一尚未處理的陸地格出發，進行一次完整的擴展，即可取得整座島嶼的所有格子與總值。

- **每個格子只需被造訪一次**：
  一旦某格被歸入某座島嶼，就不可能再屬於其他島嶼；因此只要在取用時立即將其標記為已處理，即可保證整體處理量與格子總數成正比。

- **原地標記可省去額外的造訪紀錄**：
  由於值為零的格子本來就代表海洋，將已取用的陸地格直接歸零，就能同時達到「已造訪」的效果，無需另外配置標記結構。

- **外圍加上零值邊框可消除邊界判斷**：
  若在整個矩陣外圍補上一圈海洋，則任何格子的四個鄰居都必定落在合法範圍內，擴展時便不必反覆檢查是否越界。

- **遞迴深度可能過深**：
  單一島嶼最多可包含 `10^5` 個格子，若以遞迴方式擴展可能導致呼叫堆疊溢出，因此應改以顯式堆疊模擬深度優先搜尋。

- **總值範圍可安全以浮點數表示**：
  島嶼總值上限約為 `10^11`，仍在雙精度浮點數可精確表示的範圍內，因此可在整座島嶼累加完成後只做一次取模判斷。

依據以上特性，可以採用以下策略：

- **將矩陣攤平成帶有零值邊框的一維緩衝區**，讓鄰居位置可用固定位移計算，且無需邊界檢查。
- **逐格掃描，遇到陸地格即作為種子**，以顯式堆疊進行深度優先擴展，沿途累加總值並將格子歸零。
- **每座島嶼擴展完成後檢查其總值是否可被 `k` 整除**，若是則計入答案。

此策略能確保每個格子只被推入與彈出堆疊各一次，以線性時間完成所有島嶼的統計。

## 解題步驟

### Step 1：取得網格的列數與行數

先取得原始網格的列數與行數，作為後續建立緩衝區與掃描範圍的依據。

```typescript
const rowCount = grid.length;
const columnCount = grid[0].length;
```

### Step 2：建立外圍帶有零值邊框的一維緩衝區

在原網格的上下左右各補上一圈零值，每列寬度因此增加 2，總列數也增加 2；
如此一來，任何陸地格的四個鄰居索引都必定合法，擴展時完全不需要邊界判斷。

```typescript
// 在棋盤外圍加上一圈寬度為 1 的零值邊框，使所有鄰居索引皆合法，
// 因此洪水填充完全不需要列／行的邊界檢查。
const paddedWidth = columnCount + 2;
const values = new Int32Array(paddedWidth * (rowCount + 2));
```

### Step 3：將原網格資料複製到緩衝區的內部區域

寫入位置從邊框內的第一個格子開始；
每複製完一列後，將寫入位移前進一個帶邊框的列寬，確保資料落在正確的內部位置。

```typescript
let writeOffset = paddedWidth + 1;

for (let row = 0; row < rowCount; row++) {
  const sourceRow = grid[row];

  for (let column = 0; column < columnCount; column++) {
    values[writeOffset + column] = sourceRow[column];
  }

  writeOffset += paddedWidth;
}
```

### Step 4：初始化顯式堆疊、島嶼計數與掃描起點

由於每個格子最多只會被推入堆疊一次，堆疊容量設為格子總數即可保證不會溢出；
同時初始化符合條件的島嶼數量，並將掃描位移設在邊框內的第一個格子。

```typescript
// 每個格子最多只會被推入一次，因此大小為 m * n 的扁平 Int32Array 堆疊永遠不會溢出。
const stack = new Int32Array(rowCount * columnCount);
let islandCount = 0;
let scanOffset = paddedWidth + 1;
```

### Step 5：逐列逐格掃描，略過非陸地格

外層迴圈依列推進，並計算本列在緩衝區中的掃描終點；
內層迴圈逐格讀取數值，若為零（海洋或已處理過的陸地）則直接略過，只有非零格才會作為新島嶼的種子。

```typescript
for (let row = 0; row < rowCount; row++) {
  const rowEnd = scanOffset + columnCount;

  for (let index = scanOffset; index < rowEnd; index++) {
    const seedValue = values[index];

    if (seedValue === 0) {
      continue;
    }

    // ...
  }

  // ...
}
```

### Step 6：以種子格初始化島嶼總值並推入堆疊

以種子格的值作為島嶼總值的起點，並立即將其歸零作為已造訪標記；
接著重設堆疊頂端並將種子位置推入堆疊，準備開始擴展整座島嶼。

```typescript
for (let row = 0; row < rowCount; row++) {
  // Step 5：計算本列掃描終點

  for (let index = scanOffset; index < rowEnd; index++) {
    // Step 5：讀取種子值並略過非陸地格

    // 在取用格子時將其歸零，同時充當已造訪標記，因此不需要額外的 visited 陣列。
    let total = seedValue;
    values[index] = 0;
    let stackTop = 0;
    stack[stackTop++] = index;

    // ...
  }

  // ...
}
```

### Step 7：彈出目前格並擴展左右鄰居

當堆疊不為空時，彈出一個格子作為目前位置；
左右鄰居的位置分別為目前位置減一與加一，若鄰居值不為零，則將其累加至總值、歸零標記並推入堆疊。

```typescript
for (let row = 0; row < rowCount; row++) {
  // Step 5：計算本列掃描終點

  for (let index = scanOffset; index < rowEnd; index++) {
    // Step 5：讀取種子值並略過非陸地格

    // Step 6：初始化島嶼總值並推入種子

    while (stackTop > 0) {
      const current = stack[--stackTop];

      const left = current - 1;
      const leftValue = values[left];

      if (leftValue !== 0) {
        total += leftValue;
        values[left] = 0;
        stack[stackTop++] = left;
      }

      const right = current + 1;
      const rightValue = values[right];

      if (rightValue !== 0) {
        total += rightValue;
        values[right] = 0;
        stack[stackTop++] = right;
      }

      // ...
    }

    // ...
  }

  // ...
}
```

### Step 8：擴展上下鄰居

上下鄰居的位置分別為目前位置減去與加上帶邊框的列寬；
處理方式與左右鄰居相同：若不為零則累加、歸零並推入堆疊。由於外圍邊框皆為零，擴展永遠不會越界。

```typescript
for (let row = 0; row < rowCount; row++) {
  // Step 5：計算本列掃描終點

  for (let index = scanOffset; index < rowEnd; index++) {
    // Step 5：讀取種子值並略過非陸地格

    // Step 6：初始化島嶼總值並推入種子

    while (stackTop > 0) {
      // Step 7：彈出目前格並擴展左右鄰居

      const up = current - paddedWidth;
      const upValue = values[up];

      if (upValue !== 0) {
        total += upValue;
        values[up] = 0;
        stack[stackTop++] = up;
      }

      const down = current + paddedWidth;
      const downValue = values[down];

      if (downValue !== 0) {
        total += downValue;
        values[down] = 0;
        stack[stackTop++] = down;
      }
    }

    // ...
  }

  // ...
}
```

### Step 9：判斷島嶼總值是否可被 `k` 整除，並推進至下一列

當堆疊清空時，代表整座島嶼已擴展完畢；
由於總值仍在雙精度浮點數可精確表示的範圍內，只需做一次取模判斷，若可整除則計入答案。
每列掃描結束後，再將掃描位移前進一個帶邊框的列寬。

```typescript
for (let row = 0; row < rowCount; row++) {
  // Step 5：計算本列掃描終點

  for (let index = scanOffset; index < rowEnd; index++) {
    // Step 5：讀取種子值並略過非陸地格

    // Step 6：初始化島嶼總值並推入種子

    while (stackTop > 0) {
      // Step 7：彈出目前格並擴展左右鄰居

      // Step 8：擴展上下鄰居
    }

    // 島嶼總和最多為 10^5 * 10^6 = 10^11，在 float64 中可精確表示，因此每座島只需一次取模即可。
    if (total % k === 0) {
      islandCount++;
    }
  }

  scanOffset += paddedWidth;
}
```

### Step 10：回傳符合條件的島嶼數量

所有格子掃描完畢後，`islandCount` 即為總值可被 `k` 整除的島嶼數量，直接回傳。

```typescript
return islandCount;
```

## 時間複雜度

- 建立帶邊框緩衝區並複製原網格，需 $O(m \cdot n)$；
- 掃描所有格子一次，需 $O(m \cdot n)$；
- 每個陸地格最多被推入與彈出堆疊各一次，且每次只檢查四個鄰居，擴展總成本為 $O(m \cdot n)$；
- 總時間複雜度為 $O(m \cdot n)$。

> $O(m \cdot n)$

## 空間複雜度

- 帶邊框的一維緩衝區大小為 $(m + 2)(n + 2)$，即 $O(m \cdot n)$；
- 顯式堆疊大小為 $m \cdot n$；
- 其餘僅使用固定數量的變數；
- 總空間複雜度為 $O(m \cdot n)$。

> $O(m \cdot n)$
