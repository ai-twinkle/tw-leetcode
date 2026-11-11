# 3789. Minimum Cost to Acquire Required Items

You are given five integers `cost1`, `cost2`, `costBoth`, `need1`, and `need2`.

There are three types of items available:

- An item of type 1 costs `cost1` and contributes 1 unit to the type 1 requirement only.
- An item of type 2 costs `cost2` and contributes 1 unit to the type 2 requirement only.
- An item of type 3 costs `costBoth` and contributes 1 unit to both type 1 and type 2 requirements.

You must collect enough items so that the total contribution toward type 1 is at least `need1` 
and the total contribution toward type 2 is at least `need2`.

Return an integer representing the minimum possible total cost to achieve these requirements.

**Constraints:**

- `1 <= cost1, cost2, costBoth <= 10^6`
- `0 <= need1, need2 <= 10^9`

## 基礎思路

本題有兩種需求量需要滿足，可購買的物品有三類：只滿足第一種需求的、只滿足第二種需求的，以及同時對兩種需求各貢獻一單位的共享物品。目標是以最低總成本達成兩項需求。
由於需求量最大可達 `10^9`，無法逐一枚舉購買數量，因此必須從成本函數的結構切入。

在思考解法時，可掌握以下核心觀察：

- **決策的關鍵只有共享物品的數量**：
  一旦決定購買多少個共享物品，剩餘不足的部分就只能用對應的單一物品補足，總成本隨之唯一確定。

- **總成本是共享數量的凸分段線性函數**：
  每增加一個共享物品，會同時減少兩種需求的缺口；當某一種需求已被共享物品完全覆蓋，再增加共享物品就只能抵銷另一種需求。因此成本的斜率只會在特定位置改變，且整體呈凸性。

- **凸分段線性函數的最小值必落在轉折點上**：
  轉折點只有三處：完全不買共享物品、共享數量恰好等於較小需求、共享數量恰好等於較大需求。超過較大需求後只會增加成本，不必考慮。

- **數值範圍在安全整數之內**：
  單價最大 `10^6`、需求量最大 `10^9`，任何候選成本皆不超過約 `2 × 10^15`，仍在雙精度浮點數可精確表示的整數範圍內，不會產生精度問題。

依據以上特性，可以採用以下策略：

- **先找出兩項需求中的較小值與較大值**，作為轉折點的依據。
- **分別計算三個轉折點對應的總成本**：全部分開購買、重疊部分用共享物品並以單一物品補足其餘、全部以共享物品覆蓋。
- **取三者中的最小值作為答案**。

此策略只需常數次運算即可得到最佳解，不受需求量大小影響。

## 解題步驟

### Step 1：取得兩項需求中的較小值與較大值

總成本對共享物品數量是凸分段線性函數，最佳解必落在轉折點上。這些轉折點由較小需求與較大需求決定，因此先將兩者分辨出來。

```typescript
// 總成本對共享物品數量而言是凸分段線性函數，
// 因此最佳解必定落在其轉折點之一
const smallerNeed = need1 < need2 ? need1 : need2;
const largerNeed = need1 < need2 ? need2 : need1;
```

### Step 2：計算候選一——完全不購買共享物品

第一個轉折點是共享物品數量為 0，此時兩種需求都以各自的單一物品滿足。

```typescript
// 候選一：不購買任何共享物品，分別滿足各項需求
const separateCost = cost1 * need1 + cost2 * need2;
```

### Step 3：計算候選二——以共享物品覆蓋重疊部分

第二個轉折點是共享物品數量恰好等於較小需求。此時兩種需求的重疊部分由共享物品滿足，較大需求多出的差額，再以該需求對應的單一物品補足。

```typescript
// 候選二：重疊部分以共享物品滿足，其餘部分分別購買
const remainingCost = need1 > need2
  ? cost1 * (need1 - need2)
  : cost2 * (need2 - need1);
const overlapCost = costBoth * smallerNeed + remainingCost;
```

### Step 4：計算候選三——全部以共享物品滿足

第三個轉折點是共享物品數量等於較大需求。此時兩項需求都只由共享物品覆蓋。

```typescript
// 候選三：所有需求皆僅以共享物品滿足
const allSharedCost = costBoth * largerNeed;
```

### Step 5：從三個候選中選出最低成本

以候選一為初始值，依序與另外兩個候選比較，保留最小者。

```typescript
// 從三個轉折點候選中挑選最便宜者
let minimumTotal = separateCost;
if (overlapCost < minimumTotal) {
  minimumTotal = overlapCost;
}
if (allSharedCost < minimumTotal) {
  minimumTotal = allSharedCost;
}
```

### Step 6：回傳最終結果

`minimumTotal` 即為三個轉折點中的最低總成本，也就是整體最佳解。

```typescript
return minimumTotal;
```

## 時間複雜度

- 只計算三個候選成本並比較，次數固定；
- 不隨需求量或單價大小而變動。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 僅使用固定數量的變數；
- 無任何額外陣列或動態空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
