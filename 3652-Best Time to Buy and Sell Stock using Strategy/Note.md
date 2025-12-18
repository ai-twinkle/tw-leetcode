# 3652. Best Time to Buy and Sell Stock using Strategy

You are given two integer arrays `prices` and `strategy`, where:

- `prices[i]` is the price of a given stock on the $i^{th}$ day.
- `strategy[i]` represents a trading action on the $i^{th}$ day, where:
  - `-1` indicates buying one unit of the stock.
  - `0` indicates holding the stock.
  - `1` indicates selling one unit of the stock.

You are also given an even integer `k`, and may perform at most one modification to `strategy`. 
A modification consists of:

- Selecting exactly `k` consecutive elements in `strategy`.
- Set the first `k / 2` elements to `0` (hold).
- Set the last `k / 2` elements to `1` (sell).

The profit is defined as the sum of `strategy[i] * prices[i]` across all days.

Return the maximum possible profit you can achieve.

Note: There are no constraints on budget or stock ownership, so all buy and sell operations are feasible regardless of past actions.

**Constraints:**

- `2 <= prices.length == strategy.length <= 10^5`
- `1 <= prices[i] <= 10^5`
- `-1 <= strategy[i] <= 1`
- `2 <= k <= prices.length`
- `k` is even

## 基礎思路

本題中，我們有一個既定的交易策略 `strategy`，其每天的獲利為
`strategy[i] * prices[i]`，整體獲利即為所有天數的加總。

題目允許我們 **至多一次** 對策略進行修改，修改方式具備以下特性：

* 修改區間必須是 **長度為 `k` 的連續區段**；
* 前 `k / 2` 天會被強制設為「不操作（0）」；
* 後 `k / 2` 天會被強制設為「賣出（1）」。

因此，修改某一區段後，該區段的總貢獻會變為：

* 前半段：貢獻為 `0`
* 後半段：貢獻為「該段價格總和」

我們可以從以下角度思考整體策略：

* **先計算原始策略的基礎獲利**；
* 對於任一長度為 `k` 的區段，比較：

    * 原本該區段的貢獻值；
    * 套用修改後的新貢獻值；
* 修改帶來的「獲利變化量」可表示為
  **`(後半段價格總和) − (原區段貢獻總和)`**；
* 我們只需找出能使這個變化量最大的區段即可。

由於區段長度固定為 `k`，可透過 **滑動視窗** 技術，在 $O(n)$ 時間內枚舉所有可能的修改位置並維護所需的區段資訊。

## 解題步驟

### Step 1：初始化參數與變數

先取得天數，並計算視窗的一半大小；
同時準備變數來追蹤：

* 原始總獲利
* 當前視窗的原始貢獻值
* 當前視窗後半段的價格總和

```typescript
const dayCount = prices.length;
const halfWindowSize = k >>> 1;

let baseProfit = 0;
let windowValueSum = 0;
let secondHalfPriceSum = 0;
```

### Step 2：一次遍歷計算基礎獲利與初始視窗資訊

在同一次迴圈中完成三件事：

1. 累加整體原始策略的獲利；
2. 初始化第一個長度為 `k` 的視窗，其原始貢獻總和；
3. 初始化該視窗「後半段」的價格總和。

```typescript
for (let dayIndex = 0; dayIndex < dayCount; dayIndex++) {
  const price = prices[dayIndex];
  const action = strategy[dayIndex];
  const currentValue = action * price;

  // 累加原始策略的總獲利
  baseProfit += currentValue;

  // 初始化第一個長度為 k 的視窗
  if (dayIndex < k) {
    windowValueSum += currentValue;

    // 後半段僅需累加價格（因修改後 action 固定為 1）
    if (dayIndex >= halfWindowSize) {
      secondHalfPriceSum += price;
    }
  }
}
```

### Step 3：初始化答案與視窗滑動範圍

將不做任何修改時的獲利視為初始最佳解，
並計算最後一個合法視窗的起始位置。

```typescript
let bestProfit = baseProfit;
const lastStartIndex = dayCount - k;
```

### Step 4：枚舉每個可能的修改區段起點

將每一個長度為 `k` 的區段視為修改候選，
計算若在該區段套用修改後的總獲利。

```typescript
for (let startIndex = 0; startIndex <= lastStartIndex; startIndex++) {
  // 將視窗的原始貢獻替換為：前半段 0 + 後半段價格總和
  const modifiedProfit = baseProfit + (secondHalfPriceSum - windowValueSum);
  if (modifiedProfit > bestProfit) {
    bestProfit = modifiedProfit;
  }

  // ...
}
```

### Step 5：處理視窗滑動的終止條件

當目前起點已是最後一個合法起點時，不再需要滑動視窗。

```typescript
for (let startIndex = 0; startIndex <= lastStartIndex; startIndex++) {
  // Step 4：計算套用修改後的獲利並更新最佳解

  if (startIndex === lastStartIndex) {
    break;
  }

  // ...
}
```

### Step 6：以 O(1) 更新視窗內的統計值（滑動視窗核心）

將視窗向右滑動一格時：

* 從 `windowValueSum` 移除最左邊一天的原始貢獻；
* 加入新進入視窗的一天的原始貢獻；
* 同步更新後半段的價格總和。

```typescript
for (let startIndex = 0; startIndex <= lastStartIndex; startIndex++) {
  // Step 4：計算套用修改後的獲利並更新最佳解

  // Step 5：處理視窗終止條件

  // 視窗左端移出
  const removeIndex = startIndex;
  const addIndex = startIndex + k;

  windowValueSum -= strategy[removeIndex] * prices[removeIndex];
  windowValueSum += strategy[addIndex] * prices[addIndex];

  // 後半段價格總和同步更新
  const secondHalfRemoveIndex = startIndex + halfWindowSize;
  secondHalfPriceSum -= prices[secondHalfRemoveIndex];
  secondHalfPriceSum += prices[addIndex];
}
```

### Step 7：回傳最大可達獲利

完成所有區段枚舉後，`bestProfit` 即為答案。

```typescript
return bestProfit;
```

## 時間複雜度

- 初始化與基礎計算為一次線性掃描；
- 滑動視窗枚舉所有起點，每次更新皆為 $O(1)$；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用常數個變數來維護累計值；
- 不依賴額外陣列或資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
