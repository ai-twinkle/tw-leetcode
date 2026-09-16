# 1621. Number of Sets of K Non-Overlapping Line Segments

Given `n` points on a 1-D plane, where the ith point (from `0` to `n-1`) is at `x = i`, 
find the number of ways we can draw exactly `k` non-overlapping line segments such that each segment covers two or more points. 
The endpoints of each segment must have integral coordinates. 
The `k` line segments do not have to cover all `n` points, and they are allowed to share endpoints.

Return the number of ways we can draw `k` non-overlapping line segments. 
Since this number can be huge, return it modulo `10^9 + 7`.

**Constraints:**

- `2 <= n <= 1000`
- `1 <= k <= n-1`

## 基礎思路

本題要求在一維整數格點上，畫出恰好 `k` 條互不重疊、且每條至少覆蓋兩個點的線段，計算所有可能的畫法總數；線段之間允許共用端點，並不需要覆蓋所有點。
由於結果可能極大，需對 $10^9 + 7$ 取模。

在思考解法時，可掌握以下核心觀察：

- **線段完全由端點決定**：
  每條線段僅需知道左右兩個端點即可唯一確定，因此問題等價於在整數位置上挑選若干端點，並依序兩兩配對成線段。

- **共用端點是計數的唯一障礙**：
  若線段之間彼此不相交且不共用端點，則挑選端點的過程就是單純的「從所有位置中選出偶數個點」；正是「允許共用端點」使得被選位置可能重複出現，無法直接以組合數表示。

- **以「拆點」消除共用**：
  每一次共用最多讓兩條相鄰線段黏在同一位置，而共用的機會數量恰好受限於線段數減一。若在原有的位置之外額外擴充出相同數量的虛擬位置，讓每個共用點都能被拆成兩個相異位置，則所有配置都能被還原成「在擴充後的位置集合中選出互不相同的端點」。

- **問題化歸為單一組合數**：
  拆點之後，端點總數固定為線段數的兩倍，而可選位置數為原位置數加上擴充量，因此答案即為一個組合數；此對應關係是雙射，不會重複也不會遺漏。

- **模運算下的兩個技術限制**：
  其一，組合數需要除法，在模質數下必須改以費馬小定理求乘法反元素；其二，兩個接近模數的殘值相乘會超過雙精度浮點可精確表示的範圍，必須將乘法拆成高低位分別計算後再合併。

依據以上特性，可以採用以下策略：

- **先建立模乘與模冪的安全運算工具**，確保所有乘法都不會損失精度。
- **在模組載入時一次性預先計算階乘與反階乘表**，使每次查詢的組合數都能在常數時間內取得。
- **將答案直接以組合數公式輸出**，並在端點數超過可選位置數時回傳 0。

此策略把一個看似需要動態規劃的計數問題，化簡為一次常數時間的組合數查表。

## 解題步驟

### Step 1：定義模數與預先計算的上界

先固定題目要求的模數，並依約束推得階乘表所需的最大索引；由於可選位置數不超過位置數與線段數之和，兩千已足夠涵蓋所有情況。

```typescript
const MODULUS = 1_000_000_007;
const MAX_INDEX = 2000;
```

### Step 2：實作不會溢位的模乘法

兩個小於模數的殘值直接相乘會超過雙精度可精確表示的整數範圍，因此將其中一個因數切成高低兩個 16 位元區塊分別相乘，使每個部分乘積都控制在安全範圍內，最後再合併取模。

```typescript
/**
 * 在不超出雙精度範圍的前提下，將兩個殘值相乘後取模。
 * @param left - 位於 [0, MODULUS) 的第一個殘值
 * @param right - 位於 [0, MODULUS) 的第二個殘值
 * @returns (left * right) mod MODULUS
 */
function multiplyModulo(left: number, right: number): number {
  // 將 right 拆成 16 位元的高低兩半，使每個部分乘積都低於 2^47
  const highPart = ((left * (right >>> 16)) % MODULUS) * 65536;
  const lowPart = left * (right & 65535);
  return (highPart + lowPart) % MODULUS;
}
```

