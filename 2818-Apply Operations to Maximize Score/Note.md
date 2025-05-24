# 2818. Apply Operations to Maximize Score

You are given an array `nums` of `n` positive integers and an integer `k`.

Initially, you start with a score of `1`. 
You have to maximize your score by applying the following operation at most `k` times:

- Choose any non-empty subarray `nums[l, ..., r]` that you haven't chosen previously.
- Choose an element `x` of `nums[l, ..., r]` with the highest prime score. 
  If multiple such elements exist, choose the one with the smallest index.
- Multiply your score by `x`.

Here, `nums[l, ..., r]` denotes the subarray of nums starting at index `l` and 
ending at the index `r`, both ends being inclusive.

The prime score of an integer `x` is equal to the number of distinct prime factors of `x`. 
For example, the prime score of `300` is `3` since `300 = 2 * 2 * 3 * 5 * 5`.

Return the maximum possible score after applying at most `k` operations.

Since the answer may be large, return it modulo $10^9 + 7$.

**Constraints:**

- `1 <= nums.length == n <= 10^5`
- `1 <= nums[i] <= 10^5`
- `1 <= k <= min(n * (n + 1) / 2, 10^9)`

## 基礎思路

題目給定一個正整數陣列 `nums` 和最多可執行的操作次數 `k`，每次操作需要從未選取過的子陣列中選出「質數分數」（即該數的不同質因數數量）最高的元素（若有多個候選者，則取最靠左的元素），並將當前分數（初始為 1）乘以該元素。我們的目標是經過最多 `k` 次操作後，獲得盡可能高的得分。

此題的難點在於直接枚舉所有可能的子陣列是不可行的（子陣列數量為 $O(n^2)$），因此需要更深入的觀察與演算法上的優化。我們透過以下幾個步驟和關鍵觀察來有效地解決此問題：

**關鍵觀察 1：質數分數的預處理**

首先注意到題目要求選擇子陣列內『質數分數最高』的元素，因此每個元素的質數分數必須事先計算完成，避免重複計算。我們透過質數篩法與質因數分解，將所有元素的質數分數預先求出來，後續直接使用。

**關鍵觀察 2：計算每個元素作為子陣列最高分元素的次數**

為了避免暴力枚舉子陣列，我們需要更有效地計算每個元素可以作為『質數分數最高』元素的子陣列數量。這裡我們使用單調棧：

- 對於每個元素，我們找到向左延伸的最遠邊界，使得在此範圍內所有元素的質數分數都「嚴格低於或等於」當前元素。
- 同理，我們也找到向右延伸的最遠邊界，使得範圍內的元素質數分數「嚴格低於」當前元素。

如此一來，對於每個元素，它能成為最高質數分數的子陣列個數即為：

$$
\text{左側可延伸範圍長度} \times \text{右側可延伸範圍長度}
$$

**關鍵觀察 3：貪心策略的應用**

我們每次操作希望獲得最大得分，因此應該優先選擇數值較大的元素作為乘數（而非僅依靠質數分數）。計算完每個元素可能作為最高質數分數的子陣列次數後，將元素依照數值從大到小排序，然後貪心地使用最高的元素乘入分數，直到操作次數用完為止。

由於每個元素可能貢獻次數超過 `k` 次，因此我們需對每個元素的可用次數設定上限，不超過剩餘可用的操作次數。

**關鍵觀察 4：模運算下的快速乘法（快速冪）**

最後一步，考量題目要求輸出模 $10^9+7$ 後的結果，並且元素貢獻可能很大，我們使用快速冪算法 (binary exponentiation) 來有效處理次方的模運算，確保效率足夠。

## 解題步驟

### Step 1：定義常數與初始化變數

首先定義模數常數 `MODULO` 以及陣列長度 `n`，作為後續步驟使用。

```typescript
const MODULO = 1000000007n;
const n = numbers.length;
```

### Step 2：預處理質數列表（Sieve 篩法）

計算小於等於 $\sqrt{\text{max(nums)}}$ 的所有質數，以利後續質因數分解。

```typescript
const maxValue = Math.max(...numbers);
const sqrtLimit = Math.floor(Math.sqrt(maxValue)) + 1;
const isPrime = new Array(sqrtLimit + 1).fill(true);
isPrime[0] = isPrime[1] = false;
const primes: number[] = [];

for (let candidate = 2; candidate <= sqrtLimit; candidate++) {
  if (isPrime[candidate]) {
    primes.push(candidate);
    for (let multiple = candidate * candidate; multiple <= sqrtLimit; multiple += candidate) {
      isPrime[multiple] = false;
    }
  }
}
```

