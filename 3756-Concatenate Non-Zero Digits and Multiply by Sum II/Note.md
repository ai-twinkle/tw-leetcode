# 3756. Concatenate Non-Zero Digits and Multiply by Sum II

You are given a string `s` of length `m` consisting of digits. 
You are also given a 2D integer array `queries`, where `queries[i] = [l_i, r_i]`.

For each `queries[i]`, extract the substring `s[l_i..r_i]`. 
Then, perform the following:

- Form a new integer `x` by concatenating all the non-zero digits from the substring in their original order. If there are no non-zero digits, x = 0.
- Let sum be the sum of digits in `x`. 
  The answer is `x * sum`.

Return an array of integers `answer` where `answer[i]` is the answer to the $i^{th}$ query.

Since the answers may be very large, return them modulo `10^9 + 7`.

**Constraints:**

- `1 <= m == s.length <= 10^5`
- `s` consists of digits only.
- `1 <= queries.length <= 10^5`
- `queries[i] = [l_i, r_i]`
- `0 <= l_i <= r_i < m`

## 基礎思路

本題要求對字串 `s` 的多個子字串進行查詢，每次取出子字串後去除所有零、將剩餘數字串接成整數 `x`，再將 `x` 與其數字總和相乘，最終取模回傳。查詢量與字串長度皆可達 `10^5`，若每次暴力處理子字串則過慢，需利用前綴結構加速。

在思考解法時，可掌握以下核心觀察：

- **去零後的數值可拆解為前綴差**：
  若能記錄「前 `c` 個非零數字所形成的整數模值」，則任意區間的非零串接值可用兩個前綴值相減與位移重建，無需每次重新掃描。

- **數字總和同樣可用前綴差求得**：
  非零數字的數字總和本身是線性可加的，只需前綴和即可在常數時間內得出任意區間的貢獻。

- **位置索引須從「非零計數前綴」取得**：
  字串中包含零，因此從字元位置映射到「第幾個非零數字」需要額外的計數前綴陣列，才能正確對應前綴值陣列的索引。

- **大整數乘法需拆分避免精度損失**：
  `10^9 + 7` 範圍內的數乘以 `10^5` 次方後，中間結果可能超過 JavaScript 的 `2^53` 安全整數上限；將次方拆成高低位兩個 `Float64Array` 分段計算，可確保每步乘積不超出精確範圍。

依據以上特性，可以採用以下策略：

- **預處理三個前綴結構**：非零數字計數前綴、前 `c` 個非零數字的串接值（模值）、前 `c` 個非零數字的數字總和。
- **預算 10 的次方表**並拆成高低位，供查詢時進行位移重建。
- **每次查詢以常數時間完成**：透過兩端的非零計數取得索引，再用前綴差重建串接值與數字總和，最後相乘取模即為答案。

此策略可將整體時間複雜度壓至 $O(m + q)$，足以應對最大輸入規模。

## 解題步驟

### Step 1：預算 10 的次方表並拆成高低位

為了在查詢時能夠以常數時間計算「前綴值位移後的結果」，需事先建立 $10^0$ 到 $10^{100000}$ 的模值表。由於直接相乘可能超出 `2^53`，將每個次方值拆成高位（除以 `65536` 的整數部分）與低位（對 `65536` 取餘），以確保後續計算不損失精度。

```typescript
const MOD_VALUE = 1_000_000_007;
const MAXIMUM_POWER = 100_001;

// 10 的次方對 MOD_VALUE 取模後，拆成高低兩段以確保重建時的乘法不超過 2^53
const powersOfTenLow = new Float64Array(MAXIMUM_POWER);
const powersOfTenHigh = new Float64Array(MAXIMUM_POWER);
let currentPower = 1;
for (let index = 0; index < MAXIMUM_POWER; index++) {
  powersOfTenLow[index] = currentPower % 65536;
  powersOfTenHigh[index] = Math.floor(currentPower / 65536);
  currentPower = (currentPower * 10) % MOD_VALUE;
}
```

### Step 2：初始化前綴陣列

宣告三個前綴陣列，分別用來記錄：到字串某位置為止出現過的非零數字個數、前 `c` 個非零數字串接而成的整數模值、前 `c` 個非零數字的數字總和。這三個結構共同支撐後續所有查詢的常數時間運算。

```typescript
const length = s.length;

// nonZeroCountPrefix[i] = s[0..i-1] 中非零數字的個數
const nonZeroCountPrefix = new Int32Array(length + 1);
// valueByNonZeroIndex[c] = 前 c 個非零數字串接形成的整數，對 MOD_VALUE 取模
const valueByNonZeroIndex = new Float64Array(length + 1);
// sumByNonZeroIndex[c] = 前 c 個非零數字的數字總和
const sumByNonZeroIndex = new Int32Array(length + 1);
```

