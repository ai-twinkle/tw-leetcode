# 3356. Zero Array Transformation II

You are given an integer array `nums` of length `n` and a 2D array `queries` where `queries[i] = [l_i, r_i, val_i]`.

Each `queries[i]` represents the following action on `nums`:

- Decrement the value at each index in the range `[l_i, r_i]` in nums by at most `val_i`.
- The amount by which each value is decremented can be chosen independently for each index.

A Zero Array is an array with all its elements equal to 0.

Return the minimum possible non-negative value of `k`, 
such that after processing the first `k` queries in sequence, `nums` becomes a Zero Array. 
If no such `k` exists, return -1.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `0 <= nums[i] <= 5 * 10^5`
- `1 <= queries.length <= 10^5`
- `queries[i].length == 3`
- `0 <= l_i <= r_i < nums.length`
- `1 <= val_i <= 5`

## 基礎思路

這道題的核心是要透過一系列區間的減法操作，讓陣列中每個元素都達到 0。

因為題目的操作都是「區間」的操作，使用 **差分陣列** 可以提升區間的更新效率，將原本需要 $O(n)$ 的區間操作降到 $O(1)$。

同時，我們還要保證在盡可能少的 query 內完成目標，因此可以採用 **貪婪策略**：
- 從左往右依序檢查每個位置的需求，發現不足時立即補足。
- 如果無法滿足，則立即返回 `-1`。

最後，結合差分陣列的高效區間更新與貪婪的即時補足需求，就能實現一個高效率且精簡的解法。

## 解題步驟

### Step 1：初始化差分陣列及變數

我們要先準備好以下三個工具：

- 一個長度為 `n+1` 的差分陣列（使用 `Int32Array` 提高效能）。
- `queriesUsed`：用來記錄已經用了多少個 query。
- `cumulativeDecrement`：用來累計到目前為止每個位置上已經使用的減量。

```typescript
const n = nums.length;              // nums 的長度
const m = queries.length;           // queries 的數量
const diff = new Int32Array(n + 1); // 差分陣列，用於快速區間更新
let queriesUsed = 0;                // 已使用的查詢數量
let cumulativeDecrement = 0;        // 目前為止的累計減量
```

### Step 2: 從左到右逐一處理每個位置的需求

我們從 `nums` 的最左邊依序往右檢查每個位置 $i$：

- **計算當前位置的累積減量**  
  在每個位置 $i$，我們都能快速算出到目前為止獲得的總減量（即 `cumulativeDecrement + diff[i]`），這代表當前位置已經獲得的減量總和。

- 若這個減量 **不足**以將當前位置變為 0（即小於 `nums[i]`），我們就必須利用下一個 query 來補充。

- 若已經用完所有的 query 還無法滿足，則立即返回 `-1`。

```typescript
for (let i = 0; i < n; i++) {
  // 計算目前位置 (i) 的總減量
  let currentDecrement = cumulativeDecrement + diff[i];

  // 若當前位置減量不足，則使用後續的 queries 來補充
  while (currentDecrement < nums[i]) {
    if (queriesUsed === queries.length) {
      // 沒有剩餘的 queries 可使用了，代表無法滿足
      return -1;
    }

    // 取得下一個可用的 query
    const [left, right, val] = queries[queriesUsed++];

    // 若此 query 對當前位置沒有影響 (區間右端小於當前位置)，則直接跳過
    if (right < i) {
      continue;
    }

    // 更新差分陣列：從「有效起點」(當前位置或查詢左邊界)到右端
    const effectiveStart = Math.max(left, i);
    diff[effectiveStart] += val;
    diff[right + 1] -= val;

    // 更新後重新計算當前位置的累計減量
    currentDecrement = cumulativeDecrement + diff[i];
  }

  // 當當前位置滿足後，更新累計減量以供下一個位置使用
  cumulativeDecrement = currentDecrement;
}
```

## 時間複雜度

- **外層 for 迴圈**：執行 $n$ 次，每次處理常數時間的操作，複雜度為 $O(n)$。
- **內層 while 迴圈**：
    - 雖然在每次迭代中可能需要多次執行 while 迴圈，但**關鍵在於**，每個查詢（來自 `queries`）只會被使用一次，也就是說 `queriesUsed` 從 0 逐漸增加到最多 $ m $。
    - 因此，整個過程中，所有 while 迴圈的總次數最多為 $m$，故其複雜度為 $O(m)$。
- 總時間複雜度為 $O(n+m)$。

> $O(n+m)$

## 空間複雜度

- **差分陣列** `diff`：需要額外的 $O(n)$ 空間（大小為 $n+1$）。
- 其他變數空間複雜度為常數級。
- 總空間複雜度為 $O(n)$。

> $O(n)$
