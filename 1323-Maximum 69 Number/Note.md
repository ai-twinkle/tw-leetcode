# 1323. Maximum 69 Number

You are given a positive integer `num` consisting only of digits `6` and `9`.

Return the maximum number you can get by changing at most one digit (`6` becomes `9`, and `9` becomes `6`).

**Constraints:**

- `1 <= num <= 10^4`
- `num` consists of only `6` and `9` digits.

## 基礎思路

題目要求將由 `6` 和 `9` 組成的整數 `num`，透過改變最多一位數字，使其成為最大值。

我們可以透過以下策略解決問題：

1. **優先改變最高位的 `6`**：因為位數越高，數值的影響越大，將第一個出現的 `6` 改為 `9` 可以立即得到最大值。
2. **一旦改變即返回**：因為只能改一次數字，遇到第一個 `6` 就立刻結束，不需繼續掃描。
3. **若沒有 `6`**：代表原數字全為 `9`，已是最大值，直接回傳即可。
4. **效能優化**：使用事先建立好的 `10` 的次方陣列來快速判斷位權，避免重複計算。

## 解題步驟

### Step 1：建立 10 的次方表

為了方便快速取得位權，我們建立一個長度固定的 `Int32Array`，儲存 $10^0$ 到 $10^9$。

```typescript
// 跨呼叫重複使用：避免重算次方並降低 GC 壓力
const PRECOMPUTED_POWER_OF_TEN: Int32Array = new Int32Array([
  1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000
]);
```

### Step 2：初始化函式與定位最高位權

我們先保存原始數字，並透過 `PRECOMPUTED_POWER_OF_TEN` 找到最接近且不大於 `num` 的位權。

```typescript
const originalNumber = num;

// 使用預先計算的 Typed Array 找到 ≤ num 的最高位權
let index = PRECOMPUTED_POWER_OF_TEN.length - 1;
while (index > 0 && PRECOMPUTED_POWER_OF_TEN[index] > num) {
  index--;
}
```

### Step 3：由高位到低位逐位檢查

使用最高位開始的位權，逐位檢查是否為 `6`。若遇到 `6`，直接將該位改為 `9`，等價於整體加上 `3 * currentPlace`，並立即回傳結果。

```typescript
// 從最高有效位數掃描到最低有效位數
let currentPlace = PRECOMPUTED_POWER_OF_TEN[index];
while (currentPlace > 0) {
  const quotient = Math.trunc(num / currentPlace);
  const digit = quotient % 10; // 在題目限制下為安全的整數運算

  if (digit === 6) {
    // 將此 6 變為 9 -> 加上 3 * 該位權後直接回傳
    return originalNumber + 3 * currentPlace;
  }
  currentPlace = Math.trunc(currentPlace / 10);
}
```

### Step 4：沒有發現 `6` 時回傳原數字

若整個掃描過程都沒有找到 `6`，代表數字已全為 `9`，原數即為最大值，直接回傳。

```typescript
// 已經是最大值
return originalNumber;
```

## 時間複雜度

- **定位位權**：最多掃描固定長度 10 的陣列，為 $O(1)$。
- **逐位檢查**：檢查數字的位數 $d$，時間為 $O(d)$。
- 總時間複雜度為 $O(d)$，等同 $O(\log_{10} n)$。

> $O(d)$

## 空間複雜度

- **固定陣列**：`Int32Array` 大小固定，屬於常數額外空間。
- 其他變數僅為暫存數值。
- 總空間複雜度為 $O(1)$。

> $O(1)$
