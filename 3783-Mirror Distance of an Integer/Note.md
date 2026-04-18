# 3783. Mirror Distance of an Integer

You are given an integer `n`.

Define its mirror distance as: `abs(n - reverse(n))` 
where `reverse(n)` is the integer formed by reversing the digits of `n`.

Return an integer denoting the mirror distance of `n`.

`abs(x)` denotes the absolute value of `x`.

**Constraints:**

- `1 <= n <= 10^9`

## 基礎思路

本題要求計算一個正整數與其數字反轉後的結果之間的絕對差距，稱為「鏡像距離」。問題本身並不複雜，但需要思考如何有效率地完成反轉與差值計算。

在思考解法時，可掌握以下核心觀察：

- **反轉本質為逐位重組**：
  從最低位開始依序取出每一位數字，乘以適當的權重後累加，即可完成反轉，無需借助字串轉換。

- **差值計算不依賴額外函式庫**：
  絕對差可直接透過判斷正負來取得，不需要呼叫任何內建絕對值函式。

- **數值範圍不造成溢位問題**：
  題目限制 `n` 至多為 `10^9`，在 JavaScript 的安全整數範圍內，反轉後的結果同樣不超過此範圍，無需特別處理溢位。

依據以上特性，可以採用以下策略：

- **以純算術逐位提取數字並累積完成反轉**，避免字串操作帶來的額外記憶體分配。
- **直接對差值進行符號判斷以取得絕對值**，以分支取代函式呼叫，保持整體邏輯清晰簡潔。

此策略在常數時間與空間內即可完成計算，效率最優。

## 解題步驟

### Step 1：初始化反轉過程所需的變數

在進入反轉迴圈前，先建立兩個工作變數：
一個用來累積反轉結果，另一個作為處理過程中逐步消耗的剩餘值，避免直接修改輸入。

```typescript
// 使用算術方式反轉數字，避免字串分配
let reversed = 0;
let remaining = n;
```

### Step 2：逐位提取數字並累積反轉結果

透過 `while (remaining > 0)` 不斷處理剩餘數字：
每一輪取出當前最低位，將其接到反轉結果的末端，再移除已處理的最低位，直到所有位數處理完畢。

```typescript
while (remaining > 0) {
  // 取出最低位數字並接到反轉結果末端
  reversed = reversed * 10 + (remaining % 10);
  remaining = (remaining / 10) | 0;
}
```

### Step 3：計算絕對差值並回傳

反轉完成後，計算原始值與反轉值的差；
使用無分支的絕對值寫法，若差為負則取反，確保回傳非負結果。

```typescript
// 使用無分支絕對值計算絕對差
const difference = n - reversed;
return difference < 0 ? -difference : difference;
```

## 時間複雜度

- `n` 至多為 `10^9`，即最多 10 位數，迴圈執行次數為位數長度，為常數；
- 所有操作皆為常數時間。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 僅使用固定數量的變數；
- 無任何額外陣列或動態空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
