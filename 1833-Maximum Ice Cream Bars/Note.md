# 1833. Maximum Ice Cream Bars

It is a sweltering summer day, and a boy wants to buy some ice cream bars.

At the store, there are `n` ice cream bars. 
You are given an array costs of length n, where `costs[i]` is the price of the $i^{th}$ ice cream bar in coins. 
The boy initially has coins coins to spend, and he wants to buy as many ice cream bars as possible.

Note: The boy can buy the ice cream bars in any order.

Return the maximum number of ice cream bars the boy can buy with `coins` coins.

You must solve the problem by counting sort.

**Constraints:**

- `costs.length == n`
- `1 <= n <= 10^5`
- `1 <= costs[i] <= 10^5`
- `1 <= coins <= 10^8`

## 基礎思路

本題要求在有限預算內，盡可能多地購買冰淇淋，且允許以任意順序購買。核心問題是：如何在不排序原陣列的前提下，以最少成本優先的方式貪心地選購。

在思考解法時，可掌握以下核心觀察：

- **貪心策略的正確性**：
  要最大化購買數量，應優先選擇價格最低的商品，因為每花費相同的預算，買便宜的商品能留下更多空間給後續選購。

- **計數排序天然提供價格由低到高的遍歷順序**：
  將每個價格的商品數量記錄於頻率表後，只需從低到高遍歷索引，即等同於對所有商品由便宜到貴排序，無需額外排序步驟。

- **價格上界可由預算裁剪**：
  超出現有預算的商品必然無法購買，因此頻率表的大小只需涵蓋至「預算」與「最大可能價格」兩者的較小值，節省空間與時間。

- **每個價格點可批量處理**：
  同一價格的商品可用 `Math.floor(remainingCoins / price)` 一次算出最多能買幾個，並與庫存數量取較小值，避免逐一購買的重複計算。

依據以上特性，可以採用以下策略：

- **建立頻率表**，將所有在預算內的商品價格統計入對應索引。
- **由低到高遍歷頻率表**，在每個價格點貪心地購入最多數量。
- **逐步扣除預算並累計數量**，當剩餘預算不足以負擔當前價格時提前終止。

此策略透過計數排序的特性，以線性時間完成貪心選購，整體高效且實作簡潔。

## 解題步驟

### Step 1：計算可負擔的最高價格上界

超過現有預算的商品絕對無法購買，因此以 `coins` 與題目給定的最大價格上限 `100000` 取較小值，作為頻率表的大小，避免建立不必要的空間。

```typescript
// 超出預算的商品永遠無法購買
const maxAffordable = Math.min(coins, 100000);
```

### Step 2：建立頻率表並統計各價格的商品數量

建立大小為 `maxAffordable + 1` 的整數陣列作為頻率表，遍歷所有商品，將價格在預算內的商品計入對應索引，超出預算的直接略過。

```typescript
const frequencyTable = new Int32Array(maxAffordable + 1);

// 建立頻率表，跳過超出預算的商品
for (let index = 0; index < costs.length; index++) {
  const cost = costs[index];
  if (cost <= maxAffordable) {
    frequencyTable[cost]++;
  }
}
```

### Step 3：初始化剩餘預算與購買數量

以 `remainingCoins` 追蹤尚可使用的預算，以 `iceCreamCount` 累計已購買的商品數量，兩者皆從初始值開始。

```typescript
let remainingCoins = coins;
let iceCreamCount = 0;
```

### Step 4：由低到高遍歷頻率表，貪心地批量購入最多數量

從最低價格開始逐一處理，計算在當前價格下能以剩餘預算購入的最多數量（取庫存與可負擔數量的較小值），並從預算中扣除對應花費。

```typescript
// 從最低價開始，利用排序後的頻率表貪心購買
for (let price = 1; price <= maxAffordable; price++) {
  const affordable = Math.min(frequencyTable[price], Math.floor(remainingCoins / price));
  iceCreamCount += affordable;
  remainingCoins -= affordable * price;

  // ...
}
```

### Step 5：當剩餘預算不足以負擔當前價格時提前終止

由於頻率表是由低到高遍歷，若剩餘預算已無法負擔當前價格，則更高價格的商品也必然買不起，可直接跳出迴圈。

```typescript
for (let price = 1; price <= maxAffordable; price++) {
  // Step 4：批量計算並購入當前價格的最多數量

  // 若剩餘預算不足以負擔此價格或更高的商品，則提前終止
  if (remainingCoins < price) {
    break;
  }
}
```

### Step 6：回傳最終購買數量

遍歷結束後，`iceCreamCount` 即為在預算內可購買的最大冰淇淋數量，直接回傳。

```typescript
return iceCreamCount;
```

## 時間複雜度

- 建立頻率表需遍歷所有 `n` 個商品，耗時 $O(n)$；
- 遍歷頻率表的範圍至多為 $O(\min(\text{coins}, 10^5))$，為常數級上界，視為 $O(1)$；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 頻率表大小為 $O(\min(\text{coins}, 10^5))$，為常數級上界，視為 $O(1)$；
- 無其他額外動態空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
