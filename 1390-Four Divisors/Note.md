# 1390. Four Divisors

Given an integer array `nums`, return the sum of divisors of the integers in that array that have exactly four divisors. 
If there is no such integer in the array, return `0`.

**Constraints:**

- `1 <= nums.length <= 10^4`
- `1 <= nums[i] <= 10^5`

## 基礎思路

本題要找出陣列中「恰好有四個正因數」的整數，並把這些整數的因數總和加總後回傳。

在思考解法時，我們需注意以下關鍵性質：

* **恰好四個因數的數字型態很有限**：
  一個正整數若恰好有四個正因數，只可能是：

    1. **質數的三次方**：$n = p^3$，其因數為 $1, p, p^2, p^3$。
    2. **兩個不同質數的乘積**：$n = p \cdot q$ 且 $p \ne q$，其因數為 $1, p, q, pq$。

* **大量查詢時應避免逐一分解因數**：
  直接對每個輸入值做試除找因數，對長度最多 $10^4$ 的陣列會造成不必要的成本。

為了兼顧效率，我們可以採用以下策略：

* **一次性預處理成查表**：在值域上限內，把所有符合「四因數」條目的因數總和預先存入查表，其餘設為 $0$。
* **查詢階段只做 $O(1)$ 查表累加**：線性掃描輸入陣列，每個值直接取查表並累加即可。

## 解題步驟

### Step 1：常數上限與全域查表初始化

先定義輸入值域上限，並在模組載入時就完成查表預處理，讓主函式可以直接 $O(1)$ 查詢。

```typescript
const MAXIMUM_NUM_VALUE = 100000;
const sumOfDivisorsForNumbersWithFourDivisors =
  precomputeFourDivisorSums(MAXIMUM_NUM_VALUE);
```

### Step 2：輔助函式 `precomputeFourDivisorSums` — 篩出所有質數

用埃氏篩建立質數表，後續才能枚舉 $p^3$ 與 $p \cdot q$ 兩種四因數型態。

```typescript
/**
 * 預先計算「恰好四個因數」的整數之因數總和。
 * 讓主函式能以 O(1) 查表回應每個輸入值。
 *
 * @param maxValue 輸入值上限
 * @returns 查表：index = 整數，value = 因數總和（不符合則為 0）
 */
function precomputeFourDivisorSums(maxValue: number): Int32Array {
  // 使用 Uint8Array 作為快速且省記憶體的布林陣列，用於篩法標記合數
  const isComposite = new Uint8Array(maxValue + 1);

  // 預先配置質數緩衝區，避免動態陣列擴容的額外成本
  const primeBuffer = new Int32Array(maxValue);
  let primeCount = 0;

  // 埃氏篩：產生 1..maxValue 的所有質數
  for (let candidate = 2; candidate <= maxValue; candidate++) {
    if (isComposite[candidate] === 0) {
      primeBuffer[primeCount] = candidate;
      primeCount++;

      // 從 candidate² 開始標記，避免重複工作
      const candidateSquared = candidate * candidate;
      if (candidateSquared <= maxValue) {
        for (
          let multiple = candidateSquared;
          multiple <= maxValue;
          multiple += candidate
        ) {
          isComposite[multiple] = 1;
        }
      }
    }
  }

  // ...
}
```

### Step 3：在同一函式中建立裁切後的質數清單與查表容器

把質數緩衝區裁切為實際質數長度，並建立查表（預設 0）。

```typescript
function precomputeFourDivisorSums(maxValue: number): Int32Array {
  // Step 2：輔助函式 `precomputeFourDivisorSums` — 篩出所有質數

  // 建立裁切後的質數視圖，避免未使用容量
  const primes = primeBuffer.subarray(0, primeCount);

  // 只對符合「四因數」的數字存因數總和，其餘保留 0
  const divisorSumLookup = new Int32Array(maxValue + 1);

  // ...
}
```

### Step 4：在同一函式中處理型態一 `p^3`

枚舉所有質數 $p$，只要 $p^3 \le maxValue$ 就把 $1 + p + p^2 + p^3$ 存入查表。

