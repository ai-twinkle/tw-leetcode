# 2048. Next Greater Numerically Balanced Number

An integer `x` is numerically balanced if for every digit `d` in the number `x`, there are exactly `d` occurrences of that digit in `x`.

Given an integer `n`, return the smallest numerically balanced number strictly greater than `n`.

**Constraints:**

- `0 <= n <= 10^6`

## 基礎思路

本題要求找出**嚴格大於給定整數 `n` 的最小數值平衡數（numerically balanced number）**。

一個整數被稱為數值平衡數，是指其每個數位 `d` 在整個數中**恰好出現 `d` 次**。
例如：

- `22` 是平衡的（數位 2 出現兩次）。
- `1333` 是平衡的（1 出現一次，3 出現三次）。
- `122` 則不是（2 出現兩次沒錯，但 1 只出現一次，不平衡於 2）。

題目限制 `0 ≤ n ≤ 10^6`，而符合條件的數字不可能含有超過 7 的數位，
因為若要出現 8 次數位 `8`，至少需 8 位數以上。因此所有合法的平衡數都在 7 位以內。

基於此觀察，可採用 **預先生成 + 二分搜尋** 的策略：

1. **預生成所有平衡數**
   列舉所有由數位 {1,…,7} 所構成的子集合，
   並對每個子集產生「每個數位 d 出現 d 次」的所有排列組合。
   由於總位數上限為 7，生成總量有限。

2. **排序與壓縮儲存**
   將所有結果排序後以 `Uint32Array` 儲存，利於高效查詢。

3. **查詢階段使用二分搜尋**
   對給定 `n`，使用 `upperBound` 尋找第一個嚴格大於 `n` 的元素。

## 解題步驟

### Step 1：`upperBound` — 已排序陣列中找第一個嚴格大於目標的元素

說明：在升冪排序的數列中，使用二分搜尋回傳第一個 `> target` 的索引；若不存在則回傳長度。

```typescript
/**
 * Perform a binary search to find the first element strictly greater than the given target.
 * @param sortedArray - A sorted Uint32Array of ascending numbers.
 * @param targetValue - The number to compare against.
 * @returns The index of the first element > targetValue, or sortedArray.length if not found.
 */
function upperBound(sortedArray: Uint32Array, targetValue: number): number {
  let leftIndex = 0
  let rightIndex = sortedArray.length

  while (leftIndex < rightIndex) {
    const middleIndex = (leftIndex + rightIndex) >>> 1
    if (sortedArray[middleIndex] > targetValue) {
      rightIndex = middleIndex
    } else {
      leftIndex = middleIndex + 1
    }
  }

  return leftIndex
}
```

### Step 2：`PRECOMPUTED_NUMERICALLY_BALANCED_NUMBERS` — 預先生成所有位數 ≤ 7 的平衡數

說明：以位元子集枚舉 `{1..7}`，計算該子集的總位數（各數位 `d` 需出現 `d` 次），若總位數 ≤ 7，則以遞迴回溯產生所有排列；最後排序並打包成 `Uint32Array`。

