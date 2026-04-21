# 1722. Minimize Hamming Distance After Swap Operations

You are given two integer arrays, `source` and `target`, both of length `n`. 
You are also given an array `allowedSwaps` where each `allowedSwaps[i] = [a_i, b_i]` indicates 
that you are allowed to swap the elements at index `a_i` and index `b_i` (0-indexed) of array `source`. 
Note that you can swap elements at a specific pair of indices multiple times and in any order.

The Hamming distance of two arrays of the same length, `source` and `target`, 
is the number of positions where the elements are different. 
Formally, it is the number of indices `i` for `0 <= i <= n-1` where `source[i] != target[i]` (0-indexed).

Return the minimum Hamming distance of `source` and `target` after performing any amount of swap operations on array `source`.

**Constraints:**

- `n == source.length == target.length`
- `1 <= n <= 10^5`
- `1 <= source[i], target[i] <= 10^5`
- `0 <= allowedSwaps.length <= 10^5`
- `allowedSwaps[i].length == 2`
- `0 <= a_i, b_i <= n - 1`
- `a_i != b_i`

## 基礎思路

本題要求在允許的交換操作下，使 `source` 陣列與 `target` 陣列的漢明距離最小化。
由於每一對允許交換的索引可以不限次數互換，因此若多個索引透過允許交換彼此相連，它們之間的元素可以任意排列。

在思考解法時，可掌握以下核心觀察：

- **交換形成等價類（連通分量）**：
  允許交換定義了索引之間的連通關係，所有在同一連通分量內的索引，其對應的 `source` 元素可任意重新排列。

- **最小漢明距離等價於最大化匹配數**：
  在每個連通分量內，可以自由選擇哪個 `source` 值對應哪個位置，因此問題轉化為：在每個分量內，盡量讓 `source` 中的值與 `target` 中對應位置的值相符。

- **同一分量內的匹配是獨立子問題**：
  不同分量之間的元素不能互換，因此各分量可以獨立處理，每個分量的未匹配數累加即為最終答案。

- **分量內的匹配只需統計頻率**：
  因為只需要知道有多少個值可以匹配，而非哪個位置對應哪個值，所以只需對 `source` 的值計數，再逐一與 `target` 值抵消即可求得不匹配數量。

依據以上特性，可以採用以下策略：

- **使用 Union-Find 將索引依允許交換分組**，建立各連通分量。
- **對每個連通分量，統計其 `source` 值的出現頻率，再依序與 `target` 值進行貪婪匹配**，每成功匹配一個值即減少一次不匹配。
- **使用 Bucket Sort 技巧預先將索引按所屬分量排列**，使每個分量的索引連續存放，避免每次線性掃描整個陣列。

此策略能確保每個分量內的最大匹配被正確計算，同時以高效的資料結構避免不必要的記憶體配置與重設開銷。

## 解題步驟

### Step 1：宣告模組層級的共用資料結構

為避免每次呼叫都重新配置記憶體，在模組層級預先分配 Union-Find 所需的 `parent`、`rank` 陣列，以及用於值計數與快速重置的 `valueCounts`、`touchedValues` 陣列。

```typescript
// 預先分配 Union-Find 型別陣列（避免每次呼叫重新配置）
const MAX_SIZE = 100001;
const parent = new Int32Array(MAX_SIZE);
const rank = new Int32Array(MAX_SIZE);

// 可重複使用的計數陣列，用於分量內的值匹配
const valueCounts = new Int32Array(MAX_SIZE);
// 追蹤 valueCounts 中已被設定的項目，以便快速針對性重置
const touchedValues = new Int32Array(MAX_SIZE);
```

### Step 2：實作帶路徑壓縮的 Union-Find 查根函數

`findRoot` 採用兩趟走訪：第一趟找到根節點，第二趟將路徑上所有節點直接指向根，以壓縮日後查找的路徑長度。

```typescript
/**
 * 以路徑壓縮方式，找出包含索引 x 的集合之根節點代表。
 * @param x - 要查找根節點的索引
 * @returns 該集合的根節點代表
 */
function findRoot(x: number): number {
  let root = x;
  while (parent[root] !== root) {
    root = parent[root];
  }
  // 壓縮路徑：將所有走訪過的節點直接指向根節點
  while (parent[x] !== root) {
    const next = parent[x];
    parent[x] = root;
    x = next;
  }
  return root;
}
```

### Step 3：實作按秩合併的 Union-Find 合併函數

`unionSets` 先找出兩個索引各自的根節點，若已在同一集合則直接返回；否則將秩較小的樹掛到秩較大的樹之下，以維持樹的平衡高度。

```typescript
/**
 * 按秩合併兩個集合，將較小的樹掛到較大樹的根節點之下。
 * @param x - 第一個索引
 * @param y - 第二個索引
 */
function unionSets(x: number, y: number): void {
  const rootX = findRoot(x);
  const rootY = findRoot(y);
  if (rootX === rootY) {
    return;
  }
  // 將秩較低的樹掛到秩較高的樹之下
  if (rank[rootX] < rank[rootY]) {
    parent[rootX] = rootY;
  } else if (rank[rootX] > rank[rootY]) {
    parent[rootY] = rootX;
  } else {
    parent[rootY] = rootX;
    rank[rootX]++;
  }
}
```

### Step 4：初始化 Union-Find 並根據允許交換建立連通分量

先將每個索引的父節點設為自身（各自成一個獨立集合），再依序對每筆允許交換執行合併，使可互相交換的索引歸入同一連通分量。

