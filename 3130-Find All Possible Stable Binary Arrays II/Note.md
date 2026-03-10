# 3130. Find All Possible Stable Binary Arrays II

You are given `3` positive integers `zero`, `one`, and `limit`.

A binary array `arr` is called stable if:

- The number of occurrences of 0 in `arr` is exactly `zero`.
- The number of occurrences of 1 in `arr` is exactly `one`.
- Each subarray of arr with a size greater than `limit` must contain both 0 and 1.

Return the total number of stable binary arrays.

Since the answer may be very large, return it modulo `10^9 + 7`.

**Constraints:**

- `1 <= zero, one, limit <= 1000`

## 基礎思路

本題要求計算長度固定的二元陣列數量，且陣列中 `0` 與 `1` 的出現次數必須分別恰好等於指定值，同時任意長度大於限制值的子陣列都不能只包含單一數字。換句話說，任一數字都不能連續出現超過限制次數。

在思考這類計數問題時，可掌握以下核心觀察：

* **穩定條件可轉化為連續段限制**：
  題目要求所有長度大於限制值的子陣列都同時包含 `0` 與 `1`，等價於陣列中不允許出現長度超過限制值的全 `0` 連續段或全 `1` 連續段。

* **計數過程可由前綴狀態遞推**：
  若已知某個前綴用了多少個 `0`、多少個 `1`，以及最後一個位置是 `0` 還是 `1`，就能判斷接下來加入新數字後的方案數如何轉移。

* **結尾數字會影響合法延伸方式**：
  兩個使用數量相同的前綴，若最後結尾不同，未來能接上的數字與是否會形成非法連續段也不同，因此必須分開記錄。

* **非法連續段可用扣除法高效處理**：
  當嘗試在尾端加入某個數字時，先累加所有可接續的狀態，再扣掉那些會使該數字連續長度超出限制的情況，就能避免額外枚舉連續段長度。

依據以上特性，可以採用以下策略：

* **使用動態規劃記錄每個使用數量組合的合法方案數**，並依照結尾是 `0` 或 `1` 分成兩類狀態。
* **透過平面化陣列儲存二維狀態表**，減少額外結構開銷，並提升記憶體存取效率。
* **每次轉移時先做總合，再扣除超過連續限制的非法來源**，即可在線性狀態數內完成整體計算。
* **最後將使用完所有 `0` 與 `1` 的兩種結尾方案數相加**，得到答案。

此策略能在不枚舉所有陣列排列的情況下，高效求出所有符合條件的穩定二元陣列總數。

## 解題步驟

### Step 1：初始化模數並調整維度順序

先定義題目要求的模數。
接著若 `zero` 大於 `one`，就交換兩者，讓後續內層迴圈永遠遍歷較小的維度，以提升快取區域性與整體實作效率。

```typescript
const MODULO = 1000000007;

// 確保內層迴圈遍歷較小的維度，以獲得更好的快取區域性。
if (zero > one) {
  const temp = zero;
  zero = one;
  one = temp;
}
```

### Step 2：建立平面化動態規劃表所需的尺寸與陣列

接下來先決定平面化表格中每一列的欄數，以及整張表需要的總狀態數。
然後分別建立兩個 DP 陣列，用來記錄在相同使用數量下、最後結尾為 `0` 與最後結尾為 `1` 的合法方案數。

```typescript
// 平面化 DP 表中的欄數（對應 zero 的使用數量維度）。
const zeroDimensionSize = zero + 1;

// 平面化陣列中儲存的 DP 狀態總數。
const totalStateSize = (one + 1) * zeroDimensionSize;

// DP 陣列：
// stableEndingWithZero[state] = 使用了 (onesUsed, zerosUsed) 且結尾為 0 的陣列數量
// stableEndingWithOne[state]  = 使用了 (onesUsed, zerosUsed) 且結尾為 1 的陣列數量
const stableEndingWithZero = new Int32Array(totalStateSize);
const stableEndingWithOne = new Int32Array(totalStateSize);
```

### Step 3：計算初始可直接成立的純單一數字區段長度

在正式轉移前，先求出純 `0` 開頭序列與純 `1` 開頭序列最多可以合法延伸到哪裡。
因為單一數字連續長度不能超過限制值，所以初始長度上限為使用數量與限制值中的較小者。

