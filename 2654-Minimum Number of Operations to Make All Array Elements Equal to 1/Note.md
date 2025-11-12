# 2654. Minimum Number of Operations to Make All Array Elements Equal to 1

You are given a 0-indexed array `nums` consisiting of positive integers. 
You can do the following operation on the array any number of times:

Select an index `i` such that `0 <= i < n - 1` and replace either of `nums[i]` or `nums[i+1]` with their gcd value.
Return the minimum number of operations to make all elements of `nums` equal to `1`. 
If it is impossible, return `-1`.

The gcd of two integers is the greatest common divisor of the two integers.

**Constraints:**

- `2 <= nums.length <= 50`
- `1 <= nums[i] <= 10^6`

## 基礎思路

本題要求以最少操作次數，將整個陣列的元素都變成 `1`。每次操作可選擇相鄰一對 `(nums[i], nums[i+1])`，並把其中一個改成 `gcd(nums[i], nums[i+1])`。思考時抓住幾個關鍵：

- **若陣列中已有若干個 `1`**：把其餘元素「向 `1` 擴散」即可；一個 `1` 可在一次操作把相鄰元素變成 `gcd(1, x) = 1`，因此已有 `k` 個 `1` 時，還需要的操作數為 `n - k`。
- **若整體 `gcd(nums)` 大於 1**：任何由相鄰 gcd 組合而成的數都會是整體 gcd 的倍數，不可能產生 `1`，答案為 `-1`。
- **若整體 `gcd(nums) = 1` 但沒有 `1`**：必定能藉由若干相鄰 gcd 操作先在某個子陣列內「萃出第一個 `1`」。這個成本等於把該子陣列的 gcd 降到 1 所需的步數；對於長度為 `L` 的這段，成本為 `L - 1`。接著再用這個 `1` 擴散到全陣列，需要再做 `n - 1` 次。因此**總成本 =（造出第一個 `1` 的成本）+（把 `1` 擴散到全陣列的成本）**。若我們找的是最短的能達到 gcd=1 的子陣列長度 `L_min`，則答案為 `(L_min - 1) + (n - 1) = L_min + n - 2`。

基於以上觀察，解題策略為：

- 先統計陣列中 `1` 的個數，並同時計算整體 `gcd`。
- 依序處理三種情況：已有 `1` → 直接計算；整體 gcd > 1 → 回傳 `-1`；否則枚舉所有子陣列，尋找最短 gcd 可達 1 的長度 `L_min`，回傳 `L_min + n - 2`。

## 解題步驟

### Step 1：宣告基本變數與輔助函式

宣告陣列長度、`1` 的數量、整體 gcd；並提供輔助函式 `getGcd`（歐幾里得算法）以計算兩數 gcd。

```typescript
const length = nums.length;
let countOfOnes = 0;
let overallGcd = 0;

/**
 * 使用歐幾里得演算法計算兩數的最大公因數（GCD）。
 *
 * @param a - 第一個數
 * @param b - 第二個數
 * @returns 兩數的最大公因數
 */
function getGcd(a: number, b: number): number {
  while (b !== 0) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }
  return a;
}
```

### Step 2：一次遍歷，統計 `1` 的數量並累積整體 GCD

同一趟掃描中：計數 `1` 的個數；並不斷以 `overallGcd = gcd(overallGcd, value)` 累積整體 gcd。

```typescript
// 統計 1 的數量並計算整體 GCD
for (const value of nums) {
  if (value === 1) {
    countOfOnes++;
  }
  overallGcd = getGcd(overallGcd, value);
}
```

### Step 3：根據快速判定分支返回答案（已有 1 / 不可能）

若已有 `1`，答案為把其餘元素都變成 `1` 的操作數 `n - countOfOnes`。若整體 gcd > 1，無法產生 `1`，回傳 `-1`。

```typescript
// 情況一：陣列中已存在至少一個 1
if (countOfOnes > 0) {
  return length - countOfOnes;
}

// 情況二：整體 GCD > 1，無法把任何數變為 1
if (overallGcd > 1) {
  return -1;
}
```

### Step 4：尋找能產生第一個 1 的最短子陣列

當整體 gcd = 1 且沒有 `1` 時，我們需要先在某段子陣列中把 gcd 降到 1。枚舉左端點 `start`，滾動計算 `currentGcd`，一旦等於 1 就更新最短長度並提早結束該左端點的擴張。

```typescript
// 情況三：整體 GCD = 1 且目前沒有 1，需先在某段子陣列內產生第一個 1
let minimalLength = length;
for (let start = 0; start < length; start++) {
  let currentGcd = nums[start];
  for (let end = start + 1; end < length; end++) {
    currentGcd = getGcd(currentGcd, nums[end]);
    if (currentGcd === 1) {
      const windowLength = end - start + 1;
      if (windowLength < minimalLength) {
        minimalLength = windowLength;
      }
      break; // 以此 start，已達 gcd==1，沒必要再延伸更長的 end
    }
  }
}
```

### Step 5：由最短子陣列長度推回總操作數並回傳

造出第一個 `1` 的成本是 `minimalLength - 1`，再擴散到整陣列需要 `n - 1`。合併為 `minimalLength + n - 2`。

```typescript
// 先造出第一個 1（成本 minimalLength - 1），再擴散到全陣列（成本 n - 1）
return minimalLength + length - 2;
```

## 時間複雜度

- 一次遍歷統計與整體 gcd：$O(n \log A)$，其中 $A$ 為數值上限。
- 枚舉所有起點並滾動 gcd 的雙迴圈：最壞 $O(n^2 \log A)$（每次 gcd 計算攤入 $\log A$）。
- 總時間複雜度為 $O(n^2 \log A)$。

> $O(n^2 \log A)$

## 空間複雜度

- 僅使用常數級額外變數（計數、指標與暫存 gcd）。
- 總空間複雜度為 $O(1)$。

> $O(1)$
