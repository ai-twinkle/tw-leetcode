# 3116. Kth Smallest Amount With Single Denomination Combination

You are given an integer array `coins` representing coins of different denominations and an integer `k`.

You have an infinite number of coins of each denomination. 
However, you are not allowed to combine coins of different denominations.

Return the $k^{th}$ smallest amount that can be made using these coins.

**Constraints:**

- `1 <= coins.length <= 15`
- `1 <= coins[i] <= 25`
- `1 <= k <= 2 * 10^9`
- `coins` contains pairwise distinct integers.

## 基礎思路

本題要求在「不可混用不同面額」的前提下，求出第 `k` 小的可達金額。由於每種面額都能無限使用，單一面額所能產生的金額恰為該面額的所有正倍數，因此整體可達集合即為各面額倍數集合的聯集。

在思考解法時，可掌握以下核心觀察：

- **答案具有單調性**：
  「小於等於某金額的可達數量」隨著金額增大而單調不減，因此可對答案進行二分搜尋，將求第 `k` 小轉化為判定問題。

- **倍數集合的聯集大小可由容斥原理精確計算**：
  多個面額的倍數集合彼此重疊，重疊部分恰為對應面額最小公倍數的倍數，故可用子集合的容斥交替求和，得到聯集在任一上限內的元素個數。

- **互為倍數的面額存在冗餘**：
  若某面額是另一個保留面額的倍數，其產生的金額必然已被涵蓋，可直接剔除，藉此壓縮參與容斥的面額數量。

- **超過搜尋上界的最小公倍數毫無貢獻**：
  最小面額的前 `k` 個倍數已足以達到第 `k` 名，故答案必不超過此上界；任何最小公倍數大於該上界的子集合在計數時貢獻恆為零，可提早剪除，且其所有超集同樣可一併淘汰。

- **相同最小公倍數的項可合併，完全抵消者可刪除**：
  不同子集合可能得到相同的最小公倍數，將其容斥符號合併後，若係數歸零則該項對計數毫無影響，可自核心迴圈中移除。

- **可達金額的分布具有穩定密度**：
  各項係數除以其最小公倍數之總和即為可達金額的漸近密度，實際計數與密度估計的偏差有明確上限，可用來大幅收窄二分搜尋的初始區間。

依據以上特性，可以採用以下策略：

- **先排序並剔除冗餘面額**，若最小面額為單位值則答案即為名次本身。
- **枚舉所有面額子集合並計算其最小公倍數**，同時記錄容斥符號，並剪除超出上界者。
- **合併相同最小公倍數的項並移除完全抵消者**，得到精簡的容斥項表。
- **以密度與誤差上限推得緊縮的搜尋區間，再以二分搜尋定位第 `k` 小的金額**。

此策略在指數級的子集合枚舉之上疊加了多重剪枝與合併，使實際參與計數的項數遠低於理論上限，兼顧正確性與效率。

## 解題步驟

### Step 1：實作最大公因數的輔助函數

後續計算最小公倍數時需要最大公因數，此處以輾轉相除法反覆取餘數，直到餘數為零為止，回傳最後的非零值。

```typescript
/**
 * 計算兩個正整數的最大公因數。
 * @param first 第一個正整數。
 * @param second 第二個正整數。
 * @returns 兩者的最大公因數。
 */
function greatestCommonDivisor(first: number, second: number): number {
    let left = first;
    let right = second;
    while (right !== 0) {
        const remainder = left % right;
        left = right;
        right = remainder;
    }
    return left;
}
```

### Step 2：複製並排序面額

先將輸入複製一份並由小到大排序，使後續剔除冗餘面額時，能保證較小的面額必定先被檢視並保留。

```typescript
const sortedCoins = coins.slice().sort((first, second) => first - second);
```

### Step 3：剔除為既有面額倍數的冗餘面額

依序檢視每個面額，若它能被任一已保留的面額整除，代表其倍數集合已完全被涵蓋，不會產生任何新的金額，故予以捨棄；否則納入基底面額集合。

```typescript
// 若某面額是已保留面額的倍數，則不會產生任何新的金額。
const baseCoins: number[] = [];
for (let index = 0; index < sortedCoins.length; index++) {
    const candidate = sortedCoins[index];
    let isRedundant = false;
    for (let kept = 0; kept < baseCoins.length; kept++) {
        if (candidate % baseCoins[kept] === 0) {
            isRedundant = true;
            break;
        }
    }
    if (!isRedundant) {
        baseCoins.push(candidate);
    }
}
```

### Step 4：處理最小面額為單位值的特例

