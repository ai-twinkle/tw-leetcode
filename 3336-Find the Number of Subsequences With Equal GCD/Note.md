# 3336. Find the Number of Subsequences With Equal GCD

You are given an integer array `nums`.

Your task is to find the number of pairs of non-empty subsequences `(seq1, seq2)` of `nums` 
that satisfy the following conditions:

- The subsequences `seq1` and `seq2` are disjoint, meaning no index of `nums` is common between them.
- The GCD of the elements of `seq1` is equal to the GCD of the elements of `seq2`.

Return the total number of such pairs.

Since the answer may be very large, return it modulo `10^9 + 7`.

**Constraints:**

- `1 <= nums.length <= 200`
- `1 <= nums[i] <= 200`

## 基礎思路

本題要求計算陣列中所有「互斥且非空」的子序列配對 `(seq1, seq2)` 數量，且兩者元素的 GCD 必須相等。由於配對數量可能極為龐大，最終需對 `10^9 + 7` 取模。

由於直接列舉所有子序列配對的複雜度呈指數級增長，無法在合理時間內完成，因此需要藉助動態規劃來壓縮狀態空間。可掌握以下核心觀察：

- **子序列的關鍵資訊僅剩其 GCD**：
  對於配對條件而言，我們並不在意子序列具體包含哪些元素，只在意兩個子序列各自的 GCD 為何。因此可將「已選元素的集合」抽象為「當前的 GCD 值」，大幅壓縮狀態。

- **元素值域有限，GCD 種類亦有限**：
  由於元素值介於 `1` 到 `200`，兩個子序列的 GCD 組合可被編碼為一個二維狀態，狀態總數受限於值域的平方，屬於可接受範圍。

- **每個元素僅有三種歸屬**：
  對每一個元素，它只能屬於第一個子序列、第二個子序列、或兩者皆不屬於。因此可逐一掃描每個元素，將前一層的所有狀態依這三種決策轉移到新一層。

- **空子序列需以特殊值標記**：
  當子序列尚未加入任何元素時，其 GCD 尚未定義，需以特殊值（`0`）表示空狀態，並在加入第一個元素時直接以該元素值作為初始 GCD。

依據以上特性，可以採用以下策略：

- **預先建立完整的 GCD 查表**，使得 DP 過程中每次 GCD 查詢皆為常數時間，避免重複計算輾轉相除。
- **以「兩個子序列的 GCD 組合」為狀態，逐元素進行三分支轉移**，並利用稀疏狀態列表僅追蹤有效（非零計數）的狀態以加速。
- **最終彙總兩個子序列皆非空且 GCD 相等的狀態計數**，即為答案。

## 解題步驟

### Step 1：預先建立完整的 GCD 查表

為使 DP 過程中每次 GCD 查詢皆為常數時間，先以輾轉相除法對所有可能的數值配對計算 GCD，並將結果攤平存入一維查表中，透過 `firstValue * STRIDE + secondValue` 進行索引。

```typescript
const MODULO = 1000000007;
const MAX_VALUE = 200;
const STRIDE = MAX_VALUE + 1;
const TABLE_SIZE = STRIDE * STRIDE;

// 預先建立完整的 GCD 查表，使 DP 中每次 gcd 查詢皆為 O(1)。
const gcdTable = new Int32Array(TABLE_SIZE);
for (let firstValue = 0; firstValue <= MAX_VALUE; firstValue++) {
  for (let secondValue = 0; secondValue <= MAX_VALUE; secondValue++) {
    let a = firstValue;
    let b = secondValue;
    while (b !== 0) {
      const remainder = a % b;
      a = b;
      b = remainder;
    }
    gcdTable[firstValue * STRIDE + secondValue] = a;
  }
}
```

### Step 2：初始化 DP 狀態容器與稀疏狀態列表

狀態編碼為 `gcd1 * STRIDE + gcd2`，其中 `0` 代表對應的子序列為空。我們準備當前層與下一層的計數陣列、成員標記陣列，並將初始狀態（兩者皆空）的計數設為 `1`。同時建立稀疏狀態列表，僅追蹤具有非零計數的狀態。

```typescript
// 狀態編碼為 gcd1 * STRIDE + gcd2，其中 0 代表空子序列。
const currentCounts = new Float64Array(TABLE_SIZE);
const nextCounts = new Float64Array(TABLE_SIZE);
const isInNext = new Uint8Array(TABLE_SIZE);

currentCounts[0] = 1;

// 稀疏列表：儲存持有非零計數的編碼狀態，預先配置至最大容量。
const activeStates = new Int32Array(TABLE_SIZE);
activeStates[0] = 0;
let activeLength = 1;
const nextStates = new Int32Array(TABLE_SIZE);
let nextLength = 0;
```

### Step 3：逐一處理每個元素，先建立「不使用該元素」的分支

對每個元素展開三種決策。首先處理「該元素不加入任何子序列」的分支：將前一層所有狀態原封不動地帶入下一層，計數保持不變。

```typescript
for (const value of nums) {
  nextLength = 0;

  // 分支一：當前元素不加入任一子序列，直接將狀態延續至下一層。
  for (let index = 0; index < activeLength; index++) {
    const stateKey = activeStates[index];
    nextCounts[stateKey] = currentCounts[stateKey];
    isInNext[stateKey] = 1;
    nextStates[nextLength++] = stateKey;
  }

  // ...
}
```

### Step 4：取出當前狀態並解碼出兩個子序列的 GCD