### Step 3：實作二進位快速冪

為了之後以費馬小定理求反元素，需要能在對數時間內計算模冪。逐位檢視指數的二進位表示，當該位為 1 時將當前底數併入結果，並在每一輪將底數平方、指數右移一位。

```typescript
/**
 * 以二進位快速冪計算 base^exponent 對 MODULUS 取模的結果。
 * @param base - 位於 [0, MODULUS) 的殘值
 * @param exponent - 非負整數指數
 * @returns base^exponent mod MODULUS
 */
function powerModulo(base: number, exponent: number): number {
  let result = 1;
  let currentBase = base;
  let remainingExponent = exponent;
  while (remainingExponent > 0) {
    if (remainingExponent & 1) {
      result = multiplyModulo(result, currentBase);
    }
    currentBase = multiplyModulo(currentBase, currentBase);
    remainingExponent >>>= 1;
  }
  return result;
}
```

### Step 4：配置查表陣列並預先計算階乘

建立階乘與反階乘兩張表，並自最小值往上遞推填滿階乘表；此計算在模組載入時只執行一次，後續所有查詢皆可共用。

```typescript
const factorial = new Int32Array(MAX_INDEX + 1);
const inverseFactorial = new Int32Array(MAX_INDEX + 1);

// 在模組載入時一次性預先計算階乘
factorial[0] = 1;
for (let index = 1; index <= MAX_INDEX; index++) {
  factorial[index] = multiplyModulo(factorial[index - 1], index);
}
```

### Step 5：以費馬小定理反推反階乘表

只需對最大的階乘做一次模冪即可取得其反元素，接著利用反階乘之間相差一個因數的遞推關係，由大往小一路回推，避免對每一項都做一次快速冪。

```typescript
// 費馬小定理給出最大階乘的反元素，接著往回逐項推導
inverseFactorial[MAX_INDEX] = powerModulo(factorial[MAX_INDEX], MODULUS - 2);
for (let index = MAX_INDEX; index > 0; index--) {
  inverseFactorial[index - 1] = multiplyModulo(inverseFactorial[index], index);
}
```

### Step 6：換算組合數參數並排除不可能的情形

在主函數中，先算出拆點後的可選位置總數，以及必須挑出的端點數量；若需要的端點數超過可選位置數，則不存在任何合法配置，直接回傳 0。

```typescript
const total = n + k - 1;
const chosen = 2 * k;
if (chosen > total) {
  return 0;
}
```

### Step 7：以階乘表輸出組合數作為答案

通過檢查後，直接以階乘與反階乘查表計算組合數；三項相乘皆透過安全模乘完成，確保過程不會溢位。

```typescript
// 將共用端點展開為相異槽位後，答案即等於 C(n + k - 1, 2k)
return multiplyModulo(
  multiplyModulo(factorial[total], inverseFactorial[chosen]),
  inverseFactorial[total - chosen]
);
```

## 時間複雜度

- 預先計算階乘表需一次線性掃描，為 $O(M)$，其中 $M$ 為階乘表上界；
- 反階乘表僅需一次模冪 $O(\log \text{MOD})$ 與一次線性回推 $O(M)$；
- 上述預處理在模組載入時只執行一次，單次查詢僅做常數次查表與模乘，為 $O(1)$；
- 由於 $M$ 為固定常數且 $M \ge n + k$，總時間複雜度為 $O(n + k)$。

> $O(n + k)$

## 空間複雜度

- 需要階乘與反階乘兩張長度固定的查表陣列，為 $O(M)$；
- 其餘僅使用常數個純量變數，無遞迴堆疊開銷；
- 總空間複雜度為 $O(n + k)$。

> $O(n + k)$
