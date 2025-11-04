# 3318. Find X-Sum of All K-Long Subarrays I

You are given an array `nums` of `n` integers and two integers `k` and `x`.

The x-sum of an array is calculated by the following procedure:

- Count the occurrences of all elements in the array.
- Keep only the occurrences of the top `x` most frequent elements. If two elements have the same number of occurrences, the element with the bigger value is considered more frequent.
- Calculate the sum of the resulting array.

Note that if an array has less than `x` distinct elements, its x-sum is the sum of the array.

Return an integer array `answer` of length `n - k + 1` where `answer[i]` is the x-sum of the subarray `nums[i..i + k - 1]`.

**Constraints:**

- `1 <= n == nums.length <= 50`
- `1 <= nums[i] <= 50`
- `1 <= x <= k <= nums.length`

## 基礎思路

本題要求計算每個長度為 `k` 的子陣列之 **x-sum**，也就是僅保留「出現頻率最高的前 `x` 種數字」後的加總結果。
若某個子陣列中不同元素的種類數少於 `x`，則直接取整個子陣列的總和。

在思考解法時，我們需要特別注意幾個要點：

- **頻率排序規則**：
  頻率高者優先；若頻率相同，數值較大的元素優先。
- **子陣列滑動**：
  子陣列長度固定為 `k`，每次只移動一格，需高效更新頻率。
- **少於 x 種時的特例**：
  若某子陣列內不同元素的種類數不足 `x`，則取整個窗口總和即可。
- **效能需求**：
  由於 `n ≤ 50`、元素值範圍 `1 ≤ nums[i] ≤ 50`，可使用固定長度的 `TypedArray` 來維護頻率表，避免雜湊開銷。

為了滿足上述需求，我們可採取以下策略：

- **使用滑動窗口 (Sliding Window)**：
  同時維護頻率表與當前窗口總和，移動時僅更新進出元素。
- **高效頻率掃描**：
  當需要計算 x-sum 時，從高頻到低頻掃描，再由高值到低值確認前 `x` 種元素並加總。
- **輔助函數封裝**：
  實作一個 `computeTopXSum()` 專門計算當前頻率表的前 `x` 種元素總和，以維持主函數清晰與高重用性。

## 解題步驟

### Step 1：輔助函數 `computeTopXSum` — 計算前 x 種最高頻率元素的加總

此函數從頻率最高到最低掃描，並在相同頻率下由值高到低取元素，直到選滿 `x` 種為止。

```typescript
function computeTopXSum(
  frequencyCounts: Uint16Array,
  maximumValue: number,
  topX: number,
  windowSize: number
): number {
  let selectedKinds = 0;
  let sum = 0;

  // 從高頻到低頻掃描
  for (let freq = windowSize; freq >= 1; freq -= 1) {
    // 在同一頻率下從大值到小值檢查
    for (let value = maximumValue; value >= 1; value -= 1) {
      if (frequencyCounts[value] === freq) {
        // 累加該值貢獻的總和
        sum += freq * value;
        selectedKinds += 1;

        // 達到前 x 種即停止
        if (selectedKinds === topX) {
          return sum;
        }
      }
    }
  }

  // 若種類數不足 x，則總和已等於整個窗口的總和
  return sum;
}
```

### Step 2：主函數 `findXSum` — 使用滑動窗口計算每個子陣列的 x-sum

初始化頻率表、窗口總和與種類數，並逐步滑動窗口更新。

```typescript
function findXSum(nums: number[], k: number, x: number): number[] {
  // 找出最大值，作為頻率表長度上限
  let maximumValue = 1;
  for (let i = 0; i < nums.length; i += 1) {
    if (nums[i] > maximumValue) {
      maximumValue = nums[i];
    }
  }

  // 使用 TypedArray 儲存頻率
  const frequencyCounts = new Uint16Array(maximumValue + 1);

  const n = nums.length;
  const resultLength = n - k + 1;
  const answer = new Array(resultLength);

  // 當前窗口的總和與不同元素數量
  let currentWindowSum = 0;
  let currentDistinctCount = 0;

  // 建立初始窗口
  for (let i = 0; i < k; i += 1) {
    const value = nums[i];

    // 新增新種類時更新 distinct 計數
    if (frequencyCounts[value] === 0) {
      currentDistinctCount += 1;
    }
    frequencyCounts[value] += 1;
    currentWindowSum += value;
  }

  // 計算初始窗口的 x-sum
  if (currentDistinctCount <= x) {
    // 若種類數不足 x，取整個總和
    answer[0] = currentWindowSum;
  } else {
    // 否則呼叫輔助函數計算前 x 種總和
    answer[0] = computeTopXSum(frequencyCounts, maximumValue, x, k);
  }

  // 開始滑動窗口
  for (let startIndex = 1; startIndex < resultLength; startIndex += 1) {
    const outgoingValue = nums[startIndex - 1];
    const incomingValue = nums[startIndex + k - 1];

    // 移除滑出元素
    frequencyCounts[outgoingValue] -= 1;
    if (frequencyCounts[outgoingValue] === 0) {
      currentDistinctCount -= 1;
    }
    currentWindowSum -= outgoingValue;

    // 加入新進元素
    if (frequencyCounts[incomingValue] === 0) {
      currentDistinctCount += 1;
    }
    frequencyCounts[incomingValue] += 1;
    currentWindowSum += incomingValue;

    // 根據 distinct 數量決定是否需呼叫輔助函數
    if (currentDistinctCount <= x) {
      answer[startIndex] = currentWindowSum;
    } else {
      answer[startIndex] = computeTopXSum(frequencyCounts, maximumValue, x, k);
    }
  }

  // 回傳所有窗口的結果
  return answer;
}
```

## 時間複雜度

- 在每個窗口中，更新進出元素為 $O(1)$；
  若需要重新計算 top-x，`computeTopXSum()` 最壞需掃描所有值（最多 50）與頻率（最多 k ≤ 50），因此為 $O(k \times V)$，其中 $V$ 為不同數值的最大值（最多 50）。
- 總共有 $n - k + 1$ 個窗口。
- 總時間複雜度為 $O(n \times k \times V)$，但因約束極小（$n,V ≤ 50$），實際運行極快。

> $O(n \times k \times V)$

## 空間複雜度

- 頻率表使用 `Uint16Array(maximumValue + 1)`，為 $O(V)$；
- 結果陣列長度為 $O(n)$；
- 其餘變數常數級。
- 總空間複雜度為 $O(n + V)$。

> $O(n + V)$
