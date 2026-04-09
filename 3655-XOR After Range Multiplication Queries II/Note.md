# 3655. XOR After Range Multiplication Queries II

You are given an integer array `nums` of length `n` and a 2D integer array queries of size `q`, 
where `queries[i] = [l_i, r_i, k_i, v_i]`.

For each query, you must apply the following operations in order:

- Set `idx = l_i`.
- While `idx <= r_i`:
  - Update: `nums[idx] = (nums[idx] * v_i) % (10^9 + 7)`.
  - Set idx += ki.

Return the bitwise XOR of all elements in `nums` after processing all queries.

**Constraints:**

- `1 <= n == nums.length <= 10^5`
- `1 <= nums[i] <= 10^9`
- `1 <= q == queries.length <= 10^5`
- `queries[i] = [l_i, r_i, k_i, v_i]`
- `0 <= l_i <= r_i < n`
- `1 <= k_i <= n`
- `1 <= v_i <= 10^5`

## 基礎思路

本題要求對一個整數陣列執行一系列乘法更新查詢，每筆查詢以固定步長對某個區間內的索引逐一進行乘法取模，最後回傳所有元素的 XOR 總和。關鍵挑戰在於查詢數量與陣列長度皆可達 $10^5$，若對每筆查詢暴力走訪，最壞情況下（步長為 1 時）每筆查詢耗時 $O(n)$，整體複雜度難以接受。

在思考解法時，可掌握以下核心觀察：

- **步長大小決定每筆查詢的影響範圍**：
  步長愈大，每筆查詢實際更新的位置愈少（至多 $O(n/k)$ 個）；步長愈小，更新位置雖多，但所有步長相同的查詢天然地共享相同的索引殘差類別（residue class）結構，可以彙整處理。

- **平方根分治的適用時機**：
  以 $\sqrt{n}$ 為門檻，將查詢分為「大步長」與「小步長」兩類：大步長查詢直接逐點更新，每次最多 $O(\sqrt{n})$ 個位置；小步長查詢則改用懶標記（lazy event）延遲累積，最後一次性掃描套用。

- **小步長的懶標記設計**：
  對每個小步長 $k$，建立一個事件陣列，在查詢的左端點乘上乘數，在查詢有效範圍外的第一個位置乘上逆元，使得掃描時僅需維護一個行進乘積，即可自動在正確的位置「開啟」與「關閉」效果。

- **模乘精度問題**：
  取模運算若直接使用 JavaScript 的 `number` 型別，在兩個接近 $10^9$ 的數相乘時會因 float64 精度不足而產生誤差，因此正式運算改用 `BigInt` 確保精確度；而建表階段的逆元預計算則透過 15 位元拆分技巧讓乘法結果保持在 $2^{53}$ 以下，以維持 `number` 的精確性。

- **預計算模逆元以加速懶標記關閉**：
  小步長的懶標記關閉需要對乘數取模逆元；若每次呼叫 $O(\log \text{MOD})$ 的快速冪，代價過高。由於 $v_i$ 的範圍有限，可在模組層級用線性遞推一次性預計算所有可能的逆元，查詢時以 $O(1)$ 查表取代快速冪。

依據以上特性，可以採用以下策略：

- **以 $\sqrt{n}$ 為分界切分大小步長查詢**，大步長直接更新，小步長累積至懶標記陣列。
- **掃描每個小步長的殘差類別，從頭到尾累乘懶標記中的事件**，一次性套用至所有受影響元素。
- **最後對整個陣列取 XOR**，得到最終結果。

此策略將整體複雜度壓至 $O((n + q)\sqrt{n})$，在給定的約束下可高效通過。

## 解題步驟

### Step 1：定義模組層級常數

定義兩個全域常數：模數本身，以及逆元預計算陣列的上界（涵蓋所有合法的 $v_i$ 值）。

```typescript
const MODULAR_MOD_NUMBER = 1_000_000_007;
const MAX_QUERY_VALUE = 100_001;
```

### Step 2：實作建表期模乘輔助函數

由於兩個接近 $10^9$ 的數直接相乘可能超過 float64 的安全精度，此函數透過 15 位元拆分將乘法分為高位與低位兩個部分，確保每個中間乘積均低於 $2^{45}$，從而在 `number` 型別下精確完成模乘。此函數僅供建表階段使用。