### Step 3：掃描字串並填入三個前綴陣列

逐字元掃描字串，遇到非零數字時更新串接模值與數字總和，並遞增非零計數；零則直接跳過，不影響 `x` 的構成。每個位置都將當前非零計數寫入 `nonZeroCountPrefix`，以便後續查詢時從字元索引映射到非零索引。

```typescript
let nonZeroSeen = 0;
let runningValue = 0;
let runningSum = 0;
for (let index = 0; index < length; index++) {
  const digit = s.charCodeAt(index) - 48;

  // 零數字在建構 x 和數字總和時完全跳過
  if (digit !== 0) {
    runningValue = (runningValue * 10 + digit) % MOD_VALUE;
    runningSum += digit;
    nonZeroSeen++;
    valueByNonZeroIndex[nonZeroSeen] = runningValue;
    sumByNonZeroIndex[nonZeroSeen] = runningSum;
  }

  nonZeroCountPrefix[index + 1] = nonZeroSeen;
}
```

### Step 4：初始化結果陣列並逐一處理查詢

建立與查詢數量相同大小的結果陣列，接著開始逐一處理每筆查詢，先從 `nonZeroCountPrefix` 取得該區間的非零數字索引範圍。

```typescript
const queryCount = queries.length;
const results = new Array<number>(queryCount);
for (let index = 0; index < queryCount; index++) {
  const query = queries[index];
  const startNonZero = nonZeroCountPrefix[query[0]];
  const endNonZero = nonZeroCountPrefix[query[1] + 1];
  const digitCount = endNonZero - startNonZero;

  // 若區間內無非零數字，則 x = 0，答案直接為 0
  if (digitCount === 0) {
    results[index] = 0;
    continue;
  }

  // ...
}
```

### Step 5：利用前綴差與位移重建區間串接值

已知「前 `startNonZero` 個非零數字」形成的模值，只需將其乘以 $10^{digitCount}$，再從「前 `endNonZero` 個非零數字」的模值中扣除，即可得到目標子區間的串接值。乘法部分使用高低位拆分確保精度。

```typescript
for (let index = 0; index < queryCount; index++) {
  // Step 4：取得非零索引範圍，處理空區間

  // 使用高低位拆分重建 prefixValue * 10^digitCount，確保中間乘積不超過 2^53
  const prefixValue = valueByNonZeroIndex[startNonZero];
  const shiftedPrefix = (prefixValue * powersOfTenHigh[digitCount] % MOD_VALUE * 65536 +
    prefixValue * powersOfTenLow[digitCount]) % MOD_VALUE;
  let concatenatedValue = valueByNonZeroIndex[endNonZero] - shiftedPrefix;
  if (concatenatedValue < 0) {
    concatenatedValue += MOD_VALUE;
  }

  // ...
}
```

### Step 6：計算數字總和並與串接值相乘取模存入結果

數字總和直接由兩個前綴值相減得出；由於總和最大為 $9 \times 10^5$，與模值相乘後不超過安全整數範圍，可直接對 `MOD_VALUE` 取模後存入結果陣列。

```typescript
for (let index = 0; index < queryCount; index++) {
  // Step 4：取得非零索引範圍，處理空區間

  // Step 5：重建區間串接值

  // 數字總和最大為 9 * 1e5，x * sum 在安全整數範圍內
  const digitSum = sumByNonZeroIndex[endNonZero] - sumByNonZeroIndex[startNonZero];
  results[index] = (concatenatedValue * digitSum) % MOD_VALUE;
}
```

### Step 7：回傳所有查詢的結果陣列

```typescript
return results;
```

## 時間複雜度

- 預算次方表需 $O(P)$，其中 $P$ 為 `MAXIMUM_POWER`，為常數級別；
- 掃描字串建立三個前綴陣列需 $O(m)$；
- 每筆查詢以常數時間完成，共 $q$ 筆，合計 $O(q)$；
- 總時間複雜度為 $O(m + q)$。

> $O(m + q)$

## 空間複雜度

- 次方表使用兩個長度為 $P$ 的陣列，為 $O(P)$，常數級別；
- 三個前綴陣列各長度為 $m + 1$，共 $O(m)$；
- 結果陣列長度為 $q$，為 $O(q)$；
- 總空間複雜度為 $O(m + q)$。

> $O(m + q)$
