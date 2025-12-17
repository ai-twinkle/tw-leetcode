# 3573. Best Time to Buy and Sell Stock V

You are given an integer array `prices` where `prices[i]` is the price of a stock in dollars on the $i^{th}$ day, and an integer `k`.

You are allowed to make at most `k` transactions, where each transaction can be either of the following:

- Normal transaction: Buy on day `i`, then sell on a later day `j` where `i < j`. 
  You profit `prices[j] - prices[i]`.

- Short selling transaction: Sell on day `i`, then buy back on a later day `j` where `i < j`. 
  You profit `prices[i] - prices[j]`.

Note that you must complete each transaction before starting another. 
Additionally, you can't buy or sell on the same day you are selling or buying back as part of a previous transaction.

Return the maximum total profit you can earn by making at most `k` transactions.

**Constraints:**

- `2 <= prices.length <= 10^3`
- `1 <= prices[i] <= 10^9`
- `1 <= k <= prices.length / 2`

## 基礎思路

本題要在股價序列中進行最多 `k` 次交易，且每次交易可以是：

* **一般做多**：先買後賣，賺 `sell - buy`
* **放空做空**：先賣後買回，賺 `sell - buyBack`

同時還有兩個關鍵限制：

* **一次只能持有一個部位**：必須完成上一筆交易後才能開始下一筆。
* **不可同日連鎖**：不能在同一天完成上一筆的賣出/回補後又立刻開新倉（避免同日 close→open）。

在思考解法時，我們需要抓住以下核心觀察：

* 每天的狀態只跟「前一天的最佳狀態」有關，因此適合用 **動態規劃（DP）**。
* 每筆交易都有「開倉」與「平倉」兩段，且可分成兩種方向（多/空），因此我們需要同時追蹤：

    * **空手（cash）**：目前沒有持倉、已完成若干交易的最大利潤
    * **持多（longHolding）**：目前持有多單、已完成若干交易的最大利潤
    * **持空（shortHolding）**：目前持有空單、已完成若干交易的最大利潤
* 為避免同日連鎖，更新時要小心「先平倉再開倉」的順序問題；一個常見技巧是 **對交易次數倒序更新**，讓同一天的狀態不會互相污染。
* 由於一次交易至少需要兩天，因此最多可完成的交易數不可能超過 `floor(n/2)`，可先把 `k` 截斷以縮小狀態空間。

透過上述設計，我們能在每一天用常數次轉移更新三種狀態，完成整體最大利潤計算。

## 解題步驟

### Step 1：初始化交易上限與 DP 狀態陣列

先將交易次數上限截斷到 `floor(dayCount / 2)`，若為 0 直接回傳。
接著建立三個 DP 陣列：`longHolding`、`shortHolding`、`cash`，並以極小值初始化不可達狀態，最後設定初始現金狀態 `cash[0] = 0`。

```typescript
const dayCount = prices.length;

// 每筆交易至少需要兩天，因此將 k 截斷到 floor(dayCount / 2)
const effectiveTransactionLimit = (k < (dayCount >> 1)) ? k : (dayCount >> 1);
if (effectiveTransactionLimit === 0) {
  return 0;
}

// DP 狀態大小：已完成交易數量從 0 到 effectiveTransactionLimit
const stateSize = effectiveTransactionLimit + 1;
const NEGATIVE_INFINITY = -1e30;

// longHolding[t]：已完成 t 筆交易，且目前持有多單時的最大利潤
const longHolding = new Float64Array(stateSize);

// shortHolding[t]：已完成 t 筆交易，且目前持有空單時的最大利潤
const shortHolding = new Float64Array(stateSize);

// cash[t]：已完成 t 筆交易，且目前空手時的最大利潤
const cash = new Float64Array(stateSize);

// 將所有狀態初始化為不可達
longHolding.fill(NEGATIVE_INFINITY);
shortHolding.fill(NEGATIVE_INFINITY);
cash.fill(NEGATIVE_INFINITY);

// 基底狀態：0 筆交易、空手、利潤為 0
cash[0] = 0;
```

### Step 2：逐日遍歷並計算當天可開倉/可平倉的交易索引上限

每天處理一個價格。由於交易至少需要兩天，且不能同日連鎖，因此可「開倉」與「平倉」的交易索引上限會不同。
這裡先計算兩個上限，供後續更新使用。

```typescript
for (let dayIndex = 0; dayIndex < dayCount; dayIndex++) {
  const price = prices[dayIndex];

  // 今日允許開倉的最大交易索引（避免在天數不足時開太多筆）
  const halfDay = dayIndex >> 1;
  const maxOpenTransactionIndex =
    (halfDay < effectiveTransactionLimit) ? halfDay : effectiveTransactionLimit;

  // 今日允許完成交易（平倉）的最大交易索引
  const halfDayRoundedUp = (dayIndex + 1) >> 1;
  const maxCompletedTransactionIndex =
    (halfDayRoundedUp < effectiveTransactionLimit) ? halfDayRoundedUp : effectiveTransactionLimit;

  // ...
}
```

### Step 3：更新最高 cash 狀態（只允許平倉，避免同日連鎖）

