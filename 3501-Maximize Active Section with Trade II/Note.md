# 3501. Maximize Active Section with Trade II

You are given a binary string s of length `n`, where:

- `'1'` represents an active section.
- `'0'` represents an inactive section.

You can perform at most one trade to maximize the number of active sections in `s`. 
In a trade, you:

- Convert a contiguous block of `'1'`s that is surrounded by `'0'`s to all `'0'`s.
- Afterward, convert a contiguous block of '0's that is surrounded by `'1'`s to all `'1'`s.

Additionally, you are given a 2D array `queries`, where `queries[i] = [l_i, r_i]` represents a substring `s[l_i...r_i]`.

For each query, determine the maximum possible number of active sections in s after making the optimal trade on the substring s[li...ri].

Return an array `answer`, where `answer[i]` is the result for `queries[i]`.

Note

- For each query, treat `s[l_i...r_i]` as if it is augmented with a `'1'` at both ends, 
  forming `t = '1' + s[l_i...r_i] + '1'`. 
  The augmented `'1'`s do not contribute to the final count.
- The queries are independent of each other.

**Constraints:**

- `1 <= n == s.length <= 10^5`
- `1 <= queries.length <= 10^5`
- `s[i]` is either `'0'` or `'1'`.
- `queries[i] = [l_i, r_i]`
- `0 <= l_i <= r_i < n`

## 基礎思路

本題的核心在於：對每個查詢子字串進行「一次交易」，先把某個被 `0` 包圍的 `1` 區塊清空，再把某個被 `1` 包圍的 `0` 區塊填滿，藉此最大化整體 `1` 的數量。由於查詢數量與字串長度皆可達 `10^5`，因此必須將每次查詢的成本壓到接近常數時間，才能在時限內完成。

在思考解法時，可掌握以下核心觀察：

- **交易的淨收益來自兩個相鄰的 `0` 區塊**：
  將某段 `1` 清為 `0` 後，這段新產生的 `0` 會與其相鄰的原有 `0` 區塊連成一片；接著把這整片 `0` 填為 `1`。因此有效的增益，本質上等同於「將兩個相鄰的 `0` 區塊之間的 `1` 犧牲掉、再把這兩個 `0` 區塊都轉為 `1`」，其淨增益恰為這兩個相鄰 `0` 區塊的長度總和。

- **答案為基礎 `1` 數量加上最佳增益**：
  原始的 `1` 數量是固定的，每個查詢只需在其範圍內找到「相鄰 `0` 區塊長度和」的最大值作為增益即可。

- **邊界區塊需被查詢範圍裁切**：
  查詢範圍的左右端可能只涵蓋某個 `0` 區塊的一部分。由於題目將子字串兩端視為被 `1` 包夾，落在範圍邊界的 `0` 區塊只能計入落在範圍內的部分長度。

- **內部區塊完整、可預先建表**：
  完全落在查詢範圍內部的相鄰 `0` 區塊對，其長度不會被裁切，因此可事先計算所有相鄰對的長度和，並以支援區間最大值查詢的結構加速。

依據以上特性，可以採用以下策略：

- **一次掃描字串**，統計 `1` 的總數並記錄所有極大 `0` 區塊的位置與長度。
- **預先建立位置到區塊的映射**，讓每個查詢能在常數時間定位其涵蓋的首尾 `0` 區塊。
- **以稀疏表（Sparse Table）預存相鄰 `0` 區塊長度和**，使內部區間最大值查詢達成 `O(1)`。
- **每個查詢分別處理邊界裁切與內部最大值**，取三者最佳增益後加回基礎 `1` 數量。

此策略以線性前處理搭配常數時間查詢，能在大規模輸入下穩定運作。

## 解題步驟

### Step 1：預計算每個跨度長度的 log2 值

先定義一個稀疏表類別，用於在建表後以 `O(1)` 回答任意區間的最大值。建構時先為每個到陣列大小為止的跨度長度預計算 `floor(log2)`，供後續查詢定位層級使用。

```typescript
/**
 * 靜態區間最大值查詢的稀疏表，查詢時間為 O(1)。
 * 僅建立一次，使後續每次查詢皆維持低成本。
 */
class SparseTable {
  private readonly logTable: Int32Array;
  private readonly levels: Int32Array[];

  constructor(source: Int32Array) {
    const length = source.length;

    // 為每個到陣列大小為止的跨度長度預先計算 floor(log2)。
    this.logTable = new Int32Array(length + 1);
    for (let index = 2; index <= length; index++) {
      this.logTable[index] = this.logTable[index >> 1] + 1;
    }

    // ...
  }
}
```

### Step 2：逐層倍增建立稀疏表各層資料

以第 0 層為原始資料，之後每一層將覆蓋的跨度加倍，並由前一層的兩段最大值合併而成。

