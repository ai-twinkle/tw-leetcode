# 3882. Minimum XOR Path in a Grid

You are given a 2D integer array grid of size `m * n`.

You start at the top-left cell `(0, 0)` and want to reach the bottom-right cell `(m - 1, n - 1)`.

At each step, you may move either right or down.

The cost of a path is defined as the bitwise XOR of all the values in the cells along that path, including the start and end cells.

Return the minimum possible XOR value among all valid paths from `(0, 0)` to `(m - 1, n - 1)`.

**Constraints:**

- `1 <= m == grid.length <= 1000`
- `1 <= n == grid[i].length <= 1000`
- `m * n <= 1000`
- `0 <= grid[i][j] <= 10^23`

## 基礎思路

本題要從左上角走到右下角，每步只能向右或向下，路徑成本是路徑上所有格子數值的 XOR，要求最小成本。
XOR 不具單調性，局部最小的前綴之後未必能得到最小的總結果，所以不能像一般最短路徑那樣只保留每格的最佳值。

在思考解法時，可掌握以下核心觀察：

- **每格需保留「所有可達的 XOR 值」**：
  到達某格的不同路徑會產生不同的前綴 XOR，而任何一個都可能在之後變成最小解，因此每格要記錄的是可達 XOR 值的完整集合。

- **可達值的範圍有上限**：
  任意一組數值的 XOR 都不會出現所有數值 OR 之外的位元。因此所有可能的 XOR 值都落在「OR 的位元長度」所決定的 2 的冪次範圍內，可以用固定大小的位元集合表示。

- **轉移只有「聯集」與「整體 XOR」兩種操作**：
  到達某格的集合，是上方與左方集合的聯集，再把集合中每個元素都 XOR 上該格的值。後者等同於把位元集合的索引做一次置換。

- **索引置換可拆成兩層完成**：
  將 XOR 的值拆成高位與低位。高位決定整個字組之間的對調；低位決定字組內 32 個位置的對調，可以用分層的蝶形交換一次處理整個字組。

- **只需保留一列狀態**：
  每格只依賴上方與左方，因此用一列位元集合滾動更新即可。某格被覆寫前存的正是上一列同欄的結果。

依據以上特性，可以採用以下策略：

- **先求出所有數值的 OR，決定位元集合需要涵蓋的範圍**。
- **依序掃描每一格**：合併上方與左方的可達集合，再以「字組對調加上字組內蝶形交換」完成整體 XOR 的置換。
- **最後在終點的集合中找出最小的可達值**，即為答案。

此策略把指數級的路徑枚舉，轉成每格對固定大小位元集合的位元運算，計算量只與格子數和值域大小相關。

## 解題步驟

### Step 1：取得網格尺寸並處理單一格的情況

先取得列數與欄數。若網格只有一格，起點就是終點，沒有任何路徑選擇，直接回傳該格的值。

```typescript
const rowCount = grid.length;
const columnCount = grid[0].length;

// 只有單一格時沒有任何路徑選擇。
if (rowCount === 1 && columnCount === 1) {
  return grid[0][0];
}
```

### Step 2：計算所有數值的 OR 以界定 XOR 值域

任何一組數值的 XOR 都不會超出所有數值 OR 所涵蓋的位元，因此先掃描整個網格求出 OR，作為之後決定位元集合大小的依據。

```typescript
// 任意子集合的 XOR 值都受所有數值的 OR 所限制，以此決定位元集合的大小。
let valueOr = 0;
for (let row = 0; row < rowCount; row++) {
  const currentRow = grid[row];

  for (let column = 0; column < columnCount; column++) {
    valueOr |= currentRow[column];
  }
}
```

### Step 3：計算位元長度與所需的字組數量

由 OR 的位元長度得到候選 XOR 值的總數 $2^{bitLength}$。每個 32 位元字組可存放 32 個候選值，由此換算出每格位元集合需要的字組數；值域不足 32 個時仍至少使用一個字組。

```typescript
// 涵蓋全部 2^bitLength 個候選 XOR 值所需的字組數，每個字組可存放 32 個值。
const bitLength = 32 - Math.clz32(valueOr);
const wordCount = bitLength > 5 ? 1 << (bitLength - 5) : 1;
```

### Step 4：配置滾動的位元集合與合併暫存區

`reachable` 為每一欄配置一組位元集合，代表滾動的一列狀態。某格在本列被覆寫前，存放的仍是上一列同欄的結果。`merged` 用來暫存上方與左方集合合併後的內容。

```typescript
// 滾動的一列位元集合：某格在被寫入前，仍保存著上一列同欄的內容。
const reachable = new Uint32Array(columnCount * wordCount);
const merged = new Uint32Array(wordCount);
```

### Step 5：逐格掃描並處理起點

以雙層迴圈依列、依欄走訪每一格，取得該格數值與其位元集合在滾動陣列中的起始位置。若是起點，可達的 XOR 值只有它自己，直接在對應位置設好位元後處理下一格。

```typescript
for (let row = 0; row < rowCount; row++) {
  const currentRow = grid[row];

  for (let column = 0; column < columnCount; column++) {
    const value = currentRow[column];
    const base = column * wordCount;

    // 起點只能到達其自身的值。
    if (row === 0 && column === 0) {
      reachable[value >>> 5] = 1 << (value & 31);
      continue;
    }

    // ...
  }
}
```

