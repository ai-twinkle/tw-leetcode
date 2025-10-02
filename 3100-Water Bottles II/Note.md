# 3100. Water Bottles II

You are given two integers `numBottles` and `numExchange`.

`numBottles` represents the number of full water bottles that you initially have. In one operation, you can perform one of the following operations:

- Drink any number of full water bottles turning them into empty bottles.
- Exchange `numExchange` empty bottles with one full water bottle. 
  Then, increase `numExchange` by one.

Note that you cannot exchange multiple batches of empty bottles for the same value of `numExchange`. 
For example, if `numBottles == 3` and `numExchange == 1`, you cannot exchange `3` empty water bottles for `3` full bottles.

Return the maximum number of water bottles you can drink.

**Constraints:**

- `1 <= numBottles <= 100`
- `1 <= numExchange <= 100`

## 基礎思路

本題要計算在「每次兌換門檻會逐步提高」的規則下，最多能喝掉的瓶數。具體規則是：先喝掉手上所有滿瓶，得到等量空瓶；當空瓶數量達到目前的門檻 `numExchange` 時，可以換到 1 瓶滿水，且**之後的門檻會加 1**。因此，能進行的兌換次數不是固定比例，而是一連串**遞增成本**的操作。

在思考解法時，我們需要特別注意幾個重點：

- **單調遞增的兌換成本**：第 1 次需要 `E` 個空瓶、第 2 次需要 `E+1`、第 3 次需要 `E+2`，以此類推；因此前 `t` 次兌換共需的空瓶為一個**等差級數**的和。
- **喝瓶＝產生空瓶**：每獲得 1 瓶滿水就能再喝掉並產生 1 個空瓶，形成「能量回收」，但兌換門檻也隨之上升。
- **最大兌換次數的上界**：可將「初始滿瓶數」視為初始空瓶來源，推導一個與 `t` 相關的不等式，解出允許的最大整數 `t`。
- **數學先估後微調**：利用二次不等式解出近似根作為 `t` 的估值，之後用常數次調整，確保不超過或錯失可行的兌換次數。

為了解決這個問題，我們可以採用以下策略：

- **建立不等式上界**：將前 `t` 次兌換所需的空瓶量用等差級數表示，與初始可貢獻的空瓶量比較，形成二次不等式以界定 `t`。
- **二次公式求近似**：用判別式與二次公式快速估計 `t` 的整數值。
- **常數次修正**：因為取整與邊界可能造成高估或低估，透過極少次的檢查調整到正確的 `t`。
- **總瓶數計算**：答案為「初始滿瓶可直接喝掉的數量」加上「成功兌換的次數」。

## 解題步驟

### Step 1：建立二次不等式的係數

將「前 `t` 次兌換所需空瓶總和」與「可供支出的空瓶上界」比較，化為二次不等式
`t^2 + (2E - 3)t + (2 - 2B) ≤ 0` 的形式，取出線性項與常數項。

```typescript
// 二次不等式的係數：t^2 + (2E - 3)t + (2 - 2B) <= 0
const linearCoefficient = 2 * numExchange - 3;
const constantTerm = 2 - 2 * numBottles;
```

### Step 2：計算判別式（保證非負）

為了使用二次公式估算可行的最大交換次數，先計算判別式。

```typescript
// 判別式（在題目約束下非負）
const discriminant = linearCoefficient * linearCoefficient - 4 * constantTerm;
```

### Step 3：以二次公式估算最大兌換次數 `t`

取靠近可行上界的解，向下取整得到初始估值。

```typescript
// 以二次公式估計根，得到兌換次數的初值
let numberOfExchanges = Math.floor(
  (-linearCoefficient + Math.sqrt(discriminant)) / 2
);
```

### Step 4：若估值偏大，向下調整到可行

檢查以目前門檻序列需要的空瓶是否超過可用；若超過則將 `t` 減一，直到可行為止（實務上最多少數次）。

```typescript
// 防呆：若向上取整造成不可行，往下調整一次或少數次
while (
  numBottles <
  numExchange * numberOfExchanges +
  ((numberOfExchanges - 1) * (numberOfExchanges - 2)) / 2
) {
  numberOfExchanges -= 1;
}
```

### Step 5：若仍可再兌換，向上補足

反向檢查是否還能再多一次兌換；若可以則將 `t` 加一（同樣只需少數次）。

```typescript
// 反向檢查：若仍可再多換一次，往上補一次或少數次
while (
  numBottles >=
  numExchange * (numberOfExchanges + 1) +
  (numberOfExchanges * (numberOfExchanges - 1)) / 2
) {
  numberOfExchanges += 1;
}
```

### Step 6：計算最終可喝掉的瓶數

總數等於「初始滿瓶可直接喝掉的數量」加上「成功兌換得到的額外滿瓶數」。

```typescript
// 總喝瓶數 = 初始滿瓶 + 兌換成功次數
return numBottles + numberOfExchanges;
```

## 時間複雜度

- 主要為常數次的算術運算與平方根；兩個 `while` 只做極少次邊界修正，視為常數時間。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 僅使用固定數量的變數與暫存。
- 總空間複雜度為 $O(1)$。

> $O(1)$