```typescript
/**
 * Computes (a * b) % MODULAR_MOD_NUMBER via 15-bit splitting.
 * Used only during module-level inverse table construction.
 * @param a First operand, must be < MODULAR_MOD_NUMBER
 * @param b Second operand, must be < MODULAR_MOD_NUMBER
 * @return (a * b) % MODULAR_MOD_NUMBER
 */
function buildTimeMulMod(a: number, b: number): number {
  const bLow = b & 0x7FFF;
  const bHigh = (b - bLow) >>> 15;
  // 每個部分乘積均低於 2^45 < 2^53，在 float64 下精確無誤
  return ((a * bHigh % MODULAR_MOD_NUMBER) * 32768 + a * bLow) % MODULAR_MOD_NUMBER;
}
```

### Step 3：預計算所有可能乘數的模逆元

利用線性遞推公式 $\text{inv}[i] = -\lfloor \text{MOD}/i \rfloor \cdot \text{inv}[\text{MOD} \bmod i] \pmod{\text{MOD}}$ 一次性建立逆元查表陣列，使後續每次需要逆元時皆可 $O(1)$ 取得，而無需每次執行 $O(\log \text{MOD})$ 的快速冪。

```typescript
// 以線性遞推預計算所有 v ∈ [1, MAX_QUERY_VALUE) 的模逆元：
// inv[i] = -(floor(MOD / i)) * inv[MOD % i]  (mod MOD)
// 以 O(1) 查表取代每次小步長邊界關閉時的 O(log MOD) 快速冪
const precomputedModularInverse = new Int32Array(MAX_QUERY_VALUE);
precomputedModularInverse[1] = 1;
for (let inverseIndex = 2; inverseIndex < MAX_QUERY_VALUE; inverseIndex++) {
  precomputedModularInverse[inverseIndex] =
    MODULAR_MOD_NUMBER - buildTimeMulMod(
      Math.floor(MODULAR_MOD_NUMBER / inverseIndex),
      precomputedModularInverse[MODULAR_MOD_NUMBER % inverseIndex]
    );
}
```

### Step 4：初始化工作陣列與平方根分治的關鍵參數

計算平方根分治的步長門檻值，並將原始陣列轉換為 `BigInt64Array` 以確保後續所有模乘運算精確無誤。同時配置懶標記陣列的容器（初始全為 `null`，表示尚未有任何查詢使用該步長）。

```typescript
const numCount = nums.length;
const MODULUS = 1_000_000_007n;
// 平方根分治門檻：步長低於此值使用懶標記事件陣列
const blockSize = (Math.sqrt(numCount) | 0) + 1;

// 工作陣列：以 BigInt 儲存每個元素，確保 64 位元模乘精確
const currentValues = new BigInt64Array(numCount);
for (let position = 0; position < numCount; position++) {
  currentValues[position] = BigInt(nums[position]);
}

// 按步長懶分配的事件標記陣列；null 表示此步長尚未被任何查詢使用
const stepEventArrays: (Float64Array | null)[] = new Array(blockSize).fill(null);
```

### Step 5：依步長大小分別處理每筆查詢——大步長直接更新

逐一走訪所有查詢，先將乘數轉為 BigInt。若當前查詢的步長不小於門檻值，表示此次查詢最多影響 $O(n/k) \leq O(\sqrt{n})$ 個位置，直接逐點更新 `currentValues` 中對應的元素即可，無需借助懶標記。

```typescript
for (const [leftBound, rightBound, stepSize, multiplierValue] of queries) {
  const multiplierBig = BigInt(multiplierValue);

  if (stepSize >= blockSize) {
    // 大步長：受影響的位置至多 O(n/k) 個，直接更新各位置的值
    for (let position = leftBound; position <= rightBound; position += stepSize) {
      currentValues[position] = currentValues[position] * multiplierBig % MODULUS;
    }
    continue;
  }

  // ...
}
```

### Step 6：小步長查詢——以懶標記記錄乘法事件的開啟與關閉

