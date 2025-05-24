# 2843. Count Symmetric Integers

You are given two positive integers `low` and `high`.

An integer `x` consisting of `2 * n` digits is symmetric 
if the sum of the first `n` digits of `x` is equal to the sum of the last `n` digits of `x`. 
Numbers with an odd number of digits are never symmetric.

Return the number of symmetric integers in the range `[low, high]`.

**Constraints:**

- `1 <= low <= high <= 10^4`

## 基礎思路

本題要求計算範圍 `[low, high]` 中「對稱整數」的數量。根據題意：

- 一個整數若具有偶數個位數（如 2 位或 4 位），且前半數位的數字總和等於後半數位的數字總和，即為對稱整數。
- 奇數位數的數字不可能是對稱整數。

由於本題輸入範圍固定在 $1 \sim 10000$，且符合條件的整數僅限於 2 位數與 4 位數，因此我們可透過 **前綴和（prefix sum）** 事先預計算並存儲從 1 到每個數字為止的對稱整數數量。
如此一來，查詢任意區間內對稱整數數量的操作便能在 $O(1)$ 時間內完成。

## 解題步驟

### Step 1：初始化前綴和陣列

我們建立一個長度為 `10001` 的陣列 `prefixSymmetricCount`，用來紀錄從 1 到 10000 各個數字為止的累計對稱整數數量。  
由於題目範圍固定，此處選用 `Uint16Array` 節省空間。

```typescript
const prefixSymmetricCount = new Uint16Array(10001);
```

### Step 2：計算範圍 `[1, 999]` 中的對稱整數

在此範圍內僅有 2 位數（11 到 99）可能對稱：

- 對稱條件：
   - 2 位數中只有兩個位數相同時才會對稱，因此可用整除 11 判斷。
- 前綴和更新：
   - 對稱數則前一累計數量加 1，否則繼承前一累計數量。

```typescript
for (let number = 1; number < 1000; number++) {
  if (number >= 11 && number < 100) {
    prefixSymmetricCount[number] = prefixSymmetricCount[number - 1] + (number % 11 === 0 ? 1 : 0);
  } else {
    prefixSymmetricCount[number] = prefixSymmetricCount[number - 1];
  }
}
```

### Step 3：計算範圍 `[1000, 9999]` 中的對稱整數

針對 4 位數 ABCD，對稱的充要條件為：

$$
A + B = C + D
$$

- 首先透過除法與取模運算分離出四位數的各個位數：
   - 個位：`digitOnes = number % 10`
   - 十位：`digitTens = Math.floor((number % 100) / 10)`
   - 百位：`digitHundreds = Math.floor((number % 1000) / 100)`
   - 千位：`digitThousands = Math.floor(number / 1000)`
- 然後，判斷 `(digitOnes + digitTens)` 是否等於 `(digitHundreds + digitThousands)`，符合即為對稱整數。
- 更新前綴和陣列。

```typescript
for (let number = 1000; number < 10000; number++) {
  const digitOnes = number % 10;
  const digitTens = ((number % 100) / 10) | 0;
  const digitHundreds = ((number % 1000) / 100) | 0;
  const digitThousands = (number / 1000) | 0;
  prefixSymmetricCount[number] = prefixSymmetricCount[number - 1] +
    ((digitOnes + digitTens === digitHundreds + digitThousands) ? 1 : 0);
}
```

### Step 4：處理數字 `10000`

數字 `10000` 有 5 位數，依題意不可能對稱，因此直接沿用前一個數字的結果即可：

```typescript
prefixSymmetricCount[10000] = prefixSymmetricCount[9999];
```

### Step 5：使用前綴和陣列快速查詢

完成預計算後，`prefixSymmetricCount[i]` 即儲存從 1 到數字 `i` 的對稱整數總數。因此對於任意查詢區間 `[low, high]`，我們僅需取其差即可：

```typescript
function countSymmetricIntegers(low: number, high: number): number {
  return prefixSymmetricCount[high] - prefixSymmetricCount[low - 1];
}
```

## 時間複雜度

- **前綴和預計算**：處理固定範圍 `[1, 10000]` 的整數，迴圈次數固定，因此預計算為常數時間 $O(1)$。
- **查詢區間**： 直接透過陣列相減，僅需 $O(1)$。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 僅需一個固定大小（長度為 10001）的前綴和陣列儲存計算結果，陣列大小固定 $O(1)$。
- 總空間複雜度為  $O(1)$。

> $O(1)$
