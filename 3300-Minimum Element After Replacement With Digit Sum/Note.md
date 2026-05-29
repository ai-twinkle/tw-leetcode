# 3300. Minimum Element After Replacement With Digit Sum

You are given an integer array `nums`.

You replace each element in `nums` with the sum of its digits.

Return the minimum element in `nums` after all replacements.

**Constraints:**

- `1 <= nums.length <= 100`
- `1 <= nums[i] <= 10^4`

## 基礎思路

本題要求將陣列中每個元素替換為其數位和，並回傳替換後的最小值。雖然題目規模不大，但仍可從輸入特性中觀察出幾項可加速的關鍵點：

- **輸入值域有限**：
  每個元素的範圍為 1 到 10^4，所有可能出現的「值 → 數位和」對應關係其實是固定且有限的，可以一次性預先計算並查表使用。

- **數位和具備遞迴結構**：
  對任一非負整數 v，其數位和滿足 `digitSum(v) = digitSum(v / 10) + (v mod 10)`。利用此遞迴關係，可在線性時間內建立整張查表，無需對每個值單獨拆解數位。

- **數位和值域極小**：
  在 1 ≤ v ≤ 10^4 的限制下，任一元素的數位和不會超過 36（例如 9999 對應 36）。因此最小值的初始上界可直接設為 36，無需先讀取任何元素。

- **提早終止的可能性**：
  任何正整數的數位和至少為 1，一旦在走訪過程中發現最小值已降至 1，便可立即回傳，無需再比較後續元素。

依據上述特性，可以採用以下策略：

- **預先建立 0 到 10^4 範圍的數位和查表**，使主函式中每次取值的代價降為常數時間。
- **以 36 作為最小值的初始上界**，逐一查表並更新最小值。
- **在最小值觸及 1 時提早回傳**，避免不必要的比較。

## 解題步驟

### Step 1：預先建立 10^4 以內所有值的數位和查表

在模組載入時即一次性完成數位和查表，後續所有呼叫都可以直接以 O(1) 查表。
利用 `digitSumTable[v] = digitSumTable[v / 10] + (v mod 10)` 的遞迴關係，能夠重用先前已算好的結果，避免對每個值單獨重新拆解所有數位。

```typescript
// 預先計算 10^4 以內所有值的數位和，後續所有呼叫皆可 O(1) 查表
const MAX_DIGIT_SUM_VALUE = 10001;
const digitSumTable = new Uint8Array(MAX_DIGIT_SUM_VALUE);
for (let value = 1; value < MAX_DIGIT_SUM_VALUE; value++) {
  // 利用遞迴關係重用先前計算結果，避免對每個值單獨進行數位拆解
  digitSumTable[value] = digitSumTable[(value / 10) | 0] + (value % 10);
}
```

### Step 2：初始化長度與最小值上界

取得陣列長度，並將 `minimum` 直接初始化為 36，
這是約束範圍內任何元素的數位和都不可能超過的上界，省去額外的「未初始化」判斷邏輯。

```typescript
const length = nums.length;
// 36 為限制範圍內任何值的最大可能數位和（例如 9999 -> 36）
let minimum = 36;
```

### Step 3：走訪陣列、查表並更新最小值（含提早終止）

對陣列中每個元素，透過查表立即取得其數位和。
若該數位和小於目前的最小值，則更新；
一旦最小值降至 1，可直接回傳，因為任何正整數的數位和不可能再更小。

```typescript
for (let index = 0; index < length; index++) {
  const currentSum = digitSumTable[nums[index]];
  if (currentSum < minimum) {
    minimum = currentSum;
    // 提早終止：1 是任何正整數可能的最小數位和
    if (minimum === 1) {
      return 1;
    }
  }
}
```

### Step 4：回傳最終最小值

若走訪完整個陣列仍未提早終止，則此時 `minimum` 即為所有元素數位和中的最小值，直接回傳。

```typescript
return minimum;
```

## 時間複雜度

- 預先建立查表：對 $M$ 個值各執行常數時間運算，共 $O(M)$，其中 $M$ 為輸入值上界 + 1（此題為 10001）。
- 主函式：對 $n$ 個元素各做一次 $O(1)$ 查表與比較，共 $O(n)$。
- 總時間複雜度為 $O(M + n)$。

> $O(M + n)$

## 空間複雜度

- 預先建立的數位和查表佔用 $O(M)$ 空間。
- 主函式僅使用固定數量的純量變數，為 $O(1)$。
- 總空間複雜度為 $O(M)$。

> $O(M)$
