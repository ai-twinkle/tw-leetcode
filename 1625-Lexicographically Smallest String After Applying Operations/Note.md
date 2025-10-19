# 1625. Lexicographically Smallest String After Applying Operations

You are given a string `s` of even length consisting of digits from `0` to `9`, and two integers `a` and `b`.

You can apply either of the following two operations any number of times and in any order on `s`:

- Add `a` to all odd indices of `s` (0-indexed). 
  Digits post 9 are cycled back to `0`. 
  For example, if `s = "3456"` and `a = 5`, `s` becomes `"3951"`.
- Rotate `s` to the right by `b` positions. 
  For example, if `s = "3456"` and `b = 1`, `s` becomes `"6345"`.

Return the lexicographically smallest string you can obtain by applying the above operations any number of times on `s`.

A string `a` is lexicographically smaller than a string `b` (of the same length) if in the first position where `a` and `b` differ, 
string `a` has a letter that appears earlier in the alphabet than the corresponding letter in `b`. 
For example, `"0158"` is lexicographically smaller than `"0190"` because the first position they differ is at the third letter, 
and `'5'` comes before `'9'`

**Constraints:**

- `2 <= s.length <= 100`
- `s.length` is even.
- `s` consists of digits from `0` to `9` only.
- `1 <= a <= 9`
- `1 <= b <= s.length - 1`.

## 基礎思路

本題要我們對一個由數字組成、長度為偶數的字串 `s`，重複執行兩種操作，使最終結果在字典序上最小：

1. **加法操作**：對所有奇數索引的位數加上 `a`，若超過 9 則循環回 0；
2. **旋轉操作**：將整個字串向右旋轉 `b` 位。

可任意次數與順序地應用這兩個操作，最後需找出能得到的最小字典序字串。

在思考解法時，我們需要注意以下幾點：

* **操作具週期性**：
  加法操作對某位數而言，每 10 次會回到原值；旋轉操作則會在經過 $\text{lcm}(b, n)$ 次後回到初始狀態。
* **可達狀態有限**：
  雖然可重複操作無限次，但實際不同的結果只有有限個，因此可透過數學週期找出所有獨特狀態。
* **索引奇偶的影響**：
  若旋轉步長 `b` 為奇數，則「奇偶索引」會互換，使得原本只能改變奇數位的操作，經過某些旋轉後也能影響偶數位。
* **字典序判斷**：
  在生成所有可達狀態後，需有效比較候選字串的字典序以找出最小者。

為此，我們採用以下策略：

* **使用數學週期化簡操作空間**：
  利用最大公因數 (`gcd`) 找出旋轉與加法的最小循環週期，僅需在有限次內嘗試所有可能組合。
* **分別優化奇偶索引**：
  根據 `b` 的奇偶性決定是否同時調整偶數索引。
* **直接操作字元陣列**：
  避免多餘字串拼接的開銷，以陣列形式比較字典序，提升效能。

## 解題步驟

### Step 1：輔助函數 `greaterCommonDivisor` — 計算最大公因數

利用歐幾里得演算法計算兩數的最大公因數，協助求出旋轉與加法的循環週期。

```typescript
/**
 * 使用歐幾里得演算法計算兩數的最大公因數。
 *
 * @param valueA 第一個正整數
 * @param valueB 第二個正整數
 * @returns 最大公因數
 */
function greaterCommonDivisor(valueA: number, valueB: number): number {
  while (valueB !== 0) {
    const remainder = valueA % valueB;
    valueA = valueB;
    valueB = remainder;
  }
  return valueA;
}
```

### Step 2：初始化主要變數

建立初始狀態，包括原字串、雙倍字串（方便旋轉切片）、旋轉步長與加法循環長度。

```typescript
// 字串長度
const stringLength = s.length;
let smallestString = s;

// 建立雙倍字串，方便無模運算旋轉切片
const doubledString = s + s;

// 計算旋轉步長（由 gcd 決定能形成的唯一旋轉組合數）
const rotationStep = greaterCommonDivisor(b, stringLength);

// 計算加法循環長度（每 cycleLength 次回到原狀）
const cycleLength = 10 / greaterCommonDivisor(a, 10);
```

