# 2749. Minimum Operations to Make the Integer Zero

You are given two integers `num1` and `num2`.

In one operation, you can choose integer `i` in the range `[0, 60]` and subtract `2^i + num2` from `num1`.

Return the integer denoting the minimum number of operations needed to make `num1` equal to `0`.

If it is impossible to make `num1` equal to `0`, return `-1`.

**Constraints:**

- `1 <= num1 <= 10^9`
- `-10^9 <= num2 <= 10^9`

## 基礎思路

題目給定一種操作形式：每次從 `num1` 減去 $(2^i + \text{num2})$，其中 $i \in \[0, 60]$。我們的目標是在若干次操作後讓 `num1` 變為 `0`，並找出所需的最小操作次數。

將操作後的目標形式化為：

$$
\text{num1} = \sum_{j=1}^{k} (2^{i_j} + \text{num2}) = \left( \sum 2^{i_j} \right) + k \cdot \text{num2}
\Rightarrow
\text{num1} - k \cdot \text{num2} = x
$$

其中 $x$ 必須是 $k$ 個 $2^i$ 相加而得的值。

這導出兩個必要條件：

1. $x = \text{num1} - k \cdot \text{num2}$ 必須 $\geq k$，因為每個 $2^i \geq 1$。
2. $x$ 的二進位中 1 的個數 $\leq k$，才能用 $k$ 個二的冪表示。

因此，我們可以從 $k = 1$ 到 $60$ 枚舉，檢查這兩個條件是否同時滿足，並回傳最小可行的 $k$。若無任何合法解，回傳 `-1`。

## 解題步驟

### Step 1: 特判 num1 是否為 0

這是最直接的情況，如果初始值已為 0，則無需任何操作即可達成目標。

- 檢查 `num1 === 0`
- 若為真，回傳 0 結束流程

```typescript
if (num1 === 0) {
  // 若 num1 已經是 0，則不需要任何操作
  return 0;
}
```

### Step 2: 建立 2^32 常數與位元輔助函式

為了後續有效處理大整數的位元操作，建立：

- `TWO32`：用來分離高 32 位元
- `INV_TWO32`：其倒數，用於浮點除法分解
- `popcount32`：計算 32 位整數中 1 的個數（採無分支實作）
- `popcount64`：拆為高低 32 位元後分別處理，並合併結果

```typescript
const TWO32 = 4294967296; // 2^32
const INV_TWO32 = 1 / TWO32;

/**
 * 計算 32 位元無號整數中 1 的個數
 *
 * 採用無分支位元操作以提高效率
 *
 * @param {number} value - 32 位整數（內部強制轉為無號）
 * @returns {number} 傳回 value 中的位元 1 的數量
 */
function popcount32(value: number): number {
  value = value >>> 0;
  value = value - ((value >>> 1) & 0x55555555);
  value = (value & 0x33333333) + ((value >>> 2) & 0x33333333);
  value = (value + (value >>> 4)) & 0x0F0F0F0F;
  value = value + (value >>> 8);
  value = value + (value >>> 16);
  return value & 0x3F;
}

/**
 * 計算非負整數中位元 1 的個數（JavaScript 安全整數範圍內）
 *
 * 將整數拆為高、低 32 位後分別套用 popcount32 計算
 *
 * @param {number} x - 非負整數（約最大至 2^36）
 * @returns {number} 傳回 x 中的位元 1 的數量
 */
function popcount64(x: number): number {
  const high = (x * INV_TWO32) >>> 0;   // 高 32 位
  const low = (x - high * TWO32) >>> 0; // 低 32 位
  return popcount32(high) + popcount32(low);
}
```

### Step 3: 枚舉操作次數並驗證是否可成功轉為 0

此段為演算法的主體，從 1 到 60 次操作嘗試：

- 初始化 `currentX = num1 - num2`，表示執行 1 次操作後的剩餘值
- 每一輪：
    - 檢查剩餘值是否大於等於操作次數（每次至少要湊出一個 \$2^i\$）
    - 檢查 `currentX` 中位元 1 的個數是否小於等於操作次數（表示夠湊）
    - 若皆成立，回傳該操作次數
- 若 `num2 > 0` 且剩餘值已小於操作次數，代表不可能成功，提早回傳 `-1`
- 否則持續遞減 `currentX`

```typescript
// 第一次操作後的初始剩餘值
let currentX = num1 - num2;

for (let operationCount = 1; operationCount <= 60; operationCount++) {
  // 剩餘值必須至少大於等於目前操作次數
  if (currentX >= operationCount) {
    const bits = popcount64(currentX);
    if (bits <= operationCount) {
      return operationCount;
    }
  } else {
    // 若 num2 為正數，每次操作會讓剩餘值持續變小
    // 一旦小於目前次數，就不可能再成功
    if (num2 > 0) {
      return -1;
    }
  }

  // 準備下一輪剩餘值
  currentX -= num2;
}
```

### Step 4: 所有情況皆不成立則回傳 -1

若全部 60 種可能都不符合條件，代表無法將 `num1` 消為 0，回傳 -1。

```typescript
return -1;
```

## 時間複雜度

- 外部迴圈最多執行 60 次，為固定次數。
- 每次迴圈中，進行的是常數次數的加減與位元運算（`popcount64` 內部計算為固定步驟的位元操作）。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 僅使用固定數量的輔助變數（如 `currentX`, `operationCount`）與函式（`popcount32`, `popcount64`），不依賴輸入大小。
- 未建立任何與 `num1` 或 `num2` 成比例的資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
