# 3699. Number of ZigZag Arrays I

You are given three integers `n`, `l`, and `r`.

A ZigZag array of length `n` is defined as follows:

- Each element lies in the range `[l, r]`.
- No two adjacent elements are equal.
- No three consecutive elements form a strictly increasing or strictly decreasing sequence.

Return the total number of valid ZigZag arrays.

Since the answer may be large, return it modulo `10^9 + 7`.

A sequence is said to be strictly increasing if each element is strictly greater than its previous one (if exists).

A sequence is said to be strictly decreasing if each element is strictly smaller than its previous one (if exists).

**Constraints:**

- `3 <= n <= 2000`
- `1 <= l < r <= 2000`

## 基礎思路

本題要求計算指定數值範圍內，長度為 `n` 的 ZigZag 陣列數量。ZigZag 的限制包含相鄰元素不可相同，且任意連續三個元素不可形成嚴格遞增或嚴格遞減，因此整體趨勢必須在上升與下降之間交替。

在思考解法時，可掌握以下核心觀察：

* **合法序列的狀態可由最後一步趨勢描述**：
  若最後一步是上升，下一步就必須下降；若最後一步是下降，下一步就必須上升。

* **數值範圍只與區間長度有關**：
  實際下界與上界的值不影響相對大小關係，因此只需關注可選數字的數量。

* **上升結尾與下降結尾具有對稱性**：
  將所有數值順序反轉後，上升與下降的數量彼此對應，因此只需計算其中一種方向，最後乘以二即可。

* **轉移可透過前綴累加最佳化**：
  若直接枚舉前一個值與目前值，會產生平方級轉移；利用累加和可以將每一層轉移壓到線性時間。

依據以上特性，可以採用以下策略：

* **以動態規劃記錄某一方向結尾的序列數量**。
* **每次延長序列時，利用反向累加快速完成所有狀態轉移**。
* **只保留目前長度與下一個長度的狀態，降低空間使用**。
* **最後利用對稱性合併兩種結尾方向的答案**。

此策略能避免暴力列舉所有序列，並在題目限制內有效完成計算。

## 解題步驟

### Step 1：建立模數與全域快取空間

先建立取模常數與固定大小的快取空間，用於記錄相同輸入規模下已計算過的結果，避免重複查詢時重新執行動態規劃。

```typescript
const MOD = 1_000_000_007;

// n 與區間長度的最大限制邊界
const MAX_DIMENSION = 2005;
const CACHE_SIZE = MAX_DIMENSION * MAX_DIMENSION;

// 使用全域型別陣列記憶函數結果，使重複查詢可在 O(1) 取得。
// 以 -1 表示尚未計算的狀態。
const resultCache = new Int32Array(CACHE_SIZE);
resultCache.fill(-1);
```

### Step 2：計算區間長度並查詢快取

由於合法數量只與可選數字的個數有關，因此先計算區間長度，並組合出快取索引；
若先前已計算過相同規模，直接回傳快取結果。

```typescript
const span = r - l + 1;

// 根據輸入組合產生唯一的一維快取鍵
const cacheKey = n * MAX_DIMENSION + span;

// 若已存在預先計算的結果，則立即回傳
if (resultCache[cacheKey] !== -1) {
  return resultCache[cacheKey];
}
```

### Step 3：初始化動態規劃陣列與長度為 1 的基礎狀態

使用兩個陣列分別保存目前長度與下一個長度的狀態；
長度為 1 時，每個數值都可以單獨形成一個有效序列，因此初始數量皆為 1。

```typescript
// 儲存目前長度與下一個長度的 DP 狀態
let currentDp = new Uint32Array(span + 1);
let nextDp = new Uint32Array(span + 1);

// 初始化長度為 1 的基礎情況
for (let index = 1; index <= span; index++) {
  currentDp[index] = 1;
}
```

### Step 4：透過反向累加計算下一層狀態

每次延長序列時，需要根據相反方向的可接續狀態進行轉移；
透過反向指標與累加值，可以逐步取得所有合法前置狀態的總和，避免重複枚舉。

```typescript
// 從長度 2 迭代到 n
for (let length = 1; length < n; length++) {
  nextDp[1] = 0;

  let currentSum = 0;
  let reverseIndex = span;

  // 使用滾動累加器與遞減指標，略過多餘的陣列查詢
  for (let valueIndex = 2; valueIndex <= span; valueIndex++) {
    currentSum += currentDp[reverseIndex];
    reverseIndex -= 1;

    // 使用條件扣減取代較慢的 modulo 運算，以快速取模
    if (currentSum >= MOD) {
      currentSum -= MOD;
    }

    nextDp[valueIndex] = currentSum;
  }

  // ...
}
```

### Step 5：交換目前狀態與下一層狀態

完成某一層長度的所有轉移後，將下一層狀態變成目前狀態；
透過交換陣列參考，可以避免在迴圈中反覆配置新記憶體。

```typescript
for (let length = 1; length < n; length++) {
  // Step 4：透過反向累加計算下一層狀態

  // 交換目前與下一個 DP 陣列，避免在迴圈中配置記憶體
  const temporaryDp = currentDp;
  currentDp = nextDp;
  nextDp = temporaryDp;
}
```

### Step 6：加總其中一種結尾方向的序列數量

完成所有長度轉移後，將目前狀態中的所有可能結尾加總；
此時得到的是以其中一種方向作為最後一步的合法序列數量。

```typescript
// 加總所有以遞增步驟結尾的有效序列
let totalIncreasingEnds = 0;
for (let index = 1; index <= span; index++) {
  totalIncreasingEnds += currentDp[index];

  if (totalIncreasingEnds >= MOD) {
    totalIncreasingEnds -= MOD;
  }
}
```

### Step 7：利用對稱性得到總序列數並寫入快取

由於以上升結尾與以下降結尾的數量對稱，因此總數為其中一種方向的兩倍；
完成最後取模後，將結果存入快取並回傳。

```typescript
// 總序列數是以遞增步驟結尾序列數的兩倍（基於對稱性）
let totalSequences = totalIncreasingEnds * 2;

// 對相乘後的結果套用最後一次快速取模
if (totalSequences >= MOD) {
  totalSequences -= MOD;
}

// 回傳前快取已處理完成的序列數量
resultCache[cacheKey] = totalSequences;

return totalSequences;
```

## 時間複雜度

- 設可選數字數量為 $m = r - l + 1$；
- 動態規劃共延長 $n - 1$ 次，每次以線性時間完成狀態轉移；
- 最後加總所有結尾狀態需要 $O(m)$。
- 總時間複雜度為 $O(n \times m)$。

> $O(n \times m)$

## 空間複雜度

- 動態規劃僅保留目前與下一層狀態，各需要 $O(m)$；
- 全域快取大小由限制上界固定，為 $O(2005^2)$，不隨單次輸入的實際區間額外成長。
- 總空間複雜度為 $O(m)$。

> $O(m)$
