# 3754. Concatenate Non-Zero Digits and Multiply by Sum I

You are given an integer `n`.

Form a new integer `x` by concatenating all the non-zero digits of `n` in their original order. 
If there are no non-zero digits, `x = 0`.

Let `sum` be the sum of digits in `x`.

Return an integer representing the value of `x * sum`.

**Constraints:**

- `0 <= n <= 10^9`

## 基礎思路

本題要求從整數 `n` 中提取所有非零位數，依原始順序拼接成新整數 `x`，再計算 `x` 的各位數字之和 `sum`，最終回傳 `x * sum`。

在思考解法時，可掌握以下核心觀察：

- **非零位數的拼接即為位值運算**：
  將非零位數依順序拼接，本質上是為每個位數賦予對應的位值（個位、十位、百位…），因此可用累加位值的方式還原出 `x`。

- **數字之和與拼接過程可同步計算**：
  在提取每個非零位數時，既可累加至 `x` 的建構中，也可同步累加至 `sum`，無需二次掃描。

- **從最低位往最高位處理的順序問題**：
  以 `% 10` 逐位擷取時，最先取得的是最低位。因此在拼接 `x` 時，先取到的位數需佔據較低的位值，並隨著每次取到新的非零位數，位值乘數遞增。

依據以上特性，可以採用以下策略：

- **以單一迴圈從低位到高位逐位處理 `n`**，跳過零位數，對非零位數同時累加至 `x` 的位值與 `sum`。
- **維護一個位值乘數**，每遇到非零位數就將其乘入，確保拼接順序正確。
- **迴圈結束後直接回傳 `x * sum`**，無需額外處理。

## 解題步驟

### Step 1：初始化三個核心變數

`concatenatedValue` 用於累積建構出的新整數 `x`；
`digitSum` 用於累積各非零位數之和；
`placeMultiplier` 記錄當前非零位數應佔據的位值，從個位（1）開始。

```typescript
let concatenatedValue = 0;
let digitSum = 0;
let placeMultiplier = 1;
```

### Step 2：逐位擷取最低位並跳過零位數

透過 `while (n > 0)` 不斷處理剩餘數字：
每一輪先用 `% 10` 取得目前最低位數字，若該位為零則跳過，不將其納入拼接與加總。

```typescript
// 從最低有效位到最高有效位依序處理
while (n > 0) {
  const currentDigit = n % 10;

  // ...
}
```

### Step 3：將非零位數累加至拼接值與位數和，並更新位值乘數

當位數不為零時，將其乘上當前位值乘數後加入 `concatenatedValue`，同時累加至 `digitSum`；
接著將 `placeMultiplier` 乘以 10，為下一個非零位數準備更高的位值。

```typescript
// 從最低有效位到最高有效位依序處理
while (n > 0) {
  // Step 2：擷取最低位數字

  // 跳過零位數，不將其拼接入 x
  if (currentDigit !== 0) {
    concatenatedValue += currentDigit * placeMultiplier;
    digitSum += currentDigit;
    placeMultiplier *= 10;
  }

  // ...
}
```

### Step 4：移除已處理的最低位，推進至下一位

將 `n` 減去已取出的最低位數字後除以 10，使下一輪迴圈能處理次低位；
由於 `currentDigit` 已被減去，除法結果為整數，無需額外截斷。

```typescript
// 從最低有效位到最高有效位依序處理
while (n > 0) {
  // Step 2：擷取最低位數字

  // Step 3：若非零，累加至拼接值與位數和，並更新位值乘數

  n = (n - currentDigit) / 10;
}
```

### Step 5：回傳拼接值與位數和的乘積

迴圈結束後，`concatenatedValue` 即為拼接後的整數 `x`，`digitSum` 為其各位之和；
直接回傳兩者之積作為最終答案。

```typescript
return concatenatedValue * digitSum;
```

## 時間複雜度

- `n` 最多有 $\lfloor \log_{10} n \rfloor + 1$ 位，每位執行常數次操作；
- 所有操作皆為常數時間。
- 總時間複雜度為 $O(\log n)$。

> $O(\log n)$

## 空間複雜度

- 僅使用固定數量的變數；
- 無任何額外陣列或動態空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