### Step 6：合併來自上方與左方的可達集合

依所在位置決定來源：

- 第一列只能從左方到達，取前一欄的集合；
- 第一欄只能從上方到達，取本欄尚未被覆寫的舊集合；
- 其餘格子則將兩者取聯集。

```typescript
for (let row = 0; row < rowCount; row++) {
  // Step 5：取得當前列

  for (let column = 0; column < columnCount; column++) {
    // Step 5：取得當前格數值與位置，並處理起點

    // 合併所有來源集合：尚未覆寫的舊值來自上方，前一欄則來自左方。
    if (row === 0) {
      for (let word = 0; word < wordCount; word++) {
        merged[word] = reachable[base - wordCount + word];
      }
    } else if (column === 0) {
      for (let word = 0; word < wordCount; word++) {
        merged[word] = reachable[base + word];
      }
    } else {
      for (let word = 0; word < wordCount; word++) {
        merged[word] = reachable[base + word] | reachable[base - wordCount + word];
      }
    }

    // ...
  }
}
```

### Step 7：拆解當前格數值以準備索引置換

將集合中每個元素 XOR 上當前格的值，等同於把位元集合的索引整體置換。這裡把數值拆成兩部分：高位元決定字組之間的對調量；低 5 個位元則逐一判斷，在字組內需要套用哪幾層交換。

```typescript
for (let row = 0; row < rowCount; row++) {
  // Step 5：取得當前列

  for (let column = 0; column < columnCount; column++) {
    // Step 5：取得當前格數值與位置，並處理起點

    // Step 6：合併來自上方與左方的可達集合

    // 數值的高位元會整體置換字組；低位元則在每個字組內部置換。
    const wordSwap = value >>> 5;
    const lowBits = value & 31;
    const swapBy1 = (lowBits & 1) !== 0;
    const swapBy2 = (lowBits & 2) !== 0;
    const swapBy4 = (lowBits & 4) !== 0;
    const swapBy8 = (lowBits & 8) !== 0;
    const swapBy16 = (lowBits & 16) !== 0;

    // ...
  }
}
```

### Step 8：以字組對調加蝶形交換完成整體 XOR，並寫回當前格

對每個目標字組，先從合併結果中取出經高位對調後的對應字組。接著依低位元的每個位元，分別以間距 1、2、4、8、16 的蝶形交換，同時重排字組內的 32 個位置。最後寫回當前格的位元集合，成為本列此欄的新狀態。

```typescript
for (let row = 0; row < rowCount; row++) {
  // Step 5：取得當前列

  for (let column = 0; column < columnCount; column++) {
    // Step 5：取得當前格數值與位置，並處理起點

    // Step 6：合併來自上方與左方的可達集合

    // Step 7：拆解當前格數值以準備索引置換

    for (let word = 0; word < wordCount; word++) {
      let bits = merged[word ^ wordSwap];

      // 蝶形（delta）交換可一次對 32 個位置同時套用「每個索引都 XOR lowBits」。
      if (swapBy1) {
        bits = ((bits & 0x55555555) << 1) | ((bits >>> 1) & 0x55555555);
      }

      if (swapBy2) {
        bits = ((bits & 0x33333333) << 2) | ((bits >>> 2) & 0x33333333);
      }

      if (swapBy4) {
        bits = ((bits & 0x0f0f0f0f) << 4) | ((bits >>> 4) & 0x0f0f0f0f);
      }

      if (swapBy8) {
        bits = ((bits & 0x00ff00ff) << 8) | ((bits >>> 8) & 0x00ff00ff);
      }

      if (swapBy16) {
        bits = (bits << 16) | (bits >>> 16);
      }

      reachable[base + word] = bits;
    }
  }
}
```

### Step 9：在終點集合中找出最小的可達 XOR 值

所有格子處理完後，最後一欄的位元集合即為終點的可達集合。由低到高掃描字組，找到第一個非零字組後，用「取最低位元」技巧定位其中最小的設定位元，換算回實際數值即為答案。

```typescript
// 答案即為終點位元集合中仍存在的最小值。
const lastBase = (columnCount - 1) * wordCount;
for (let word = 0; word < wordCount; word++) {
  const bits = reachable[lastBase + word];

  if (bits !== 0) {
    return (word << 5) + 31 - Math.clz32(bits & -bits);
  }
}
```

### Step 10：保底回傳

終點集合一定非空，正常情況下會在前一步回傳。此處僅作為保底的預設回傳。

```typescript
return 0;
```

## 時間複雜度

- 設 $V$ 為候選 XOR 值的個數（即 $2^{bitLength}$），每格的位元集合共有 $\lceil V / 32 \rceil$ 個字組；
- 計算所有數值的 OR 需走訪全部格子一次，為 $O(m \cdot n)$；
- 每格的合併與置換都對全部字組各做常數次位元運算，為 $O(V / 32)$，共 $m \cdot n$ 格；
- 最後掃描終點集合為 $O(V / 32)$；
- 總時間複雜度為 $O(m \cdot n \cdot V)$。

> $O(m \cdot n \cdot V)$

## 空間複雜度

- 滾動陣列為每一欄保存一組位元集合，共 $n \cdot \lceil V / 32 \rceil$ 個字組；
- 合併暫存區只需一組位元集合的大小；
- 總空間複雜度為 $O(n \cdot V)$。

> $O(n \cdot V)$