### Step 3：計算每個數字的質數分數（含快取）

利用預計算的質數快速分解質因數，並統計不同質因數數量，結果存入快取避免重複計算。

```typescript
const distinctPrimeFactorCache = new Map<number, number>();

function countDistinctPrimeFactors(value: number): number {
  if (distinctPrimeFactorCache.has(value)) {
    return distinctPrimeFactorCache.get(value)!;
  }

  let count = 0;
  let temp = value;

  for (let i = 0, len = primes.length; i < len && primes[i] * primes[i] <= temp; i++) {
    const prime = primes[i];
    if (temp % prime === 0) {
      count++;
      while (temp % prime === 0) {
        temp = Math.floor(temp / prime);
      }
    }
  }

  if (temp > 1) count++;

  distinctPrimeFactorCache.set(value, count);
  return count;
}

const primeFactorCounts: number[] = new Array(n);
for (let index = 0; index < n; index++) {
  primeFactorCounts[index] = countDistinctPrimeFactors(numbers[index]);
}
```

### Step 4：利用單調棧計算元素左右邊界

計算每個數字可成為最高質數分數元素的子陣列範圍，分別統計其左右邊界。

```typescript
const leftBoundary: number[] = new Array(n).fill(-1);
const rightBoundary: number[] = new Array(n).fill(n);
const stack: number[] = [];

for (let index = 0; index < n; index++) {
  while (stack.length && primeFactorCounts[stack[stack.length - 1]] < primeFactorCounts[index]) {
    stack.pop();
  }
  leftBoundary[index] = stack.length ? stack[stack.length - 1] : -1;
  stack.push(index);
}

stack.length = 0;

for (let index = n - 1; index >= 0; index--) {
  while (stack.length && primeFactorCounts[stack[stack.length - 1]] <= primeFactorCounts[index]) {
    stack.pop();
  }
  rightBoundary[index] = stack.length ? stack[stack.length - 1] : n;
  stack.push(index);
}
```

### Step 5：計算每個數字作為候選元素的次數（頻率統計）

依據前一步計算的邊界，得出每個數字可作為候選元素出現的次數，考量操作上限 `k`。

```typescript
const maxOperationsBigInt = BigInt(maxOperations);
const frequencyByNumber = new Map<number, bigint>();

for (let index = 0; index < n; index++) {
  const leftOptions = BigInt(index - leftBoundary[index]);
  const rightOptions = BigInt(rightBoundary[index] - index);
  const frequency = leftOptions * rightOptions;
  const capped = frequency > maxOperationsBigInt ? maxOperationsBigInt : frequency;

  frequencyByNumber.set(
    numbers[index],
    (frequencyByNumber.get(numbers[index]) || 0n) + capped
  );
}
```

### Step 6：將元素依數值排序，以利貪心乘法

將統計後的元素依數值大小降序排列，供下一步貪心選擇最大元素。

```typescript
const aggregatedEntries = Array.from(frequencyByNumber.entries());
aggregatedEntries.sort((a, b) => b[0] - a[0]);
```

### Step 7：透過快速冪運算，計算最終得分

利用快速冪運算函數進行模乘，將每個數字的貢獻累計至最終答案，直到耗盡操作次數。

```typescript
function modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
  let result = 1n;
  base %= modulus;
  while (exponent > 0n) {
    if (exponent & 1n) {
      result = (result * base) % modulus;
    }
    base = (base * base) % modulus;
    exponent >>= 1n;
  }
  return result;
}

let finalScore = 1n;
let remainingOperations = maxOperationsBigInt;

for (const [numberValue, totalFrequency] of aggregatedEntries) {
  if (remainingOperations === 0n) break;
  const uses = totalFrequency < remainingOperations ? totalFrequency : remainingOperations;
  finalScore = (finalScore * modPow(BigInt(numberValue), uses, MODULO)) % MODULO;
  remainingOperations -= uses;
}

return Number(finalScore);
```

## 時間複雜度

- 預處理質數：$O(\sqrt{max(nums)})$
- 質因數分解：平均低於 $O(n\sqrt{max(nums)})$
- 單調棧範圍統計與頻率統計：$O(n)$
- 排序元素：$O(n \log n)$
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- 質數列表與質因數快取：$O(\sqrt{max(nums)})$
- 左右邊界、頻率統計、質數分數陣列：$O(n)$
- 總空間複雜度為 $O(n)$。

> $O(n)$
