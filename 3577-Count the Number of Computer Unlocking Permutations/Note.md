# 3577. Count the Number of Computer Unlocking Permutations

You are given an array complexity of length `n`.

There are `n` locked computers in a room with labels from 0 to `n - 1`, each with its own unique password. 
The password of the computer `i` has a complexity `complexity[i]`.

The password for the computer labeled 0 is already decrypted and serves as the root. 
All other computers must be unlocked using it or another previously unlocked computer, following this information:

- You can decrypt the password for the computer `i` using the password for computer `j`, where `j` is any integer less than `i` with a lower complexity. 
  (i.e. `j < i` and `complexity[j] < complexity[i]`)
- To decrypt the password for computer `i`, you must have already unlocked a computer `j` such that `j < i` and `complexity[j] < complexity[i]`.

Find the number of permutations of `[0, 1, 2, ..., (n - 1)]` that represent a valid order in which the computers can be unlocked, starting from computer 0 as the only initially unlocked one.

Since the answer may be large, return it modulo `10^9 + 7`.

Note that the password for the computer with label 0 is decrypted, and not the computer with the first position in the permutation.

**Constraints:**

- `2 <= complexity.length <= 10^5`
- `1 <= complexity[i] <= 10^9`

## 基礎思路

題目要我們計算：有多少種排列方式可以依序解鎖電腦，前提是：

* 電腦標號為 `0` 的密碼一開始就已解出，視為「已解鎖」。
* 要解鎖電腦 `i`，必須先解鎖某台電腦 `j`，且滿足：

    * `j < i`
    * `complexity[j] < complexity[i]`

也就是說，解鎖能力只能沿著「**索引往右**」傳遞，且要從「**較低複雜度** → 較高複雜度」。

關鍵觀察如下：

1. **電腦 0 必須是唯一的全域嚴格最小複雜度**
   若存在某台電腦 `k > 0` 滿足 `complexity[k] <= complexity[0]`：

    * 如果 `complexity[k] < complexity[0]`，那 `k` 應該是全域最小，但因為 `k > 0`，前面沒有複雜度更小且索引更小的電腦可以解鎖它，永遠無法被解鎖。
    * 如果 `complexity[k] === complexity[0]`，則也不可能找到 `j < k` 且 `complexity[j] < complexity[k]`，一樣無法解鎖。
      → 只要有這種情況發生，**任何排列都不合法**，答案為 `0`。

2. **若電腦 0 是唯一的全域嚴格最小複雜度**

    * 對所有 `i > 0`，皆有 `complexity[0] < complexity[i]`。
    * 且 `0 < i`，因此電腦 0 在索引與複雜度上都符合解鎖條件：

      > 可以使用電腦 0 來解鎖任何其他電腦。
    * 因此，不管其他電腦 `1..n-1` 的解鎖順序如何，只要最終都解鎖即可，**它們任何排列都合法**，因為總是可以把「用誰解鎖誰」對應到「用 0 或之前已解鎖的更小複雜度電腦」上。

3. **排列數量的計算**

    * 電腦 0 的位置在排列中可以是任意位置嗎？注意：規則只要求「解鎖順序」是排列 `[0..n-1]`，且一開始只有電腦 0 是已解鎖的。
    * 無論 0 在排列中的哪個位置，我們都可以解釋為「實際開始解鎖前，0 已被視為解鎖」，之後照排列順序進行，其餘電腦皆可由 0 作為來源。
    * 因此，**剩餘 `n-1` 台電腦可以任意排列**，總數為 `(n - 1)!`。

結論：

* 若 `complexity[0]` 不是唯一全域嚴格最小 → 回傳 `0`。
* 否則答案為 `(n - 1)!`，再對 `10^9 + 7` 取模即可。
  由於 `n` 最大為 `10^5`，可預先將 `0!` 到 `100000!` 的結果表格化，之後查表即為 $O(1)$。

## 解題步驟

### Step 1：宣告模數、最大長度與階乘表

先宣告模數 `MODULO`、根據題目限制設定最大長度，並建立儲存階乘值的陣列。