### Step 3：輔助函數 `applyBestAddition` — 最佳化指定奇偶索引的加法操作

針對奇數或偶數索引，嘗試所有可能的加法次數，找出使該位數最小的增量，並將其應用到所有相同奇偶的位上。

```typescript
/**
 * 對指定奇偶性的索引套用最佳加法操作。
 *
 * @param digits 可變的字元陣列
 * @param startIndex 起始索引（0 表偶數，1 表奇數）
 */
function applyBestAddition(digits: string[], startIndex: number) {
  // 取得此奇偶性下的首個數字值
  const originalDigit = digits[startIndex].charCodeAt(0) - 48;
  let minimumDigit = 10;
  let bestTimes = 0;

  // 嘗試所有加法循環次數，找出能讓結果最小的次數
  for (let times = 0; times < cycleLength; times++) {
    const addedDigit = (originalDigit + (times * a) % 10) % 10;
    if (addedDigit < minimumDigit) {
      minimumDigit = addedDigit;
      bestTimes = times;
    }
  }

  // 套用最佳增量至所有同奇偶索引位置
  const increment = (bestTimes * a) % 10;
  for (let index = startIndex; index < stringLength; index += 2) {
    const baseDigit = digits[index].charCodeAt(0) - 48;
    digits[index] = String.fromCharCode(48 + ((baseDigit + increment) % 10));
  }
}
```

### Step 4：輔助函數 `isLexicographicallySmaller` — 比較字典序

逐字比較兩組字元陣列，判斷候選字串是否比當前最佳解更小。

```typescript
/**
 * 判斷候選字元陣列是否字典序更小。
 *
 * @param candidateDigits 候選字元陣列
 * @param currentBestString 當前最小字串
 * @returns 若候選字串更小則回傳 true
 */
function isLexicographicallySmaller(candidateDigits: string[], currentBestString: string): boolean {
  for (let index = 0; index < stringLength; index++) {
    const candidateChar = candidateDigits[index].charCodeAt(0);
    const bestChar = currentBestString.charCodeAt(index);

    if (candidateChar < bestChar) {
      return true;
    }
    if (candidateChar > bestChar) {
      return false;
    }
  }
  return false;
}
```

### Step 5：嘗試所有有效旋轉組合

根據旋轉步長 `rotationStep`，嘗試所有唯一旋轉狀態，對每一種旋轉：

1. 取出旋轉後字元陣列；
2. 對奇數索引執行最佳加法；
3. 若 `b` 為奇數，偶數索引經旋轉後也可能成為奇數，需再執行一次最佳化；
4. 與當前最小字串比較更新。

```typescript
// 嘗試所有唯一旋轉組合
for (let rotationIndex = 0; rotationIndex < stringLength; rotationIndex += rotationStep) {
  // 擷取當前旋轉後的子字串
  const rotatedDigits = doubledString.slice(rotationIndex, rotationIndex + stringLength).split("");

  // 永遠可對奇數位進行加法操作
  applyBestAddition(rotatedDigits, 1);

  // 若旋轉步長為奇數，偶數位也可能被影響，需再執行一次
  if ((b & 1) === 1) {
    applyBestAddition(rotatedDigits, 0);
  }

  // 比較並更新目前的最小字串
  if (isLexicographicallySmaller(rotatedDigits, smallestString)) {
    smallestString = rotatedDigits.join("");
  }
}
```

### Step 6：返回最小字典序結果

完成所有旋轉與加法嘗試後，回傳最小結果。

```typescript
// 返回最終的最小字典序字串
return smallestString;
```

## 時間複雜度

- `applyBestAddition()`：每次最多嘗試 10 次加法循環，需遍歷 $\frac{n}{2}$ 位數，為 $O(n)$。
- 旋轉嘗試次數最多為 $\frac{n}{\gcd(b, n)}$。
- 整體複雜度為 $O(\frac{n^2}{\gcd(b, n)})$，在 $n \le 100$ 時可接受。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 使用少量臨時陣列（旋轉後字串、副本）與常數映射表。
- 額外空間與輸入長度成正比。
- 總空間複雜度為 $O(n)$。

> $O(n)$
