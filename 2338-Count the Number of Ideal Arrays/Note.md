# 2338. Count the Number of Ideal Arrays

You are given two integers `n` and `maxValue`, which are used to describe an ideal array.

A 0-indexed integer array `arr` of length `n` is considered ideal if the following conditions hold:

- Every `arr[i]` is a value from `1` to `maxValue`, for `0 <= i < n`.
- Every `arr[i]` is divisible by `arr[i - 1]`, for `0 < i < n`.

Return the number of distinct ideal arrays of length `n`. 
Since the answer may be very large, return it modulo $10^9 + 7$.

## 基礎思路

題目要求計算長度為 $n$ 且每個元素範圍在 $[1, maxValue]$ 內的「理想陣列」總數，且必須滿足以下條件：

- 對所有的 $0 < i < n$，必須有 $arr[i] \mod arr[i - 1] = 0$。

我們可以觀察到，理想陣列的每一個元素都必須是前一個元素的倍數，因此對於最後一個元素（設為 $v$），假設其質因數分解為：

$$
v = \prod_{j} p_j^{e_j}
$$

因為序列每一步元素都是前一步的倍數，這意味著每個質數的指數必須以非遞減的方式分配在陣列元素中。因此，我們可以將每個質數指數的分配視為「重複組合問題」，依照 Stars and Bars 定理，有：

$$
\text{方案數} = C(n + e_j - 1,\; e_j)
$$

我們將每個質數的方案數相乘，即可得出固定值 $v$ 作為最終元素的理想陣列數量。最後，只要將所有可能的結尾元素 $v = 1, 2, \dots, maxValue$ 的結果相加，即可得出最終答案，並取模 $10^9+7$。

## 解題步驟

### Step 1：常數與資料結構初始化

首先定義必要的常數和 Typed Array，以提高計算效率：

```typescript
// 模數常數
const MODULO = 1000000007n;
// 預設最大範圍
const MAX_N = 10010;
// 質因數最大種類數量
const MAX_PRIME_FACTORS = 15;

/** 最小質因數 */
const minimumPrimeFactor = new Uint16Array(MAX_N);
/** 扁平化質因子指數陣列 */
let primeExponentsFlat: Uint8Array;
/** 扁平化陣列的索引位置 */
const primeExponentsOffset = new Int32Array(MAX_N + 1);
/** 組合數陣列 C(i, k) mod MODULO，以 BigInt 存放 */
const combinationCoefficients: Array<Array<bigint>> = new Array(MAX_N + MAX_PRIME_FACTORS);
```

### Step 2：前置計算函式 `precomputeAll()`

執行一次性計算，包含四個部分：

```typescript
(function precomputeAll() {
  // 1. 篩法計算最小質因子
  for (let v = 2; v < MAX_N; v++) {
    if (minimumPrimeFactor[v] === 0) {
      for (let m = v; m < MAX_N; m += v) {
        if (minimumPrimeFactor[m] === 0) {
          minimumPrimeFactor[m] = v;
        }
      }
    }
  }

  // 2. 統計每個數的質因子指數
  const tempExponents: number[][] = Array.from({ length: MAX_N }, () => []);
  for (let v = 2; v < MAX_N; v++) {
    let x = v;
    while (x > 1) {
      const p = minimumPrimeFactor[x];
      let cnt = 0;
      do {
        x = Math.floor(x / p);
        cnt++;
      } while (minimumPrimeFactor[x] === p);
      tempExponents[v].push(cnt);
    }
  }

  // 3. 扁平化質因子指數並記錄索引位置
  let totalCounts = 0;
  for (let v = 0; v < MAX_N; v++) {
    totalCounts += tempExponents[v].length;
  }
  primeExponentsFlat = new Uint8Array(totalCounts);

  let writePtr = 0;
  for (let v = 0; v < MAX_N; v++) {
    primeExponentsOffset[v] = writePtr;
    for (let cnt of tempExponents[v]) {
      primeExponentsFlat[writePtr++] = cnt;
    }
  }
  primeExponentsOffset[MAX_N] = writePtr;

  // 4. 構建 Pascal 三角（組合數表）
  const totalRows = MAX_N + MAX_PRIME_FACTORS;
  for (let i = 0; i < totalRows; i++) {
    const row: Array<bigint> = new Array(MAX_PRIME_FACTORS + 1);
    row[0] = 1n;
    for (let k = 1; k <= MAX_PRIME_FACTORS; k++) {
      row[k] = k > i
        ? 0n
        : (combinationCoefficients[i - 1][k] + combinationCoefficients[i - 1][k - 1]) % MODULO;
    }
    combinationCoefficients[i] = row;
  }
})();
```

### Step 3：主函式 `idealArrays` 實作

利用前置計算的資料，計算理想陣列總數：

```typescript
function idealArrays(n: number, maxValue: number): number {
  let totalSum = 0n;
  const combos = combinationCoefficients;
  const exponentsFlat = primeExponentsFlat;
  const exponentsOff = primeExponentsOffset;
  const mod = MODULO;

  // 逐一遍歷所有可能的最終元素值
  for (let value = 1; value <= maxValue; value++) {
    let productForValue = 1n;
    const start = exponentsOff[value];
    const end = exponentsOff[value + 1];

    // 針對每個質因子指數，計算組合數並累乘
    for (let ptr = start; ptr < end; ptr++) {
      const e = exponentsFlat[ptr];
      productForValue = (productForValue * combos[n + e - 1][e]) % mod;
    }

    // 累加每個最終元素值所得到的結果
    totalSum = (totalSum + productForValue) % mod;
  }

  return Number(totalSum);
}
```

- **外層**：從 $1$ 到 $maxValue$ 枚舉所有可能最終元素。
- **內層**：將每個質數指數對應的組合數相乘得到單一元素的陣列數目。
- **累加**：將每個結果累加，最後取模返回。

## 時間複雜度

- **前置計算**
    - 篩法計算最小質因子：$O(n\log\log nN)$
    - 質因子分解與扁平化：$O(n\log n)$
    - Pascal 三角構建：$O(n)$
- **主函式**
    - 枚舉結尾值並計算：$O(maxValue \times P)=O(n)$

- **總時間複雜度**：$O(n\log n)$

> $O(N\log N)$

## 空間複雜度

- `minimumPrimeFactor`：$O(n)$
- `primeExponentsFlat`：$O(n\log n)$
- `primeExponentsOffset`：$O(n)$
- `combinationCoefficients`：$O(n)$
- **總空間複雜度**：$O(nlog n$，其中 $n = \max(n,\,maxValue)$，且質因數上限 $P$ 為常數。

> $O(n\log n)$
