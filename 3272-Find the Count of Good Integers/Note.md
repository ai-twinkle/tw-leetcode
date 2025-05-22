# 3272. Find the Count of Good Integers

You are given two positive integers `n` and `k`.

An integer `x` is called k-palindromic if:

- `x` is a palindrome.
- `x` is divisible by `k`.

An integer is called good if its digits can be rearranged to form a k-palindromic integer. 
For example, for `k = 2`, 
2020 can be rearranged to form the k-palindromic integer 2002, 
whereas 1010 cannot be rearranged to form a k-palindromic integer.

Return the count of good integers containing `n` digits.

Note that any integer must not have leading zeros, neither before nor after rearrangement. 
For example, 1010 cannot be rearranged to form 101.

**Constraints:**

- `1 <= n <= 10`
- `1 <= k <= 9`

## 基礎思路

題目要求計算「好整數」(Good Integer) 的數量，所謂「好整數」的定義如下：

- 一個整數稱為 **k-回文數 (k-palindromic)** 若且唯若它是一個回文數，且能被整數 $k$ 整除。
- 一個整數稱為 **好整數** 若且唯若它的數字經重新排列後，可以形成一個 k-回文數，且任何排列不得有前導零。

要解決此問題，可以透過下列步驟進行：

1. 枚舉所有可能的迴文數（依據奇偶位數分別處理）。
2. 檢查每個候選迴文數是否能被 $k$ 整除。
3. 若符合條件，將此迴文數的數位頻率儲存起來，以避免重複計算。
4. 對每個有效的數位頻率組合，計算其所有可能排列，並扣除不合法的（前導零排列）。
5. 最後，透過預計算以達到 $O(1)$ 查詢效率。

## 解題步驟

### Step 1：階乘預處理與資料結構準備

題目最大位數不超過 $10$，我們預先計算 $0$ 到 $10$ 的階乘，供後續快速計算排列組合時使用：

```typescript
const MAX_DIGITS = 10;
const factorials = new Array(MAX_DIGITS + 1).fill(1);
for (let i = 1; i <= MAX_DIGITS; i++) {
  factorials[i] = factorials[i - 1] * i;
}
```

### Step 2：計算排列數（多項式係數）

考量數位頻率，我們可得出該頻率組合的總排列數（多項式係數）：

- 多項式係數公式為：

$$
\text{permutations} = \frac{n!}{a_0! \times a_1! \times a_2! \times \dots \times a_9!}
$$

其中 $a_i$ 表示數字 $i$ 的出現次數，$n$ 為總位數。

```typescript
function computeTotalPermutations(digitFrequencies: number[], totalDigits: number): number {
  let permutations = factorials[totalDigits];
  for (let digit = 0; digit < 10; digit++) {
    permutations /= factorials[digitFrequencies[digit]];
  }
  return permutations;
}
```

### Step 3：扣除前導零的非法排列數

若數字 $0$ 出現超過一次，必須扣除將 $0$ 放在首位的排列數：

- 固定首位為 $0$ 後，剩餘排列方式計算為：

$$
\frac{(n - 1)!}{(a_0 - 1)! \times a_1! \times a_2! \times \dots \times a_9!}
$$

```typescript
function computeInvalidLeadingZeroPermutations(digitFrequencies: number[], totalDigits: number): number {
  if (digitFrequencies[0] === 0) {
    return 0;
  }
  let invalidPermutations = factorials[totalDigits - 1] / factorials[digitFrequencies[0] - 1];
  for (let digit = 1; digit < 10; digit++) {
    invalidPermutations /= factorials[digitFrequencies[digit]];
  }
  return invalidPermutations;
}
```

### Step 4：產生數位頻率唯一標識鍵

我們利用字串表示一個數位頻率組合，以快速去除重複情況：

```typescript
function getDigitFrequencyKey(numericString: string): string {
  const digitFrequency = new Array(10).fill(0);
  for (const char of numericString) {
    digitFrequency[Number(char)]++;
  }
  return digitFrequency.join(',');
}
```

