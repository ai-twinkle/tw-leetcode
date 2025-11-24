# 9. Palindrome Number

Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.

**Constraints:**

- `-2^31 <= x <= 2^31 - 1`

## 基礎思路

本題要求判斷整數 `x` 是否為回文數。
回文概念為「從左讀與從右讀相同」，因此若將整數反轉後與原值相等，該整數即為回文。

在正式設計解法前，我們需要注意幾個核心觀察：

1. **負數必定不是回文**
   因為負號 `-` 會出現在最左側，但反轉後會跑到最右側，因此永不相等。

2. **反轉整數即可直接比對**
   只要將輸入的整數逐位反轉（利用取餘數與整數除法），最後比對是否與原值相同。

3. **不需使用字串轉換**
   題目允許純數值操作，因此使用取餘數 `%`、整數除法即可完成。

4. **反轉過程使用 while 逐位取 digit**
   反覆將最低位取出、累積到反轉值中，直到整數變為 0。

基於以上觀察即可完成高效、純數值的判斷流程。

## 解題步驟

### Step 1：處理負數與保留原始值

首先排除負數（負數必定不是回文），
並將原始值保存起來以便最後比對。

```typescript
// 負數因為有負號，無法是回文數
if (x < 0) {
  return false;
}

// 保存原始值，用於最終比較
const originalValue = x;
```

### Step 2：宣告反轉累積變數 reversedValue

反轉結果會使用一個累積變數 `reversedValue`，初始為 0。

```typescript
// reversedValue 負責累加反轉後的數字
let reversedValue = 0;
```

### Step 3：主迴圈 — 逐位取出數字並反轉

使用 while 迴圈反覆執行「取最低位 → 加入反轉值 → 去除最低位」的操作。

```typescript
// 反轉所有位數（使用取餘數與快速整數除法）
while (x > 0) {
  // 取出最低有效位數
  const digit = x % 10;

  // 將此位數加入反轉結果中
  reversedValue = (reversedValue * 10) + digit;

  // 以 32 位整數截斷方式移除最低位
  x = (x / 10) | 0;
}
```

### Step 4：比較反轉結果與原始值

若反轉後與原始值相等，即為回文。

```typescript
// 回文的定義：反轉後仍與原值相同
return reversedValue === originalValue;
```

## 時間複雜度

- while 迴圈會執行一次 per digit，對於整數最多約 10 位。
- 總時間複雜度為 $O(d)$，其中 $d$ 為數字位數（最大為 10）。

> $O(d)$

## 空間複雜度

- 僅使用常數額外變數 `reversedValue`、`originalValue`、`digit`。
- 總空間複雜度為 $O(1)$。

> $O(1)$