```typescript
class SparseTable {
  constructor(source: Int32Array) {
    // Step 1：預計算 logTable

    const maxLevel = length > 0 ? this.logTable[length] + 1 : 1;
    this.levels = new Array(maxLevel);
    this.levels[0] = source;

    // 每一層都利用前一層將覆蓋的跨度加倍。
    for (let level = 1; level < maxLevel; level++) {
      const span = 1 << level;
      const half = span >> 1;
      const previous = this.levels[level - 1];
      const current = new Int32Array(length);
      const limit = length - span;
      for (let start = 0; start <= limit; start++) {
        const leftValue = previous[start];
        const rightValue = previous[start + half];
        current[start] = leftValue >= rightValue ? leftValue : rightValue;
      }
      this.levels[level] = current;
    }
  }
}
```

### Step 3：實作區間最大值查詢方法

利用預先算好的 `logTable` 定位對應層級，取該層兩個重疊區段的最大值即為答案；若區間為空則回傳 0。

```typescript
class SparseTable {
  constructor(source: Int32Array) {
    // Step 1：預計算 logTable

    // Step 2：逐層倍增建立各層資料
  }

  /**
   * @param leftIndex 區間左界（含）
   * @param rightIndex 區間右界（含）
   * @return 區間內的最大值，若區間為空則回傳 0
   */
  public query(leftIndex: number, rightIndex: number): number {
    if (leftIndex > rightIndex) {
      return 0;
    }
    const level = this.logTable[rightIndex - leftIndex + 1];
    const row = this.levels[level];
    const leftValue = row[leftIndex];
    const rightValue = row[rightIndex - (1 << level) + 1];
    return leftValue >= rightValue ? leftValue : rightValue;
  }
}
```

### Step 4：一次掃描統計 `1` 數量並記錄所有 `0` 區塊

以單次線性掃描累計 `1` 的總數；遇到 `0` 時，將該段連續 `0` 延伸到底，記錄其長度與左右邊界位置。

```typescript
const n = s.length;
const queryCount = queries.length;

// 單次掃描統計 1 的數量並記錄每個極大 0 區塊。
let activeCount = 0;
const blockLengthBuffer = new Int32Array(n);
const blockLeftBuffer = new Int32Array(n);
const blockRightBuffer = new Int32Array(n);
let blockCount = 0;

let index = 0;
while (index < n) {
  if (s.charCodeAt(index) === 49) {
    activeCount++;
    index++;
    continue;
  }
  // 將當前這段 0 延伸至其完整長度。
  const start = index;
  index++;
  while (index < n && s.charCodeAt(index) === 48) {
    index++;
  }
  blockLengthBuffer[blockCount] = index - start;
  blockLeftBuffer[blockCount] = start;
  blockRightBuffer[blockCount] = index - 1;
  blockCount++;
}
```

### Step 5：處理無法交易的退化情況

若 `0` 區塊少於兩個，任何交易都無從進行，直接讓所有查詢回傳基礎 `1` 數量。

```typescript
// 少於兩個 0 區塊時，永遠無法進行交易。
if (blockCount < 2) {
  return new Array(queryCount).fill(activeCount);
}

const zeroBlocks = blockLengthBuffer.subarray(0, blockCount);
const blockLeft = blockLeftBuffer.subarray(0, blockCount);
const blockRight = blockRightBuffer.subarray(0, blockCount);
```

### Step 6：建立位置到 `0` 區塊的映射表

為了讓每個查詢能在常數時間定位其涵蓋的首尾區塊，預先計算兩張表：每個位置「其右端在該位置之後的第一個區塊」（供左端點使用），以及「其左端在該位置之前的最後一個區塊」（供右端點使用）。

```typescript
// 將每個位置映射到「起始於該位置或之後的第一個 0 區塊」（供左端點使用），
// 以及「結束於該位置或之前的最後一個 0 區塊」（供右端點使用），每次查詢 O(1)。
const firstBlockAtOrAfter = new Int32Array(n + 1);
const lastBlockAtOrBefore = new Int32Array(n + 1);
let cursor = blockCount;
// 由右往左走訪各位置，可得右端 >= 該位置的第一個區塊。
for (let position = n; position >= 0; position--) {
  while (cursor > 0 && blockRight[cursor - 1] >= position) {
    cursor--;
  }
  firstBlockAtOrAfter[position] = cursor;
}
cursor = -1;
// 由左往右走訪各位置，可得左端 <= 該位置的最後一個區塊。
for (let position = 0; position <= n; position++) {
  while (cursor + 1 < blockCount && blockLeft[cursor + 1] <= position) {
    cursor++;
  }
  lastBlockAtOrBefore[position] = cursor;
}
```