### Step 5：枚舉並檢查迴文數候選

依照位數奇偶分別處理：

- 偶數位數時，候選數為 `(左半邊) + (左半邊倒置)`。
- 奇數位數時，候選數為 `(左半邊) + (中間位數) + (左半邊倒置)`。

我們需檢查：

- 無前導零。
- 可被 $k$ 整除。

符合的候選數位頻率，記錄起來：

```typescript
function computeGoodIntegerCount(totalDigits: number, divisor: number): number {
  // 儲存唯一的數位頻率組合
  const validDigitFrequencySets = new Map<string, true>();

  const halfLength = Math.floor(totalDigits / 2);
  const startNumber = Math.pow(10, halfLength - 1);
  const endNumber = Math.pow(10, halfLength);

  if (totalDigits === 1) {
    // 單位數：枚舉 1~9 並檢查能否被 divisor 整除
    for (let digit = 1; digit < 10; digit++) {
      if (digit % divisor === 0) {
        const freq = new Array(10).fill(0);
        freq[digit] = 1;
        validDigitFrequencySets.set(freq.join(','), true);
      }
    }
  } else {
    // 多位數：以左半邊產生迴文候選
    for (let leftHalf = startNumber; leftHalf < endNumber; leftHalf++) {
      const leftHalfStr = leftHalf.toString();
      const reversedLeftHalf = leftHalfStr.split('').reverse().join('');

      if (totalDigits % 2 === 0) {
        const candidate = leftHalfStr + reversedLeftHalf;
        if (parseInt(candidate) % divisor === 0) {
          validDigitFrequencySets.set(getDigitFrequencyKey(candidate), true);
        }
      } else {
        // 奇數位：嘗試所有中間數字
        for (let midDigit = 0; midDigit < 10; midDigit++) {
          const candidate = leftHalfStr + midDigit + reversedLeftHalf;
          if (candidate[0] !== '0' && parseInt(candidate) % divisor === 0) {
            validDigitFrequencySets.set(getDigitFrequencyKey(candidate), true);
          }
        }
      }
    }
  }

  let totalGoodCount = 0;
  // 對每組唯一數位頻率計算合法排列數
  for (const frequencyKey of validDigitFrequencySets.keys()) {
    const digitFrequencies = frequencyKey.split(',').map(Number);
    let arrangements = computeTotalPermutations(digitFrequencies, totalDigits);
    if (digitFrequencies[0] > 0) {
      arrangements -= computeInvalidLeadingZeroPermutations(digitFrequencies, totalDigits);
    }
    totalGoodCount += arrangements;
  }
  return totalGoodCount;
}
```

### Step 6：預計算所有情況結果

由於題目限制 ($n \leq 10$, $1 \leq k \leq 9$)，可預計算所有可能結果，方便後續 $O(1)$ 查詢：

```typescript
function precomputeGoodIntegers(): number[][] {
  const results = Array.from({ length: MAX_DIGITS + 1 }, () => Array(10).fill(0));
  for (let n = 1; n <= MAX_DIGITS; n++) {
    for (let divisor = 1; divisor <= 9; divisor++) {
      results[n][divisor] = computeGoodIntegerCount(n, divisor);
    }
  }
  return results;
}
const precomputedGoodIntegers = precomputeGoodIntegers();
```

### Step 7：最終查詢函式（$O(1)$ 查詢）

```typescript
function countGoodIntegers(totalDigits: number, divisor: number): number {
  return precomputedGoodIntegers[totalDigits][divisor];
}
```

## 時間複雜度

- 枚舉候選數量最多約為 $O(10^{n/2})$ 次，並在常數次計算內完成所有排列計算。
- 因為預計算，此後查詢複雜度皆為 $O(1)$。
- 總時間複雜度為 $O(10^{n/2})$，但實際上由於 $n$ 的限制，實際運行時間遠低於此值。

> $O(10^{n/2})$

## 空間複雜度

- 儲存階乘數字與預計算結果為 $O(1)$。
- 總空間複雜度為 $O(1)$。

> $O(1)$
