# 3495. Minimum Operations to Make Array Elements Zero

You are given a 2D array `queries`, where `queries[i]` is of the form `[l, r]`. 
Each `queries[i]` defines an array of integers `nums` consisting of elements ranging from `l` to `r`, both inclusive.

In one operation, you can:

- Select two integers `a` and `b` from the array.
- Replace them with `floor(a / 4)` and `floor(b / 4)`.

Your task is to determine the minimum number of operations required to reduce all elements of the array to zero for each query. 
Return the sum of the results for all queries.

**Constraints:**

- `1 <= queries.length <= 10^5`
- `queries[i].length == 2`
- `queries[i] == [l, r]`
- `1 <= l < r <= 10^9`

## 基礎思路

本題要求將一段連續整數陣列中的每個元素，不斷進行「整除 4 並向下取整」的操作，直到所有元素皆為 0。
每次操作可同時作用於兩個元素，因此若不加選擇地任意配對，將導致操作次數過多，影響整體效能。

為了設計有效的解法，我們可從下列兩個面向思考：

1. **單一元素的遞減行為具有單調性**：
   每個數字最終都會經過一系列的除法遞減過程，而每一步的輸出只與當前數值相關，與配對對象無關。因此，每個數字所需經過的步驟數可預先估算，且具備封閉邊界與累加性。

2. **總體操作數的下界來自兩種限制**：

    * **總需求限制**：因為一次操作可消化兩個「遞減需求」，若能快速估計整段區間總需求，即可推算操作數的下界。
    * **最大瓶頸限制**：無論如何安排配對，最慢歸零的數字仍需經過其獨立所需的所有步驟，因此最大需求本身也構成一種操作數下界。

結合上述兩點，我們可得出一個策略：

- **預先計算**所有可能需求級別（如遞減層級與對應數值區間），藉此避免重複模擬每個數字。
- **對每筆查詢**，透過查表與推導快速估算「總需求」與「最大需求」，兩者取最大即為最少操作次數。
- **最終結果**為所有查詢所需操作次數的總和。

該策略的優勢在於：即使查詢次數龐大，也能以極低時間與空間成本，在常數時間內求解每筆子問題。

## 解題步驟

### Step 1: 宣告介面 `Tables`

建立一個 `Tables` 介面來描述預先計算表格的格式，方便後續函式回傳類型明確化。

- 定義 `powerOfFourTable` 為 `Uint32Array`，存儲所有小於等於 $10^9$ 的 4 的冪。
- 定義 `weightedPrefixSumTable` 為 `Float64Array`，對每個 $k$ 儲存 $\displaystyle \sum_{j=0}^{k-1} j \cdot 3 \cdot 4^j$。

```typescript
/**
 * 用於快速對數（以 4 為底）計算的預先查表。
 */
interface Tables {
  powerOfFourTable: Uint32Array;        // 4 的冪（4^k），直到覆蓋所需的最大範圍。
  weightedPrefixSumTable: Float64Array; // k * 3 * 4^k 的前綴和，用於快速區間加總。
}
```

### Step 2: 建立與快取查表

初始化 `powerOfFourTable` 和 `weightedPrefixSumTable`，並透過閉包記憶結果避免重複初始化。

- 使用 while 迴圈產生所有 $\leq 4^{15}$ 的整數冪。
- 再透過 for 迴圈計算加權前綴和：$j \cdot 3 \cdot 4^j$。
- 快取最終結果於 `getTables.cache`。

```typescript
/**
 * 初始化並快取 4 的冪表與加權前綴和。
 * 確保預先計算只執行一次。
 *
 * @returns 4 的冪與前綴和查表。
 */
function getTables(): Tables {
  if (getTables.cache !== null) {
    return getTables.cache;
  }

  const powerOfFourList: number[] = [];
  let currentValue = 1;
  while (currentValue <= 1_073_741_824) { // 4^15，略高於 1e9
    powerOfFourList.push(currentValue);
    currentValue *= 4;
  }
  const powerOfFourTable = new Uint32Array(powerOfFourList);

  const weightedPrefixSumTable = new Float64Array(powerOfFourTable.length + 1);
  let runningSum = 0;
  for (let k = 0; k < powerOfFourTable.length; k++) {
    weightedPrefixSumTable[k] = runningSum;
    runningSum += k * 3 * powerOfFourTable[k];
  }
  weightedPrefixSumTable[powerOfFourTable.length] = runningSum;

  getTables.cache = { powerOfFourTable, weightedPrefixSumTable };
  return getTables.cache;
}
getTables.cache = null as Tables | null;
```