### Step 7：預計算相鄰 `0` 區塊長度和並建立稀疏表

將每一對相鄰 `0` 區塊的長度和預先算出，作為內部區間最大值查詢的資料來源，並據此建立稀疏表。

```typescript
// 為內部區間最大值查詢預先計算相鄰 0 區塊對的長度和。
const pairCount = blockCount - 1;
const pairSums = new Int32Array(pairCount);
for (let k = 0; k < pairCount; k++) {
  pairSums[k] = zeroBlocks[k] + zeroBlocks[k + 1];
}
const sparseTable = new SparseTable(pairSums);

const activeSectionCounts: number[] = new Array(queryCount);
const lastBlockIndex = blockCount - 1;
```

### Step 8：逐一處理查詢並定位首尾 `0` 區塊

對每個查詢取出其左右界，利用前述映射表在常數時間內找出與查詢子字串相交的首尾 `0` 區塊。

```typescript
for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  const query = queries[queryIndex];
  const left = query[0];
  const right = query[1];

  // 與查詢子字串相交的首尾 0 區塊，O(1)。
  const firstBlock = firstBlockAtOrAfter[left];
  const lastBlock = lastBlockAtOrBefore[right];

  // ...
}
```

### Step 9：排除窗口內不足兩個 `0` 區塊的情況

若窗口內找不到兩個相異的 `0` 區塊，則無法交易，該查詢直接回傳基礎 `1` 數量。

```typescript
for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  // Step 8：定位首尾 0 區塊

  // 窗口內需至少有兩個相異的 0 區塊才能交易。
  if (firstBlock > lastBlockIndex || lastBlock < 0 || firstBlock >= lastBlock) {
    activeSectionCounts[queryIndex] = activeCount;
    continue;
  }

  // ...
}
```

### Step 10：裁切邊界區塊至查詢窗口

首尾兩個 `0` 區塊可能只有部分落在查詢範圍內，因此需將其左右端裁切至窗口邊界，計算落在範圍內的實際長度。

```typescript
for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  // Step 8：定位首尾 0 區塊

  // Step 9：排除不足兩個 0 區塊的情況

  // 將兩個邊界區塊裁切至子字串窗口內。
  const leftBlockStart = blockLeft[firstBlock];
  const boundaryLeft = leftBlockStart > left ? leftBlockStart : left;
  const firstLength = blockRight[firstBlock] - boundaryLeft + 1;

  const rightBlockEnd = blockRight[lastBlock];
  const boundaryRight = rightBlockEnd < right ? rightBlockEnd : right;
  const lastLength = boundaryRight - blockLeft[lastBlock] + 1;

  // ...
}
```

### Step 11：計算最佳增益並寫入查詢結果

分兩種情況求最佳增益：若首尾區塊剛好相鄰，則增益即為兩個裁切後的邊界長度和；否則需比較「首區塊搭配其右鄰」、「尾區塊搭配其左鄰」以及「完全內部相鄰對（透過稀疏表查詢）」三者，取最大值。最後將最佳增益加回基礎 `1` 數量。

```typescript
for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  // Step 8：定位首尾 0 區塊

  // Step 9：排除不足兩個 0 區塊的情況

  // Step 10：裁切邊界區塊

  let bestGain: number;
  if (firstBlock + 1 === lastBlock) {
    // 僅有兩個裁切後的邊界區塊可用。
    bestGain = firstLength + lastLength;
  } else {
    const gainFromFirst = firstLength + zeroBlocks[firstBlock + 1];
    const gainFromLast = zeroBlocks[lastBlock - 1] + lastLength;
    bestGain = gainFromFirst > gainFromLast ? gainFromFirst : gainFromLast;
    // 完全內部的相鄰對未被裁切，故使用稀疏表查詢。
    const gainInterior = sparseTable.query(firstBlock + 1, lastBlock - 2);
    if (gainInterior > bestGain) {
      bestGain = gainInterior;
    }
  }
  activeSectionCounts[queryIndex] = activeCount + bestGain;
}

return activeSectionCounts;
```

## 時間複雜度

- 掃描字串統計 `1` 並記錄 `0` 區塊為 $O(n)$；
- 建立位置映射表與相鄰對長度和皆為 $O(n)$；
- 稀疏表建構為 $O(n \log n)$；
- 每個查詢以 $O(1)$ 完成，共 $q$ 個查詢為 $O(q)$。
- 總時間複雜度為 $O(n \log n + q)$。

> $O(n \log n + q)$

## 空間複雜度

- 各類緩衝陣列與映射表皆為 $O(n)$；
- 稀疏表佔用 $O(n \log n)$；
- 輸出結果陣列為 $O(q)$。
- 總空間複雜度為 $O(n \log n + q)$。

> $O(n \log n + q)$
