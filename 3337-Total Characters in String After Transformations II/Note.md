# 3337. Total Characters in String After Transformations II

You are given a string `s` consisting of lowercase English letters, 
an integer `t` representing the number of transformations to perform, 
and an array `nums` of size 26. 
In one transformation, every character in `s` is replaced according to the following rules:

- Replace `s[i]` with the next `nums[s[i] - 'a']` consecutive characters in the alphabet. 
  For example, if `s[i] = 'a'` and `nums[0] = 3`, the character `'a'` transforms into the next 3 consecutive characters ahead of it, 
  which results in `"bcd"`.
- The transformation wraps around the alphabet if it exceeds `'z'`. 
  For example, if `s[i] = 'y'` and `nums[24] = 3`, the character `'y'` transforms into the next 3 consecutive characters ahead of it, which results in `"zab"`.

Return the length of the resulting string after exactly `t` transformations.

Since the answer may be very large, return it modulo $10^9 + 7$.

**Constraints:**

- `1 <= s.length <= 10^5`
- `s` consists only of lowercase English letters.
- `1 <= t <= 10^9`
- `nums.length == 26`
- `1 <= nums[i] <= 25`

## 基礎思路

本題關鍵在於注意到**直接模擬每次轉換**會使字串長度呈**指數級增長**，導致計算量爆炸，明顯不現實。
因此，為解決此類「重複執行大量轉換」的問題，必須思考以下兩個高階概念：

1. **字元獨立轉換性質**：

   - 每個字母在轉換過程中是獨立的，不會受到其他字母位置或排列的影響。
   - 因此，我們只需關注**字母的數量**，而非整個字串本身，這樣就能將問題降維至 26 個字母的數量變化。

2. **轉換的數學本質（矩陣運算）**：

   - 字母轉換可以抽象為一個 26 維的**狀態向量**，每次轉換則是一個**固定的線性變換**（可用矩陣表示）。
   - 如果轉換次數較小（如 $t \leq 10^4$），可以直接透過迭代方法模擬狀態變化。
   - 然而，由於本題轉換次數上限極大 ($10^9$)，必須考慮高效的**矩陣快速冪**方法來處理高次冪運算。

因此，本題的精髓在於：

- 以**字母頻率向量**取代實際字串，降低問題複雜度。
- 透過構造**26×26 的轉移矩陣**，將問題轉化為**矩陣指數運算**，並使用快速冪方法求解，讓問題可在可接受的時間內被解決。

## 解題步驟

### Step 1：初始化字母頻率向量

由於各字母轉換是獨立的，我們首先計算字串 `s` 中每個字母的初始數量。

```typescript
const MOD = 1_000_000_007;
const ALPHABET_SIZE = 26;

// 統計字母初始頻率
const initialFrequencies = new Uint32Array(ALPHABET_SIZE);
for (let i = 0; i < s.length; i++) {
  initialFrequencies[s.charCodeAt(i) - 97]++;
}
```

### Step 2：處理轉換次數較小的情況（直接模擬法）

當轉換次數較小時（如 $t \leq 10^4$），直接模擬是足夠高效且簡單的方法：

* 每輪將目前字母頻率依照規則分散到下一輪的字母頻率中。
* 每次透過 modulo 運算控制數值大小避免溢位。

```typescript
if (t <= 10_000) {
  let currentFrequencies = new Uint32Array(initialFrequencies);
  let nextFrequencies = new Uint32Array(ALPHABET_SIZE);

  for (let step = 0; step < t; step++) {
    nextFrequencies.fill(0); // 清空下一輪頻率

    // 每個字母的頻率分散
    for (let letterIndex = 0; letterIndex < ALPHABET_SIZE; letterIndex++) {
      const count = currentFrequencies[letterIndex];
      if (count !== 0) {
        const reachSpan = nums[letterIndex]; // 目前字母可擴展的字母數
        for (let offset = 1; offset <= reachSpan; offset++) {
          const targetIndex = (letterIndex + offset) % ALPHABET_SIZE;
          nextFrequencies[targetIndex] = (nextFrequencies[targetIndex] + count) % MOD;
        }
      }
    }

    // 更新至下一次迭代
    [currentFrequencies, nextFrequencies] = [nextFrequencies, currentFrequencies];
  }

  // 計算頻率總和即為答案
  let totalLength = 0;
  for (let frequency of currentFrequencies) {
    totalLength = (totalLength + frequency) % MOD;
  }
  return totalLength;
}
```