```typescript
const length = source.length;

// 為當前問題規模初始化 Union-Find
for (let i = 0; i < length; i++) {
  parent[i] = i;
  rank[i] = 0;
}

// 依允許的交換操作建立連通分量
const swapCount = allowedSwaps.length;
for (let i = 0; i < swapCount; i++) {
  const swap = allowedSwaps[i];
  unionSets(swap[0], swap[1]);
}
```

### Step 5：對所有索引執行最終查根並統計各分量大小

對每個索引呼叫 `findRoot` 以完成完整路徑壓縮，將結果存入 `roots` 陣列；同時重置 `rank` 陣列改作分量大小計數器，統計每個根節點所代表分量的索引個數。

```typescript
// 對所有根節點執行最終查根（確保完整路徑壓縮）
const roots = new Int32Array(length);
// 將 rank 重新用作分量大小計數器（Union-Find 的秩不再需要）
for (let i = 0; i < length; i++) {
  rank[i] = 0;
}
for (let i = 0; i < length; i++) {
  roots[i] = findRoot(i);
  rank[roots[i]]++;
}
```

### Step 6：以前綴和計算各分量在排序索引陣列中的起始位置

依各根節點的分量大小計算前綴和，為每個分量分配一段連續的區間，使後續可直接透過起始位置與大小存取該分量的所有索引。

```typescript
// 建立 Bucket 排序的索引陣列：計算前綴和起始位置
const bucketStart = new Int32Array(length);
let offset = 0;
for (let i = 0; i < length; i++) {
  if (rank[i] > 0) {
    bucketStart[i] = offset;
    offset += rank[i];
  }
}
```

### Step 7：將所有索引依所屬分量填入排序後的連續陣列

使用 `writeOffset` 追蹤每個分量的填入進度，將每個索引寫入其所屬分量對應的 Bucket 區段，完成後 `sortedIndices` 中同一分量的索引即連續排列。

```typescript
// 每個根節點的寫入偏移量（將 rank 重新用作各 Bucket 的寫入偏移）
const writeOffset = new Int32Array(length);
const sortedIndices = new Int32Array(length);
for (let i = 0; i < length; i++) {
  const root = roots[i];
  sortedIndices[bucketStart[root] + writeOffset[root]] = i;
  writeOffset[root]++;
}
```

### Step 8：對每個分量統計 source 值出現頻率並與 target 值進行匹配

逐一處理以根節點為代表的分量：先將分量內所有 `source` 值的出現次數記錄到 `valueCounts`，再依序嘗試與每個 `target` 值匹配，每次成功匹配即將不匹配數減一，最後將剩餘不匹配數累加進總漢明距離。

```typescript
// 處理每個分量：統計 source 值，再減去與 target 的匹配數
let hammingDistance = 0;

for (let i = 0; i < length; i++) {
  // 每個分量只從其根節點處理一次
  if (roots[i] !== i) {
    continue;
  }

  const start = bucketStart[i];
  const size = writeOffset[i];
  let touchedCount = 0;
  let componentMismatches = size;

  // 統計此分量中 source 各值的出現次數
  for (let j = start, end = start + size; j < end; j++) {
    const sourceValue = source[sortedIndices[j]];
    if (valueCounts[sourceValue] === 0) {
      touchedValues[touchedCount++] = sourceValue;
    }
    valueCounts[sourceValue]++;
  }

  // ...
}
```

### Step 9：匹配 target 值並累加各分量的不匹配數，最後重置計數陣列

對分量內每個 `target` 值，若 `valueCounts` 中尚有對應的 `source` 值可用，則消耗一個並將不匹配數減一；處理完畢後將分量的不匹配數累入總答案，並僅重置本次用到的計數項目，避免全陣列清零的開銷。

```typescript
for (let i = 0; i < length; i++) {
  // Step 8：每個分量只從其根節點處理一次，並統計 source 值

  // 將 target 值與可用的 source 值進行匹配
  for (let j = start, end = start + size; j < end; j++) {
    const targetValue = target[sortedIndices[j]];
    if (valueCounts[targetValue] > 0) {
      valueCounts[targetValue]--;
      componentMismatches--;
    }
  }

  hammingDistance += componentMismatches;

  // 僅重置本次有觸碰的項目，以供下一個分量使用
  for (let j = 0; j < touchedCount; j++) {
    valueCounts[touchedValues[j]] = 0;
  }
}
```

### Step 10：回傳最終的最小漢明距離

所有分量處理完畢後，累計的 `hammingDistance` 即為在最優交換策略下可達到的最小漢明距離。

```typescript
return hammingDistance;
```

## 時間複雜度

- 初始化 Union-Find 需 $O(n)$；
- 建立連通分量處理 $m$ 筆允許交換，每次近似 $O(1)$（反 Ackermann 函數），共 $O(m)$；
- 查根與分量大小統計需 $O(n)$；
- 前綴和計算與 Bucket 填入各需 $O(n)$；
- 每個索引在 source 統計與 target 匹配各被處理一次，共 $O(n)$；
- 計數陣列重置僅清除有觸碰的項目，總重置次數不超過 $O(n)$。
- 總時間複雜度為 $O(n + m)$。

> $O(n + m)$

## 空間複雜度

- 模組層級預先分配的 `parent`、`rank`、`valueCounts`、`touchedValues` 皆為固定大小 $O(\text{MAX\_SIZE})$，視為常數；
- `roots`、`bucketStart`、`writeOffset`、`sortedIndices` 各需 $O(n)$ 空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
