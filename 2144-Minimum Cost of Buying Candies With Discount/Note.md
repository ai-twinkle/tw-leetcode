# 2144. Minimum Cost of Buying Candies With Discount

A shop is selling candies at a discount. 
For every two candies sold, the shop gives a third candy for free.

The customer can choose any candy to take away for free as long as the cost of the chosen candy is less than or equal 
to the minimum cost of the two candies bought.

- For example, if there are `4` candies with costs `1`, `2`, `3`, and `4`, 
  and the customer buys candies with costs `2` and `3`, they can take the candy with cost `1` for free, 
  but not the candy with cost `4`.

Given a 0-indexed integer array `cost`, where `cost[i]` denotes the cost of the $i^{th}$ candy, 
return the minimum cost of buying all the candies.

**Constraints:**

- `1 <= cost.length <= 100`
- `1 <= cost[i] <= 100`

## 基礎思路

本題以「買二送一」促銷規則為前提，免費糖果的成本必須小於或等於所購買兩顆糖果中的較小值。目標是找出將所有糖果都帶走的最小總花費。

在思考解法時，可掌握以下核心觀察：

- **越貴的糖果越值得「成對購買」**：
  由於免費糖果必須 ≤ 同次購買中較便宜的那顆，最有效率的方式是先將糖果由貴至便宜排列，每三顆為一組，前兩顆付費、第三顆（即此組中最便宜者）享免費。

- **價格範圍很小，無需實際排序**：
  成本的值域受嚴格上界限制，因此可改採桶計數，把每個成本的出現次數累積起來，由高至低掃描即可模擬排序遞減後的順序。

- **免費位置在排序後的索引上具規律性**：
  在排序遞減的序列中，免費位置永遠落在「索引對 3 取餘為 2」的位置，這個事實與糖果的實際數值無關。

- **同一個成本值佔據連續的位置區段，可用前綴差一次處理**：
  由於相同成本的糖果在排序序列中佔據一段連續區間，只需要知道此段的起點與終點，便能透過區段內「索引對 3 取餘為 2」的位置數，直接算出此段中有幾顆是免費的。

依據以上特性，可以採用以下策略：

- **以桶計數記錄每個成本值的出現次數**，避免實際的比較排序。
- **由高至低逐一處理每個成本值**，並維護一個游標代表目前在排序遞減序列中已推進到的位置。
- **對每個出現過的成本值，先計算其在序列中所佔的區段，再以前綴差求得區段內的免費位置數**。
- **僅將付費位置的成本累加進總和**，最後得到的即為購買所有糖果的最小花費。

此策略不需要建構出實際的排序結果，就能在線性時間內完成統計。

## 解題步驟

### Step 1：以桶計數統計每個成本值的出現次數

由於 `cost[i]` 的範圍為 1 到 100，可使用固定大小的桶陣列累積每個 value 的出現次數，藉此略過實際的比較排序；又因 `cost.length <= 100`，任一 value 的出現次數最多也只有 100，可放入 `Uint8Array` 中。

```typescript
const length = cost.length;

// 對每個成本值進行桶計數；因 length <= 100，Uint8Array 足以容納任何出現次數
const valueCounts = new Uint8Array(101);
for (let index = 0; index < length; index++) {
  valueCounts[cost[index]]++;
}
```

### Step 2：初始化累積總成本與序列位置游標

`totalCost` 用於累加所有付費糖果的成本；`position` 表示目前處理過的糖果在排序遞減序列中所佔的位置數，亦即下一個尚待填入的位置索引。

```typescript
let totalCost = 0;
let position = 0;
```

### Step 3：由高至低掃描每個 value，略過未出現者

從最大成本 100 往下逐一掃描；若該 value 在 `cost` 中未曾出現，無需處理，直接跳到下一個 value。

```typescript
// 由高至低掃描每個 value；在排序遞減的序列中，每三顆的最後一顆為免費
for (let value = 100; value >= 1; value--) {
  const count = valueCounts[value];
  if (count === 0) {
    continue;
  }

  // ...
}
```

### Step 4：計算此 value 所佔據的區段右界

此 value 共出現 `count` 次，在排序遞減的序列中佔據 `[position, position + count - 1]` 共 `count` 個位置；先以 `nextPosition = position + count` 標示此區段的右界（不含），便於後續以半開區間 `[position, nextPosition)` 進行前綴運算。

```typescript
for (let value = 100; value >= 1; value--) {
  // Step 3：略過未出現的 value

  // 此 value 在排序遞減序列中佔據位置 [position, position + count - 1]
  const nextPosition = position + count;

  // ...
}
```

### Step 5：以前綴差計算區段內的免費位置數

在排序遞減的序列中，免費位置滿足「索引對 3 取餘為 2」；
從 `[0, n)` 中此類索引的個數恰為 $\lfloor n / 3 \rfloor$，因此 `[position, nextPosition)` 區段內的免費位置數可直接以 $\lfloor \text{nextPosition} / 3 \rfloor - \lfloor \text{position} / 3 \rfloor$ 得出，無需逐位置檢查。

```typescript
for (let value = 100; value >= 1; value--) {
  // Step 3：略過未出現的 value

  // Step 4：計算此 value 所佔區段的右界

  // 以前綴差計算 [position, nextPosition) 區段內的免費位置數（索引對 3 取餘為 2 者）
  const freeCount = ((nextPosition / 3) | 0) - ((position / 3) | 0);

  // ...
}
```

### Step 6：累加付費位置的成本並推進位置游標

此 value 在區段內需付費的糖果數為 `count - freeCount`，乘上 `value` 後加入 `totalCost`；最後將 `position` 推進至 `nextPosition`，準備處理下一個更小的 value。

```typescript
for (let value = 100; value >= 1; value--) {
  // Step 3：略過未出現的 value

  // Step 4：計算此 value 所佔區段的右界

  // Step 5：以前綴差計算免費位置數

  // 僅將付費位置的成本累加至總和
  totalCost += value * (count - freeCount);
  position = nextPosition;
}
```

### Step 7：回傳購買所有糖果的最小總花費

所有 value 處理完畢後，`totalCost` 即為將所有糖果帶走的最小成本。

```typescript
return totalCost;
```

## 時間複雜度

- 桶計數階段需遍歷 `cost` 陣列一次：$O(n)$。
- 由高至低掃描 $V$（= 100）個 value，每個 value 的處理為常數時間：$O(V)$。
- 總時間複雜度為 $O(n + V)$，由於 $V$ 為固定常數，可視為線性。

> $O(n + V)$

## 空間複雜度

- 計數桶陣列 `valueCounts` 大小固定為 101，僅依 value 範圍 $V$：$O(V)$。
- 其餘僅使用常數個輔助變數。
- 總空間複雜度為 $O(V)$，由於 $V$ 為常數，可視為 $O(1)$。

> $O(V)$
