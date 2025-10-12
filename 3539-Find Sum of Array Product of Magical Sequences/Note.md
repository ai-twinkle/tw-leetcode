# 3539. Find Sum of Array Product of Magical Sequences

You are given two integers, `m` and `k`, and an integer array `nums`.

A sequence of integers seq is called magical if:

- seq has a size of `m.`
- `0 <= seq[i] < nums.length`
- The binary representation of `2^seq[0] + 2^seq[1] + ... + 2^seq[m - 1]` has `k` set bits.

The array product of this sequence is defined as `prod(seq) = (nums[seq[0]] * nums[seq[1]] * ... * nums[seq[m - 1]])`.

Return the sum of the array products for all valid magical sequences.

Since the answer may be large, return it modulo `10^9 + 7`.

A set bit refers to a bit in the binary representation of a number that has a value of 1.

**Constraints:**

- `1 <= k <= m <= 30`
- `1 <= nums.length <= 50`
- `1 <= nums[i] <= 10^8`

## 基礎思路

本題要計算所有「魔法序列（magical sequence）」的乘積總和，定義如下：

- 長度為 `m` 的索引序列 `seq`，每個元素介於 `[0, nums.length)`。
- 將其對應的位權和表示為 `2^seq[0] + 2^seq[1] + ... + 2^seq[m-1]`。
- 若該和的二進位表示中 **恰有 `k` 個 1（set bits）**，則該序列為「魔法序列」。

我們要回傳所有魔法序列的乘積和，結果需取模 $10^9 + 7$。

在思考解法時，有幾個重點：

- **位元加總與進位的結構**：同一位若被選取多次會造成進位（例如 `2^x + 2^x = 2^{x+1}`），因此需追蹤每一層進位與累積的 1。
- **狀態轉移**：對於每個位元（索引）與其選取次數，需更新三個變數：
  `used`（已使用的次數）、`carry`（上一位進位）、`ones`（目前為 1 的個數）。
- **加速技巧**：
    - 預先計算組合數表 $C(n,k)$。
    - 預先建立 popcount 表，計算整數中 1 的數量。
    - 使用壓平的 DP（3 維轉 1 維索引）節省記憶體。
- **最終處理**：計算完所有索引後，殘餘進位中的 1 也需加入總數判斷。

## 解題步驟

### Step 1：全域變數與常數宣告

宣告模數常數、上限值及快取變數，用以保存組合數表與 popcount。

```typescript
const MOD_BIGINT = 1000000007n;
const MAX_M = 30;

let globalCombination: BigInt64Array | null = null;      // C(n,k) 組合表（扁平化）
let globalCombinationRowStart: Int32Array | null = null; // 各列起始位置
let globalPopcount: Uint8Array | null = null;            // 預先計算 0..MAX_M 的 popcount
```

### Step 2：輔助函數1 — 模運算與組合數預處理

包含模乘法與組合數表建立。

```typescript
/**
 * 以 BigInt 進行乘法並取模。
 * @param a 左乘數
 * @param b 右乘數
 * @returns (a * b) % MOD_BIGINT
 */
function multiplyModulo(a: bigint, b: bigint): bigint {
  return (a * b) % MOD_BIGINT;
}

/**
 * 建立扁平化組合表 C(n, k)。
 * 使用帕斯卡三角形遞推關係，0 <= n <= MAX_M。
 */
function ensureGlobalCombination(): void {
  if (globalCombination !== null) {
    return;
  }

  let totalSize = 0;
  for (let n = 0; n <= MAX_M; n += 1) {
    totalSize += (n + 1);
  }

  const combination = new BigInt64Array(totalSize);
  const rowStart = new Int32Array(MAX_M + 1);

  let currentIndex = 0;
  for (let n = 0; n <= MAX_M; n += 1) {
    rowStart[n] = currentIndex;
    for (let k = 0; k <= n; k += 1) {
      if (k === 0 || k === n) {
        combination[currentIndex] = 1n;
      } else {
        combination[currentIndex] =
          (combination[rowStart[n - 1] + (k - 1)] + combination[rowStart[n - 1] + k]) % MOD_BIGINT;
      }
      currentIndex += 1;
    }
  }

  globalCombination = combination;
  globalCombinationRowStart = rowStart;
}
```

### Step 3：輔助函數2 — Popcount 與 DP 索引壓平

建立 0...MAX_M 的 popcount 表與 DP 三維索引壓平函數。

```typescript
/**
 * 建立 0...MAX_M 的 popcount 表，用於結尾進位補正。
 */
function ensureGlobalPopcount(): void {
  if (globalPopcount !== null) {
    return;
  }

  const popcountArray = new Uint8Array(MAX_M + 1);
  for (let value = 0; value <= MAX_M; value += 1) {
    let bitValue = value;
    let bitCount = 0;
    while (bitValue > 0) {
      bitValue &= (bitValue - 1);
      bitCount += 1;
    }
    popcountArray[value] = bitCount as number;
  }
  globalPopcount = popcountArray;
}

/**
 * 壓平成一維索引。
 * @param numberUsed 已使用的元素數量
 * @param carry 當前進位值
 * @param onesCount 已產生的 1 的數量
 * @param carryDimension carry 維度大小
 * @param onesDimension ones 維度大小
 * @returns 在一維 DP 陣列中的位置
 */
function dpIndex(
  numberUsed: number,
  carry: number,
  onesCount: number,
  carryDimension: number,
  onesDimension: number
): number {
  return ((numberUsed * carryDimension) + carry) * onesDimension + onesCount;
}
```

