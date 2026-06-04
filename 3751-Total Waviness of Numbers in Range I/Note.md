# 3751. Total Waviness of Numbers in Range I

You are given two integers `num1` and `num2` representing an inclusive range `[num1, num2]`.

The waviness of a number is defined as the total count of its peaks and valleys:

- A digit is a peak if it is strictly greater than both of its immediate neighbors.
- A digit is a valley if it is strictly less than both of its immediate neighbors.
- The first and last digits of a number cannot be peaks or valleys.
- Any number with fewer than 3 digits has a waviness of 0.

Return the total sum of waviness for all numbers in the range `[num1, num2]`.

**Constraints:**

- `1 <= num1 <= num2 <= 10^5`

## 基礎思路

本題要求對指定區間 `[num1, num2]` 內的所有整數，計算其「波動數」總和。所謂波動數，即一個整數從第二位到倒數第二位中，所有嚴格大於兩側鄰位（波峰）或嚴格小於兩側鄰位（波谷）的位數個數。

在思考解法時，可掌握以下核心觀察：

- **資料規模有限且固定**：
  題目所給上界為 10^5，整個可能整數空間最多僅約十萬個元素，可在合理時間內完整列舉。

- **單次查詢為連續區間和**：
  將每個整數對應到一個波動數後，題目即轉化為對該函數做區間加總，這正是經典的前綴和應用情境。

- **單一整數的波動數可逐位求得**：
  以三位數作為一組視窗，由右至左掃描整個數字，每個視窗只需常數時間即可判斷其是否為波峰或波谷。

- **位數不足 3 的整數一律為 0**：
  此類整數無內部位數可作為波峰或波谷的中心，可直接視為 0 而不必特殊處理。

依據以上特性，可以採用以下策略：

- **預先計算 1 到上界之間每個整數對應的波動數，並建構成前綴和陣列**，使任意區間查詢都能於常數時間內完成。
- **以三位數滑動視窗逐位掃描**，避免將整數轉為字串或重複拆解位數所帶來的額外開銷。
- **由位數最少為 3 的整數（即 100）開始累積**，前綴和初始值已涵蓋所有位數不足者，無須額外特判。

藉由「離線預處理 + 前綴和」的結構，每次查詢僅為兩次陣列存取，效率極佳且結構清晰。

## 解題步驟

### Step 1：定義輸入範圍上界常數

依題目約束，所有輸入值不會超過 10^5，因此先定義此上界，作為前綴和表的容量依據。

```typescript
// 題目輸入範圍的上界
const MAX_NUMBER = 100000;
```

### Step 2：建立前綴和容器並從具備三位數的最小值開始累加

使用 IIFE 一次性建立 `wavinessPrefixSum` 陣列。
由於小於 100 的數字位數少於 3，其波動數必為 0，因此前綴和的初始 0 已涵蓋此區段，直接由 100 開始計算即可。
每進入一個新數字時，先取出其最低兩位作為三位數滑動視窗的初始狀態，並準備計數器以累積該數的波動數。

```typescript
// 預先計算的波動數前綴和，索引值對應數字
// wavinessPrefixSum[i] 代表 1 到 i 所有整數的累積波動數
const wavinessPrefixSum = (() => {
  const prefixSum = new Int32Array(MAX_NUMBER + 1);
  // 100 以下的數字位數少於 3，波動數必為 0，故由 100 開始計算
  for (let number = 100; number <= MAX_NUMBER; number++) {
    let remaining = number;
    // 取出最低兩位以初始化滑動視窗
    let rightDigit = remaining % 10;
    remaining = (remaining / 10) | 0;
    let middleDigit = remaining % 10;
    remaining = (remaining / 10) | 0;
    let count = 0;

    // ...
  }
  return prefixSum;
})();
```

### Step 3：由右至左滑動三位數視窗判斷波峰與波谷

進入內部 `while` 迴圈，每輪取出下一個高位作為視窗的左側位數。
當中間位嚴格大於兩側時為波峰，嚴格小於兩側時為波谷，兩者皆使計數器加一。
處理完畢後將視窗整體向最高位推進一位，繼續掃描，直到所有位數皆被處理完畢。

```typescript
for (let number = 100; number <= MAX_NUMBER; number++) {
  // Step 2：取出最低兩位作為視窗初值並初始化計數器

  // 由右至左滑動三位數視窗掃描整個數字
  while (remaining > 0) {
    const leftDigit = remaining % 10;
    // 波峰：中間位嚴格大於兩側鄰位
    if (middleDigit > rightDigit && middleDigit > leftDigit) {
      count++;
    } else if (middleDigit < rightDigit && middleDigit < leftDigit) {
      // 波谷：中間位嚴格小於兩側鄰位
      count++;
    }
    // 將視窗向最高位推進一位
    rightDigit = middleDigit;
    middleDigit = leftDigit;
    remaining = (remaining / 10) | 0;
  }

  // ...
}
```

### Step 4：將該數的波動數累加進前綴和

掃描完成後，將當前數字累積出的波動數加上前一個數字的前綴和，寫入對應索引位置，完成本輪累加。

```typescript
for (let number = 100; number <= MAX_NUMBER; number++) {
  // Step 2：取出最低兩位作為視窗初值並初始化計數器

  // Step 3：滑動三位數視窗累計波峰與波谷數量

  // 將當前數字的波動數累加至前綴和對應位置
  prefixSum[number] = prefixSum[number - 1] + count;
}
```

### Step 5：以前綴和於常數時間回應區間查詢

最終的查詢函數僅需兩次陣列存取，即可取得 `[num1, num2]` 區間內的累積波動數總和，達成 O(1) 區間查詢。

```typescript
/**
 * 計算指定整數區間內所有整數的波動數總和。
 * @param num1 區間下界（包含）
 * @param num2 區間上界（包含）
 * @returns 區間 [num1, num2] 內所有整數的波動數總和
 */
function totalWaviness(num1: number, num2: number): number {
  // 透過預先計算的前綴和表進行常數時間區間查詢
  return wavinessPrefixSum[num2] - wavinessPrefixSum[num1 - 1];
}
```

## 時間複雜度

- 預先計算階段需處理 100 到 N 共 O(N) 個整數；
- 每個整數至多需檢查 O(log N) 個位數以判斷波峰與波谷；
- 區間查詢僅需常數次陣列存取，為 O(1)；
- 總時間複雜度為 $O(N \log N)$。

> $O(N \log N)$

## 空間複雜度

- 前綴和陣列長度為 N + 1，佔用 O(N) 空間；
- 其餘變數皆為常數個；
- 總空間複雜度為 $O(N)$。

> $O(N)$