### Step 3: 利用位元技巧計算 floor(log4(n))

透過 `clz32` 找到以 2 為底的對數，右移 1 位推導出以 4 為底的下界。再透過查表微調，確保精確落在 $[4^k, 4^{k+1})$ 區間內。

- 使用 `clz32` 快速計算 $⌊\log_2 n⌋$
- 轉換成 $⌊\log_4 n⌋$ 再做邊界修正。

```typescript
/**
 * 以位元技巧與預先表列的 4 的冪，快速計算 floor(log4(n))。
 *
 * @param n - 輸入整數（n >= 1）。
 * @param powerOfFourTable - 已預先計算的 4 的冪表。
 * @returns 索引 k，使得 4^k <= n < 4^(k+1)。
 */
function floorLogBaseFourIndex(n: number, powerOfFourTable: Uint32Array): number {
  const logBaseTwoFloor = 31 - Math.clz32(n | 0);
  let k = logBaseTwoFloor >>> 1;

  if (n < powerOfFourTable[k]) {
    k -= 1;
  } else if (k + 1 < powerOfFourTable.length && n >= powerOfFourTable[k + 1]) {
    k += 1;
  }
  return k;
}
```

### Step 4: 快速計算 prefixSum(floor(log4(x)))

藉由加權前綴和 + 最後一段線性公式，計算 $\sum_{x=1}^n \lfloor \log_4 x \rfloor$。

* 先透過 `floorLogBaseFourIndex(n)` 找到區間層級。
* 回傳加權總和 + 線性尾段。

```typescript
/**
 * 計算區間 [1, n] 的 floor(log4(x)) 前綴和。
 *
 * @param n - 上界。
 * @param powerOfFourTable - 已預先計算的 4 的冪表。
 * @param weightedPrefixSumTable - 已預先計算的加權前綴和。
 * @returns Sum_{x=1..n} floor(log4(x))；若 n <= 0 則回傳 0。
 */
function prefixSumFloorLogBaseFour(
  n: number,
  powerOfFourTable: Uint32Array,
  weightedPrefixSumTable: Float64Array
): number {
  if (n <= 0) {
    return 0;
  }

  const k = floorLogBaseFourIndex(n, powerOfFourTable);
  return weightedPrefixSumTable[k] + k * (n - powerOfFourTable[k] + 1);
}
```

### Step 5: 遍歷查詢並累加最小操作數

對每筆 `[l, r]` 查詢計算兩個下界：

- 載荷下界：$(r-l+1) + \sum \lfloor \log_4 x \rfloor$ 再除以 2 向上取整。
- 個體下界：$\lfloor \log_4 r \rfloor + 1$
- 取兩者最大值後累加到總和中。

```typescript
const { powerOfFourTable, weightedPrefixSumTable } = getTables();
let totalOperationsSum = 0;

for (let i = 0; i < queries.length; i++) {
  const left = queries[i][0] | 0;
  const right = queries[i][1] | 0;

  const lengthOfInterval = right - left + 1;
  const sumFloorLogBaseFour =
    prefixSumFloorLogBaseFour(right, powerOfFourTable, weightedPrefixSumTable) -
    prefixSumFloorLogBaseFour(left - 1, powerOfFourTable, weightedPrefixSumTable);

  const totalRequiredSelections = lengthOfInterval + sumFloorLogBaseFour;

  const loadBound = Math.ceil(totalRequiredSelections * 0.5);
  const largestIndividualSteps = floorLogBaseFourIndex(right, powerOfFourTable) + 1;

  let minimalOperationsForQuery = 0;
  if (loadBound > largestIndividualSteps) {
    minimalOperationsForQuery = loadBound;
  } else {
    minimalOperationsForQuery = largestIndividualSteps;
  }

  totalOperationsSum += minimalOperationsForQuery;
}
```

### Step 6: 回傳總操作數

將所有查詢的最小操作數總和回傳。

```typescript
return totalOperationsSum;
```

## 時間複雜度

- 預處理固定大小查表為 $O(1)$。
- 每筆查詢透過查表與邏輯推導在 $O(1)$ 完成。
- 總時間複雜度為 $O(q)$，其中 $q$ 為查詢筆數。

> $O(q)$

## 空間複雜度

- 查表大小固定，未使用額外動態資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
