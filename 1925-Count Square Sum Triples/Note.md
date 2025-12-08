# 1925. Count Square Sum Triples

A square triple `(a,b,c)` is a triple where `a`, `b`, and `c` are integers and `a^2 + b^2 = c^2`.

Given an integer `n`, return the number of square triples such that `1 <= a, b, c <= n`.

**Constraints:**

- `1 <= n <= 250`

## 基礎思路

本題要求計算所有整數三元組 `(a, b, c)`，滿足 `a^2 + b^2 = c^2`，且 `1 <= a, b, c <= n`。由於 `(a, b, c)` 與 `(b, a, c)` 被視為
**不同的有序三元組**，每找到一組邊長實際上會貢獻兩個答案。

若直接暴力掃描所有 `(a, b)` 配對，時間複雜度約為 $O(n^2)$，但仍需檢查是否存在整數 `c`
滿足等式，實作上不夠精準高效。利用畢氏三元組的數論結構可以更有系統地枚舉所有候選：

* **Euclid 公式生成 primitive triple**：
  對於整數 `m > n > 0`，若：

    * `m` 與 `n` 互質；
    * `m` 與 `n` 一奇一偶；
      則可產生一組 primitive triple：

      $$
      a = m^2 - n^2,\quad b = 2mn,\quad c = m^2 + n^2
      $$

      且必定滿足 `a^2 + b^2 = c^2`。

* **透過整數倍數取得所有 triple**：
  對任意整數倍數 `k >= 1`，
  `(ka, kb, kc)` 仍為合法的畢氏三元組。
  只要 `ka, kb, kc` 仍在 `[1, n]` 範圍內，即為本題中的有效三元組。

* **邊長上界帶來剪枝條件**：
  因為 `c = m^2 + n^2 <= n` 必須成立，`m` 不會無限制增大；
  內層參數 `n` 對每個 `m` 也會受到 `c <= n` 的約束，超出即可及早停止。

* **有序三元組計數方式**：
  對每一個合法的 `(a, b, c)`，題目要求 `(a, b, c)` 與 `(b, a, c)` 都要計入，
  因此每次找到一組邊長，就將計數加 2。

整體策略為：

1. 以 Euclid 公式的參數 `(m, n)` 生成所有 primitive triples，並利用互質與奇偶性條件過濾。
2. 對每組 primitive triple，將其以倍數放大，直到任一邊長超出 `n` 為止。
3. 對每組合法 triple 計入兩個有序三元組。
4. 全程維持計數器，最後回傳答案。

## 解題步驟

### Step 1：定義全域最大限制常數

使用全域常數來表示支援的最大 `n`，後續主函數會依此做邊界檢查。

```typescript
const MAX_LIMIT = 250;
```

### Step 2：輔助函式 — 計算兩數的最大公因數

這個輔助函式以迭代式歐幾里得算法計算兩個正整數的最大公因數，用於 Euclid 公式生成 primitive triple 時，檢查參數是否互質。

```typescript
function greatestCommonDivisor(firstValue: number, secondValue: number): number {
  // 迭代直到餘數變為 0
  while (secondValue !== 0) {
    const remainder = firstValue % secondValue;
    firstValue = secondValue;
    secondValue = remainder;
  }

  return firstValue;
}
```

### Step 3：檢查輸入是否超出支援限制

主函數一開始先確認輸入 `n` 是否大於預設的最大上限，若超出則直接拋出錯誤，避免不預期的使用情境。

```typescript
// 針對超出支援限制的輸入進行防護檢查
if (n > MAX_LIMIT) {
  throw new Error("Input n exceeds supported limit.");
}
```

### Step 4：初始化計數器與 Euclid 外層參數迴圈骨架

初始化三元組計數器，並進入 Euclid 公式外層參數（m）。
利用最小可能 `c = m^2 + 1` 做剪枝，超出範圍即停止外層迴圈。

```typescript
let tripleCount = 0;

// 在 Euclid 公式中對外層參數 (常記為 m) 進行迭代
for (let euclidOuter = 2; ; euclidOuter++) {
  const outerSquare = euclidOuter * euclidOuter;

  // 當 inner = 1 且縮放倍數為 1 時，最小可能的 c 為 outerSquare + 1
  // 若此值已大於 n，則更大的 euclidOuter 也無法產生合法三元組
  if (outerSquare + 1 > n) {
    break;
  }

  // ...
}
```

### Step 5：過濾 Euclid 內層參數，僅保留可生成 primitive triple 的組合

對於每個內層參數 `euclidInner`，
必須符合 **奇偶性不同**且 **互質**，
才能保證生成 primitive triple。