```typescript
const maxInitialZeros = zero < limit ? zero : limit;
const maxInitialOnes = one < limit ? one : limit;
```

### Step 4：初始化只由 0 組成的合法序列

只要長度沒有超過限制值，純 `0` 序列就是合法的，因此可直接把這些初始狀態設為 1，作為後續轉移基礎。

```typescript
// 初始化僅由 0 組成的序列。
for (let zerosUsed = 0; zerosUsed <= maxInitialZeros; zerosUsed++) {
  stableEndingWithZero[zerosUsed] = 1;
}
```

### Step 5：初始化只由 1 組成的合法序列

同理，只要長度不超過限制值，純 `1` 序列也都是合法初始狀態。
由於平面化表格是以列來表示 `1` 的使用數量，因此每次往下一列移動都要加上一整列的偏移量。

```typescript
// 初始化僅由 1 組成的序列。
for (
  let onesUsed = 0, rowStartIndex = 0;
  onesUsed <= maxInitialOnes;
  onesUsed++, rowStartIndex += zeroDimensionSize
) {
  stableEndingWithOne[rowStartIndex] = 1;
}
```

### Step 6：修正空序列狀態並預先準備非法區段偏移量

空序列不能同時視為結尾是 `0` 或結尾是 `1` 的合法狀態，因此要將原點狀態清為 0。
此外，也先計算「超出限制時」所需回扣的連續段長度與整列位移，方便後面快速扣除非法來源。

```typescript
stableEndingWithZero[0] = 0;
stableEndingWithOne[0] = 0;

const forbiddenRunLength = limit + 1;
const forbiddenRowOffset = forbiddenRunLength * zeroDimensionSize;
```

### Step 7：逐列展開 DP，先取得目前列的基礎索引資訊

外層迴圈逐步增加已使用的 `1` 數量。
在每一列中，先找出上一列的起始位置，並預先計算若目前加入 `1` 會造成連續 `1` 超限時，應該扣除的是哪一列的來源狀態。

```typescript
// 填滿 DP 狀態。
for (
  let onesUsed = 1, rowStartIndex = zeroDimensionSize;
  onesUsed <= one;
  onesUsed++, rowStartIndex += zeroDimensionSize
) {
  const previousRowStartIndex = rowStartIndex - zeroDimensionSize;

  // 會違反最多連續 1 限制的那一列。
  const forbiddenOnesRowStartIndex =
    onesUsed > limit ? rowStartIndex - forbiddenRowOffset : -1;

  // ...
}
```

### Step 8：進入每一格狀態，先處理結尾接上 0 的轉移

內層迴圈逐步增加已使用的 `0` 數量。
對於每個狀態，若最後要接上一個 `0`，則可從左邊相鄰狀態的兩種結尾方式累加而來；之後再以模數維持在合法範圍內。

```typescript
for (
  let onesUsed = 1, rowStartIndex = zeroDimensionSize;
  onesUsed <= one;
  onesUsed++, rowStartIndex += zeroDimensionSize
) {
  // Step 7：取得目前列的基礎索引資訊

  for (
    let zerosUsed = 1, stateIndex = rowStartIndex + 1;
    zerosUsed <= zero;
    zerosUsed++, stateIndex++
  ) {
    // 轉移：接上一個 0
    let countEndingWithZero =
      stableEndingWithZero[stateIndex - 1] +
      stableEndingWithOne[stateIndex - 1];

    if (countEndingWithZero >= MODULO) {
      countEndingWithZero -= MODULO;
    }

    // ...
  }
}
```

### Step 9：扣除會使連續 0 超限的非法來源並寫回狀態

若目前已使用的 `0` 數量已經超過限制值，代表某些「接上 `0`」的來源會形成過長的連續 `0`，需要從剛才的總數中扣除。
扣除後若變成負數，則加回模數，最後把結果存入對應的「結尾為 `0`」狀態。

```typescript
for (
  let onesUsed = 1, rowStartIndex = zeroDimensionSize;
  onesUsed <= one;
  onesUsed++, rowStartIndex += zeroDimensionSize
) {
  // Step 7：取得目前列的基礎索引資訊

  for (
    let zerosUsed = 1, stateIndex = rowStartIndex + 1;
    zerosUsed <= zero;
    zerosUsed++, stateIndex++
  ) {
    // Step 8：處理結尾接上 0 的基礎轉移

    // 移除那些 0 的連續長度超過允許限制的非法狀態。
    if (zerosUsed > limit) {
      countEndingWithZero -=
        stableEndingWithOne[stateIndex - forbiddenRunLength];

      if (countEndingWithZero < 0) {
        countEndingWithZero += MODULO;
      }
    }

    stableEndingWithZero[stateIndex] = countEndingWithZero;

    // ...
  }
}
```