若最小的基底面額為 `1`，則所有正整數皆可達成，第 `k` 小的金額恰為 `k` 本身，可直接回傳。

```typescript
const smallestCoin = baseCoins[0];

// 若存在單位面額，則所有正整數皆可達成。
if (smallestCoin === 1) {
    return k;
}
```

### Step 5：設定搜尋上界並配置子集合枚舉所需的容器

最小面額的前 `k` 個倍數已足以涵蓋第 `k` 名，故以其乘積作為答案上界。接著依基底面額數量決定位元遮罩總數，並配置存放各子集合最小公倍數、容斥符號與打包項的陣列；空集合的最小公倍數初始化為 `1`。

```typescript
// 最小面額的前 k 個倍數已足以達到第 k 名。
const upperBound = smallestCoin * k;
const coinCount = baseCoins.length;
const maskCount = 1 << coinCount;

const lcmByMask = new Float64Array(maskCount);
const parityByMask = new Uint8Array(maskCount);
const packedTerms = new Float64Array(maskCount);
let liveCount = 0;
lcmByMask[0] = 1;
```

### Step 6：逐一枚舉子集合並淘汰已死亡子集的超集

依遮罩由小到大枚舉每個子集合：先由去掉最低位後的遮罩遞推其容斥符號，再取出移除最低位元後的前一個子集合及其最小公倍數。若前一個子集合已被判定為超界（死亡），則其所有超集的最小公倍數只會更大，可直接標記為死亡並跳過。

```typescript
for (let mask = 1; mask < maskCount; mask++) {
    parityByMask[mask] = parityByMask[mask >> 1] ^ (mask & 1);

    const previousMask = mask & (mask - 1);
    const previousLcm = lcmByMask[previousMask];

    // 任何死亡子集的超集同樣為死亡。
    if (previousLcm === Infinity) {
        lcmByMask[mask] = Infinity;
        continue;
    }

    // ...
}
```

### Step 7：計算候選最小公倍數並剪除超過上界者

取出遮罩的最低位元所對應的面額，將前一個子集合的最小公倍數與該面額合併，得到當前子集合的最小公倍數。若其已超過答案上界，則對計數毫無貢獻，標記為死亡並跳過；否則予以記錄。

```typescript
for (let mask = 1; mask < maskCount; mask++) {
    // Step 6：遞推容斥符號並淘汰死亡子集的超集

    const lowestBit = mask & -mask;
    const coin = baseCoins[31 - Math.clz32(lowestBit)];
    const candidateLcm = (previousLcm / greatestCommonDivisor(previousLcm, coin)) * coin;

    if (candidateLcm > upperBound) {
        lcmByMask[mask] = Infinity;
        continue;
    }
    lcmByMask[mask] = candidateLcm;

    // ...
}
```

### Step 8：將數值與容斥符號打包為單一數字

把最小公倍數左移一位後，將容斥符號存入最低位，使得單一次數值排序即可同時依數值排序、並讓相同數值的項聚集在一起。

```typescript
for (let mask = 1; mask < maskCount; mask++) {
    // Step 6：遞推容斥符號並淘汰死亡子集的超集

    // Step 7：計算候選最小公倍數並剪除超界者

    // 將數值與容斥符號打包，使單次數值排序同時決定兩者的順序。
    packedTerms[liveCount] = candidateLcm * 2 + parityByMask[mask];
    liveCount++;
}
```

### Step 9：對存活的打包項進行排序

取出實際使用到的前段區間，直接以型別化陣列的原生數值排序處理，避免每次比較都呼叫 JS 比較函數所帶來的額外開銷。

```typescript
// 原生數值排序，不會為每次比較呼叫 JS 比較函數。
const liveTerms = packedTerms.subarray(0, liveCount);
liveTerms.sort();
```

### Step 10：準備合併容器並解出當前段落的最小公倍數

配置合併後的項表與計數器，接著逐段掃描：每段開頭先由打包值還原出最低位的符號位與其對應的最小公倍數，並將係數歸零以便累加。

```typescript
const termLcm = new Float64Array(liveCount);
const termCoefficient = new Int32Array(liveCount);
let termCount = 0;
let scanIndex = 0;

while (scanIndex < liveCount) {
    const firstPacked = liveTerms[scanIndex];
    const firstBit = firstPacked % 2;
    const lcmValue = (firstPacked - firstBit) / 2;
    let coefficient = 0;

    // ...
}
```

### Step 11：合併具有相同最小公倍數的容斥符號

排序後相同最小公倍數的項必定相鄰，因此持續向後推進指標，只要還原出的數值仍相同，便依其符號位累加或扣減係數，直到遇到不同數值為止。

