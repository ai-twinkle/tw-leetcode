# 13. Roman to Integer

Roman numerals are represented by seven different symbols: `I`, `V`, `X`, `L`, `C`, `D` and `M`.

| Symbol | Value |
|--------|-------|
| I      | 1     |
| V      | 5     |
| X      | 10    |
| L      | 50    |
| C      | 100   |
| D      | 500   |
| M      | 1000  |

For example, `2` is written as `II` in Roman numeral, just two ones added together. 
`12` is written as `XII`, which is simply `X + II`. 
The number 27 is written as XXVII, which is `XX + V + II`.

Roman numerals are usually written largest to smallest from left to right. 
However, the numeral for four is not `IIII`. 
Instead, the number four is written as `IV`. 
Because the one is before the five we subtract it making four. 
The same principle applies to the number nine, which is written as `IX`. 
There are six instances where subtraction is used:

- `I` can be placed before `V` (5) and `X` (10) to make 4 and 9.
- `X` can be placed before `L` (50) and `C` (100) to make 40 and 90.
- `C` can be placed before `D` (500) and `M` (1000) to make 400 and 900.

Given a roman numeral, convert it to an integer.

**Constraints:**

- `1 <= s.length <= 15`
- `s` contains only the characters (`'I'`, `'V'`, `'X'`, `'L'`, `'C'`, `'D'`, `'M'`).
- It is guaranteed that `s` is a valid roman numeral in the range `[1, 3999]`.

## 基礎思路

本題要求將羅馬數字字串轉換為對應的整數值。羅馬數字的核心特性在於：多數情況下符號由左到右、由大到小排列並相加；但當較小符號出現在較大符號之前時，代表特殊的減法規則（例如 `IV` 代表 4、`IX` 代表 9）。

在思考解法時，可掌握以下核心觀察：

- **符號與右側鄰居的關係決定加減**：
  判斷某個符號應該被加上還是被減去，關鍵不在於它自己的數值大小，而在於它與「右側相鄰符號」的數值比較。

- **由右至左遍歷可簡化判斷邏輯**：
  若從左至右處理，需要額外往後看一個字元才能判斷是否為減法情況；而改為從右至左遍歷，只需記住「前一個處理過的符號數值」，即可即時判斷目前符號是否小於它，從而決定加或減。

- **查表可將符號轉換為數值的開銷降到最低**：
  由於羅馬數字符號種類固定且字元碼範圍可預先得知，可利用查表（lookup table）以字元碼作為索引直接取得對應數值，避免重複的條件判斷或字串比較。

依據以上特性，可以採用以下策略：

- **預先建立字元碼到數值的對照表**，使每次符號轉換都能以常數時間完成。
- **從字串尾端往前遍歷**，並維護一個「前一個符號的數值」。
- **若目前符號數值小於前一個符號數值，則代表此處為減法情境，需從總和中扣除；否則代表正常累加**。

此策略僅需一次線性掃描即可完成轉換，邏輯簡潔且效率穩定。

## 解題步驟

### Step 1：建立字元碼到羅馬數值的查表

在函數外預先建立一個查表 `ROMAN_VALUES`，以每個羅馬符號的字元碼作為索引，存入其對應的數值，使後續轉換可在常數時間內完成查找。

```typescript
// 預先計算好的查表，將每個羅馬符號的字元碼對應到其數值，
// 存放於函數外以便重複利用，達成 O(1) 查找
const ROMAN_VALUES = new Int16Array(90);
ROMAN_VALUES[73] = 1; // 'I'
ROMAN_VALUES[86] = 5; // 'V'
ROMAN_VALUES[88] = 10; // 'X'
ROMAN_VALUES[76] = 50; // 'L'
ROMAN_VALUES[67] = 100; // 'C'
ROMAN_VALUES[68] = 500; // 'D'
ROMAN_VALUES[77] = 1000; // 'M'
```

### Step 2：取得字串長度並初始化總和與前一數值

先記錄字串長度供迴圈使用，並初始化 `total` 用以累加結果，`previousValue` 用以記錄上一個（右側）符號的數值。

```typescript
const length = s.length;
let total = 0;
let previousValue = 0;
```

### Step 3：由右至左遍歷字串，取得目前符號對應的數值

透過 `for` 迴圈從字串尾端開始往前處理，並利用查表 `ROMAN_VALUES` 以字元碼取得目前符號的數值。

```typescript
// 由右至左遍歷，使每個符號可依據右側符號判斷加或減
for (let index = length - 1; index >= 0; index--) {
  const currentValue = ROMAN_VALUES[s.charCodeAt(index)];

  // ...
}
```

### Step 4：比較目前數值與前一數值，決定加總或扣除

若目前符號的數值小於前一個（右側）符號的數值，代表這是減法情境，需從 `total` 扣除；否則代表正常情境，將數值加入 `total`。

```typescript
for (let index = length - 1; index >= 0; index--) {
  // Step 3：取得目前符號對應的數值

  // 較小符號出現在較大符號之前，代表此處為減法
  if (currentValue < previousValue) {
    total -= currentValue;
  } else {
    total += currentValue;
  }

  previousValue = currentValue;
}
```

### Step 5：回傳最終累加結果

完成整個遍歷後，`total` 即為此羅馬數字所代表的整數值。

```typescript
return total;
```

## 時間複雜度

- 僅對字串進行一次由右至左的線性掃描；
- 每個字元的數值查找與加減運算皆為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的變數（`total`、`previousValue` 等），與輸入長度無關；
- 查表 `ROMAN_VALUES` 大小固定，不隨輸入變化。
- 總空間複雜度為 $O(1)$。

> $O(1)$