```typescript
/**
 * Precompute all numerically balanced numbers with up to 7 digits (using digits 1 through 7).
 *
 * A number is numerically balanced if, for every digit d in the number,
 * the count of digit d is exactly equal to d.
 */
const PRECOMPUTED_NUMERICALLY_BALANCED_NUMBERS: Uint32Array = (() => {
  const allBalancedNumbers: number[] = []
  const remainingDigitCounts = new Int8Array(8) // index 1..7 represents the remaining count for each digit

  /**
   * Recursive helper to generate all possible numeric combinations that satisfy the balanced condition.
   * @param digitsRemaining - Number of digits left to place.
   * @param currentValue - Current partial integer being formed.
   */
  function generateNumbersRecursively(digitsRemaining: number, currentValue: number) {
    if (digitsRemaining === 0) {
      allBalancedNumbers.push(currentValue)
      return
    }

    // Try placing each digit that still has remaining occurrences
    for (let digit = 1; digit <= 7; digit++) {
      if (remainingDigitCounts[digit] > 0) {
        remainingDigitCounts[digit]--

        // Build next integer by appending the digit
        const nextValue = currentValue * 10 + digit
        generateNumbersRecursively(digitsRemaining - 1, nextValue)

        // Backtrack after exploring this branch
        remainingDigitCounts[digit]++
      }
    }
  }

  /**
   * Generate all possible digit subsets (from 1 to 7) where each digit d appears exactly d times.
   * Skip subsets whose total digit count exceeds 7.
   */
  function generateAllSubsets() {
    const totalSubsets = 1 << 7 // 2^7 possible subsets of digits {1..7}

    for (let subsetMask = 1; subsetMask < totalSubsets; subsetMask++) {
      let totalDigitCount = 0

      // Compute total digit occurrences for this subset
      for (let bitIndex = 0; bitIndex < 7; bitIndex++) {
        if ((subsetMask & (1 << bitIndex)) !== 0) {
          totalDigitCount += bitIndex + 1
        }
      }

      // Skip invalid subsets that exceed 7 total digits
      if (totalDigitCount === 0 || totalDigitCount > 7) {
        continue
      }

      // Initialize remaining counts for this subset
      for (let digit = 1; digit <= 7; digit++) {
        remainingDigitCounts[digit] = (subsetMask & (1 << (digit - 1))) !== 0 ? digit : 0
      }

      // Begin recursive generation for this subset
      generateNumbersRecursively(totalDigitCount, 0)
    }
  }

  // Generate all balanced numbers once
  generateAllSubsets()

  // Sort results for binary search compatibility
  allBalancedNumbers.sort((a, b) => a - b)

  // Pack into a Uint32Array for cache efficiency
  const packedArray = new Uint32Array(allBalancedNumbers.length)
  for (let index = 0; index < allBalancedNumbers.length; index++) {
    packedArray[index] = allBalancedNumbers[index]
  }

  return packedArray
})()
```

### Step 3：`nextBeautifulNumber` — 查找最小且嚴格大於 `n` 的平衡數

說明：利用 Step 1 的二分搜尋在 Step 2 的預生成表中查找第一個嚴格大於 `n` 的元素；若超出範圍則拋出錯誤。

```typescript
/**
 * Find the smallest numerically balanced number strictly greater than n.
 *
 * A number is numerically balanced if, for every digit d in it,
 * the count of digit d is exactly d.
 *
 * Constraints: 0 <= n <= 10^6
 *
 * @param inputNumber - The given integer.
 * @returns The smallest numerically balanced number strictly greater than inputNumber.
 * @throws RangeError - If no numerically balanced number exists that is strictly greater than inputNumber.
 */
function nextBeautifulNumber(inputNumber: number): number {
  // Binary search to locate the first precomputed number strictly greater than inputNumber
  const foundIndex = upperBound(PRECOMPUTED_NUMERICALLY_BALANCED_NUMBERS, inputNumber)

  // If not found, signal to the caller that the request is out of the supported range
  if (foundIndex >= PRECOMPUTED_NUMERICALLY_BALANCED_NUMBERS.length) {
    throw new RangeError(
      `No numerically balanced number strictly greater than ${inputNumber} exists within the precomputed range.`
    )
  }

  // Return the next numerically balanced number
  return PRECOMPUTED_NUMERICALLY_BALANCED_NUMBERS[foundIndex]
}
```

## 時間複雜度

- **預生成階段**：設 **`n`** 為「所有位數 ≤ 7 的數值平衡數總數」。
  - 每個數字需被完整遞迴生成一次，成本為 $O(n)$；生成後需排序以支援二分搜尋，成本為 $O(n \log n)$。
  - 因此預生成階段的最壞時間複雜度為 $O(n \log n)$。
- **查詢階段（單次）**：
  - 預生成完成後，使用二分搜尋尋找第一個嚴格大於輸入值的平衡數，耗時 $O(\log n)$。
- **最壞情況（首次呼叫）**：
  - 當快取尚未建立時，系統需執行完整的預生成與查詢流程，整體最壞時間複雜度為 $O(n \log n)$。
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- 預生成集合需儲存所有平衡數，為 $O(n)$。
- 輔助結構（如遞迴狀態陣列、遮罩變數等）僅需常數額外空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