```typescript
function precomputeFourDivisorSums(maxValue: number): Int32Array {
  // Step 2：輔助函式 `precomputeFourDivisorSums` — 篩出所有質數

  // Step 3：在同一函式中建立裁切後的質數清單與查表容器

  // 情況一：形如 p³ 的數字（唯一會有四因數的質數冪次）
  for (let primeIndex = 0; primeIndex < primes.length; primeIndex++) {
    const primeValue = primes[primeIndex];
    const primeSquared = primeValue * primeValue;
    const primeCubed = primeSquared * primeValue;

    // 提早中止可避免不必要的溢位檢查與迭代
    if (primeCubed > maxValue) {
      break;
    }

    // 直接存入因數總和，供後續 O(1) 查表
    divisorSumLookup[primeCubed] =
      1 + primeValue + primeSquared + primeCubed;
  }

  // ...
}
```

### Step 5：在同一函式中處理型態二 `p * q`（p≠q），最後回傳查表

用遞增有序的質數對確保每個乘積只處理一次；若乘積超出上限則可直接停止內層迴圈。

```typescript
function precomputeFourDivisorSums(maxValue: number): Int32Array {
  // Step 2：輔助函式 `precomputeFourDivisorSums` — 篩出所有質數

  // Step 3：在同一函式中建立裁切後的質數清單與查表容器

  // Step 4：在同一函式中處理型態一 `p^3`

  // 情況二：形如 p * q（p ≠ q）的數字
  // 使用有序質數對可確保每個數字只會被處理一次
  for (let firstPrimeIndex = 0; firstPrimeIndex < primes.length; firstPrimeIndex++) {
    const firstPrime = primes[firstPrimeIndex];

    for (
      let secondPrimeIndex = firstPrimeIndex + 1;
      secondPrimeIndex < primes.length;
      secondPrimeIndex++
    ) {
      const secondPrime = primes[secondPrimeIndex];
      const product = firstPrime * secondPrime;

      // 質數遞增，因此後續乘積一定更大，可直接中止
      if (product > maxValue) {
        break;
      }

      // 存入因數總和，供查詢階段快速取用
      divisorSumLookup[product] =
        1 + firstPrime + secondPrime + product;
    }
  }

  return divisorSumLookup;
}
```

### Step 6：主函式 `sumFourDivisors` — 線性掃描並查表累加

查表中不符合者為 0，因此只要把每個輸入值對應的查表值累加即可。

```typescript
/**
 * 回傳輸入陣列中所有「恰好四個因數」的整數之因數總和累加值。
 *
 * @param nums 輸入整數陣列
 * @returns 符合條件者的因數總和之總和
 */
function sumFourDivisors(nums: number[]): number {
  const divisorSumLookup = sumOfDivisorsForNumbersWithFourDivisors;

  let totalSum = 0;

  // 線性掃描 + O(1) 查表，確保最佳執行效率
  for (let index = 0; index < nums.length; index++) {
    const value = nums[index];
    totalSum += divisorSumLookup[value];
  }

  return totalSum;
}
```

## 時間複雜度

- 預處理（一次性）包含篩法產生質數、枚舉 $p^3$、以及枚舉 $p \cdot q$。
- 篩法產生質數為 $O(M \log \log M)$，其中 $M = 100000$。
- 枚舉 $p^3$ 的迭代次數不超過 $\lfloor \sqrt[3]{M} \rfloor$，為 $O(\sqrt[3]{M})$。
- 枚舉 $p \cdot q$ 的迭代次數可用「質數倒數和」上界：

  $$
  \sum_{p \le M} O(\frac{M}{p})
  \;\subseteq\;
  O(M \sum_{p \le M} \frac{1}{p})
  \;=\;
  O(M \log \log M)
  $$

- 單次查詢掃描陣列並查表累加為 $O(n)$，其中 $n$ 為輸入陣列長度 `nums.length`。
- 總時間複雜度為 $O(M \log \log M + n)$。

> $O(M \log \log M + n)$

## 空間複雜度

- 預處理使用 `isComposite`、`primeBuffer`、`divisorSumLookup`，皆為 $O(M)$。
- 查詢階段僅使用常數個變數，為 $O(1)$。
- 總空間複雜度為 $O(M)$。

> $O(M)$
