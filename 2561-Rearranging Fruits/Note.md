# 2561. Rearranging Fruits

You have two fruit baskets containing `n` fruits each. 
You are given two 0-indexed integer arrays `basket1` and `basket2` representing the cost of fruit in each basket. 
You want to make both baskets equal. 
To do so, you can use the following operation as many times as you want:

- Chose two indices `i` and `j`, and swap the `ith` fruit of `basket1` with the `jth` fruit of `basket2`.
- The cost of the swap is `min(basket1[i],basket2[j])`.

Two baskets are considered equal if sorting them according to the fruit cost makes them exactly the same baskets.

Return the minimum cost to make both the baskets equal or `-1` if impossible.

**Constraints:**

- `basket1.length == basket2.length`
- `1 <= basket1.length <= 10^5`
- `1 <= basket1[i],basket2[i] <= 10^9`

## 基礎思路

此題要透過多次交換兩個籃子裡面的水果，使得兩個籃子中所有水果成本排序後完全相同。每次交換可從任意籃子中各取出一個水果交換，且成本為兩個水果成本的較小值。因此，我們的高階解題策略如下：

1. **檢查可行性**：
   先確認兩個籃子是否能透過交換達成完全相同的狀態。若某種水果成本的差異數量是奇數，代表無法兩兩配對交換，因此不可能相同。

2. **統計成本差異**：
   使用一個計數器（`Map`）紀錄每種水果成本在兩個籃子中的數量差異，藉此找出需交換的水果種類與數量。

3. **成本最小化策略**：
   考量每次交換的成本，選擇成本最小的方式：

   - 若待交換的水果成本夠低，直接交換。
   - 若待交換的水果成本較高，則透過成本最低的水果進行「間接交換」（即兩次交換），可進一步降低總成本。

## 解題步驟

### Step 1：建立並初始化計數器

我們先準備一個 `Map` 來紀錄兩個籃子中每種水果成本的數量差異，並找出所有水果中的最低成本，以利後續成本計算：

```typescript
const count = new Map<number, number>(); // 紀錄每種水果的數量差異
let globalMinimum = Infinity;            // 所有水果成本中的最低值
const n = basket1.length;
```

### Step 2：統計兩個籃子裡水果數量差異

接著遍歷兩個籃子，計算水果成本的數量差異。

- 對於 `basket1` 的水果數量加一。
- 對於 `basket2` 的水果數量減一。
  同時更新最低成本值：

```typescript
for (let i = 0; i < n; i++) {
  const value1 = basket1[i];
  count.set(value1, (count.get(value1) ?? 0) + 1); // 籃子1水果加1
  if (value1 < globalMinimum) {
    globalMinimum = value1; // 更新最低成本
  }

  const value2 = basket2[i];
  count.set(value2, (count.get(value2) ?? 0) - 1); // 籃子2水果減1
  if (value2 < globalMinimum) {
    globalMinimum = value2; // 更新最低成本
  }
}
```

### Step 3：檢查是否可以透過交換達成相等

檢查每種水果的數量差異，若差異為奇數，表示無法達成相等狀態。
計算總共需要交換的水果數量，若為零代表已經相等：

```typescript
let totalImbalance = 0; // 總共需要交換的水果數量
for (const frequency of count.values()) {
  if (frequency % 2 !== 0) {
    // 若任何一種水果數量差異是奇數，無法達成
    return -1;
  }
  totalImbalance += Math.abs(frequency) >> 1; // 累計所有需交換的數量
}
if (totalImbalance === 0) {
  // 已經相等，不需交換
  return 0;
}
```

### Step 4：列出需要交換的水果成本清單

將每種水果成本按照差異的次數，加入待交換清單：

```typescript
const toSwap = new Array<number>(totalImbalance); // 待交換清單
let index = 0;
for (const [value, frequency] of count) {
  const times = Math.abs(frequency) >> 1;
  for (let j = 0; j < times; j++) {
    toSwap[index++] = value; // 加入需交換的成本
  }
}
```

### Step 5：排序待交換的成本清單

為了最小化成本，需對待交換的水果成本排序：

```typescript
toSwap.sort((a, b) => a - b);
```

### Step 6：計算最小交換總成本

從排序後的清單中，取前半段作為每次交換考慮的成本。

- 若該成本小於「最低成本的兩倍」，直接使用。
- 若該成本大於等於「最低成本的兩倍」，則透過最低成本水果交換兩次更划算。

```typescript
const swapCount = totalImbalance >> 1; // 需要交換的次數
let totalCost = 0;
const doubleMinimum = globalMinimum * 2;

for (let i = 0; i < swapCount; i++) {
  if (toSwap[i] < doubleMinimum) {
    totalCost += toSwap[i]; // 直接交換
  } else {
    totalCost += doubleMinimum; // 使用最低成本交換兩次
  }
}
```

### Step 7：回傳最終答案

最後回傳計算出的最小總成本：

```typescript
return totalCost;
```

## 時間複雜度

- 計數差異遍歷兩個長度為 $n$ 的陣列，複雜度為 $O(n)$。
- 建立交換清單長度至多為 $n$，排序複雜度為 $O(n \log n)$。
- 其他步驟皆為線性 $O(n)$。
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- 使用額外的 `Map` 統計數量差異，最差狀況下需額外空間為 $O(n)$。
- 儲存待交換成本清單 `toSwap`，額外空間最差狀況為 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
