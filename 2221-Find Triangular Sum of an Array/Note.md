# 2221. Find Triangular Sum of an Array

You are given a 0-indexed integer array `nums`, where `nums[i]` is a digit between `0` and `9` (inclusive).

The triangular sum of `nums` is the value of the only element present in `nums` after the following process terminates:

1. Let `nums` comprise of `n` elements. 
   If `n == 1`, end the process. Otherwise, create a new 0-indexed integer array `newNums` of length `n - 1`.
2. For each index `i`, where `0 <= i < n - 1`, assign the value of `newNums[i]` as `(nums[i] + nums[i+1]) % 10`, where `%` denotes modulo operator.
3. Replace the array `nums` with `newNums`.
4. Repeat the entire process starting from step 1.

Return the triangular sum of `nums`.

**Constraints:**

- `1 <= nums.length <= 1000`
- `0 <= nums[i] <= 9`

## 基礎思路

本題要求計算一個數列的「三角和」（Triangular Sum）。定義為：將相鄰元素相加並取模 $10$，重複此過程直到只剩下單一元素，該元素即為最終結果。

在思考解法時，我們需要注意以下幾點：

- **直接模擬**：若依照題目流程逐層生成新陣列，時間複雜度約為 $O(n^2)$，在 $n=1000$ 時仍能接受，但並非最佳。
- **數學觀察**：三角和實際上等價於「二項式展開」的組合加權和。例如：
    - 經過一次縮減後，結果涉及 $nums[i]$ 與 $nums[i+1]$；
    - 經過多次縮減後，最終結果就是原始陣列各元素乘上對應二項式係數的加總（取模 $10$）。
- **化簡公式**：最終三角和可表示為：

  $$
  \text{TriangularSum}(nums) = \left( \sum_{i=0}^{n-1} nums[i] \times \binom{n-1}{i} \right) \bmod 10
  $$

- **策略**：
    - 預先計算帕斯卡三角形（Pascal’s Triangle）的係數表，並對每個係數取模 $10$；
    - 在計算時直接使用對應的二項式係數，與陣列元素做加權求和，再取模 $10$；
    - 由於 $n \leq 1000$，事先建表即可快速查詢。

## 解題步驟

### Step 1：預先計算帕斯卡三角形係數（取模 10）

使用二項式遞推公式 $\binom{r}{c} = \binom{r-1}{c-1} + \binom{r-1}{c}$，並對 $10$ 取模，建構出從 $0$ 到 $1000$ 的帕斯卡三角形表。

```typescript
// 建立帕斯卡三角形 (binomial coefficients) 並對 10 取模，直到長度 1000
const binomialCoefficientMod10: Int32Array[] = ((): Int32Array[] => {
  const coefficients: Int32Array[] = [];

  for (let rowIndex = 0; rowIndex <= 1000; rowIndex++) {
    const currentRow = new Int32Array(rowIndex + 1);

    // 每一列的首尾元素固定為 1
    currentRow[0] = 1;
    currentRow[rowIndex] = 1;

    // 中間元素依帕斯卡遞推公式計算，並取模 10
    for (let column = 1; column < rowIndex; column++) {
      currentRow[column] =
        (coefficients[rowIndex - 1][column - 1] + coefficients[rowIndex - 1][column]) % 10;
    }

    coefficients.push(currentRow);
  }

  return coefficients;
})();
```

### Step 2：計算最終三角和

取對應長度的二項式係數列，與輸入數組的各元素相乘後加總，最後對 10 取模即可。

```typescript
/**
 * 計算數列的三角和
 *
 * @param nums - 整數陣列，每個元素為 0~9
 * @returns 三角和結果 (單一數字 0~9)
 */
function triangularSum(nums: number[]): number {
  const length = nums.length;

  // 取出對應長度的二項式係數列
  const coefficientRow = binomialCoefficientMod10[length - 1];

  let result = 0;

  // 計算加權和 Σ nums[i] * C(n-1, i)
  for (let index = 0; index < length; index++) {
    result += nums[index] * coefficientRow[index];
  }

  // 最終對 10 取模
  return result % 10;
}
```

## 時間複雜度

- **預處理**：建立帕斯卡三角形至 $1000$ 列，總計元素數量為 $O(n^2)$。
- **查詢計算**：對單一輸入陣列，僅需 $O(n)$ 計算加權和。
- 總時間複雜度為 $O(n^2)$，其中預處理為 $O(n^2)$，查詢為 $O(n)$。

> $O(n^2)$

## 空間複雜度

- 需儲存 $1000$ 列的帕斯卡三角形，空間為 $O(n^2)$。
- 計算過程中僅使用 $O(1)$ 額外變數。
- 總空間複雜度為 $O(n^2)$。

> $O(n^2)$