### Step 3：轉換次數較大情況（矩陣快速冪）

若轉換次數較大（如 $t > 10^4$），直接模擬效率極差。此時我們改採用矩陣快速冪方法：

- 將一次轉換抽象為 26×26 的矩陣乘法運算。
- 透過快速冪演算法有效計算矩陣的高次方，避免暴力計算。

#### Step 3.1 建立一次轉換的基礎矩陣：

```typescript
const MOD_BIGINT = BigInt(MOD);
const MATRIX_SIZE = ALPHABET_SIZE * ALPHABET_SIZE;

const baseMatrix = Array<bigint>(MATRIX_SIZE).fill(0n);
for (let source = 0; source < ALPHABET_SIZE; source++) {
  for (let offset = 1; offset <= nums[source]; offset++) {
    const target = (source + offset) % ALPHABET_SIZE;
    baseMatrix[target * ALPHABET_SIZE + source] += 1n;
  }
}
```

#### Step 3.2 準備矩陣快速冪所需的變數：

```typescript
let transitionMatrix = baseMatrix.slice();  // 轉移矩陣
let frequencyVector = Array.from(initialFrequencies, (count) => BigInt(count)); // 初始狀態向量
const intermediateMatrix = Array<bigint>(MATRIX_SIZE).fill(0n);   // 暫存矩陣
const intermediateVector = Array<bigint>(ALPHABET_SIZE).fill(0n); // 暫存向量

let exponent = BigInt(t);
```

#### Step 3.3 執行矩陣快速冪：

```typescript
while (exponent > 0n) {
  if (exponent & 1n) { // 若指數的此位為1，則向量乘上轉移矩陣
    for (let row = 0; row < ALPHABET_SIZE; row++) {
      let accumulator = 0n;
      const rowStart = row * ALPHABET_SIZE;
      for (let col = 0; col < ALPHABET_SIZE; col++) {
        const value = transitionMatrix[rowStart + col];
        if (value !== 0n) {
          accumulator += value * frequencyVector[col];
        }
      }
      intermediateVector[row] = accumulator % MOD_BIGINT;
    }
    frequencyVector = intermediateVector.slice();
  }

  // 平方轉移矩陣
  intermediateMatrix.fill(0n);
  for (let row = 0; row < ALPHABET_SIZE; row++) {
    const rowStart = row * ALPHABET_SIZE;
    for (let mid = 0; mid < ALPHABET_SIZE; mid++) {
      const multiplier = transitionMatrix[rowStart + mid];
      if (multiplier !== 0n) {
        const midStart = mid * ALPHABET_SIZE;
        for (let col = 0; col < ALPHABET_SIZE; col++) {
          intermediateMatrix[rowStart + col] += multiplier * transitionMatrix[midStart + col];
        }
      }
    }
    for (let col = 0; col < ALPHABET_SIZE; col++) {
      intermediateMatrix[rowStart + col] %= MOD_BIGINT;
    }
  }
  transitionMatrix = intermediateMatrix.slice();
  exponent >>= 1n; // 指數除2
}
```

### Step 4. 計算答案：

```typescript
let finalSum = 0n;
for (let value of frequencyVector) {
  finalSum += value;
}
return Number(finalSum % MOD_BIGINT);
```

## 時間複雜度

- 小 $t$ 情境直接模擬：每次轉換最多 $26\times25$ 次操作，共 $O(t)$。
- 大 $t$ 情境矩陣快速冪：一次矩陣乘法為 $O(26^3)$，共需 $O(\log t)$ 次。
- 總時間複雜度為 $O(\min(t,10^4) + 26^3\log t)$。

> $O(\min(t,10^4) + \log t)$

## 空間複雜度

- 僅使用固定大小矩陣（26×26）及數個26元素陣列。
- 總空間複雜度為常數 $O(1)$。

> $O(1)$