接著進入「該元素加入某一子序列」的分支。逐一掃描前一層的有效狀態，跳過計數為零者，並將編碼後的狀態解碼還原為兩個子序列各自的 GCD 值，供後續轉移使用。

```typescript
for (const value of nums) {
  // Step 3：不使用該元素的分支

  // 分支二與三：當前元素加入第一或第二個子序列。
  for (let index = 0; index < activeLength; index++) {
    const stateKey = activeStates[index];
    const waysToReach = currentCounts[stateKey];
    if (waysToReach === 0) {
      continue;
    }

    const gcdOfFirst = (stateKey / STRIDE) | 0;
    const gcdOfSecond = stateKey - gcdOfFirst * STRIDE;

    // ...
  }

  // ...
}
```

### Step 5：將該元素加入第一個子序列並更新狀態計數

計算元素加入第一個子序列後的新 GCD（若原為空則直接取元素值），組出新狀態編碼。若該狀態尚未出現於下一層則新增之，否則以單次條件式減法完成模加，避免昂貴的取模運算。

```typescript
for (const value of nums) {
  // Step 3：不使用該元素的分支

  for (let index = 0; index < activeLength; index++) {
    // Step 4：取出狀態並解碼兩個子序列的 GCD

    // 將元素加入第一個子序列。
    const newGcdFirst = gcdOfFirst === 0 ? value : gcdTable[gcdOfFirst * STRIDE + value];
    const keyFirst = newGcdFirst * STRIDE + gcdOfSecond;
    if (isInNext[keyFirst] === 0) {
      isInNext[keyFirst] = 1;
      nextCounts[keyFirst] = waysToReach;
      nextStates[nextLength++] = keyFirst;
    } else {
      // 以單次條件式減法取代取模運算完成歸約。
      const sum = nextCounts[keyFirst] + waysToReach;
      nextCounts[keyFirst] = sum >= MODULO ? sum - MODULO : sum;
    }

    // ...
  }

  // ...
}
```

### Step 6：將該元素加入第二個子序列並更新狀態計數

以相同邏輯處理元素加入第二個子序列的情形：計算第二個子序列的新 GCD、組出新狀態編碼，並依狀態是否已存在決定新增或累加。

```typescript
for (const value of nums) {
  // Step 3：不使用該元素的分支

  for (let index = 0; index < activeLength; index++) {
    // Step 4：取出狀態並解碼兩個子序列的 GCD

    // Step 5：將元素加入第一個子序列

    // 將元素加入第二個子序列。
    const newGcdSecond = gcdOfSecond === 0 ? value : gcdTable[gcdOfSecond * STRIDE + value];
    const keySecond = gcdOfFirst * STRIDE + newGcdSecond;
    if (isInNext[keySecond] === 0) {
      isInNext[keySecond] = 1;
      nextCounts[keySecond] = waysToReach;
      nextStates[nextLength++] = keySecond;
    } else {
      const sum = nextCounts[keySecond] + waysToReach;
      nextCounts[keySecond] = sum >= MODULO ? sum - MODULO : sum;
    }
  }

  // ...
}
```

### Step 7：清除舊層並將新層提交為當前層

完成該元素的所有轉移後，先將前一層用到的計數歸零，再把下一層的狀態與計數複製回當前層，同時重置成員標記，並更新有效狀態數量，為下一個元素做準備。

```typescript
for (const value of nums) {
  // Step 3：不使用該元素的分支

  // Step 4 ~ Step 6：加入第一或第二個子序列的轉移

  // 清除前一層的計數。
  for (let index = 0; index < activeLength; index++) {
    currentCounts[activeStates[index]] = 0;
  }

  // 將新一層提交為當前層，並重置成員標記。
  for (let index = 0; index < nextLength; index++) {
    const stateKey = nextStates[index];
    currentCounts[stateKey] = nextCounts[stateKey];
    isInNext[stateKey] = 0;
    activeStates[index] = stateKey;
  }
  activeLength = nextLength;
}
```

### Step 8：彙總兩子序列皆非空且 GCD 相等的狀態

處理完所有元素後，掃描所有 `gcd1 === gcd2` 且皆非空的狀態（即編碼為 `sharedGcd * STRIDE + sharedGcd`），將其計數累加並取模，即為所求配對總數。

```typescript
// 彙總兩個子序列皆非空且共享相同 GCD 的狀態。
let validPairTotal = 0;
for (let sharedGcd = 1; sharedGcd <= MAX_VALUE; sharedGcd++) {
  validPairTotal = (validPairTotal + currentCounts[sharedGcd * STRIDE + sharedGcd]) % MODULO;
}
return validPairTotal;
```

## 時間複雜度

- 預建 GCD 查表需對值域平方的所有配對計算輾轉相除，設值域上界為 `V`，此部分為 $O(V^2 \log V)$；
- 主 DP 對每個元素掃描一次有效狀態，狀態總數上界為 $O(V^2)$，共 `n` 個元素，故為 $O(n \cdot V^2)$；
- 由於 `V` 為固定常數，整體由元素數量主導。
- 總時間複雜度為 $O(n \cdot V^2)$。

> $O(n \cdot V^2)$

## 空間複雜度

- GCD 查表與各計數、狀態陣列的大小皆為值域平方等級，即 $O(V^2)$；
- 未使用與輸入規模相關的額外動態空間。
- 總空間複雜度為 $O(V^2)$。

> $O(V^2)$
