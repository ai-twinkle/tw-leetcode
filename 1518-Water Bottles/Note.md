# 1518. Water Bottles

There are `numBottles` water bottles that are initially full of water. 
You can exchange `numExchange` empty water bottles from the market with one full water bottle.

The operation of drinking a full water bottle turns it into an empty bottle.

Given the two integers `numBottles` and `numExchange`, return the maximum number of water bottles you can drink.

**Constraints:**

- `1 <= numBottles <= 100`
- `2 <= numExchange <= 100`

## 基礎思路

本題是典型的「資源轉換與最大化使用」問題。你有若干瓶裝滿水的水瓶，喝掉後變成空瓶。當你收集到一定數量的空瓶（由 `numExchange` 指定）時，可以兌換一瓶新的水，再次飲用並產生新的空瓶。

我們要計算：最多能喝幾瓶水？

在思考解法時，需要掌握以下幾個重點：

- **喝水會產生空瓶**，這些空瓶可以再被拿去兌換；
- **兌換需要固定數量的空瓶**，每次兌換可喝一瓶新的水；
- **兌換過程是循環性的**：新的水瓶又可以喝、又能產生空瓶，直到空瓶不足以再兌換為止。

為了解決這個問題，可以觀察：

- 每次兌換會消耗 `numExchange` 個空瓶，得到 1 個新的水瓶；
- 而喝掉這個新水瓶後，又會產生 1 個新的空瓶；
- 等效來說：每次兌換其實是「用 `numExchange - 1` 個空瓶換 1 次喝水的機會」；
- 總共能兌換幾次，即為 `(numBottles - 1) / (numExchange - 1)`（整數除法）。

因此，最終答案就是：**初始可喝瓶數 + 可兌換次數**。

## 解題步驟

### Step 1：計算可用於換水的空瓶數與實際換得的水瓶數

將問題轉換為「可以進行多少次兌換」的數學計算：

```typescript
// 換水次數的分子：扣掉第一次喝的水後，剩下的空瓶數
const numerator = numBottles - 1;

// 每次兌換實際等價於消耗 (numExchange - 1) 個空瓶
const denominator = numExchange - 1;

// 使用整數除法計算總共可以額外喝到幾瓶水
const extraFromExchange = (numerator / denominator) | 0;
```

### Step 2：回傳總共能喝的瓶數

初始瓶數加上可從兌換中再喝到的額外瓶數即為總數。

```typescript
// 回傳總共能喝的瓶數：原始 + 兌換來的
return numBottles + extraFromExchange;
```

## 時間複雜度

- 所有運算皆為常數時間的數學運算。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 僅使用少數變數記錄中間結果，無額外資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
