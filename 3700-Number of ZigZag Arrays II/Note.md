# 3700. Number of ZigZag Arrays II

You are given three integers `n`, `l`, and `r`.

A ZigZag array of length `n` is defined as follows:

- Each element lies in the range `[l, r]`.
- No two adjacent elements are equal.
- No three consecutive elements form a strictly increasing or strictly decreasing sequence.

Return the total number of valid ZigZag arrays.

Since the answer may be large, return it modulo `10^9 + 7`.

A sequence is said to be strictly increasing if each element is strictly greater than its previous one (if exists).

A sequence is said to be strictly decreasing if each element is strictly smaller than its previous one (if exists).

**Constraints:**

- `3 <= n <= 10^9`
- `1 <= l < r <= 75`

## 基礎思路

本題要求計算所有長度為 `n`、值域在 `[l, r]` 內的 ZigZag 陣列數量。ZigZag 的核心約束是：相鄰元素不相等，且任意連續三個元素不能嚴格遞增或嚴格遞減，也就是說每個內部元素必須是「局部極大值（峰）」或「局部極小值（谷）」。

在思考解法時，可掌握以下核心觀察：

- **ZigZag 的轉折本質**：
  合法序列中，每個位置的元素必須在兩側鄰居中是局部極大或局部極小，即連續三個元素必須呈現「上下上」或「下上下」形。

- **對稱性簡化計數**：
  峰值結尾的序列數與谷值結尾的序列數完全對稱，故只需計算其中一類（例如以峰結尾的），最後乘以 2 即可得到總數。

- **狀態轉移可矩陣化**：
  若以「前一個元素的值」作為狀態，當前元素的可選值可由上一元素決定：為了確保峰性質，當前值必須嚴格大於前一個元素，才能讓再下一個元素有機會小於它。此轉移規律固定，可建構轉移矩陣。

- **矩陣快速冪處理大 n**：
  由於 `n` 最大可達 `10^9`，直接遞推不可行；轉移矩陣的冪次可以透過矩陣快速冪（Exponentiation by Squaring）在 $O(\log n)$ 次矩陣乘法內完成。

- **初始向量的設計**：
  長度為 2 時，每個以某值結尾的峰序列，其初始狀態數等於比它小的值的數量（即有多少前一個位置的值可以使它成為峰），這正好是元素值在零索引下的索引值本身。

依據以上特性，可以採用以下策略：

- **建構轉移矩陣**：矩陣中 `[row][col]` 為 1 表示「前一值為 row、當前峰值為 col」是合法的，即 `col > row`（確保峰）；
- **以矩陣快速冪計算 `n - 2` 次冪**，得到整個序列累積的轉移結果；
- **乘以初始向量後加總**，得到所有以峰結尾的合法序列數；
- **結果乘以 2**，涵蓋以谷結尾的對稱情況。

## 解題步驟

### Step 1：計算值域大小並排除不合法情況

值域 `[l, r]` 包含 `rangeSize` 個不同整數。若 `rangeSize < 2`，則無法選出兩個不相等的相鄰元素，直接回傳 0。

```typescript
const rangeSize = r - l + 1;

// 因為相鄰元素不能相等，若值域大小小於 2，則無法構成合法陣列
if (rangeSize < 2) {
  return 0;
}

const moduloConstant = 1000000007n;
```

### Step 2：定義矩陣乘法輔助函數

定義 `multiplyMatrices` 用於計算兩個 `rangeSize × rangeSize` 矩陣的乘積。矩陣以一維 `BigInt64Array` 儲存（row-major），利用 `innerIndex` 優化記憶體存取，並在每次乘加後立即取模以避免 64 位元溢位。

```typescript
/**
 * 計算兩個大小為 rangeSize x rangeSize 的方陣乘積。
 *
 * @param matrixA - 左矩陣運算元
 * @param matrixB - 右矩陣運算元
 * @returns 新計算出的乘積矩陣
 */
function multiplyMatrices(matrixA: BigInt64Array, matrixB: BigInt64Array): BigInt64Array<ArrayBuffer> {
  const productMatrix = new BigInt64Array(rangeSize * rangeSize);

  for (let rowIndex = 0; rowIndex < rangeSize; rowIndex++) {
    const rowOffset = rowIndex * rangeSize;

    for (let innerIndex = 0; innerIndex < rangeSize; innerIndex++) {
      const multiplier = matrixA[rowOffset + innerIndex];

      if (multiplier === 0n) {
        continue;
      }

      const innerRowOffset = innerIndex * rangeSize;

      for (let colIndex = 0; colIndex < rangeSize; colIndex++) {
        // 計算矩陣格值，使用模運算以原生方式防止 64 位元溢位
        const currentProduct = multiplier * matrixB[innerRowOffset + colIndex];
        productMatrix[rowOffset + colIndex] = (productMatrix[rowOffset + colIndex] + currentProduct) % moduloConstant;
      }
    }
  }

  return productMatrix;
}
```

