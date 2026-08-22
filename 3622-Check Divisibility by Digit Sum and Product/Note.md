# 3622. Check Divisibility by Digit Sum and Product

You are given a positive integer `n`. 
Determine whether `n` is divisible by the sum of the following two values:

- The digit sum of `n` (the sum of its digits).
- The digit product of `n` (the product of its digits).

Return `true` if `n` is divisible by this sum; 
otherwise, return `false`.

**Constraints:**

- `1 <= n <= 10^6`

## 基礎思路

本題要求判斷一個正整數是否能被「其位數和」與「其位數積」的總和整除。單次查詢本身相當單純，但由於輸入上界固定且不大，若能將重複計算的部分預先備妥，就能把每次查詢壓縮到常數次查表。

在思考解法時，可掌握以下核心觀察：

- **位數和與位數積皆具備遞推結構**：
  一個數的位數資訊，可由「去掉最低位後的數」加上「最低位本身」推得，因此整張表可由小到大一次性遞推建立，無須對每個數重新逐位拆解。

- **輸入上界固定，可完全預先計算**：
  由於數值範圍有明確上限，所需的表格大小為常數，預處理只需執行一次，之後所有查詢皆可共用。

- **數值可依區塊切分以縮小表格規模**：
  若直接為整個範圍建表，空間開銷與上限同階；改為將數字切成高低兩段，只需為較小的區塊範圍建表，即可透過兩次查表組合出完整結果。

- **切分後的低位段會產生前導零問題**：
  位數和在切分後可直接相加，不受影響；但位數積不同——低位段若不足位數，其前導零在原數中是真實存在的位數，會使整個乘積歸零。因此低位段必須以「補足固定位數」的方式另外建表，才能正確反映原數的位數積。

依據以上特性，可以採用以下策略：

- **以遞推方式預先建立位數和表與位數積表**，讓每個數值重用其去尾後的結果。
- **另外建立一張補零版的位數積表**，專供低位段使用，使前導零被視為真實位數。
- **查詢時先以快速路徑處理落在單一區塊內的小數值**，其餘則拆為高低兩段，分別查表後合併，最後以取餘數判斷整除性。

此策略將所有繁重運算移至一次性的預處理階段，使每次查詢皆維持在常數時間內完成。

## 解題步驟

### Step 1：定義區塊切分的常數

先定義單一區塊的大小，數值將以此切分為高低兩段；同時定義高位段可達的最大索引數量，作為表格容量的依據。

```typescript
/** 單一位數區塊的大小；n 會被拆解為 highBlock * BLOCK_SIZE + lowBlock。 */
const BLOCK_SIZE = 1000;

/** 高位區塊可達的最大索引，因為 n <= 10^6 使得 floor(n / 1000) <= 1000。 */
const HIGH_BLOCK_COUNT = 1001;
```

### Step 2：宣告三張預先計算的查表

分別準備位數和表、位數積表，以及專供低位段使用的補零版位數積表，三者皆以型別化陣列儲存以節省空間並加速存取。

```typescript
/** digitSumTable[value] = value 的十進位各位數字之和。 */
const digitSumTable = new Int32Array(HIGH_BLOCK_COUNT);

/** digitProductTable[value] = value 的十進位各位數字之積，不含前導零。 */
const digitProductTable = new Int32Array(HIGH_BLOCK_COUNT);

/** digitProductPaddedTable[value] = value 補足為三位數後的各位數字之積（"007" -> 0）。 */
const digitProductPaddedTable = new Int32Array(BLOCK_SIZE);
```

### Step 3：設定遞推所需的中性起始值

遞推的起點需為「空位數列」的中性值：和為 0、積為 1，如此才能讓後續遞推對個位數值也成立。

```typescript
// 中性種子：空的位數列其和為 0、積為 1，這使得下方的遞推對個位數值也正確
// （索引 0 本身不會被直接查詢）。
digitSumTable[0] = 0;
digitProductTable[0] = 1;
```

### Step 4：以遞推方式建立位數和表與位數積表

由小到大逐一走訪每個數值，先取得去掉最低位後的商與該最低位數字，再直接沿用商的既有結果進行累加與累乘，避免重複拆解位數。

```typescript
// 以遞推方式建立自然表：每個數值都重用 value / 10 的結果。
for (let value = 1; value < HIGH_BLOCK_COUNT; value++) {
  const quotient = (value / 10) | 0;
  const lastDigit = value - quotient * 10;

  digitSumTable[value] = digitSumTable[quotient] + lastDigit;
  digitProductTable[value] = digitProductTable[quotient] * lastDigit;
}
```

### Step 5：建立補零版的位數積表

低位段在原數中固定佔滿三位，其前導零是真實存在的位數。因此逐一取出百位、十位與個位並直接相乘，使含零者的乘積自然歸零。

```typescript
// 建立補零表：前導零是 n 的真實位數，因此會使乘積歸零。
for (let value = 0; value < BLOCK_SIZE; value++) {
  const hundredsDigit = (value / 100) | 0;
  const tensDigit = ((value / 10) | 0) - hundredsDigit * 10;
  const unitsDigit = value - ((value / 10) | 0) * 10;

  digitProductPaddedTable[value] = hundredsDigit * tensDigit * unitsDigit;
}
```

### Step 6：快速處理落在單一區塊內的小數值

若數值本身小於一個區塊的大小，代表其完全落在既有表格的自然索引範圍內，可直接以一組查表取得除數並判斷整除性。

```typescript
// 較小的數值可容納於單一區塊中，因此一組查表即可回答此查詢。
if (n < BLOCK_SIZE) {
  const smallDivisor = digitSumTable[n] + digitProductTable[n];

  return n % smallDivisor === 0;
}
```

### Step 7：將數值拆解為高位段與低位段

對於較大的數值，以區塊大小做整數除法取得高位段，再扣去高位段所代表的部分得到低位段。

```typescript
const highBlock = (n / BLOCK_SIZE) | 0;
const lowBlock = n - highBlock * BLOCK_SIZE;
```

### Step 8：合併兩段結果求得除數並判斷整除

位數和可跨區塊直接相加；位數積則需以高位段的自然乘積乘上低位段的補零乘積，才能正確計入低位段的前導零。取得除數後即可判斷整除性。

```typescript
// 位數和可跨區塊相加；位數積則使用補零版的低位區塊，
// 使低位區塊的前導零被視為 n 的真實位數。
const divisor =
  digitSumTable[highBlock] +
  digitSumTable[lowBlock] +
  digitProductTable[highBlock] * digitProductPaddedTable[lowBlock];

return n % divisor === 0;
```

## 時間複雜度

- 預處理階段建立三張表，其長度由固定的常數上界決定，且僅執行一次；
- 單次查詢僅涉及常數次的查表、乘加與取餘運算；
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 三張查表的長度皆由固定的常數上界決定，不隨輸入變動；
- 查詢過程僅使用固定數量的區域變數；
- 總空間複雜度為 $O(1)$。

> $O(1)$
