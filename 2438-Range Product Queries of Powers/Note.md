# 2438. Range Product Queries of Powers

Given a positive integer `n`, there exists a 0-indexed array called `powers`, composed of the minimum number of powers of `2` that sum to `n`. 
The array is sorted in non-decreasing order, and there is only one way to form the array.

You are also given a 0-indexed 2D integer array queries, where `queries[i] = [left_i, right_i]`. 
Each `queries[i]` represents a query where you have to find the product of all `powers[j]` with `left_i <= j <= right_i`.

Return an array `answers`, equal in length to `queries`, where `answers[i]` is the answer to the $i^{th}$ query. 
Since the answer to the $i^{th}$ query may be too large, each `answers[i]` should be returned modulo `10^9 + 7`.

**Constraints:**

- `1 <= n <= 10^9`
- `1 <= queries.length <= 10^5`
- `0 <= start_i <= end_i < powers.length`

## 基礎思路

題目中所謂的 `powers`，實際上就是將 `n` 的二進位展開中所有為 `1` 的位元位置，分別對應成 `2^b`，並按非遞減順序組成的陣列。
例如 `n = 10` (二進位為 `1010`)，其 set bit 位於第 1 位和第 3 位，所以 `powers = [2^1, 2^3] = [2, 8]`。

對任一查詢區間 `[L, R]`，我們要計算的乘積為：

$$
\prod_{j=L}^R 2^{e_j} = 2^{\sum_{j=L}^R e_j}
$$

其中 $e_j$ 是位元位置（指數）。
因此解法方向是：

1. **找出 n 的所有 set bit 位元位置**（由低到高）。
2. **對指數序列做前綴和**，以便快速計算任一區間的指數總和。
3. **預運算所有可能的 $2^k \bmod 10^9+7$**。
4. **查詢時 O(1) 回答**，用前綴和找指數總和，再從預運算表取結果。

## 解題步驟

### Step 1：初始化常數與輸入的無號副本

首先定義取模常數 `MODULO`，並將輸入的 `n` 轉成 32 位元無號整數，確保後續位元運算不會受符號位影響。

```typescript
const MODULO = 1_000_000_007;

// 保留一份無號整數副本，因為 n <= 1e9
const inputNumber = n >>> 0;
```

### Step 2：計算 set bit 數量

這一步要找出 `n` 的二進位表示中有多少個 set bit（即為 1 的位元），因為這正是 `powers` 陣列的長度。
採用經典的位元技巧 `x &= (x - 1)`，每次會移除最低位的 1，迴圈次數即為 set bit 個數。

```typescript
// 1. 統計設位數（表示法中 2 的冪次個數）
let tempNumber = inputNumber;
let setBitCount = 0;
while (tempNumber) {
  tempNumber &= (tempNumber - 1); // 移除最低位的 1
  setBitCount++;
}
```

### Step 3：找出每個 set bit 的位元位置（指數）

初始化一個 `Uint16Array` 存放所有 set bit 的位元位置（從 0 開始計算）。
從最低位往高位檢查，如果當前位是 1，就把這個位元位置存進陣列。
由於我們是從低位到高位掃描，結果天然是遞增排序。

```typescript
// 2. 以遞增順序記錄 set bit 的位元位置（指數）
const bitPositionList = new Uint16Array(setBitCount);
let positionWritePointer = 0;
let currentBitPosition = 0;
let remainingValue = inputNumber;
while (remainingValue) {
  if (remainingValue & 1) {
    bitPositionList[positionWritePointer++] = currentBitPosition;
  }
  remainingValue >>>= 1;
  currentBitPosition++;
}
```

### Step 4：計算指數序列的前綴和

為了能在 $O(1)$ 時間內計算任意區間 `[L, R]` 的指數總和，我們先對 `bitPositionList` 建立一個前綴和陣列 `exponentPrefixSum`。
另外，我們也計算出所有指數的總和 `maxExponentSum`，以決定後面需要預運算多少個 `2^k`。

```typescript
// 3. 計算位元位置（指數）的前綴和
const exponentPrefixSum = new Uint32Array(setBitCount + 1);
for (let i = 0; i < setBitCount; i++) {
  exponentPrefixSum[i + 1] = exponentPrefixSum[i] + bitPositionList[i];
}
const maxExponentSum = exponentPrefixSum[setBitCount];
```

### Step 5：預運算所有需要的 $2^k \bmod MODULO$

建立 `powersOfTwoModulo` 陣列，從 `2^0` 開始遞推到 `2^{maxExponentSum}`，每次都取模，避免溢位。
這樣查詢時只需直接索引取值，無需重複計算。

```typescript
// 4. 將 2 的冪次（取模）自 0 到 maxExponentSum 全部預先計算
const powersOfTwoModulo = new Uint32Array(maxExponentSum + 1);
powersOfTwoModulo[0] = 1;
for (let exponent = 1; exponent <= maxExponentSum; exponent++) {
  powersOfTwoModulo[exponent] = (powersOfTwoModulo[exponent - 1] * 2) % MODULO;
}
```

### Step 6：利用前綴和 O(1) 回答每筆查詢

對每個查詢 `[startIndex, endIndex]`，利用前綴和計算 `exponentSumInRange = prefix[endIndex+1] - prefix[startIndex]`。
然後直接回傳 `powersOfTwoModulo[exponentSumInRange]` 即為該區間的乘積結果（取模後）。

```typescript
// 5. 以前綴和在 O(1) 內回答每筆查詢
const queryCount = queries.length;
const queryResults: number[] = new Array(queryCount);
for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  const startIndex = queries[queryIndex][0] | 0;
  const endIndex = queries[queryIndex][1] | 0;
  const exponentSumInRange =
    exponentPrefixSum[endIndex + 1] - exponentPrefixSum[startIndex];
  queryResults[queryIndex] = powersOfTwoModulo[exponentSumInRange];
}
```

### Step 7：返回結果

最後，將所有查詢結果組成陣列返回。

```typescript
return queryResults;
```

## 時間複雜度

- 計算 set bit 與位元位置為 $O(\text{bitlen})$，對 `n ≤ 1e9` 為 $\le 30$。
- 前綴和計算為 $O(\text{setBitCount}) \le 30$。
- 預運算 $2^k$ 為 $O(\text{maxExponentSum}) \le 435$。
- 回答查詢為每筆 $O(1)$，總計 $O(q)$。
- 總時間複雜度為 $O(q)$（常數部分極小）。

> $O(q)$

## 空間複雜度

- 主要使用三個陣列 `bitPositionList`、`exponentPrefixSum`、`powersOfTwoModulo`，長度分別 $\le 30$、$\le 31$、$\le 436$。
- 其餘為常數變數。
- 總空間複雜度為 $O(1)$。

> $O(1)$
