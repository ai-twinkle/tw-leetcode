# 1984. Minimum Difference Between Highest and Lowest of K Scores

You are given a 0-indexed integer array `nums`, where `nums[i]` represents the score of the $i^{th}$ student.
You are also given an integer `k`.

Pick the scores of any `k` students from the array so that the difference between the highest and the lowest of the `k` scores is minimized.

Return the minimum possible difference.

**Constraints:**

- `1 <= k <= nums.length <= 1000`
- `0 <= nums[i] <= 10^5`

## 基礎思路

本題要從分數陣列中挑選任意 `k` 位學生，使被選到的 `k` 個分數中「最高分 − 最低分」最小，並回傳這個最小差值。

在思考解法時，我們需要注意幾個核心觀察：

* **只在乎最大值與最小值**：對於任意一組 `k` 個分數，其差值完全由該組的最大與最小決定，中間的分數不影響差值大小。
* **排序後最佳解會變成連續區間**：若先將分數排序，任意挑選 `k` 個分數要使差值最小，最佳的 `k` 個分數必定對應到排序後某段長度為 `k` 的連續區間，因為非連續挑選只會讓區間跨度更大或不更小。
* **滑動視窗找最小跨度**：因此只需在排序後的陣列上，用大小固定為 `k` 的視窗從左到右掃描，計算每個視窗的「尾端 − 起點」，取其中最小值即可。
* **下界與提前結束**：差值的理論下界為 0，若在掃描過程中已達到 0，則不可能再更小，可以立即返回。

透過上述策略，我們可將問題化簡為：排序後做一次線性掃描，即可求出最小差值。

## 解題步驟

### Step 1：取得長度並處理 k 的特例

當 `k <= 1` 時，選到的集合最多只有一個元素，最高與最低相同，因此差值必為 0，可直接回傳。

```typescript
const length = nums.length;

// 處理不需要比較的情況
if (k <= 1) {
  return 0;
}
```

### Step 2：建立排序用的分數陣列並排序

將輸入分數複製到新的整數陣列中，接著進行升序排序，為後續固定長度視窗掃描做準備。

```typescript
// 準備 TypedArray 以加速數值排序並降低記憶體負擔
const sortedScores = new Int32Array(length);
for (let index = 0; index < length; index += 1) {
  sortedScores[index] = nums[index] | 0;
}
sortedScores.sort();
```

### Step 3：初始化最小差值與固定視窗偏移量

* `minimumPossibleDifference` 用來維護目前找到的最小差值，初始化為 32-bit 整數上限。
* `windowEndOffset = k - 1` 代表固定視窗大小的尾端偏移，避免在迴圈中反覆計算。

```typescript
// 追蹤所有合法視窗中出現的最小差值
let minimumPossibleDifference = 2147483647;

// 預先計算固定視窗大小的尾端偏移量
const windowEndOffset = k - 1;
```

### Step 4：掃描所有大小為 k 的連續視窗並更新答案

在排序後陣列上逐一枚舉每個長度為 `k` 的連續視窗，計算視窗尾端與起點的差值，若更小就更新答案；若答案已為 0，則立即回傳。

```typescript
// 在排序後陣列中評估每個大小為 k 的連續視窗
for (let windowStart = 0; windowStart + windowEndOffset < length; windowStart += 1) {
  const windowEnd = windowStart + windowEndOffset;
  const difference = sortedScores[windowEnd] - sortedScores[windowStart];

  if (difference < minimumPossibleDifference) {
    minimumPossibleDifference = difference;

    // 0 是最佳下界，可立即結束
    if (minimumPossibleDifference === 0) {
      return 0;
    }
  }
}
```

### Step 5：回傳最終最小差值

當所有視窗都評估完畢後，回傳掃描過程中記錄到的最小差值。

```typescript
// 回傳觀察到的最小差值
return minimumPossibleDifference;
```

## 時間複雜度

- 複製分數到新陣列：`for` 迴圈跑 `n = nums.length` 次，為 $O(n)$。
- 排序：對長度為 $n$ 的陣列排序，為 $O(n \log n)$。
- 固定視窗掃描：視窗起點 `windowStart` 從 `0` 到 `n - k`（含）共 `n - k + 1` 次，每次為常數操作，為 $O(n - k + 1)$，亦即 $O(n)$。
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- 額外建立 `sortedScores`，大小為 $n$，為 $O(n)$。
- 其餘變數皆為常數空間，為 $O(1)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
