# 3343. Count Number of Balanced Permutations

You are given a string `num`. 
A string of digits is called balanced if the sum of the digits at even indices is equal to the sum of the digits at odd indices.

Return the number of distinct permutations of `num` that are balanced.

Since the answer may be very large, return it modulo $10^9 + 7$.

A permutation is a rearrangement of all the characters of a string.

**Constraints:**

- `2 <= num.length <= 80`
- `num` consists of digits `'0'` to `'9'` only.

## 基礎思路

本題要求計算字串 `num` 所有排列中，**偶數索引位**與**奇數索引位**上數字和相等的「平衡排列」數量。
由於排列數量可能非常龐大，我們需在模 $10^9 + 7$ 下求解。整體可以拆解為兩個主要步驟：

1. **數位選擇（組合階段）**
   我們必須從 `num` 中挑選出剛好放在偶數索引位置的數字，且這些數字的總和等於所有數字總和的一半。
   這個問題可以建模為一個**受限背包問題（bounded knapsack）**：

    - 要選擇 $\lceil n/2\rceil$ 個數字（對應偶數索引個數）；
    - 總和必須是 $\frac{1}{2}\sum_{\text{所有數字}}d$；
    - 每個數字 $d \in [0,9]$ 最多可使用其在 `num` 中出現的次數。

2. **排列計數與重複修正（排列階段）**
   找到所有滿足條件的組合後，我們需考慮這些數字在對應位置上的排列方式。將：

    - 偶數位上的數字進行全排列，共 $(\lceil n/2\rceil)!$ 種；
    - 奇數位上的剩餘數字也做全排列，共 $(\lfloor n/2\rfloor)!$ 種；
    - 但由於數字中可能有重複，我們還需除以每個數字頻次的階乘，避免重複計數。

為了高效計算組合數 $\binom{n}{k}$ 與階乘除法，我們會預先建立模 $10^9 + 7$ 下的**階乘表**與**逆元表**，並透過**費馬小定理**實現快速反元素計算。

最終答案可表示為下式：

$$
\left(\text{waysToPickTarget} \times (\lceil n/2\rceil)! \times (\lfloor n/2\rfloor)! \right) \div \prod_{d=0}^{9}(\text{freq}[d]!) \pmod{10^9+7}
$$

## 解題步驟

### Step 1：構建階乘與反階乘表

在此步，我們要預先計算從 0 到 `MAX_DIGITS` 的階乘與逆元階乘，方便後續快速求組合數 $\binom{n}{k}$。
這樣可以將任意 $n$、$k$ 的組合計算降到 $O(1)$，使得效率大幅提升。

```typescript
const MODULUS = 1000000007n;
const MAX_DIGITS = 80;

// 步驟 1：構建階乘與反階乘表，用於快速計算 nCr
//     factorials[k] = k! mod MODULUS
//     inverseFactorials[k] = (k!)^{-1} mod MODULUS
const factorials = Array<bigint>(MAX_DIGITS + 1).fill(0n);
const inverseFactorials = Array<bigint>(MAX_DIGITS + 1).fill(0n);
factorials[0] = 1n;

for (let index = 1; index <= MAX_DIGITS; index++) {
  // 將前一項階乘乘以當前索引並取模
  factorials[index] = (factorials[index - 1] * BigInt(index)) % MODULUS;
}
```

### Step 2：快速冪函數

為了計算大數的模反元，我們利用費馬小定理：$a^{-1}\equiv a^{p-2}\bmod p$。此處實作二分冪（binary exponentiation），在 $O(\log \text{exponent})$ 時間內完成模冪。

```typescript
/**
 * 快速冪（binary exponentiation）計算模冪
 * 使用指數平方法，使計算時間為 O(log exponentValue)。
 *
 * @param baseValue {bigint} - 底數
 * @param exponentValue {bigint} - 指數
 * @returns baseValue^exponentValue mod MODULUS
 */
const computeModularPower = (baseValue: bigint, exponentValue: bigint): bigint => {
  let resultValue = 1n;
  let currentBase = baseValue % MODULUS;
  let currentExponent = exponentValue;

  while (currentExponent > 0n) {
    if (currentExponent & 1n) {
      // 若當前位為1，乘入結果並取模
      resultValue = (resultValue * currentBase) % MODULUS;
    }
    // 底數平方並取模，處理下一位
    currentBase = (currentBase * currentBase) % MODULUS;
    currentExponent >>= 1n;
  }
  return resultValue;
};
```

### Step 3：計算反階乘表

運用剛才的快速冪函數，我們先計算 `MAX_DIGITS!` 的逆元，然後依次推導其餘逆階乘。
這樣可在常數時間內獲得任意 $(k!)^{-1}\bmod p$。

```typescript
// 依據費馬小定理，a^(p-1) ≡ 1 mod p => a^(p-2) ≡ a^{-1}
inverseFactorials[MAX_DIGITS] = computeModularPower(factorials[MAX_DIGITS], MODULUS - 2n);
for (let index = MAX_DIGITS; index >= 1; index--) {
  // 使用關係：invFact[k-1] = invFact[k] * k mod MODULUS
  inverseFactorials[index - 1] = (inverseFactorials[index] * BigInt(index)) % MODULUS;
}
```

### Step 4：統計數位頻次與總和

首先讀取輸入字串，統計每個數字出現的次數，並累加所有數字之和。
- 若總和為奇數或超出偶數位和的最大可能值（$\lceil n/2\rceil\times9$），可直接返回 0。

