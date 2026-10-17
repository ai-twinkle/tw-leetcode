# 3551. Minimum Swaps to Sort by Digit Sum

You are given an array `nums` of distinct positive integers. 
You need to sort the array in increasing order based on the sum of the digits of each number. 
If two numbers have the same digit sum, the smaller number appears first in the sorted order.

Return the minimum number of swaps required to rearrange `nums` into this sorted order.

A swap is defined as exchanging the values at two distinct positions in the array.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^9`
- `nums` consists of distinct positive integers.

## 基礎思路

本題要求依「位數和」為主鍵、「數值本身」為次鍵，將陣列排序，並求出把原陣列重排成此順序所需的最少交換次數。
由於所有數值皆相異，排序後的目標順序唯一，因此問題可轉化為對一個排列求最少交換次數。

在思考解法時，可掌握以下核心觀察：

- **最少交換次數由排列的循環結構決定**：
  將「排序後的名次」對應到「原始位置」，會形成一個排列。排列可分解為若干互不相交的循環，大小為 `k` 的循環恰需 `k - 1` 次交換即可歸位。
  因此答案為「元素總數減去循環數」。

- **排序鍵具有兩層結構**：
  位數和為主鍵，數值為次鍵。
  由於數值皆相異，兩者組合可形成嚴格的全序，不會出現無法區分的情況。

- **位數和的值域極小**：
  數值不超過 `10^9`，位數和最多為 81。
  主鍵只有極少數種可能，非常適合以計數排序處理。

- **位數和可藉分塊查表快速計算**：
  預先建立所有四位數區塊的位數和表後，任一數值只需切成三個區塊、查表三次即可求得，省去逐位除法的迴圈。

- **不同資料規模適合不同排序策略**：
  - 資料量小時，插入排序的常數開銷最低。
  - 資料量大時，以基數排序依數值穩定排序，再以位數和做一次穩定的計數排序，即可在線性時間內得到「主鍵為位數和、次鍵為數值」的順序。

依據以上特性，可以採用以下策略：

- **預先建立分塊位數和查表**，以常數次查表取得每個數值的位數和。
- **小規模輸入**：將兩層排序鍵打包成單一數值鍵，以插入排序直接比較。
- **大規模輸入**：
  1. 先以最低位優先的基數排序依數值排序。
  2. 再依位數和做最後一次穩定計數排序，讓位數和成為主鍵，同時保留數值順序作為次鍵。
- **走訪排序後形成的排列並計算循環數**，以元素總數減去循環數得到答案。

此策略讓排序與計數皆維持在線性時間內完成，能有效應付最大規模的輸入。

## 解題步驟

### Step 1：預先建立四位數區塊的位數和查表

建立一張涵蓋 `0` 到 `9999` 的位數和表。每個數的位數和等於「去掉最後一位後的數」的位數和加上最後一位，因此可由小到大遞推一次建成。之後任一數值的位數和只需查表三次即可求得。

```typescript
/**
 * 每個 4 位數區塊的位數和查表，只建構一次，
 * 使單一數值的位數和只需三次查表，而非逐位進行除法與取餘的迴圈。
 */
const DIGIT_SUM_BY_CHUNK = (() => {
  const table = new Uint8Array(10000);

  for (let value = 1; value < 10000; value++) {
    table[value] = table[(value / 10) | 0] + (value % 10);
  }

  return table;
})();
```

### Step 2：定義位數和桶數與插入排序門檻

位數和最大為 81，因此計數排序需要 82 個桶。另外設定一個長度門檻，低於此長度時改用插入排序，以避免建立基數計數器的額外開銷。

```typescript
/** 1..10^9 的位數和不會超過 81（由 999999999 達到）。 */
const DIGIT_SUM_BUCKET_COUNT = 82;

/** 長度低於此值時，插入排序比建立基數計數器更快。 */
const INSERTION_SORT_LIMIT = 160;
```

### Step 3：定義基數排序的位元寬度參數

數值皆小於 `2^30`，因此有兩種位元寬度可選：

- 11 位元一輪：需三輪處理。
- 15 位元一輪：只需兩輪，但計數器較大。

資料量足夠大時，改用較寬的位元數以減少輪數。

```typescript
/** 數值皆小於 2^30，故 11 位元的位數需三輪，15 位元則需兩輪。 */
const NARROW_RADIX_BITS = 11;
const WIDE_RADIX_BITS = 15;
const WIDE_RADIX_LENGTH_THRESHOLD = 16384;
```

### Step 4：處理長度不足的邊界情況

若陣列只有一個元素，必然已經有序，不需要任何交換，直接回傳 0。

```typescript
const length = nums.length;

if (length < 2) {
  return 0;
}
```

### Step 5：單次掃描快取數值、位數和與最大值

建立型別化陣列以快取每個數值與其位數和，並在同一次掃描中記錄最大值，供後續決定基數排序的輪數。

位數和的計算方式如下：

1. 將數值切成低、中、高三個四位數區塊。
2. 分別查表後相加。

```typescript
const digitSums = new Uint8Array(length);
const values = new Int32Array(length);
let maxValue = 0;