當 `maxCompletedTransactionIndex > maxOpenTransactionIndex` 時，代表今日在最高交易數狀態下只能「平倉」而不能再開倉，
用此方式避免同一天出現 close→open 的連鎖操作。

```typescript
for (let dayIndex = 0; dayIndex < dayCount; dayIndex++) {
  // Step 2：計算當天可開倉/可平倉的交易索引上限

  if (maxCompletedTransactionIndex > maxOpenTransactionIndex) {
    const transactionIndex = maxCompletedTransactionIndex;

    let bestCash = cash[transactionIndex];

    // 平多單：從前一筆完成數的多單狀態轉移到 cash
    const previousLong = longHolding[transactionIndex - 1];
    const closeLongCandidate = previousLong + price;
    if (closeLongCandidate > bestCash) {
      bestCash = closeLongCandidate;
    }

    // 平空單：從前一筆完成數的空單狀態轉移到 cash
    const previousShort = shortHolding[transactionIndex - 1];
    const closeShortCandidate = previousShort - price;
    if (closeShortCandidate > bestCash) {
      bestCash = closeShortCandidate;
    }

    cash[transactionIndex] = bestCash;
  }

  // ...
}
```

### Step 4：倒序遍歷交易索引並同時更新開倉與平倉狀態

為了避免同一天的狀態互相污染，交易索引必須由大到小更新。
在每個 `transactionIndex` 下，依序嘗試：

* 從 `cash` 開多/開空（或維持原持倉）
* 從前一層持倉狀態平倉以完成交易，更新 `cash`

```typescript
for (let dayIndex = 0; dayIndex < dayCount; dayIndex++) {
  // Step 2：計算當天可開倉/可平倉的交易索引上限

  // Step 3：更新最高 cash 狀態（只允許平倉）

  // 交易索引倒序更新，避免同日先平倉再開倉造成連鎖
  for (let transactionIndex = maxOpenTransactionIndex; transactionIndex >= 1; transactionIndex--) {
    const cashBefore = cash[transactionIndex];

    // 嘗試開多或維持多單
    let bestLongHolding = longHolding[transactionIndex];
    const openLongCandidate = cashBefore - price;
    if (openLongCandidate > bestLongHolding) {
      bestLongHolding = openLongCandidate;
    }
    longHolding[transactionIndex] = bestLongHolding;

    // 嘗試開空或維持空單
    let bestShortHolding = shortHolding[transactionIndex];
    const openShortCandidate = cashBefore + price;
    if (openShortCandidate > bestShortHolding) {
      bestShortHolding = openShortCandidate;
    }
    shortHolding[transactionIndex] = bestShortHolding;

    // 嘗試平倉完成一筆交易，更新 cash
    let bestCash = cashBefore;

    const closeLongCandidate = longHolding[transactionIndex - 1] + price;
    if (closeLongCandidate > bestCash) {
      bestCash = closeLongCandidate;
    }

    const closeShortCandidate = shortHolding[transactionIndex - 1] - price;
    if (closeShortCandidate > bestCash) {
      bestCash = closeShortCandidate;
    }

    cash[transactionIndex] = bestCash;
  }

  // ...
}
```

### Step 5：更新 `t = 0` 的開倉狀態（尚未完成任何交易）

當完成交易數為 0 時，仍可在任何一天選擇開多或開空，因此單獨更新 `longHolding[0]` 與 `shortHolding[0]`。

```typescript
for (let dayIndex = 0; dayIndex < dayCount; dayIndex++) {
  // Step 2：計算當天可開倉/可平倉的交易索引上限

  // Step 3：更新最高 cash 狀態（只允許平倉）

  // Step 4：倒序更新交易索引並同步更新開倉/平倉

  // 處理 t = 0 的開倉狀態
  const negativePrice = -price;

  let bestLongHolding0 = longHolding[0];
  if (negativePrice > bestLongHolding0) {
    bestLongHolding0 = negativePrice;
  }
  longHolding[0] = bestLongHolding0;

  let bestShortHolding0 = shortHolding[0];
  if (price > bestShortHolding0) {
    bestShortHolding0 = price;
  }
  shortHolding[0] = bestShortHolding0;
}
```

### Step 6：掃描所有 cash 狀態取得最終答案

結束所有天數後，答案必定是「空手」狀態中最大的利潤，
因此掃描 `cash[0..effectiveTransactionLimit]` 取最大值。

```typescript
// 最終答案為任意完成交易數下的最大 cash
let maxProfit = cash[0];
for (let transactionIndex = 1; transactionIndex <= effectiveTransactionLimit; transactionIndex++) {
  const candidate = cash[transactionIndex];
  if (candidate > maxProfit) {
    maxProfit = candidate;
  }
}

return maxProfit;
```

## 時間複雜度

- 每一天會對交易索引最多更新 `effectiveTransactionLimit` 次，且每次轉移為常數操作。
- `effectiveTransactionLimit` 最多為 `floor(n/2)`，其中 `n = prices.length`。
- 總時間複雜度為 $O(n \times k)$。

> $O(n \times k)$

## 空間複雜度

- 使用三個長度為 `k+1` 的 DP 陣列：`longHolding`、`shortHolding`、`cash`。
- 其餘變數皆為常數級。
- 總空間複雜度為 $O(k)$。

> $O(k)$
