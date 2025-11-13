# 121. Best Time to Buy and Sell Stock

You are given an array `prices` where `prices[i]` is the price of a given stock on the $i^{th}$ day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. 
If you cannot achieve any profit, return `0`.

**Constraints:**

- `1 <= prices.length <= 10^5`
- `0 <= prices[i] <= 10^4`

## 基礎思路

本題要求從每天的股價中，找到「先買後賣」能得到的最大獲利。
因為只能進行一次買賣（買一天、賣一天且賣的時間必須在買之後），我們需要在單次掃描中同時追蹤：

- **最佳買入價（目前為止最低的價格）**
- **以目前價格出售時能得到的最大獲利**

在思考解法時，有幾個關鍵觀點：

- 當前價格若想賣出，最佳買入時機一定是「在它前面」出現過的最低價格；
- 若遇到更低的價格，這將成為新的買入時機，取代舊的最低價；
- 只需掃描一次即可求得最大獲利，因此時間複雜度可達到線性；
- 若全程無法獲利（股價不斷下降），則回傳 0。

基於以上特性，我們可以採用以下策略：

- **單趟掃描**：一路掃描陣列，不需回頭；
- **持續維護最低買入價**：遇到更低價即更新；
- **即時計算賣出獲利**：對每一天，都用「今日價格 − 最低買入價」計算潛在收益；
- **更新最大獲利**：遍歷過程中即時維護最佳解。

## 解題步驟

### Step 1：處理陣列長度不足的情況

若價格只有一天，無法進行交易，直接回傳 0。

```typescript
// 若價格數量不足兩天，無法進行交易
const length = prices.length;
if (length <= 1) {
  return 0;
}
```

### Step 2：初始化最低買入價與最大獲利

紀錄「目前看過的最低股價」及「目前能達成的最佳獲利」。

```typescript
// 初始化「目前最低買入價」為第一天股價
let minimumPriceSoFar = prices[0];

// 初始化最佳獲利為 0（至少不會是負值）
let maximumProfit = 0;
```

### Step 3：單趟掃描所有價格並計算最大獲利

透過單次迴圈依序處理每一天的價格，並且：

- 先計算若今天賣出可得的獲利；
- 若比目前最佳獲利更好則更新；
- 若今天價格比目前最低價更低，則更新最低買入價。

```typescript
// 單趟掃描所有價格
for (let index = 1; index < length; index++) {
  const currentPrice = prices[index];

  // 計算若今天賣出所能獲得的潛在獲利
  const potentialProfit = currentPrice - minimumPriceSoFar;

  // 若潛在獲利比目前最佳獲利大，更新最大獲利
  if (potentialProfit > maximumProfit) {
    maximumProfit = potentialProfit;
  }

  // 若今日價格更低，更新「最低買入價」
  if (currentPrice < minimumPriceSoFar) {
    minimumPriceSoFar = currentPrice;
  }
}
```

### Step 4：回傳最大獲利

掃描完成後，最佳解即為紀錄的最大獲利值。

```typescript
// 回傳可達成的最大獲利（如無獲利則為 0）
return maximumProfit;
```

## 時間複雜度

- 單趟掃描價格陣列，每一步皆為 O(1) 更新或比較。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用固定的變數儲存最低價格與最大獲利。
- 總空間複雜度為 $O(1)$。

> $O(1)$