### Step 10：處理結尾接上 1 的轉移

接著在同一個狀態中，計算最後接上一個 `1` 的方案數。
這時來源來自上一列相同 `0` 使用數量的位置，也就是少用一個 `1` 的所有合法前綴總和。

```typescript
for (
  let onesUsed = 1, rowStartIndex = zeroDimensionSize;
  onesUsed <= one;
  onesUsed++, rowStartIndex += zeroDimensionSize
) {
  // Step 7：取得目前列的基礎索引資訊

  for (
    let zerosUsed = 1, stateIndex = rowStartIndex + 1;
    zerosUsed <= zero;
    zerosUsed++, stateIndex++
  ) {
    // Step 8：處理結尾接上 0 的基礎轉移

    // Step 9：扣除連續 0 超限的非法來源並寫回狀態

    // 轉移：接上一個 1
    let countEndingWithOne =
      stableEndingWithZero[previousRowStartIndex + zerosUsed] +
      stableEndingWithOne[previousRowStartIndex + zerosUsed];

    if (countEndingWithOne >= MODULO) {
      countEndingWithOne -= MODULO;
    }

    // ...
  }
}
```

### Step 11：扣除會使連續 1 超限的非法來源並完成整張 DP 表

若目前存在會形成過長連續 `1` 的來源列，就必須將其扣除。
修正後同樣處理負值情況，並將最終結果寫回「結尾為 `1`」的狀態，至此該格 DP 狀態完整計算完成。

```typescript
for (
  let onesUsed = 1, rowStartIndex = zeroDimensionSize;
  onesUsed <= one;
  onesUsed++, rowStartIndex += zeroDimensionSize
) {
  // Step 7：取得目前列的基礎索引資訊

  for (
    let zerosUsed = 1, stateIndex = rowStartIndex + 1;
    zerosUsed <= zero;
    zerosUsed++, stateIndex++
  ) {
    // Step 8：處理結尾接上 0 的基礎轉移

    // Step 9：扣除連續 0 超限的非法來源並寫回狀態

    // Step 10：處理結尾接上 1 的基礎轉移

    // 移除那些 1 的連續長度超過允許限制的非法狀態。
    if (forbiddenOnesRowStartIndex >= 0) {
      countEndingWithOne -=
        stableEndingWithZero[forbiddenOnesRowStartIndex + zerosUsed];

      if (countEndingWithOne < 0) {
        countEndingWithOne += MODULO;
      }
    }

    stableEndingWithOne[stateIndex] = countEndingWithOne;
  }
}
```

### Step 12：取出最終狀態並合併兩種結尾答案

當所有狀態都計算完成後，最終答案位於「剛好使用完所有 `0` 與 `1`」的那個位置。
將結尾為 `0` 與結尾為 `1` 的方案數相加，做一次模數修正後即可回傳。

```typescript
const finalStateIndex = one * zeroDimensionSize + zero;

let totalStableArrays =
  stableEndingWithZero[finalStateIndex] +
  stableEndingWithOne[finalStateIndex];

if (totalStableArrays >= MODULO) {
  totalStableArrays -= MODULO;
}

return totalStableArrays;
```

## 時間複雜度

- 設 `n` 為 `0` 的數量，`m` 為 `1` 的數量；
- 動態規劃需要計算所有 `(zerosUsed, onesUsed)` 的狀態組合，總共有 $(n + 1) \times (m + 1)$ 個狀態；
- 每個狀態的轉移與非法狀態扣除皆為常數時間。
- 總時間複雜度為 $O(n \times m)$。

> $O(n \times m)$

## 空間複雜度

- 設 `n` 為 `0` 的數量，`m` 為 `1` 的數量；
- 使用兩個大小皆為 $(n + 1) \times (m + 1)$ 的動態規劃陣列來儲存狀態；
- 其餘僅使用常數額外變數。
- 總空間複雜度為 $O(n \times m)$。

> $O(n \times m)$