```typescript
const MODULO = 1_000_000_007;

// 基於限制：2 <= complexity.length <= 1e5
const MAXIMUM_LENGTH = 100_000;

// 預先計算 0...(MAXIMUM_LENGTH-1) 的階乘模 MODULO。
// factorialValues[k] = k! % MODULO
const factorialValues = new Uint32Array(MAXIMUM_LENGTH);
```

### Step 2：使用立即執行函式初始化階乘表

透過 IIFE（立即呼叫函式表達式），在載入時就將 `0!` 到 `(MAXIMUM_LENGTH - 1)!` 全部預計算完成。

```typescript
// 立即執行的初始化函式，用來一次填滿階乘表
(function initializeFactorials(): void {
  // 0! = 1
  factorialValues[0] = 1;

  for (let index = 1; index < MAXIMUM_LENGTH; index++) {
    // 使用 number 運算後再指定回 typed array
    const previousFactorial = factorialValues[index - 1];
    factorialValues[index] = (previousFactorial * index) % MODULO;
  }
})();
```

### Step 3：讀取輸入長度與根電腦複雜度，並設定檢查旗標

接著進入主邏輯， 先取得陣列長度與電腦 0 的複雜度，並用布林值記錄「電腦 0 是否為全域嚴格最小」。

```typescript
const complexityLength = complexity.length;
const rootComplexity = complexity[0];

// 檢查電腦 0 是否為唯一的全域最小複雜度
let isRootStrictMinimum = true;
```

### Step 4：掃描其餘電腦，確認 0 是否為唯一嚴格最小

遍歷索引 `1..n-1` 的所有電腦，只要找到某個 `complexity[index] <= rootComplexity`，
就代表存在與根同複雜度或更小的電腦，導致該電腦無法被解鎖，直接判定為「不可能」。

```typescript
for (let index = 1; index < complexityLength; index++) {
  if (rootComplexity >= complexity[index]) {
    // 若有任何電腦複雜度 <= 根電腦，則某個最小複雜度電腦無法被解鎖
    isRootStrictMinimum = false;
    break;
  }
}

if (!isRootStrictMinimum) {
  return 0;
}
```

### Step 5：計算 (n - 1)! 的索引並檢查是否在預先計算範圍內

若電腦 0 通過檢查，答案為 `(n - 1)!`。
先算出對應的階乘索引 `factorialIndex = complexityLength - 1`，並確認是否落在預建表範圍內。

```typescript
// 需要計算 (n - 1)! 的模值
const factorialIndex = complexityLength - 1;

// 安全防護：若有人傳入超過預設 MAXIMUM_LENGTH 的長度
if (factorialIndex < 0 || factorialIndex >= MAXIMUM_LENGTH) {
  // 退而求其次：現場計算階乘（對單次呼叫仍足夠快速）
  let factorialValue = 1;

  for (let value = 2; value <= factorialIndex; value++) {
    factorialValue = (factorialValue * value) % MODULO;
  }

  return factorialValue;
}
```

### Step 6：直接回傳預先計算好的階乘值

若 `factorialIndex` 在可接受範圍內，直接從 `factorialValues` 查表即可，
以 $O(1)$ 時間得到 `(n - 1)! % MODULO`。

```typescript
return factorialValues[factorialIndex];
```

## 時間複雜度

- 初始化階乘表（IIFE）為一次性預處理，花費 $O(N_{\max})$，其中 $N_{\max} = 10^5$，可視為固定成本。
- 主邏輯中：
    - 透過單一 `for` 迴圈掃描 `complexity` 檢查根是否為嚴格最小，花費 $O(n)$。
    - 查詢預先計算的階乘值為 $O(1)$。
    - 若發生 fallback 現場計算階乘，額外花費 $O(n)$，但仍為線性。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 階乘表 `factorialValues` 需要 $O(N_{\max})$ 額外空間，與輸入長度上界同階。
- 其他變數（`rootComplexity`、旗標、索引等）皆為常數空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