### Step 3：建構峰值轉移矩陣

對於轉移矩陣中的位置 `[rowValue][colValue]`，若 `colValue > rowValue`（即「當前峰值嚴格大於前一個元素」），則設為 1，表示此轉移合法；否則保留為 0。

```typescript
// 初始化基礎轉移矩陣，僅對應「峰值」狀態
const transitionMatrix = new BigInt64Array(rangeSize * rangeSize);

for (let rowValue = 0; rowValue < rangeSize; rowValue++) {
  const rowOffset = rowValue * rangeSize;

  for (let colValue = rangeSize - rowValue; colValue < rangeSize; colValue++) {
    transitionMatrix[rowOffset + colValue] = 1n;
  }
}
```

### Step 4：初始化單位矩陣，準備進行矩陣快速冪

`resultMatrix` 初始化為單位矩陣（對角線為 1），作為矩陣快速冪的初始累積值；`baseMatrix` 設為轉移矩陣，`exponent` 設為 `n - 2`，代表需要做的轉移次數（序列長度扣除頭尾兩個位置）。

```typescript
let resultMatrix = new BigInt64Array(rangeSize * rangeSize);

for (let diagonalIndex = 0; diagonalIndex < rangeSize; diagonalIndex++) {
  resultMatrix[diagonalIndex * rangeSize + diagonalIndex] = 1n;
}

let baseMatrix = transitionMatrix;
let exponent = n - 2;
```

### Step 5：以矩陣快速冪計算轉移矩陣的 `n - 2` 次冪

透過「平方再折半」的策略，每輪將指數減半，只需 $O(\log n)$ 次矩陣乘法即可完成冪次運算，大幅降低對大型 `n` 的計算成本。

```typescript
// 使用快速冪以達到 O(log N) 的效率
while (exponent > 0) {
  if (exponent % 2 === 1) {
    resultMatrix = multiplyMatrices(resultMatrix, baseMatrix);
  }

  baseMatrix = multiplyMatrices(baseMatrix, baseMatrix);
  exponent = Math.floor(exponent / 2);
}
```

### Step 6：建構初始向量

`initialVector[i]` 代表長度為 2、以索引 `i` 的值作為峰值結尾時，合法前置元素的數量，即比它小的元素個數，恰好等於 `i` 本身（零索引下）。

```typescript
const initialVector = new BigInt64Array(rangeSize);

for (let vectorIndex = 0; vectorIndex < rangeSize; vectorIndex++) {
  initialVector[vectorIndex] = BigInt(vectorIndex);
}
```

### Step 7：將最終冪次矩陣乘以初始向量，統計所有以峰結尾的合法序列總數

對 `resultMatrix` 的每一列，計算其與 `initialVector` 的內積，並累加為 `rowSum`；
再將所有列的 `rowSum` 加總為 `totalPeakSequences`，即所有以峰結尾的合法序列總數。

```typescript
let totalPeakSequences = 0n;

// 將最終冪次矩陣乘以初始向量狀態
for (let rowIndex = 0; rowIndex < rangeSize; rowIndex++) {
  let rowSum = 0n;
  const rowOffset = rowIndex * rangeSize;

  for (let colIndex = 0; colIndex < rangeSize; colIndex++) {
    const cellProduct = resultMatrix[rowOffset + colIndex] * initialVector[colIndex];
    rowSum = (rowSum + cellProduct) % moduloConstant;
  }

  totalPeakSequences = (totalPeakSequences + rowSum) % moduloConstant;
}
```

### Step 8：乘以 2 以涵蓋谷值結尾的對稱情況，回傳最終答案

由對稱性，以谷結尾的合法序列數與以峰結尾相等，故將 `totalPeakSequences` 乘以 2 即得所有合法 ZigZag 陣列數量，再轉為 `number` 回傳。

```typescript
// 乘以 2 以正確涵蓋峰結尾與谷結尾兩類對稱陣列
const totalValidArrays = (totalPeakSequences * 2n) % moduloConstant;

return Number(totalValidArrays);
```

## 時間複雜度

- 設值域大小為 $s = r - l + 1$，矩陣大小為 $s \times s$；
- 每次矩陣乘法需要 $O(s^3)$；
- 矩陣快速冪執行 $O(\log n)$ 次矩陣乘法；
- 最後矩陣乘向量需要 $O(s^2)$；
- 由於 $s \le 75$，可視為常數，整體瓶頸在對數因子上。
- 總時間複雜度為 $O(s^3 \log n)$。

> $O(s^3 \log n)$

## 空間複雜度

- 儲存轉移矩陣、結果矩陣與底數矩陣各需 $O(s^2)$；
- 初始向量與輸出皆為 $O(s)$；
- 總空間複雜度為 $O(s^2)$。

> $O(s^2)$
