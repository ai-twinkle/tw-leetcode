# 762. Prime Number of Set Bits in Binary Representation

Given two integers `left` and `right`, 
return the count of numbers in the inclusive range `[left, right]` having a prime number of set bits in their binary representation.

Recall that the number of set bits an integer has is the number of `1`'s present when written in binary.

For example, `21` written in binary is `10101`, which has `3` set bits.

**Constraints:**

- `1 <= left <= right <= 10^6`
- `0 <= right - left <= 10^4`

## 基礎思路

本題要求統計區間內每個整數的二進位表示中，`1` 的個數是否為質數，並回傳符合條件的數量。由於數值上限為 $10^6$，每個數的二進位長度有限，因此可對區間逐一檢查並以高效率方式完成計數。

在思考解法時，可掌握以下核心觀察：

* **質數判斷的輸入範圍很小**：
  在 $10^6$ 以內的整數，其二進位 `1` 的個數最多只會落在一個很小的範圍，因此可預先把「哪些位數是質數」編碼成常數查表結構。

* **計算 `1` 的個數可用位元技巧加速**：
  反覆消去最低位的 `1`，每次消去一次就代表少了一個 `1`，可在與 `1` 的數量成正比的次數內完成計數。

* **整體流程可抽象為逐值掃描 + 常數時間判斷**：
  對區間內每個數字先取得其 `1` 的個數，再用預先編碼的集合進行 $O(1)$ 質數判斷，累加結果即可。

依據以上特性，可以採用以下策略：

* **逐一掃描整個區間**，對每個數計算其二進位 `1` 的個數。
* **使用消去最低位 `1` 的方式取得 `1` 的總數**，避免逐位檢查所有 bit。
* **用位元遮罩一次性表示所有合法的質數計數值**，將「是否為質數」轉成 $O(1)$ 的位元查詢。

此策略能在可控的掃描範圍內，以極低常數成本完成判斷與統計。

## 解題步驟

### Step 1：建立質數 bit count 的位元遮罩

將所有可能出現的質數 `1` 個數預先標記到位元遮罩中，讓後續判斷只需位移取位即可完成。

```typescript
const PRIME_BITCOUNT_MASK =
  (1 << 2) | (1 << 3) | (1 << 5) | (1 << 7) |
  (1 << 11) | (1 << 13) | (1 << 17) | (1 << 19);
```

### Step 2：初始化答案計數器

準備累加器，用於統計符合條件的整數數量。

```typescript
let count = 0;
```

### Step 3：枚舉區間並初始化當前數值狀態

逐一走訪區間內的整數，並為當前整數建立位元計數的工作變數與計數器。

```typescript
for (let value = left; value <= right; value++) {
  let x = value;
  let bitCount = 0;

  while (x !== 0) {
    // ...
  }

  // ...
}
```

### Step 4：使用位元消除法計算 `1` 的個數

反覆消除最低位的 `1`，每消除一次即代表找到一個 `1`，直到數值歸零為止。

```typescript
for (let value = left; value <= right; value++) {
  // Step 3：枚舉區間並初始化當前數值狀態

  while (x !== 0) {
    x &= x - 1;
    bitCount++;
  }

  // ...
}
```

### Step 5：以位元遮罩在 $O(1)$ 內判斷是否為質數並累加答案

將 `1` 的個數映射到位元遮罩對應位置，若該位為 1，表示其為質數，則累加答案。

```typescript
for (let value = left; value <= right; value++) {
  // Step 3：枚舉區間並初始化當前數值狀態

  // Step 4：使用位元消除法計算 1 的個數

  // 使用位元遮罩在 O(1) 內進行質數判斷。
  if (((PRIME_BITCOUNT_MASK >>> bitCount) & 1) !== 0) {
    count++;
  }
}
```

### Step 6：回傳最終統計結果

區間掃描完成後，回傳累加得到的結果。

```typescript
return count;
```

## 時間複雜度

- 設區間長度為 $n = right - left + 1$，需逐一檢查每個數一次；
- 每個數的位元計數次數等於其 `1` 的個數，且在本題範圍內至多約 20 次，因此每次迭代為常數上界；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的工作變數與常數遮罩；
- 不隨輸入區間大小成長。
- 總空間複雜度為 $O(1)$。

> $O(1)$
