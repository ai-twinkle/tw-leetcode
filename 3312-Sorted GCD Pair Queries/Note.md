# 3312. Sorted GCD Pair Queries

You are given an integer array `nums` of length `n` and an integer array `queries`.

Let `gcdPairs` denote an array obtained by calculating the GCD of all possible pairs `(nums[i], nums[j])`, 
where `0 <= i < j < n`, and then sorting these values in ascending order.

For each query `queries[i]`, you need to find the element at index `queries[i]` in gcdPairs.

Return an integer array `answer`, where `answer[i]` is the value at `gcdPairs[queries[i]]` for each query.

The term `gcd(a, b)` denotes the greatest common divisor of `a` and `b`.

**Constraints:**

- `2 <= n == nums.length <= 10^5`
- `1 <= nums[i] <= 5 * 10^4`
- `1 <= queries.length <= 10^5`
- `0 <= queries[i] < n * (n - 1) / 2`

## 基礎思路

本題要求計算陣列中所有數對的最大公因數（GCD），將這些 GCD 值排序後，回應多個查詢，每個查詢要求取得排序後陣列中特定索引位置的值。

由於數對的數量可達 `n * (n - 1) / 2`，在 `n` 高達 `10^5` 時會有約 `5 * 10^9` 個數對，因此絕不可能實際枚舉所有數對並排序。必須尋找能夠避免逐一列舉的計數方法。

在思考解法時，可掌握以下核心觀察：

- **數值範圍有限**：
  由於每個元素的值域被限制在較小範圍內，我們可以利用「值域」作為計算基準，而非以「數對數量」為基準。

- **GCD 為特定值的數對可被計數**：
  對於任一數值 `g`，若能得知有多少數對的 GCD 恰好等於 `g`，便能完全掌握排序後 GCD 陣列的結構，而無須真正建構該陣列。

- **先算倍數再做排容**：
  「GCD 恰好為 `g` 的數對數量」不易直接求得，但「GCD 為 `g` 之倍數的數對數量」相對容易計算；只要先算出後者，再由大到小扣除其倍數的貢獻，即可反推出恰好為 `g` 的數量。

- **前綴和搭配二分搜尋定位查詢**：
  將各 GCD 值的數對數量依序累加成前綴和後，排序後陣列中每個索引所對應的值，即可透過二分搜尋在前綴和上快速定位。

依據以上特性，可以採用以下策略：

- **統計每個值的出現次數，並計算每個因數的倍數涵蓋數量**，作為後續計數的基礎。
- **由大到小以排容原理，計算出 GCD 恰好為每個值的數對數量**。
- **建立前綴和，並對每筆查詢以二分搜尋定位其對應的 GCD 值**。

此策略將問題從「枚舉數對」轉化為「值域上的計數」，能在合理的時間內處理大量數對與查詢。

## 解題步驟

### Step 1：統計每個數值的出現次數並記錄最大值

先建立一個以值域為索引的計數陣列，統計每個數值在 `nums` 中的出現次數，同時記錄實際出現過的最大值，以縮小後續運算的範圍。

```typescript
const length = nums.length;

// 統計 nums 中每個數值的出現次數
const valueCount = new Int32Array(MAXIMUM_VALUE + 1);
let maximumPresent = 0;
for (let index = 0; index < length; index++) {
  const value = nums[index];
  valueCount[value]++;
  if (value > maximumPresent) {
    maximumPresent = value;
  }
}
```

### Step 2：計算每個因數的倍數涵蓋數量

對於每個因數 `divisor`，累加其所有倍數的出現次數，得到「有多少個 `nums` 元素可被 `divisor` 整除」。此數量將作為後續計算數對的基礎。

```typescript
// multiplesCount[g] = 有多少個 nums 元素可被 g 整除
const multiplesCount = new Int32Array(maximumPresent + 1);
for (let divisor = 1; divisor <= maximumPresent; divisor++) {
  let total = 0;
  for (let multiple = divisor; multiple <= maximumPresent; multiple += divisor) {
    total += valueCount[multiple];
  }
  multiplesCount[divisor] = total;
}
```

### Step 3：由大到小以排容原理計算 GCD 恰好為各值的數對數量

由大到小遍歷每個因數：先以「可被 `divisor` 整除的元素數量」計算出兩兩皆為其倍數的數對總數，再扣除所有以其倍數為 GCD 的數對，即可隔離出「GCD 恰好為 `divisor`」的數對數量。

```typescript
// pairsWithExactGcd[g] = GCD 恰好為 g 的數對數量
// 先計算 GCD 為 g 之倍數的數對數量，再扣除以隔離出恰好為 g 的部分
const pairsWithExactGcd = new Float64Array(maximumPresent + 1);
for (let divisor = maximumPresent; divisor >= 1; divisor--) {
  const count = multiplesCount[divisor];
  // 兩元素皆可被 divisor 整除的數對數量
  let exact = (count * (count - 1)) / 2;
  for (let multiple = 2 * divisor; multiple <= maximumPresent; multiple += divisor) {
    exact -= pairsWithExactGcd[multiple];
  }
  pairsWithExactGcd[divisor] = exact;
}
```

### Step 4：建立數對數量的前綴和

依數值由小到大累加「GCD 恰好為該值的數對數量」，形成前綴和；如此一來，任一查詢索引即可透過此前綴和對應到某個 GCD 值。

```typescript
// 建立數對數量的前綴和，使查詢索引可透過二分搜尋對應至某 GCD 值
const prefixCount = new Float64Array(maximumPresent + 1);
let running = 0;
for (let value = 1; value <= maximumPresent; value++) {
  running += pairsWithExactGcd[value];
  prefixCount[value] = running;
}
```

### Step 5：以二分搜尋定位每筆查詢對應的 GCD 值

對每筆查詢，在前綴和上進行二分搜尋，找出第一個「前綴和大於查詢索引」的數值。該數值即為排序後 GCD 陣列中，此索引位置所對應的 GCD 值。

```typescript
// 逐筆處理查詢：找出第一個前綴和超過該索引的 GCD 值
const queryLength = queries.length;
const gcdPairValues = new Array<number>(queryLength);
for (let queryIndex = 0; queryIndex < queryLength; queryIndex++) {
  const target = queries[queryIndex];
  let low = 1;
  let high = maximumPresent;
  // 二分搜尋出最小且滿足 prefixCount[value] > target 的數值
  while (low < high) {
    const middle = (low + high) >> 1;
    if (prefixCount[middle] > target) {
      high = middle;
    } else {
      low = middle + 1;
    }
  }
  gcdPairValues[queryIndex] = low;
}

return gcdPairValues;
```

## 時間複雜度

- 統計出現次數需 $O(n)$；
- 計算倍數涵蓋數量與排容計算皆為調和級數總和，需 $O(M \log M)$，其中 `M` 為最大數值；
- 建立前綴和需 $O(M)$；
- 每筆查詢以二分搜尋處理，需 $O(\log M)$，共 $O(q \log M)$，其中 `q` 為查詢數量。
- 總時間複雜度為 $O(n + M \log M + q \log M)$。

> $O(n + M \log M + q \log M)$

## 空間複雜度

- 計數、倍數涵蓋、排容與前綴和陣列皆與值域相關，需 $O(M)$；
- 儲存查詢結果需 $O(q)$。
- 總空間複雜度為 $O(M + q)$。

> $O(M + q)$
