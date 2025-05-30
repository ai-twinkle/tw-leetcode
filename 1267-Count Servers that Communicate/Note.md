# 1267. Count Servers that Communicate

You are given a map of a server center, represented as a `m * n` integer matrix `grid`, 
where 1 means that on that cell there is a server and 0 means that it is no server. 
Two servers are said to communicate if they are on the same row or on the same column.

Return the number of servers that communicate with any other server.

**Constraints:**

- `m == grid.length`
- `n == grid[i].length`
- `1 <= m <= 250`
- `1 <= n <= 250`
- `grid[i][j] == 0 or 1`

## 基礎思路

為了計算可以通訊的伺服器數量，我們只需要知道每個行與每個列中伺服器的分佈。
如果某個儲存格中有伺服器，且其所在的行或列上至少還有另一台伺服器，則該伺服器就能與其他伺服器通訊。

基於此，我們採取兩階段遍歷：

1. **階段 1**：統計每行與每列的伺服器數量。
2. **階段 2**：再掃描每個有伺服器的儲存格，判斷其所在行或列的伺服器數是否大於 1，若是則累計可通訊的伺服器。

如此，可在 $O(m \times n)$ 時間內完成計算。

## 解題步驟

### Step 1：輸入驗證與行列計數初始化

- 取得矩陣的行數 `rowCount`。
- 若 `rowCount === 0`，代表沒有任何儲存格，直接回傳 0。
- 取得矩陣的列數 `colCount`。

```typescript
const rowCount = grid.length;
if (rowCount === 0) {
  return 0;
}
const colCount = grid[0].length;
```

### Step 2：初始化型別化計數陣列

- `serversPerRow[i]` 用來儲存第 `i` 行的伺服器總數。
- `serversPerCol[j]` 用來儲存第 `j` 列的伺服器總數。

```typescript
// 使用型別化陣列來儲存計數，以減少 JS 物件的額外負擔
const serversPerRow = new Uint16Array(rowCount);
const serversPerCol = new Uint16Array(colCount);
```

### Step 3：階段 1 — 統計每行與每列的伺服器數量

1. 外層迴圈遍歷每一行，並將 `grid[i]` 存為 `row`，可減少一次邊界檢查成本。
2. 使用區域變數 `rowServerCount` 作為本地累加器，將該行中的所有 `row[j]`（0 或 1）直接相加。
3. 同時將 `hasServer` 累加到對應的 `serversPerCol[j]`。
4. 最後將本行的總和 `rowServerCount` 存入 `serversPerRow[i]`。

```typescript
// 階段 1：統計每列與每欄的伺服器數量
for (let i = 0; i < rowCount; i++) {
  const row = grid[i]; // 行的別名，減少邊界檢查
  let rowServerCount = 0; // 當前行的伺服器總數
  for (let j = 0; j < colCount; j++) {
    // 直接將 0 或 1 加總
    const hasServer = row[j];
    rowServerCount += hasServer;
    serversPerCol[j] += hasServer;
  }
  serversPerRow[i] = rowServerCount;
}
```

### Step 4：階段 2 — 掃描伺服器並計算可通訊的數量

1. 初始化計數器 `totalCommunicating = 0`。
2. 再次遍歷整個矩陣，只對 `row[j] === 1`（有伺服器）的儲存格進行檢查。
3. 若該行 `rowServers > 1` 或該列 `serversPerCol[j] > 1`，代表至少有另一台伺服器與之共用行或列，則此伺服器可通訊，累加一次。


```typescript
let totalCommunicating = 0;
for (let i = 0; i < rowCount; i++) {
  const row = grid[i];
  const rowServers = serversPerRow[i];
  for (let j = 0; j < colCount; j++) {
    // 快速跳過空位後，再檢查此伺服器是否可以通訊
    if (row[j] && (rowServers > 1 || serversPerCol[j] > 1)) {
      totalCommunicating++;
    }
  }
}
```
### Step 5：回傳結果

最終回傳 `totalCommunicating`，即所有可通訊伺服器的總和。

```typescript
return totalCommunicating;
```

## 時間複雜度

- 階段 1 需遍歷整個 $m \times n$ 矩陣一次；
- 階段 2 也需遍歷整個 $m \times n$ 矩陣一次；
- 總時間複雜度為 $O(m \times n)$。

> $O(m \times n)$

## 空間複雜度

- 使用兩個 `Uint16Array`，長度分別為 $m$ 與 $n$，額外空間為 $O(m + n)$。
- 總空間複雜度為 $O(m + n)$。

> $O(m + n)$