```typescript
while (scanIndex < liveCount) {
    // Step 10：解出當前段落的最小公倍數

    // 相同的最小公倍數在排序後必相鄰，故可於一次掃描中合併符號。
    while (scanIndex < liveCount) {
        const currentPacked = liveTerms[scanIndex];
        const currentBit = currentPacked % 2;
        if ((currentPacked - currentBit) / 2 !== lcmValue) {
            break;
        }
        coefficient += currentBit === 1 ? 1 : -1;
        scanIndex++;
    }

    // ...
}
```

### Step 12：僅保留未被完全抵消的項

若合併後的係數為零，代表該最小公倍數在容斥中完全抵消，對計數毫無影響，予以捨棄；否則寫入精簡後的項表。

```typescript
while (scanIndex < liveCount) {
    // Step 10：解出當前段落的最小公倍數

    // Step 11：合併相同最小公倍數的容斥符號

    // 完全抵消的子集會自核心計數迴圈中移除。
    if (coefficient !== 0) {
        termLcm[termCount] = lcmValue;
        termCoefficient[termCount] = coefficient;
        termCount++;
    }
}
```

### Step 13：計算可達金額的密度與誤差預算

將各項係數除以其最小公倍數後累加，得到可達金額的漸近密度；同時累加係數絕對值，作為實際計數與密度估計之間的偏差上限。

```typescript
let density = 0;
let errorBudget = 0;
for (let index = 0; index < termCount; index++) {
    density += termCoefficient[index] / termLcm[index];
    errorBudget += Math.abs(termCoefficient[index]);
}
```

### Step 14：建立計算上限內可達金額數量的內部函數

此函數依容斥項表累加各項貢獻：每項的貢獻為其係數乘上上限除以最小公倍數的商。由於項表已依數值遞增排列，一旦最小公倍數超過上限，後續各項皆無貢獻，可提早結束。

```typescript
/**
 * 計算小於等於指定上限的可達金額數量。
 * @param limit 欲統計金額的上限（含）。
 * @returns 上限範圍內可達金額的數量。
 */
function countAtMost(limit: number): number {
    let total = 0;
    for (let index = 0; index < termCount; index++) {
        const lcmValue = termLcm[index];

        // 各項為遞增排列，因此後續不會再有貢獻。
        if (lcmValue > limit) {
            break;
        }
        total += termCoefficient[index] * Math.floor(limit / lcmValue);
    }
    return total;
}
```

### Step 15：以密度估計收窄二分搜尋的初始區間

由於精確計數與密度估計的偏差不超過誤差預算，可反推出答案所在的狹窄範圍，並額外預留少量緩衝；同時以名次本身與上界夾住區間確保合法。若估計窗口因數值退化而失效，則回退至保證正確的安全範圍。

```typescript
// 精確計數與密度估計之間的偏差不會超過誤差預算。
let low = Math.max(k, Math.floor((k - errorBudget) / density) - 8);
let high = Math.min(upperBound, Math.ceil((k + errorBudget) / density) + 8);

// 若解析窗口退化，則回退至安全範圍。
if (low > high) {
    low = k;
    high = upperBound;
}
```

### Step 16：二分搜尋出第 k 小的可達金額

在區間內反覆取中點：若中點以內的可達金額數量已達到名次要求，則答案不會更大，收縮右界；否則排除中點以左的所有候選。區間收斂後的值即為答案。

```typescript
while (low < high) {
    const middle = low + Math.floor((high - low) / 2);
    if (countAtMost(middle) >= k) {
        high = middle;
    } else {
        low = middle + 1;
    }
}
return low;
```

## 時間複雜度

- 設面額數量為 $n$，面額上限為 $c$，欲求名次為 $k$；
- 排序與剔除冗餘面額最多需 $O(n^2)$；
- 枚舉所有子集合共 $O(2^n)$ 次，每次計算最小公倍數需 $O(\log c)$，為 $O(2^n \log c)$；
- 對存活項排序需 $O(2^n \cdot n)$，合併相同數值的項為一次線性掃描 $O(2^n)$；
- 二分搜尋需 $O(\log (ck))$ 輪，每輪計數為 $O(2^n)$，為 $O(2^n \log (ck))$；
- 總時間複雜度為 $O(2^n (n + \log c + \log (ck)))$。

> $O(2^n (n + \log c + \log (ck)))$

## 空間複雜度

- 各子集合的最小公倍數、容斥符號與打包項陣列皆為 $O(2^n)$；
- 合併後的項表同樣不超過 $O(2^n)$；
- 其餘僅使用固定數量的純量變數；
- 總空間複雜度為 $O(2^n)$。

> $O(2^n)$
