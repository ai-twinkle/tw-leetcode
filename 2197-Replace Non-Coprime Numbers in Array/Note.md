# 2197. Replace Non-Coprime Numbers in Array

You are given an array of integers `nums`. 
Perform the following steps:

1. Find any two adjacent numbers in `nums` that are non-coprime.
2. If no such numbers are found, stop the process.
3. Otherwise, delete the two numbers and replace them with their LCM (Least Common Multiple).
4. Repeat this process as long as you keep finding two adjacent non-coprime numbers.

Return the final modified array. 
It can be shown that replacing adjacent non-coprime numbers in any arbitrary order will lead to the same result.

The test cases are generated such that the values in the final array are less than or equal to `10^8`.

Two values `x` and `y` are non-coprime if `GCD(x, y) > 1` where `GCD(x, y)` is the Greatest Common Divisor of `x` and `y`.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^5`
- The test cases are generated such that the values in the final array are less than or equal to `10^8`.

## 基礎思路

我們需要反覆把相鄰且「不互質」的數合併為它們的最小公倍數，直到整列中再也找不到可合併的一對。
關鍵觀察是：合併的最終結果與合併順序無關，因此可以用「單調堆疊」的思維從左到右處理：

- 依序把元素推入堆疊，並在每次推入前，檢查「堆疊頂端」與當前值是否不互質。
- 只要頂端與當前值不互質，就把這兩個數以最小公倍數合併，彈出頂端，並用合併後的新值再與新的頂端比較，持續合併到兩者變成互質或堆疊為空為止。
- 這樣能局部消除可能的連鎖合併（例如 `a` 與 `b` 合併後的新值可能又與先前更左邊的數不互質），確保一次掃描即可得到最終答案。

最小公倍數使用公式 $\mathrm{LCM}(a, b) = \left( \frac{a}{\gcd(a, b)} \right) \times b$，以避免中途溢位風險。由於每個元素最多被推入與彈出各一次，整體是線性的。

## 解題步驟

### Step 1：預先配置堆疊並實作 GCD（歐幾里得演算法）

先建立固定大小的堆疊（使用 TypedArray 降低動態配置成本），並提供一個無配置、迭代版本的 GCD。

```typescript
const length = nums.length;

// 預先配置固定大小（TypedArray）的堆疊，降低動態開銷。
// 題目保證結果值不超過 1e8，32 位元整數足夠儲存。
const stack = new Uint32Array(length);
let stackPointer = -1; // 堆疊當前頂端的索引。

/**
 * 使用迭代版歐幾里得演算法計算最大公因數（快速、無配置）。
 *
 * @param {number} a - 第一個非負整數。
 * @param {number} b - 第二個非負整數。
 * @returns {number} - a 與 b 的最大公因數。
 */
function computeGreatestCommonDivisor(a: number, b: number): number {
  while (b !== 0) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }
  return a;
}
```

### Step 2：線性掃描並與堆疊頂端連鎖合併

逐一處理 `nums` 中的元素：每讀到一個值，就嘗試與堆疊頂端合併，只要仍不互質就繼續合併，直到變成互質或堆疊清空，最後把合併後的值推回堆疊。

```typescript
for (let i = 0; i < length; i++) {
  // 以無號 32 位元形式存入堆疊（型別相容）。
  let currentValue = nums[i] >>> 0;

  // 只要與堆疊頂端不互質，就持續合併。
  while (stackPointer >= 0) {
    const previousValue = stack[stackPointer];
    const divisor = computeGreatestCommonDivisor(previousValue, currentValue);

    if (divisor === 1) {
      // 若互質，停止合併。
      break;
    }

    // 以 LCM 取代兩數：(a / gcd) * b 可降低溢位風險。
    currentValue = Math.trunc((previousValue / divisor) * currentValue);

    // 頂端元素已合併，彈出。
    stackPointer--;
  }

  // 將合併後的值推入堆疊。
  stack[++stackPointer] = currentValue;
}
```

### Step 3：輸出堆疊有效區段即為最終陣列

處理完畢後，堆疊中的有效部分（自 0 至頂端索引）就是最後結果，拷貝到一般陣列回傳。

```typescript
// 複製堆疊有效部分作為回傳結果。
const resultLength = stackPointer + 1;
const result: number[] = new Array(resultLength);
for (let i = 0; i < resultLength; i++) {
  result[i] = stack[i];
}

return result;
```

## 時間複雜度

- 每個元素最多被推入與彈出堆疊各一次；合併過程的連鎖也只會使已有元素被再次檢查後彈出，不會重複無限次。
- GCD 與 LCM 計算皆為常數均攤成本（相對於整體線性掃描）。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用一個與輸入等長的堆疊作為工作空間，外加常數個臨時變數。
- 結果以新陣列輸出，其長度不超過輸入長度。
- 總空間複雜度為 $O(n)$。

> $O(n)$