### Step 4：DP 初始化與主迴圈框架

初始化狀態空間，設定滾動 DP 層，逐個索引更新。

```typescript
function magicalSum(m: number, k: number, nums: number[]): number {
  // 準備全域組合數表與 popcount 表
  ensureGlobalCombination();
  ensureGlobalPopcount();

  const combination = globalCombination as BigInt64Array;
  const rowStart = globalCombinationRowStart as Int32Array;
  const popcount = globalPopcount as Uint8Array;

  const numsLength = nums.length;
  const totalUsedDimension = m + 1;
  const carryDimension = m + 1;
  const onesDimension = k + 1;

  const totalStates = totalUsedDimension * carryDimension * onesDimension;
  let currentDp = new BigInt64Array(totalStates);
  let nextDp = new BigInt64Array(totalStates);

  const powerArray = new BigInt64Array(m + 1);
  const weightArray = new BigInt64Array(m + 1);

  // 初始狀態：未選任何元素、進位 0、1 的數量 0
  currentDp[dpIndex(0, 0, 0, carryDimension, onesDimension)] = 1n;
  
  // ...
}
```

### Step 5：DP 轉移邏輯與結果統計

對每個索引進行 DP 轉移，最後依照殘餘進位 popcount 匯總結果。

```typescript
function magicalSum(m: number, k: number, nums: number[]): number {
  // Step 4：DP 初始化與主迴圈框架

  // 逐一處理 nums 每個索引（對應位元）
  for (let index = 0; index < numsLength; index += 1) {
    nextDp.fill(0n);

    const currentBase = BigInt(nums[index]) % MOD_BIGINT;

    for (let numberUsed = 0; numberUsed <= m; numberUsed += 1) {
      const remaining = m - numberUsed;
      const carryLimit = numberUsed >> 1;
      const onesLimit = Math.min(k, numberUsed);

      // 預先計算 currentBase 的各次冪
      powerArray[0] = 1n;
      for (let count = 1; count <= remaining; count += 1) {
        powerArray[count] = multiplyModulo(powerArray[count - 1], currentBase);
      }

      // 預先計算 C(remaining, c) * base^c 權重
      const row = rowStart[remaining];
      for (let chooseCount = 0; chooseCount <= remaining; chooseCount += 1) {
        weightArray[chooseCount] = multiplyModulo(combination[row + chooseCount], powerArray[chooseCount]);
      }

      // 遍歷 DP 狀態
      for (let carry = 0; carry <= carryLimit; carry += 1) {
        for (let onesCount = 0; onesCount <= onesLimit; onesCount += 1) {
          const currentIndex = dpIndex(numberUsed, carry, onesCount, carryDimension, onesDimension);
          const currentWays = currentDp[currentIndex];
          if (currentWays === 0n) continue;

          // 枚舉當前索引被選取次數
          for (let chooseCount = 0; chooseCount <= remaining; chooseCount += 1) {
            const totalAtBit = carry + chooseCount;
            const additionalBit = totalAtBit & 1;
            const newOnes = onesCount + additionalBit;
            if (newOnes > k) continue;

            const newCarry = totalAtBit >> 1;
            const newUsed = numberUsed + chooseCount;

            const dest = dpIndex(newUsed, newCarry, newOnes, carryDimension, onesDimension);
            const contribution = multiplyModulo(currentWays, weightArray[chooseCount]);
            nextDp[dest] = (nextDp[dest] + contribution) % MOD_BIGINT;
          }
        }
      }
    }

    // 滾動更新
    const temp = currentDp;
    currentDp = nextDp;
    nextDp = temp;
  }

  // ...
}
```

### Step 6：結算與回傳結果

```typescript
function magicalSum(m: number, k: number, nums: number[]): number {
  // Step 4：DP 初始化與主迴圈框架
  
  // Step 5：DP 轉移邏輯與結果統計

  // 結算：加上殘餘進位 popcount 的影響
  let result = 0n;
  const carryUpperLimit = (m >> 1) + 1;
  for (let carry = 0; carry <= carryUpperLimit && carry <= m; carry += 1) {
    const extraOnes = popcount[carry];
    const requiredOnesBefore = k - extraOnes;
    if (requiredOnesBefore < 0 || requiredOnesBefore > k) continue;

    const finalIndex = dpIndex(m, carry, requiredOnesBefore, carryDimension, onesDimension);
    result = (result + currentDp[finalIndex]) % MOD_BIGINT;
  }

  return Number(result);
}
```

## 時間複雜度

- 設 `n = nums.length`，對每個索引進行 DP 更新。
- 單次索引的 DP 狀態空間為 `O(m^2 * k)`，每層轉移枚舉最多 `O(m)` 次。
- 總時間複雜度為 $O(n \cdot m^3 \cdot k)$。

> $O(n \cdot m^3 \cdot k)$

## 空間複雜度

- DP 陣列需儲存 `(m+1) × (m+1) × (k+1)` 狀態。
- 外加常數級暫存陣列與預處理表。
- 總空間複雜度為 $O(m^2 \cdot k)$。

> $O(m^2 \cdot k)$