// 單次掃描：快取每個數值、其位數和以及整體最大值。
for (let index = 0; index < length; index++) {
  const value = nums[index];
  const upperChunks = (value / 10000) | 0;

  values[index] = value;
  digitSums[index] =
    DIGIT_SUM_BY_CHUNK[value % 10000] +
    DIGIT_SUM_BY_CHUNK[upperChunks % 10000] +
    DIGIT_SUM_BY_CHUNK[(upperChunks / 10000) | 0];

  if (value > maxValue) {
    maxValue = value;
  }
}
```

### Step 6：小規模輸入時將兩層排序鍵打包為單一鍵

建立記錄排序結果的索引陣列。若長度不超過門檻，則走插入排序分支：

- 將「位數和」乘上 `2^30` 再加上數值，打包成單一的精確雙精度鍵。主鍵與次鍵因此可由一次數值比較判斷。
- 由於 `81 * 2^30 + 10^9` 遠小於 `2^53`，此打包不會損失精度。
- 同時將索引陣列初始化為原始順序。

```typescript
let order = new Int32Array(length);

if (length <= INSERTION_SORT_LIMIT) {
  // 將 (位數和, 數值) 打包成一個精確的雙精度浮點數，使內層迴圈只需一次數值比較；
  // 81 * 2^30 + 10^9 仍遠小於 2^53。
  const sortKeys = new Float64Array(length);

  for (let index = 0; index < length; index++) {
    sortKeys[index] = digitSums[index] * 1073741824 + values[index];
    order[index] = index;
  }

  // ...
} else {
  // ...
}
```

### Step 7：以插入排序同步排序鍵與索引

對打包後的鍵執行插入排序。每次取出當前鍵，將比它大的元素逐一右移，再把它放入正確位置。索引陣列與鍵同步移動，最終即可得到「排序名次對應原始位置」的排列。

```typescript
if (length <= INSERTION_SORT_LIMIT) {
  // Step 6：建立打包排序鍵並初始化索引

  for (let index = 1; index < length; index++) {
    const currentKey = sortKeys[index];
    const currentIndex = order[index];
    let scan = index - 1;

    while (scan >= 0 && sortKeys[scan] > currentKey) {
      sortKeys[scan + 1] = sortKeys[scan];
      order[scan + 1] = order[scan];
      scan--;
    }

    sortKeys[scan + 1] = currentKey;
    order[scan + 1] = currentIndex;
  }
} else {
  // ...
}
```

### Step 8：大規模輸入時準備基數排序的緩衝區

若長度超過門檻，則走基數排序分支：

1. 依資料量決定每輪處理的位元寬度，並算出桶數與遮罩。
2. 配置雙緩衝的索引陣列與數值陣列，以便每輪交替寫入。
3. 配置計數陣列，並初始化索引與數值。

```typescript
if (length <= INSERTION_SORT_LIMIT) {
  // Step 6：建立打包排序鍵並初始化索引

  // Step 7：以插入排序同步排序鍵與索引
} else {
  const radixBits = length >= WIDE_RADIX_LENGTH_THRESHOLD ? WIDE_RADIX_BITS : NARROW_RADIX_BITS;
  const radixSize = 1 << radixBits;
  const radixMask = radixSize - 1;

  let sortedValues = new Int32Array(length);
  let spareOrder = new Int32Array(length);
  let spareValues = new Int32Array(length);
  const counts = new Int32Array(radixSize);

  for (let index = 0; index < length; index++) {
    order[index] = index;
    sortedValues[index] = values[index];
  }

  // ...
}
```

### Step 9：每輪基數排序先統計各桶的元素數量

從最低位區塊開始，每輪處理一段位元。迴圈條件中的兩個判斷各有用途：

- 位移上限避免 JavaScript 位移量以 32 取模而繞回。
- 當最大值右移後已為 0，代表更高位全為 0，可提早結束。

每輪先清空計數器，再統計當前位元段在各桶中的出現次數。

```typescript
if (length <= INSERTION_SORT_LIMIT) {
  // Step 6：建立打包排序鍵並初始化索引

  // Step 7：以插入排序同步排序鍵與索引
} else {
  // Step 8：準備基數排序的緩衝區

  // 依數值的每個區塊進行最低位優先的基數排序；
  // 位移上限保護可避免 JavaScript 位移量以 32 取模而繞回。
  for (let shift = 0; shift < 31 && (maxValue >>> shift) !== 0; shift += radixBits) {
    counts.fill(0);

    for (let index = 0; index < length; index++) {
      counts[(sortedValues[index] >>> shift) & radixMask]++;
    }

    // ...
  }

  // ...
}
```

### Step 10：將各桶計數轉換為起始位置

以前綴和將每個桶的計數轉換為該桶在輸出陣列中的起始寫入位置，供下一步穩定分配元素使用。

```typescript
if (length <= INSERTION_SORT_LIMIT) {
  // Step 6：建立打包排序鍵並初始化索引

  // Step 7：以插入排序同步排序鍵與索引
} else {
  // Step 8：準備基數排序的緩衝區

  for (let shift = 0; shift < 31 && (maxValue >>> shift) !== 0; shift += radixBits) {
    // Step 9：清空並統計各桶的元素數量

    let runningTotal = 0;

    for (let bucket = 0; bucket < radixSize; bucket++) {
      const bucketSize = counts[bucket];
      counts[bucket] = runningTotal;
      runningTotal += bucketSize;
    }

    // ...
  }

  // ...
}
```

### Step 11：穩定地分配元素並交換雙緩衝

依原順序掃描元素，按桶的起始位置寫入備用緩衝區，數值與其原始索引同步搬移，以維持穩定性。本輪完成後交換正式與備用緩衝區，讓下一輪以本輪結果為輸入。

```typescript
if (length <= INSERTION_SORT_LIMIT) {
  // Step 6：建立打包排序鍵並初始化索引

  // Step 7：以插入排序同步排序鍵與索引
} else {
  // Step 8：準備基數排序的緩衝區

  for (let shift = 0; shift < 31 && (maxValue >>> shift) !== 0; shift += radixBits) {
    // Step 9：清空並統計各桶的元素數量

    // Step 10：將各桶計數轉換為起始位置

    for (let index = 0; index < length; index++) {
      const value = sortedValues[index];
      const slot = counts[(value >>> shift) & radixMask]++;
      spareValues[slot] = value;
      spareOrder[slot] = order[index];
    }

    const previousOrder = order;
    order = spareOrder;
    spareOrder = previousOrder;

    const previousValues = sortedValues;
    sortedValues = spareValues;
    spareValues = previousValues;
  }

  // ...
}
```

### Step 12：依位數和進行最後一次穩定計數排序

此時元素已依數值排序完成。再以位數和為鍵做一次穩定計數排序，流程如下：

1. 統計各位數和的出現次數。
2. 以前綴和轉換為起始位置。
3. 依目前順序把原始索引寫入對應位置。

由於計數排序是穩定的，同一位數和內會保留先前的數值順序。位數和因此成為主鍵，數值則自然成為次鍵。

```typescript
if (length <= INSERTION_SORT_LIMIT) {
  // Step 6：建立打包排序鍵並初始化索引

  // Step 7：以插入排序同步排序鍵與索引
} else {
  // Step 8：準備基數排序的緩衝區

  // Step 9 ~ Step 11：依數值逐段執行最低位優先的基數排序

  // 最後依位數和做一次穩定排序，將其提升為主要鍵，
  // 而先前建立的數值順序則保留為次要比較依據。
  const digitSumCounts = new Int32Array(DIGIT_SUM_BUCKET_COUNT);

  for (let index = 0; index < length; index++) {
    digitSumCounts[digitSums[order[index]]]++;
  }

  let digitSumTotal = 0;

  for (let bucket = 0; bucket < DIGIT_SUM_BUCKET_COUNT; bucket++) {
    const bucketSize = digitSumCounts[bucket];
    digitSumCounts[bucket] = digitSumTotal;
    digitSumTotal += bucketSize;
  }

  for (let index = 0; index < length; index++) {
    const originalIndex = order[index];
    spareOrder[digitSumCounts[digitSums[originalIndex]]++] = originalIndex;
  }

  order = spareOrder;
}
```

### Step 13：走訪排列並計算循環數

此時索引陣列記錄的是「排序名次對應原始位置」的排列。依序從每個尚未造訪的位置出發，沿著排列一路前進，直到回到已造訪處，即完成一個循環。

走訪過程中直接將已造訪的位置標記為 `-1`，省去額外的造訪陣列。

```typescript
// 走訪排列，將已造訪的位置直接標記為空，而非另外維護造訪陣列；
// 大小為 k 的循環恰需 k - 1 次交換。
let cycleCount = 0;