當步長小於門檻值時，不立即更新陣列，而是在事件陣列的左端點位置「開啟」乘法效果（乘上乘數），並在超出有效範圍的第一個對齊位置「關閉」效果（乘上逆元）。掃描階段只需維護行進乘積，即可正確還原每個位置應套用的累積乘數。

```typescript
for (const [leftBound, rightBound, stepSize, multiplierValue] of queries) {
  // Step 5：大步長直接更新

  // 首次使用此步長時，懶分配並以 1.0 初始化事件陣列
  if (!stepEventArrays[stepSize]) {
    stepEventArrays[stepSize] = new Float64Array(numCount + 1).fill(1.0);
  }
  const eventArray = stepEventArrays[stepSize]!;

  // 在左端點開啟乘法效果
  eventArray[leftBound] = Number(BigInt(eventArray[leftBound]) * multiplierBig % MODULUS);

  // 關閉位置為 rightBound 之後第一個對齊步長的位置，兼顧 remainder 為 0 與非 0 的情況
  const closePosition = rightBound + stepSize - (rightBound - leftBound) % stepSize;
  if (closePosition <= numCount) {
    // O(1) 查表取得逆元，避免 O(log MOD) 的快速冪
    const inverseMultiplierBig = BigInt(precomputedModularInverse[multiplierValue]);
    eventArray[closePosition] = Number(BigInt(eventArray[closePosition]) * inverseMultiplierBig % MODULUS);
  }
}
```

### Step 7：掃描各小步長的殘差類別，將懶標記套用至工作陣列

對每個有事件記錄的小步長，按殘差類別（即模 `stepSize` 同餘的索引集合）分別掃描：維護一個行進乘積，遇到事件時更新乘積，並將當前乘積套用至對應的工作陣列元素。

```typescript
// 將各步長的事件標記透過殘差類別掃描套用至工作陣列
for (let stepSize = 1; stepSize < blockSize; stepSize++) {
  const eventArray = stepEventArrays[stepSize];
  if (!eventArray) {
    continue;
  }

  // 每個模 stepSize 的殘差類別形成獨立的掃描通道
  for (let laneStart = 0; laneStart < stepSize && laneStart < numCount; laneStart++) {
    let runningMultiplier = 1n;
    for (let position = laneStart; position < numCount; position += stepSize) {
      if (eventArray[position] !== 1.0) {
        // 將事件標記折入此通道的行進乘積
        runningMultiplier = runningMultiplier * BigInt(eventArray[position]) % MODULUS;
      }
      if (runningMultiplier !== 1n) {
        currentValues[position] = currentValues[position] * runningMultiplier % MODULUS;
      }
    }
  }
}
```

### Step 8：對所有最終值取 XOR 並回傳結果

所有查詢與懶標記均已套用完畢，逐一對工作陣列中每個元素取 XOR，累積後回傳。

```typescript
// 對所有最終值取 XOR；取模後每個值均在安全整數範圍內
let xorResult = 0;
for (let position = 0; position < numCount; position++) {
  xorResult ^= Number(currentValues[position]);
}
return xorResult;
```

## 時間複雜度

- 預計算逆元表：遍歷 $[1, 10^5)$ 共 $O(V)$ 次，每次常數時間，其中 $V = 10^5$；
- 查詢處理：大步長查詢（$k \geq \sqrt{n}$）每筆最多走訪 $O(n/k) \leq O(\sqrt{n})$ 個位置，共 $O(q\sqrt{n})$；小步長查詢每筆僅更新兩個事件點，共 $O(q)$；
- 懶標記套用：對每個小步長按殘差類別掃描，合計每個步長 $k$ 貢獻 $O(n)$，共 $O(\sqrt{n})$ 個步長，合計 $O(n\sqrt{n})$；
- 最終 XOR：線性掃描 $O(n)$；
- 總時間複雜度為 $O((n + q)\sqrt{n})$。

> $O((n + q)\sqrt{n})$

## 空間複雜度

- 工作陣列 `currentValues` 佔用 $O(n)$；
- 懶標記陣列容器共 $O(\sqrt{n})$ 個，每個長度至多 $O(n)$，合計 $O(n\sqrt{n})$；
- 逆元查表陣列佔用 $O(V)$，其中 $V = 10^5$；
- 總空間複雜度為 $O(n\sqrt{n})$。

> $O(n\sqrt{n})$
