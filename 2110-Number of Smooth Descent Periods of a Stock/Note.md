# 2110. Number of Smooth Descent Periods of a Stock

You are given an integer array `prices` representing the daily price history of a stock, 
where `prices[i]` is the stock price on the $i^{th}$ day.

A smooth descent period of a stock consists of one or more contiguous days 
such that the price on each day is lower than the price on the preceding day by exactly `1`. 
The first day of the period is exempted from this rule.

Return the number of smooth descent periods.

**Constraints:**

- `1 <= prices.length <= 10^5`
- `1 <= prices[i] <= 10^5`

## 基礎思路

本題要求計算股票價格序列中，所有「平滑下降區段（smooth descent period）」的數量。

一個平滑下降區段需滿足以下條件：

* 區段為**連續的天數**
* 從第二天開始，每一天的價格必須**恰好比前一天少 1**
* 區段長度至少為 1（單獨一天本身也視為合法區段）

在思考解法時，我們可以得到以下重要觀察：

* **每一天本身一定是一個合法區段**，因此答案至少等於天數。
* 若某一天的價格恰好比前一天少 1，則代表可以「延續」前一天的下降區段。
* 若下降條件中斷，則必須重新開始計算新的下降區段。
* 對於一段連續的平滑下降長度為 `L` 的區段，其能貢獻的平滑下降區段數量正好是 `1 + 2 + ... + L`，但我們可以在掃描過程中**逐步累加**，無需額外計算。

因此，整體策略為：

* 使用一次線性掃描
* 動態維護「目前連續平滑下降的長度」
* 每掃描到一天，就將「以該天結尾」的所有合法區段數量加入答案

此方式可在一次遍歷中完成計算，效率最佳。

## 解題步驟

### Step 1：初始化基本狀態

由於每一天本身即構成一個合法的平滑下降區段，因此：

* 初始答案至少為 `1`
* 當前下降區段長度從 `1` 開始
* 紀錄前一天的價格，供後續比較使用

```typescript
const pricesLength = prices.length;

// 每一天本身就是一個合法的平滑下降區段
let totalPeriods = 1;

// 當前連續平滑下降區段的長度
let currentDescentLength = 1;

let previousPrice = prices[0];
```

### Step 2：由左至右遍歷價格序列

從第 2 天開始逐一檢查價格變化，判斷是否能延續平滑下降區段。

```typescript
for (let index = 1; index < pricesLength; index++) {
  const currentPrice = prices[index];

  // ...
}
```

### Step 3：判斷是否能延續平滑下降區段

若當前價格剛好比前一天少 `1`，代表可延續下降區段；
否則表示下降條件中斷，需重新開始計算。

```typescript
for (let index = 1; index < pricesLength; index++) {
  // Step 2：由左至右遍歷價格序列

  // 若價格恰好下降 1，則可延續平滑下降區段
  if (currentPrice === previousPrice - 1) {
    currentDescentLength += 1;
  } else {
    // 否則重新開始新的下降區段
    currentDescentLength = 1;
  }

  // ...
}
```

### Step 4：累加以當前天結尾的所有平滑下降區段

以當前天作為結尾，能形成的平滑下降區段數量，
正好等於目前的 `currentDescentLength`，直接累加即可。

```typescript
for (let index = 1; index < pricesLength; index++) {
  // Step 2：由左至右遍歷價格序列

  // Step 3：判斷是否能延續平滑下降區段

  // 累加所有以當前天結尾的平滑下降區段
  totalPeriods += currentDescentLength;
  previousPrice = currentPrice;
}
```

### Step 5：回傳最終結果

當所有天數遍歷完成後，`totalPeriods` 即為所有平滑下降區段的總數。

```typescript
return totalPeriods;
```

## 時間複雜度

- 僅進行一次線性掃描
- 每個元素只做常數次比較與加法
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

-僅使用固定數量的變數來追蹤狀態
- 不使用額外與輸入大小成比例的空間
- 總空間複雜度為 $O(1)$。

> $O(1)$
