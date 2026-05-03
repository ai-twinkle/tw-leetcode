# 788. Rotated Digits

An integer `x` is a good if after rotating each digit individually by 180 degrees, 
we get a valid number that is different from `x`. 
Each digit must be rotated - we cannot choose to leave it alone.

A number is valid if each digit remains a digit after rotation. For example:

- `0`, `1`, and `8` rotate to themselves,
- `2` and `5` rotate to each other (in this case they are rotated in a different direction, in other words, `2` or `5` gets mirrored),
- `6` and `9` rotate to each other, and
- the rest of the numbers do not rotate to any other number and become invalid.

Given an integer `n`, return the number of good integers in the range `[1, n]`.

**Constraints:**

- `1 <= n <= 10^4`

## 基礎思路

本題要求統計 `[1, n]` 範圍內所有「好整數」的數量，其中好整數定義為：將每一位數字旋轉 180 度後，結果仍為合法數字，且旋轉後的整體數值與原數不同。由於 `n` 最大為 10^4，且查詢可能被多次呼叫，因此有機會透過預處理來達成每次查詢的常數時間。

在思考解法時，可掌握以下核心觀察：

- **數字旋轉的合法性可被分類**：
  每一位數字旋轉後只有三種結果：保持自身（0、1、8）、映射為另一個數字（2↔5、6↔9）、或成為無效字元（3、4、7）。這三類行為完全決定於該位數字本身，因此可用查表的方式以 $O(1)$ 判斷每一位。

- **好整數成立需滿足兩個條件**：
  所有位數旋轉後必須合法（不含 3、4、7），且至少有一位數字在旋轉後改變（否則整體數值不變，不符合「不同於原數」的要求）。

- **前綴和可將單次查詢壓縮為常數時間**：
  若預先計算出 `[1, i]` 中的好整數數量，並儲存為前綴和陣列，則任意查詢 `[1, n]` 均可在 $O(1)$ 內回答，適合大量查詢的場景。

依據以上特性，可以採用以下策略：

- **以查表方式逐位分類每個數字的旋轉行為**，避免字串轉換的額外開銷。
- **於模組載入時一次性預計算全範圍的前綴好整數計數**，使每筆查詢僅需一次陣列存取。
- **主函數僅做單次陣列查找**，直接回傳對應位置的前綴和結果。

此策略將預處理成本攤銷到模組初始化階段，使實際查詢效率達到理論最優。

## 解題步驟

### Step 1：定義常數與數字分類查表

預先定義問題允許的最大值，並以靜態查表的方式對每個數字（0–9）標記其旋轉類型：`-1` 表示旋轉後無效，`0` 表示旋轉後保持自身，`1` 表示旋轉後變為不同數字。查表讓每次判斷只需 $O(1)$，無需任何條件分支。

```typescript
// 依題目限制，n 的最大值
const MAX_N: number = 10000;

// 數字分類查表：-1 = 無效，0 = 旋轉後為自身（0,1,8），1 = 旋轉後改變（2,5,6,9）
// 以數字 0-9 為索引，支援 O(1) 查詢
const DIGIT_TYPE: Int8Array = new Int8Array([0, 0, 1, -1, -1, 1, 1, -1, 0, 1]);
```

### Step 2：宣告前綴和陣列

建立大小為 `MAX_N + 1` 的前綴和陣列，其中索引 `i` 將儲存 `[1, i]` 中的好整數數量，供後續查詢直接使用。

```typescript
// 前綴和陣列：PREFIX_GOOD_COUNT[i] = [1, i] 中的好整數數量
// 在模組載入時預計算一次，以支援 O(1) 查詢
const PREFIX_GOOD_COUNT: Int32Array = new Int32Array(MAX_N + 1);
```

### Step 3：以立即執行函式預計算所有好整數的前綴和，並判斷每個數是否含有無效位數

使用立即執行函式在模組載入時完成整個範圍的預計算。對每個數字，逐位取出並查表：一旦發現無效位（類型為 `-1`），立刻標記為無效並跳出迴圈；同時以位元 OR 累積是否有任何位數在旋轉後改變。

```typescript
// 預計算完整範圍內的好整數前綴和
(function precomputeGoodIntegers(): void {
  let runningCount: number = 0;
  for (let currentNumber = 1; currentNumber <= MAX_N; currentNumber++) {
    let remainingDigits = currentNumber;
    let hasChangingDigit = 0;
    let isValid = 1;
    // 以整數除法逐位取出，避免字串轉換的額外開銷
    while (remainingDigits > 0) {
      const digitType = DIGIT_TYPE[remainingDigits % 10];
      if (digitType < 0) {
        // 發現無效位數（3、4 或 7），此數不可能為好整數
        isValid = 0;
        break;
      }
      // 追蹤是否至少有一位數在旋轉後改變
      hasChangingDigit |= digitType;
      remainingDigits = (remainingDigits / 10) | 0;
    }

    // ...
  }
})();
```

### Step 4：累積好整數計數並寫入前綴和陣列

在每個數字判斷結束後，若所有位數皆合法且至少有一位改變，則視為好整數並累加計數，再將當前累計值寫入前綴和陣列對應位置。

```typescript
(function precomputeGoodIntegers(): void {
  let runningCount: number = 0;
  for (let currentNumber = 1; currentNumber <= MAX_N; currentNumber++) {
    // Step 3：逐位檢查合法性與是否有改變的位數

    // 唯有所有位數合法且至少一位改變，才計為好整數
    runningCount += isValid & hasChangingDigit;
    PREFIX_GOOD_COUNT[currentNumber] = runningCount;
  }
})();
```

### Step 5：主函式直接查表回傳結果

主函式只需以 `n` 作為索引，從前綴和陣列中取出對應值並回傳，整個查詢為 $O(1)$。

```typescript
/**
 * 計算 [1, n] 範圍內的好整數數量，其中好整數在每位數字旋轉 180 度後
 * 會得到一個與原數不同的合法數字。
 * @param n 範圍的上界（含），1 <= n <= 10^4。
 * @return [1, n] 中好整數的數量。
 */
function rotatedDigits(n: number): number {
  // 直接從預計算的前綴和陣列中 O(1) 查詢
  return PREFIX_GOOD_COUNT[n];
}
```

## 時間複雜度

- 預計算階段遍歷 `[1, MAX_N]` 共 $10^4$ 個數字，每個數字最多有 $\log_{10}(\text{MAX_N}) = 5$ 位，故預計算總耗時為 $O(\text{MAX_N} \cdot \log_{10}(\text{MAX_N}))$，為與輸入 `n` 無關的固定常數；
- 主函式 `rotatedDigits` 每次呼叫僅做一次陣列索引存取；
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- `DIGIT_TYPE` 為長度 10 的固定陣列；
- `PREFIX_GOOD_COUNT` 為長度 `MAX_N + 1 = 10001` 的固定陣列；
- 兩者均為常數大小，與輸入 `n` 無關；
- 總空間複雜度為 $O(1)$。

> $O(1)$
