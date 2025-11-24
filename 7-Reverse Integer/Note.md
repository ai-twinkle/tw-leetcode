# 7. Reverse Integer

Given a signed 32-bit integer `x`, return `x` with its digits reversed. 
If reversing `x` causes the value to go outside the signed 32-bit integer range `[-2^31, 2^31 - 1]`, then return `0`.

Assume the environment does not allow you to store 64-bit integers (signed or unsigned).

**Constraints:**

- `-2^31 <= x <= 2^31 - 1`

## 基礎思路

本題要求將一個 32 位元帶符號整數的數字反轉，但反轉後的結果必須仍位於合法範圍 `[-2^31, 2^31 - 1]`，否則需回傳 `0`。在解題時需注意 JavaScript 無法使用 64 位元整數，因此不能藉由擴展精度來處理溢位問題。

在思考解法時，可掌握以下核心觀察：

- **32 位元整數上下界不對稱**：
  `-2^31` 的絕對值大於 `2^31 - 1`，因此若直接將負數轉為正數再反轉，可能在運算過程中產生無法表示的情況。

- **反轉本質為逐位運算**：
  將整數逐位分離並重新組合，每加入一位數都可能使結果超過 32 位元上下界，因此溢位檢查必須發生在每次更新之前。

- **符號獨立於反轉過程**：
  正負號不影響數字本身的反轉邏輯，可先記錄符號，運算時統一用負數處理，以避免超出可表示的範圍。

- **僅以 32 位元的安全範圍判斷是否溢位**：
  必須在反轉前確認下一次乘十與加位數是否會突破邊界，否則視為溢位。

依據以上特性，可以採用以下策略：

- **統一將所有運算轉換到負數空間進行**，因為負數區間的範圍較完整，不會出現負值無法表示的情況。
- **逐位拆離最低位數字，並在每次合併之前進行溢位檢查**。
- **最終依照原始符號還原結果，若發現反轉後不能合法轉回正數，則回傳 0**。

此策略能確保整個反轉過程始終在合法 32 位元空間內進行，安全可靠。

## 解題步驟

### Step 1：快速處理輸入為 0 的情況

若 `x` 為 0，反轉後仍為 0，無須進行任何運算，可直接回傳。

```typescript
// 快速路徑：若輸入為 0，則可直接回傳
if (x === 0) {
  return 0;
}
```

### Step 2：處理正負號並統一轉為負數運算

我們先記錄原始數是否為正數；
若為正，將其轉為負數，之後所有運算都在負數區間中進行，避免處理 `-2^31` 絕對值時溢位。

```typescript
// 紀錄此數原本是否為正
let isOriginalPositive = false;

if (x > 0) {
  // 若輸入為正，則轉成負數以便於在負數範圍中安全運算
  isOriginalPositive = true;
  x = -x;
}
```

### Step 3：初始化反轉後的累積結果

使用 `reversedValue` 儲存目前已反轉出的數值，並保持其為非正數，與前述負數策略一致。

```typescript
// 儲存反轉後的結果（保持為非正數以確保安全）
let reversedValue = 0;
```

### Step 4：逐位擷取原數的最低位並移除該位

透過 `while (x !== 0)` 不斷處理剩餘數字：
每一輪先用 `% 10` 取得目前的最低位數字，再用整數除法去除該位，直到所有位數被處理完（`x` 變為 0）。

```typescript
// 當 x 尚未處理完所有位數時持續進行
while (x !== 0) {
  // 取出最低位數字（為負或 0）
  const currentDigit = x % 10;

  // 將 x 向右移除一位（使用 32 位元向零截斷）
  x = (x / 10) | 0;

  // ...
}
```

### Step 5：在加入新位數前先檢查是否會溢位

在將 `currentDigit` 併入 `reversedValue` 之前，
先預判 `reversedValue * 10 + currentDigit` 是否會小於 32 位元可容許的最小值；
若會溢位，需立刻回傳 0。

```typescript
while (x !== 0) {
  // Step 4：擷取並移除最低位數字

  // 若 reversedValue * 10 已經低於界線，則勢必溢位
  if (reversedValue < INT32_MIN_DIV10) {
    return 0;
  }

  // 若已在邊界，則需進一步檢查要加入的位數是否使其超界
  if (reversedValue === INT32_MIN_DIV10 && currentDigit < INT32_MIN_LAST_DIGIT) {
    return 0;
  }

  // ...
}
```

### Step 6：通過檢查後，安全地把當前位數合併進結果

當確定不會溢位後，才實際執行 `reversedValue * 10 + currentDigit`，
把新的位數接到反轉結果的尾端。

```typescript
while (x !== 0) {
  // Step 4：擷取並移除最低位數字
  
  // Step 5：進行溢位檢查

  // 將此位數加入反轉結果（反轉值仍保持為負數）
  reversedValue = (reversedValue * 10) + currentDigit;
}
```

### Step 7：若原始輸入為正數，將結果轉回正數並再次檢查

如果原始 `x` 是正數，反轉完成後需再轉回正數；
但若此時 `reversedValue` 為 `INT32_MIN`，則取負會超出 `INT32_MAX`，必須回傳 0。

```typescript
// 若原輸入為正數，則需將結果取負還原
if (isOriginalPositive) {
  // 若結果為 INT32_MIN，則無法取負（會超出 INT32_MAX），必須回傳 0
  if (reversedValue === INT32_MIN) {
    return 0;
  }

  // 安全地轉回正數
  return -reversedValue;
}
```

### Step 8：原始為負數時，直接回傳目前結果

若原本就是負數，`reversedValue` 已帶有正確符號，可以直接回傳。

```typescript
// 若原始輸入為負數，結果已為正確符號，直接回傳
return reversedValue;
```

## 時間複雜度

- 整數最多 10 位，每位處理一次；
- 所有操作皆為常數時間。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 僅使用固定數量的變數；
- 無任何額外陣列或動態空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
