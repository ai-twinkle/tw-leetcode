# 12. Integer to Roman

Seven different symbols represent Roman numerals with the following values:

| Symbol | Value |
|--------|-------|
| I      | 1     |
| V      | 5     |
| X      | 10    |
| L      | 50    |
| C      | 100   |
| D      | 500   |
| M      | 1000  |

Roman numerals are formed by appending the conversions of decimal place values from highest to lowest. 
Converting a decimal place value into a Roman numeral has the following rules:

- If the value does not start with 4 or 9, select the symbol of the maximal value that can be subtracted from the input, 
  append that symbol to the result, subtract its value, and convert the remainder to a Roman numeral.
- If the value starts with 4 or 9 use the subtractive form representing one symbol subtracted from the following symbol, 
  for example, 4 is 1 (`I`) less than 5 (`V`): `IV` and 9 is 1 (`I`) less than 10 (`X`): `IX`. 
  Only the following subtractive forms are used: 4 (`IV`), 9 (`IX`), 40 (`XL`), 90 (`XC`), 400 (`CD`) and 900 (`CM`).
- Only powers of 10 (`I`, `X`, `C`, `M`) can be appended consecutively at most 3 times to represent multiples of 10. 
  You cannot append 5 (`V`), 50 (`L`), or 500 (`D`) multiple times. 
  If you need to append a symbol 4 times use the subtractive form.

Given an integer, convert it to a Roman numeral.

**Constraints:**

- `1 <= num <= 3999`

## 基礎思路

本題要求將一個介於 1 到 3999 之間的整數轉換為對應的羅馬數字。羅馬數字採用「位數獨立」的書寫規則，每個十進位位數（千、百、十、個）皆對應一組固定且有限的符號組合，因此可以從規則本身著手，將整個轉換過程縮減為查表操作。

在思考解法時，可掌握以下核心觀察：

- **羅馬數字按位獨立組合**：
  千位、百位、十位、個位各自擁有專屬的符號集合（如 `M`、`C/D`、`X/L`、`I/V`），不同位數之間互不干擾，可分別轉換後再串接結果。

- **每個位數僅有 10 種寫法**：
  每個十進位位數的數字介於 0 至 9，對應的羅馬數字形式（含減法形式如 `IV`、`CM`）皆為固定模式，可事先窮舉列出。

- **轉換不需在執行時推導減法規則**：
  既然所有可能寫法皆可預先列表，便毋須在執行時動態判斷是否需採用減法形式，直接以位數值作為索引即可取得對應字串。

基於上述觀察，可採用以下策略：

- **預先建立四張查表，分別對應千位、百位、十位、個位的所有可能寫法**。
- **以整數除法與取餘運算分離輸入數字的各個位數**。
- **以位數值作為索引查表，並依高位到低位順序串接結果**。

此策略將整個轉換過程化簡為四次查表與一次字串串接，可在常數時間內完成。

## 解題步驟

### Step 1：預先建立各位數對應的羅馬數字查表

由於每個十進位位數的羅馬數字寫法僅有 10 種（0 至 9），可在函數外預先建立四張固定查表，分別涵蓋千位、百位、十位、個位的全部寫法。索引 0 對應空字串，使得該位數為 0 時自然不貢獻任何字元，免去額外判斷。

```typescript
// 預先計算各位數對應的羅馬數字字串，存放於函數外以提供 O(1) 查詢
const THOUSANDS: readonly string[] = ["", "M", "MM", "MMM"];
const HUNDREDS: readonly string[] = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"];
const TENS: readonly string[] = ["", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"];
const ONES: readonly string[] = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
```

### Step 2：依位數拆解輸入並串接對應字串

利用整數除法搭配 `| 0` 進行向零截斷取整，並以取餘運算將 `num` 分離為千、百、十、個四個位數的數字；隨後以各位數值作為索引查詢對應字串，並依高位到低位順序串接，即可組成完整的羅馬數字。

```typescript
// 依十進位位數拆解後串接預計算的對應字串
return THOUSANDS[(num / 1000) | 0] + HUNDREDS[((num / 100) | 0) % 10] + TENS[((num / 10) | 0) % 10] + ONES[num % 10];
```

## 時間複雜度

- 位數拆解與索引查表皆為固定次數的常數操作；
- 字串串接的結果長度有上限（最多 15 字元），亦為常數成本。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 四張查表為全域常數，與輸入大小無關；
- 函數內未額外配置任何結構，僅回傳串接後的字串。
- 總空間複雜度為 $O(1)$。

> $O(1)$
