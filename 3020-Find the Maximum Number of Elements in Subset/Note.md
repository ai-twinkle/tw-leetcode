# 3020. Find the Maximum Number of Elements in Subset

You are given an array of positive integers `nums`.

You need to select a subset of `nums` which satisfies the following condition:

 - You can place the selected elements in a 0-indexed array such that it follows the pattern: 
   `[x, x^2, x^4, ..., x^(k/2), x^k, x^(k/2), ..., x^4, x^2, x]` 
   (Note that `k` can be any non-negative power of `2`). 
   For example, `[2, 4, 16, 4, 2]` and `[3, 9, 3]` follow the pattern while `[2, 4, 8, 4, 2]` does not.

Return the maximum number of elements in a subset that satisfies these conditions.

**Constraints:**

- `2 <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^9`

## 基礎思路

本題要求從陣列中選出最多元素，使其能排列成回文冪次鏈的形式：`[x, x², x⁴, …, x^k, …, x⁴, x², x]`。這個結構本質上是一條以平方遞增的鏈，且整體具有回文對稱性。

在思考解法時，可掌握以下核心觀察：

- **鏈結構為平方遞增**：
  從某個基底值 `x` 出發，鏈中每一層都是前一層的平方，因此鏈的延伸方向為 `x → x² → x⁴ → …`，與一般的等比或等差鏈不同。

- **回文結構要求成對出現**：
  除了鏈的頂端可作為單一中心外，其餘每一層的值都必須出現至少兩次，才能在回文的兩側各貢獻一個元素。

- **1 是特殊情形**：
  `1` 的任何次方仍為 `1`，因此 `1` 組成的鏈是常數序列。其合法長度取決於出現次數的奇偶性——奇數個可直接使用，偶數個需減去一個以保留有效中心。

- **避免重複計算**：
  若某個值 `x` 本身是另一個更長鏈中間某層的值，則從 `x` 出發計算的鏈必定是那條更長鏈的子集，應予以跳過，只從鏈的真正根部開始展開。

- **上界限制防止溢位**：
  值域上限為 `10⁹`，平方後可能超出合法範圍，需在展開下一層前提前判斷是否越界。

依據以上特性，可以採用以下策略：

- **先統計每個值的出現頻率**，作為後續查詢的基礎。
- **單獨處理值為 1 的情形**，依奇偶決定可取的最大長度。
- **對每個可能的鏈根，逐層展開並累計成對長度**，同時在無法繼續配對時停止並視情況補上中心。
- **跳過非鏈根的起始點**，避免對同一條鏈重複計算。

此策略確保每條鏈只從根部展開一次，整體效率高且邏輯清晰。

## 解題步驟

### Step 1：統計每個數值的出現頻率

使用 `Map` 記錄陣列中每個值出現的次數，作為後續查詢配對數量的依據。

```typescript
// 使用 Map 統計每個值的出現次數（值域最大至 1e9，分布稀疏）
const frequency = new Map<number, number>();
for (let index = 0; index < nums.length; index++) {
  const value = nums[index];
  frequency.set(value, (frequency.get(value) ?? 0) + 1);
}
```

### Step 2：初始化答案並特別處理值為 1 的情形

先初始化最佳長度為 0。由於 `1` 的任意次方仍為 `1`，其鏈為常數序列，合法長度需根據奇偶性調整：若出現次數為奇數則直接使用，若為偶數則需減一，以確保回文中心唯一。

```typescript
let bestLength = 0;

// 值 1 是特殊情形：鏈為常數，合法長度取決於奇偶性。
const onesCount = frequency.get(1) ?? 0;
if (onesCount > 0) {
  // 保留奇數個，確保回文具有合法的單一中心
  bestLength = onesCount % 2 === 1 ? onesCount : onesCount - 1;
}
```

### Step 3：略過值 1 與非鏈根的起始點

遍歷所有出現過的基底值，跳過已處理的 `1`；若某個值的出現次數少於 2，該值最多只能作為單一中心（長度 1），直接更新答案後跳過；若該值的平方根是整數且其頻率不低於 2，則代表存在更長的鏈涵蓋當前值，應跳過以避免重複計算。

```typescript
// 對每個基底 x > 1，展開鏈 x, x², x⁴, ... 並計算成對數量。
for (const [base, count] of frequency) {
  // 跳過 1（已單獨處理）與任何平方根存在且頻率 >= 2 的值（避免重複計算）
  if (base === 1) {
    continue;
  }
  if (count < 2) {
    // 長度為 1 的鏈（以單一元素作為中心）始終可達成
    if (bestLength < 1) {
      bestLength = 1;
    }
    continue;
  }

  // 只從真正的鏈根出發：若 sqrt(base) 是整數且頻率 >= 2，則存在更長的鏈涵蓋此值，略過
  const squareRoot = Math.round(Math.sqrt(base));
  if (squareRoot * squareRoot === base && (frequency.get(squareRoot) ?? 0) >= 2) {
    continue;
  }

  // ...
}
```

### Step 4：從鏈根出發逐層展開並計算鏈長

從當前基底開始，持續向下一層（平方）延伸。每當目前值出現次數不低於 2，代表可在回文兩側各放一個，鏈長加 2，並繼續展開；若出現次數恰為 1，則作為回文中心加 1 後停止；若出現次數為 0，則無中心可用，移除最後一對並停止。此外，在展開前需先判斷平方後是否超出值域上限，超出則視當前對為頂端，補上中心後停止。

```typescript
for (const [base, count] of frequency) {
  // Step 3：略過 1 與非鏈根

  let chainLength = 0;
  let current = base;

  // 頻率 >= 2 的值貢獻一對對稱元素（加 2）
  while (true) {
    const currentCount = frequency.get(current) ?? 0;
    if (currentCount >= 2) {
      chainLength += 2;
      // 平方前先防止超出值域範圍
      const next = current * current;
      if (next > 1_000_000_000) {
        // 平方後的值不可能出現，此對為頂端，補上中心
        chainLength -= 1;
        break;
      }
      current = next;
    } else if (currentCount === 1) {
      // 單一元素作為回文中心後停止
      chainLength += 1;
      break;
    } else {
      // 無中心可用，移除最後一個未配對的位置
      chainLength -= 1;
      break;
    }
  }

  if (chainLength > bestLength) {
    bestLength = chainLength;
  }
}
```

### Step 5：回傳所有鏈中的最大長度

所有基底都展開完畢後，`bestLength` 即為能選出的最多元素數量，直接回傳。

```typescript
return bestLength;
```

## 時間複雜度

- 統計頻率需遍歷整個陣列，耗時 $O(n)$；
- 對每個不重複值展開鏈，鏈的層數最多為 $O(\log \log V)$（其中 $V = 10^9$），每層為常數操作；
- 不重複值的數量最多為 $O(n)$；
- 總時間複雜度為 $O(n \log \log V)$。

> $O(n \log \log V)$

## 空間複雜度

- 使用 `Map` 儲存最多 $O(n)$ 個不重複值的頻率；
- 其餘皆為常數個輔助變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