```typescript
// 在 Euclid 公式中對外層參數 (常記為 m) 進行迭代
for (let euclidOuter = 2; ; euclidOuter++) {
  // Step 4：初始化計數器與 Euclid 外層參數迴圈骨架

  // 內層參數 (常記為 n) 的迭代
  for (let euclidInner = 1; euclidInner < euclidOuter; euclidInner++) {
    // Euclid 公式要求 euclidOuter 與 euclidInner 需一奇一偶
    if (((euclidOuter - euclidInner) & 1) === 0) {
      continue;
    }

    // 若兩者不是互質，則不會得到 primitive triple，直接略過
    if (greatestCommonDivisor(euclidOuter, euclidInner) !== 1) {
      continue;
    }

    // ...
  }
}
```

### Step 6：由 Euclid 公式計算 primitive triple，並剪枝不合法的 c

透過 Euclid 公式計算 primitive triple 的三邊 `(a, b, c)`，
若 `c` 已大於 `n`，後續更大的內層參數也不可能產生合法結果，因此立即停止內層迴圈。

```typescript
// 在 Euclid 公式中對外層參數 (常記為 m) 進行迭代
for (let euclidOuter = 2; ; euclidOuter++) {
  // Step 4：初始化計數器與 Euclid 外層參數迴圈骨架

  // 內層參數 (常記為 n) 的迭代
  for (let euclidInner = 1; euclidInner < euclidOuter; euclidInner++) {
    // Step 5：過濾 Euclid 內層參數

    const innerSquare = euclidInner * euclidInner;
    const baseSideC = outerSquare + innerSquare;

    // 若 primitive triple 的 c 已超出 n，則更大的 euclidInner 也必定超出範圍
    if (baseSideC > n) {
      break;
    }

    // 使用 Euclid 公式計算 primitive triple 的邊長
    const baseSideA = outerSquare - innerSquare;
    const baseSideB = 2 * euclidOuter * euclidInner;

    // ...
  }
}
```

### Step 7：縮放 primitive triple，並累計所有合法有序三元組

將 primitive triple 依倍數 `k = 1, 2, 3, ...` 進行縮放。
每次縮放只要三邊仍在 `[1, n]` 內，即為合法三元組。
此外，由於 `(a, b, c)` 與 `(b, a, c)` 都要計入，
因此每組縮放 triple 貢獻 **2 個有序三元組**。

```typescript
// 在 Euclid 公式中對外層參數 (常記為 m) 進行迭代
for (let euclidOuter = 2; ; euclidOuter++) {
  // Step 4：初始化計數器與 Euclid 外層參數迴圈骨架

  // 內層參數 (常記為 n) 的迭代
  for (let euclidInner = 1; euclidInner < euclidOuter; euclidInner++) {
    // Step 5：過濾 Euclid 內層參數
    
    // Step 6：計算 primitive triple 並剪枝不合法的 c

    // 將 primitive triple 以倍數 k = 1, 2, 3, ... 進行縮放
    let scaledSideA = baseSideA;
    let scaledSideB = baseSideB;
    let scaledSideC = baseSideC;

    // 僅保留所有邊長皆落在 [1, n] 範圍內的縮放三元組
    while (scaledSideC <= n && scaledSideA <= n && scaledSideB <= n) {
      // (a, b, c) 與 (b, a, c) 為不同有序三元組，因此一次計入兩個
      tripleCount += 2;

      // 縮放至下一倍 triple
      scaledSideA += baseSideA;
      scaledSideB += baseSideB;
      scaledSideC += baseSideC;
    }
  }
}
```

### Step 8：回傳累計的有序畢氏三元組數量

所有 Euclid 參數組合與縮放皆處理完後，回傳最終的有序三元組數量。

```typescript
return tripleCount;
```

## 時間複雜度

- 外層參數 `euclidOuter` 的最大值受限於 `euclidOuter^2 + 1 <= n`，因此外層迴圈次數為 $O(\sqrt{n})$。
- 對每個 `euclidOuter`，`euclidInner` 在 `1` 到 `euclidOuter - 1` 間遞增，總共約有 $O(n)$ 組 `(euclidOuter, euclidInner)`
  被檢查。
- 每組 `(euclidOuter, euclidInner)`：
    - 呼叫一次最大公因數函式，時間為 $O(\log n)$；
    - 若形成合法 primitive triple，之後的縮放迴圈最多進行 $O(n)$ 次（因為 `k * baseSideC <= n`）。
- 在最壞情況下，可保守估計所有縮放過程的總步數上界為 $O(n^2)$，而最大公因數的總成本被此主項支配。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 僅使用常數數量的標量變數（計數器、迴圈參數與暫存邊長）。
- 未配置任何與 `n` 相關的額外陣列或集合。
- 總空間複雜度為 $O(1)$。

> $O(1)$
