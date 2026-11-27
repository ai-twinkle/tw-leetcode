# 3946. Maximum Number of Items From Sale I

You are given a 2D integer array `items`, where `items[i] = [factor_i, price_i]` represents the `i^{th}` item. 
You are also given an integer `budget`.

There are unlimited copies of each item available for purchase. 
You may buy any number of copies of any items such that the total cost of the purchased copies is at most `budget`.

After buying items, you may receive free copies according to the following rules:

- For each item `i` that you bought at least one copy of, 
  you receive one free copy of every item `j` such that `j != i` and `factor_i` divides `factor_j`.
- Buying multiple copies of the same item `i` does not give additional free copies through item `i`.
- The same item `j` can be received multiple times for free if it is received from purchases of different item types.

Return the maximum total number of item copies you can obtain, 
including both purchased copies and free copies, while spending at most `budget` on purchased items.

**Constraints:**

- `1 <= items.length <= 1000`
- `items[i] = [factor_i, price_i]`
- `1 <= factor_i, price_i <= 1500`
- `1 <= budget <= 1500`

## 基礎思路

本題要在預算限制下購買物品，並依「因數整除」規則獲得免費複本，求最多能取得的物品總份數。表面上購買數量不受限，但贈品規則只與「是否買過某種物品」有關，因此可以把問題拆成兩個彼此獨立的部分處理。

在思考解法時，可掌握以下核心觀察：

- **贈品只取決於「是否購買過」，與購買數量無關**：
  同一種物品不論買幾份，透過它獲得的免費複本都只有一輪。因此每種物品的「第一份」與「後續份數」價值截然不同，應分開看待。

- **第一份的價值可預先算出**：
  購買某種物品的第一份時，會得到自身一份，並對每個因數為其倍數的其他物品各得一份贈品。合計恰為「因數為該因數倍數的物品總數」，與其他購買決策無關。

- **後續份數每份只值 1**：
  已買過的物品再買，不會帶來新的贈品，每份僅貢獻自身。在這種情況下，用剩餘預算購買價格最低的物品最划算。

- **因數值域很小，可快速統計倍數數量**：
  因數上限僅 1500，可先統計每個因數出現的次數，再以枚舉倍數的方式（調和級數）快速求出每個因數的倍數物品數。

依據以上特性，可以採用以下策略：

- **預先統計每個因數的倍數物品數**，作為購買該物品第一份時的固定價值。
- **以 0/1 背包決定要購買哪些物品種類的第一份**，求出每個花費上限下可得的最大價值。
- **枚舉背包實際使用的花費，將剩餘預算全數用於最便宜的物品**，取所有情況中的最大總數作為答案。

此策略將「贈品組合」與「額外購買」完全解耦，能在多項式時間內求得最優解。

## 解題步驟

### Step 1：初始化基本參數

先記錄物品數量，並設定因數的上限，作為後續統計陣列的大小依據。

```typescript
const itemCount = items.length;
const maximumFactor = 1500;
```

### Step 2：建立因數直方圖並找出最低價格

掃描所有物品，統計每個因數出現的次數，同時記錄所有物品中的最低價格，供最後分配剩餘預算時使用。

```typescript
// 建立因數的直方圖，以便快速計算倍數數量
const factorFrequency = new Int32Array(maximumFactor + 1);
let minimumPrice = Infinity;
for (let index = 0; index < itemCount; index++) {
  const item = items[index];
  factorFrequency[item[0]]++;
  if (item[1] < minimumPrice) {
    minimumPrice = item[1];
  }
}
```

### Step 3：計算每個因數的倍數物品數量

對每個實際出現過的因數，枚舉其所有倍數，並累加這些倍數的出現次數。這個總數就是購買該因數物品第一份時能取得的份數（含自身）。未出現的因數不需要計算，直接略過。

```typescript
// multipleCount[f] = 因數為 f 之倍數的物品數量
const multipleCount = new Int32Array(maximumFactor + 1);
for (let factor = 1; factor <= maximumFactor; factor++) {
  if (factorFrequency[factor] === 0) {
    continue;
  }
  let total = 0;
  for (let multiple = factor; multiple <= maximumFactor; multiple += factor) {
    total += factorFrequency[multiple];
  }
  multipleCount[factor] = total;
}
```

### Step 4：初始化背包陣列並過濾買不起的物品

建立 `best` 陣列，代表在各花費上限下，購買一組相異物品種類各一份所能得到的最大價值。接著逐一處理每種物品；若其價格已超出總預算，則不可能購買，直接略過。

```typescript
// best[cost] = 總花費不超過 `cost` 時，所選相異物品種類集合的最大價值
const best = new Int32Array(budget + 1);
for (let index = 0; index < itemCount; index++) {
  const item = items[index];
  const price = item[1];
  if (price > budget) {
    continue;
  }

  // ...
}
```

### Step 5：以 0/1 背包更新購買第一份的最大價值

購買該物品第一份的價值，即其因數的倍數物品數量。由於每種物品的第一份只能選一次，花費須由大到小倒序更新，避免同一物品在同一輪被重複計入。

```typescript
for (let index = 0; index < itemCount; index++) {
  // Step 4：取得價格並略過超出預算的物品

  // 第一份複本可得到自身，並為每個其他倍數物品各得到一份免費複本（不含自身）
  const value = multipleCount[item[0]];
  for (let cost = budget; cost >= price; cost--) {
    const candidate = best[cost - price] + value;
    if (candidate > best[cost]) {
      best[cost] = candidate;
    }
  }
}
```

### Step 6：將剩餘預算用於最便宜的物品並取最大值

枚舉背包部分實際使用的花費。剩餘預算全數購買最便宜的物品，每份貢獻 1。兩部分相加即為該情況下的總份數，取所有情況中的最大值。

```typescript
// 將剩餘預算用於購買最便宜的物品，每 minimumPrice 換得一份
let answer = 0;
for (let cost = 0; cost <= budget; cost++) {
  const total = best[cost] + Math.floor((budget - cost) / minimumPrice);
  if (total > answer) {
    answer = total;
  }
}
```

### Step 7：回傳最終結果

所有花費分配情況皆已比較完畢，`answer` 即為可取得的最大物品總份數。

```typescript
return answer;
```

## 時間複雜度

- 建立因數直方圖並找出最低價格需 $O(n)$，其中 $n$ 為物品數量；
- 計算倍數數量時，對每個因數枚舉其倍數，總次數為調和級數 $O(k \log k)$，其中 $k$ 為因數上限；
- 0/1 背包對每種物品倒序掃描整個預算範圍，需 $O(n \cdot m)$，其中 $m$ 為預算；
- 最後枚舉花費分配需 $O(m)$。
- 總時間複雜度為 $O(n \cdot m + k \log k)$。

> $O(n \cdot m + k \log k)$

## 空間複雜度

- 因數直方圖與倍數數量陣列皆為 $O(k)$；
- 背包陣列為 $O(m)$；
- 總空間複雜度為 $O(k + m)$。

> $O(k + m)$
