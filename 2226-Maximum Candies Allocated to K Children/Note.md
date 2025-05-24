# 2226. Maximum Candies Allocated to K Children

You are given a 0-indexed integer array `candies`. 
Each element in the array denotes a pile of `candies` of size `candies[i]`. 
You can divide each pile into any number of sub piles, 
but you cannot merge two piles together.

You are also given an integer `k`. 
You should allocate piles of `candies` to `k` children such that each child gets the same number of `candies`. 
Each child can be allocated `candies` from only one pile of `candies` and some piles of `candies` may go unused.

Return the maximum number of `candies` each child can get.

**Constraints:**

- `1 <= candies.length <= 10^5`
- `1 <= candies[i] <= 10^7`
- `1 <= k <= 10^12`

## 基礎思路

這題的核心目標是「把一堆糖果公平地分給一群小朋友，每個人都拿到盡可能多的糖果」。一開始，我們會先把所有糖果堆加總，算出總共到底有多少顆糖果，同時記錄一下最大的糖果堆有多少顆，因為這會決定每個小朋友最多可能拿到幾顆糖果。

接下來有兩個情況：

- 如果所有的糖果加起來連每個小朋友發一顆都不夠，那沒辦法，就直接回傳 0。
- 如果糖果足夠，我們就要想：「到底每個小朋友最多可以拿幾顆糖果呢？」

這時候「二分搜尋」將會十分好用。我們設定一個合理範圍（最少一顆、最多不超過糖果堆中最大的那一堆，也不超過平均分配數量），在這個範圍內不斷猜測可能的答案：

1. 每次猜測一個中間值（mid），看這個數量的糖果能不能成功地分給所有的小朋友。
2. 如果可以，就表示「也許還可以更多！」我們就試試看更大的數字。
3. 如果不行，就表示「太多了，大家分不完」，我們試試看小一點的數字。

這樣不斷縮小範圍，最後找到的數字，就是每個小朋友最多可以拿到的糖果數量了。

以下使用你提供的寫作風格，撰寫本題完整的步驟題解、時間複雜度與空間複雜度驗證：

## 解題步驟

### Step 1: 計算糖果總數與最大糖果堆

在開始二分搜尋之前，我們先計算所有糖果的總數，同時找出最大的糖果堆。

```typescript
let totalCandies = 0;      // 紀錄所有糖果的總數
let largestCandyPile = 0;  // 紀錄糖果數量最多的那一堆

for (const pile of candyPiles) {
  totalCandies += pile;
  largestCandyPile = Math.max(largestCandyPile, pile);
}
```

### Step 2: 特殊情況的判斷

如果總糖果數量連每個小孩分一顆都不足，直接返回 0。

```typescript
// 如果總糖果數量連每個小孩分一顆都不足，直接返回 0
if (totalCandies < numChildren) {
  return 0;
}
```

### Step 3: 透過二分搜尋找最大值

接下來，我們透過二分搜尋找到每個小孩最多可以拿到的糖果數量。

```typescript
let minCandies = 1;  // 每個小孩至少分一顆糖果
let maxCandies = Math.min(largestCandyPile, Math.floor(totalCandies / numChildren));
let optimalCandies = 0;  // 儲存目前找到的最佳解

while (minCandies <= maxCandies) {
  const midCandies = (minCandies + maxCandies) >> 1;  // 快速整數除法
  
  // 計算以 midCandies 為標準，每個小孩是否都能分到糖果
  let childrenSatisfied = 0;
  for (const pile of candyPiles) {
    childrenSatisfied += Math.floor(pile / midCandies);
    if (childrenSatisfied >= numChildren) break;  // 提前結束避免浪費時間
  }

  if (childrenSatisfied >= numChildren) {
    // 若能滿足，表示目前答案可行，但仍嘗試找更大的數值
    optimalCandies = midCandies;
    minCandies = midCandies + 1;
  } else {
    // 否則，答案不可行，降低糖果數量繼續嘗試
    maxCandies = midCandies - 1;
  }
}

return optimalCandies;
```

## 時間複雜度

- **計算糖果總數與最大堆大小**：遍歷所有糖果堆，共需 $O(n)$ 時間。
- **二分搜尋**：搜尋範圍為 $[1, M]$（M 為最大糖果堆大小），共需進行 $O(\log{M})$ 次操作，每次需遍歷 $O(n)$ 堆糖果進行檢查，故二分搜尋步驟為 $O(n \log{M})$。
- 總時間複雜度為 $O(n) + O(n \log{M})$，即 $O(n \log{M})$。

> $O(n \log{M})$

## 空間複雜度

- 不需額外的數組或對應表，故空間複雜度為 $O(1)$。
- 總空間複雜度為 $O(1)$。

> $O(1)$
