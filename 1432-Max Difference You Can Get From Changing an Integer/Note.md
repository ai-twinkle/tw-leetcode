# 1432. Max Difference You Can Get From Changing an Integer

You are given an integer `num`. 
You will apply the following steps to `num` two separate times:

- Pick a digit `x` `(0 <= x <= 9)`.
- Pick another digit `y` `(0 <= y <= 9)`. Note `y` can be equal to `x`.
- Replace all the occurrences of `x` in the decimal representation of `num` by `y`.

Let `a` and `b` be the two results from applying the operation to `num` independently.

Return the max difference between `a` and `b`.

Note that neither `a` nor `b` may have any leading zeros, and must not be 0.

**Constraints:**

- `1 <= num <= 10^8`

## 基礎思路

本題的核心是透過數字中的各個位數變換，找出最大可能的差值。我們可以清楚觀察到數字每個位數：

- 若要讓數值變大，應盡可能將某個數字替換成「9」。
- 若要讓數值變小，應盡可能將某個數字替換成「0」（注意首位不可替換成 0，否則會有前導零問題，因此應改為「1」）。

為了實現上述過程，我們要：

- 先找出每個數字所在的位值總和（個位、十位、百位...）。
- 再利用這些資訊，計算出透過替換操作能達成的最大增益和最大損失。
- 最終兩者差值即為答案。

## 解題步驟

### Step 1：初始化並統計數字位值

先初始化相關變數：

```typescript
const digitPlaceValueSums = new Uint32Array(10);  // 儲存每個數字 (0~9) 出現時所在位值的總和
let placeValue = 1;                               // 從個位開始
let mostSignificantDigit = 0;                     // 紀錄數字的最高位（左邊第一個）

while (num > 0) {
  const digit = num % 10;                         // 取得當前位數的數字
  digitPlaceValueSums[digit] += placeValue;       // 更新該數字所在的位值總和
  mostSignificantDigit = digit;                   // 每次循環結束時更新最高位數字
  num = (num / 10) | 0;                           // 將數字往右移動一位（整數除法）
  placeValue *= 10;                               // 位值往上提升（個位→十位→百位...）
}
```

### Step 2：計算最佳的增益與損失

- 初始化最佳的增益與損失。
- 逐一判斷每個數字 (0\~9) 替換後對數值的影響。

```typescript
let bestIncrease = 0;  // 最大增益（數字替換成9）
let bestDecrease = 0;  // 最大損失（數字替換成0或1）

for (let digit = 0; digit < 10; digit++) {
  const sumOfPlaces = digitPlaceValueSums[digit]; // 取得當前數字所有位值的總和

  // 若此數字未出現，則略過
  if (sumOfPlaces === 0) {
    continue;
  }

  // 計算替換成「9」後的數值增益
  const increaseDelta = (9 - digit) * sumOfPlaces;
  if (increaseDelta > bestIncrease) {
    bestIncrease = increaseDelta;
  }

  // 計算替換成「0」或「1」後的數值損失
  let replacement = 0;                 // 預設替換為「0」
  if (digit === mostSignificantDigit) {
    replacement = 1;                   // 若為最高位，則替換為「1」
    if (replacement === digit) {       // 若最高位已是「1」，無法進一步減小，跳過
      continue;
    }
  }

  const decreaseDelta = (replacement - digit) * sumOfPlaces;
  if (decreaseDelta < bestDecrease) {
    bestDecrease = decreaseDelta;
  }
}
```

### Step 3：計算並回傳最大差值

最大差值即為最大增益減去最大損失：

```typescript
return bestIncrease - bestDecrease;
```

## 時間複雜度

- 只需掃描數字的每一位數，共最多 10 個位數，因此時間複雜度為 $O(\log_{10}(num))$。
- 內部計算每個數字 (0\~9) 的影響共花費固定時間，因此不影響整體複雜度。
- 總時間複雜度為 $O(\log_{10}(num))$。

> $O(\log_{10}(num))$

## 空間複雜度

- 使用固定大小的數組（長度為 10 的 `Uint32Array`），額外只使用少量變數，空間複雜度為常數級 $O(1)$。
- 空間複雜度為常數級 $O(1)$。
- 總空間複雜度為 $O(1)$。

> $O(1)$