```typescript
const totalDigits = numberString.length;
const numberOfEvenPositions = Math.ceil(totalDigits / 2); // 偶數位數量
const numberOfOddPositions = totalDigits - numberOfEvenPositions;

const digitFrequencies = new Array<number>(10).fill(0);
let totalSumOfDigits = 0;
for (const character of numberString) {
  const digitValue = character.charCodeAt(0) - 48;
  digitFrequencies[digitValue]++;
  totalSumOfDigits += digitValue;
}

// 若總和為奇數，無法平分，提前返回 0
if (totalSumOfDigits % 2 !== 0) {
  return 0;
}
const halfSumTarget = totalSumOfDigits / 2;

// 若目標和超出偶數位最大可能（每位最多9）的範圍，提前返回 0
if (halfSumTarget > numberOfEvenPositions * 9) {
  return 0;
}
```

### Step 5：初始化 DP 表

我們使用二維 DP，`dpCurrent[count][sum]` 表示「已選取 `count` 個數字，其總和為 `sum` 的方案數」。

初始化時，只選 0 個數字、總和為 0 的方案數為 1。

```typescript
// dpCurrent[count][sum] = 選取 count 個數字，總和為 sum 的方案數
let dpTableCurrent = Array.from(
  { length: numberOfEvenPositions + 1 },
  () => Array<bigint>(halfSumTarget + 1).fill(0n)
);
let dpTableNext = Array.from(
  { length: numberOfEvenPositions + 1 },
  () => Array<bigint>(halfSumTarget + 1).fill(0n)
);
dpTableCurrent[0][0] = 1n; // 基底：選0個數字，和為0，有1種方案
```

### Step 6：受限背包（bounded knapsack）轉移

針對每個數字 $d$，最多可選取其頻次次。先預計算對應的組合數 $C(\text{freq},k)$，再將其併入 DP 轉移，保證選取數量及總和均受限。

```typescript
for (let digitValue = 0; digitValue <= 9; digitValue++) {
  const frequency = digitFrequencies[digitValue];
  if (frequency === 0) {
    continue;
  }

  // 預計算 C(frequency, k)
  const binomialCoefficients = Array<bigint>(frequency + 1).fill(0n);
  for (let k = 0; k <= frequency; k++) {
    binomialCoefficients[k] =
      (factorials[frequency] * inverseFactorials[k] % MODULUS) *
      inverseFactorials[frequency - k] % MODULUS;
  }

  // 重置下一表
  for (let count = 0; count <= numberOfEvenPositions; count++) {
    dpTableNext[count].fill(0n);
  }

  // 轉移：對於當前每個狀態，嘗試添加 0..maxAdditional 個當前 digit
  for (let count = 0; count <= numberOfEvenPositions; count++) {
    for (let currentSum = 0; currentSum <= halfSumTarget; currentSum++) {
      const currentWays = dpTableCurrent[count][currentSum];
      if (currentWays === 0n) {
        continue;
      }

      const maxAdditional = Math.min(frequency, numberOfEvenPositions - count);
      for (let tryCount = 0; tryCount <= maxAdditional; tryCount++) {
        const newCount = count + tryCount;
        const newSum = currentSum + tryCount * digitValue;
        if (newSum > halfSumTarget) {
          break;
        }
        dpTableNext[newCount][newSum] =
          (dpTableNext[newCount][newSum] + currentWays * binomialCoefficients[tryCount]) % MODULUS;
      }
    }
  }

  // 交換表格以備下一輪
  [dpTableCurrent, dpTableNext] = [dpTableNext, dpTableCurrent];
}
```

### Step 7：取得目標方案數

經過所有數字的轉移後，`dpCurrent[numberOfEvenPositions][halfSumTarget]` 即為「從所有數字中選出恰好放在偶數位，且總和為目標值」的方案數。

```typescript
const waysToPickTarget = dpTableCurrent[numberOfEvenPositions][halfSumTarget];
if (waysToPickTarget === 0n) {
  return 0;
}
```

### Step 8：計算最終排列數並修正重複

最後一步，將選中放在偶數位的那半組合乘上偶數位與奇數位的全排列，再除以重複數字的階乘，消除相同數字互換的重複計數。

```typescript
// 將偶數位與奇數位的排列全排列相乘
let totalArrangements =
  (waysToPickTarget * factorials[numberOfEvenPositions] % MODULUS) *
  factorials[numberOfOddPositions] % MODULUS;

// 除以每個數字的重複排列數
for (let d = 0; d <= 9; d++) {
  totalArrangements = (totalArrangements * inverseFactorials[digitFrequencies[d]]) % MODULUS;
}

// 最後轉回 Number
return Number(totalArrangements);
```

## 時間複雜度

- **階乘與反階乘表構建**：$O(\text{MAX_DIGITS})$，其中 $\text{MAX_DIGITS}=80$。
- **受限背包 DP 轉移**：遍歷 10 個數字，每次最壞需處理 $O(\lceil n/2\rceil\times \tfrac{9n}{2})$ 狀態，總計 $O(n^3)$，此處 $n=\text{num.length}$。
- **總時間複雜度為** $O(n^3)$。

> $O(n^3)$

## 空間複雜度

- **階乘與反階乘表**：$O(\text{MAX_DIGITS})$。
- **DP 表格**：$O(\lceil n/2\rceil \times \tfrac{9n}{2}) = O(n^2)$。
- **總空間複雜度為** $O(n^2)$。

> $O(n^2)$