for (let index = 0; index < length; index++) {
  if (order[index] < 0) {
    continue;
  }

  cycleCount++;
  let cursor = index;

  while (order[cursor] >= 0) {
    const nextCursor = order[cursor];
    order[cursor] = -1;
    cursor = nextCursor;
  }
}
```

### Step 14：以元素總數減去循環數得到答案

每個大小為 `k` 的循環需 `k - 1` 次交換。所有循環的交換次數加總即為元素總數減去循環數，直接回傳。

```typescript
return length - cycleCount;
```

## 時間複雜度

- 位數和查表的建構為固定的 10000 次運算，屬常數時間。
- 單次掃描計算位數和與最大值，每個元素僅需三次查表，為 $O(n)$。
- 插入排序分支僅在 $n \le 160$ 時執行，其成本受固定上界限制，屬常數時間。
- 基數排序分支的輪數為常數（至多三輪），每輪成本為 $O(n + 2^b)$，其中 $2^b$ 至多為 $2^{15}$，屬常數，故為 $O(n)$。
- 依位數和的穩定計數排序為 $O(n)$。
- 走訪排列時每個位置僅被造訪一次，為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 位數和查表與各計數陣列的大小皆為固定常數。
- 快取的數值陣列、位數和陣列、索引陣列與基數排序的雙緩衝區皆為 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
