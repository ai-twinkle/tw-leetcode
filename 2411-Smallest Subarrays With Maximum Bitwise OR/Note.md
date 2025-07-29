# 2411. Smallest Subarrays With Maximum Bitwise OR

You are given a 0-indexed array `nums` of length `n`, consisting of non-negative integers. 
For each index `i` from `0` to `n - 1`, you must determine the size of the minimum sized non-empty subarray of `nums` starting at `i` (inclusive) that has the maximum possible bitwise OR.

In other words, let $B_{ij}$ be the bitwise OR of the subarray `nums[i...j]`. 
You need to find the smallest subarray starting at `i`, such that bitwise OR of this subarray is equal to $max(B_{ik})$ where `i <= k <= n - 1`.
The bitwise OR of an array is the bitwise OR of all the numbers in it.

Return an integer array `answer` of size `n` where `answer[i]` is the length of the minimum sized subarray starting at `i` with maximum bitwise OR.

A subarray is a contiguous non-empty sequence of elements within an array.

**Constraints:**

- `n == nums.length`
- `1 <= n <= 10^5`
- `0 <= nums[i] <= 10^9`

## 基礎思路

本題的核心是要對每個起始位置 `i` 找出一個最短的連續子陣列，使得該子陣列的 Bitwise OR 達到從位置 `i` 出發後能獲得的最大值。

因此，我們思考的方向是：

- **從右往左** 來看每個位置，透過記錄每個位元最新出現的位置來確定，從當前位置開始，最少需要往後延伸多遠才能使所有可能的位元貢獻被包含進去。
- 若一個位元在當前或後續位置有出現，那麼為了達到最大 OR 值，必須包含此位元第一次出現的位置，因此從每個位置出發所需的最小子陣列長度，取決於這些位元出現位置的最遠者。
- 因此，我們用一個輔助陣列記錄各位元最後出現的位置，每次更新後再計算最遠的必要延伸位置即可。

## 解題步驟

### Step 1：初始化輔助資料結構

我們首先需要定義一些必要的變數和資料結構：

- `nextSetBitIndices`：由於數字最多到 $10^9$，因此最多只需要 31 個位元來記錄。


```typescript
const length = nums.length;                  // nums 陣列的長度
const resultArray = new Uint32Array(length); // 存放每個位置的答案
const nextSetBitIndices = new Int32Array(31);// 儲存每個位元下一次出現的位置
nextSetBitIndices.fill(-1);                  // 初始全部設為 -1 (代表尚未出現)
```
### Step 2：從後往前掃描，更新位元的最新出現位置

從陣列尾端往前掃描，逐步更新每個位元的最新位置：

```typescript
for (let index = length - 1; index >= 0; index--) {
  let currentValue = nums[index] >>> 0;  // 轉為無號整數處理
  let bitPosition = 0;                   // 位元的位置（從 0 到 30）

  // 檢查 currentValue 的每一個位元
  while (currentValue !== 0) {
    if ((currentValue & 1) !== 0) {
      // 若此位元為 1，則更新此位元最新的位置為目前索引
      nextSetBitIndices[bitPosition] = index;
    }
    currentValue >>>= 1;  // 右移一位繼續檢查下一位元
    bitPosition++;
  }

  // ...
}
```

### Step 3：計算並儲存每個位置的最短子陣列長度

更新完畢後，我們再透過位元資訊計算最短子陣列長度：

```typescript
for (let index = length - 1; index >= 0; index--) {
  // Step 2：從後往前掃描，更新位元的最新出現位置
  
  let farthestIndex = index; // 最遠需要延伸的位置，初始設為自己

  // 掃描所有位元找出下一次出現位置最遠的位元
  for (let bit = 0; bit < 31; bit++) {
    const nextIndex = nextSetBitIndices[bit];
    if (nextIndex > farthestIndex) {
      farthestIndex = nextIndex; // 更新為更遠的位置
    }
  }

  // 子陣列長度即從 index 到 farthestIndex (含頭尾)
  resultArray[index] = farthestIndex - index + 1;
}
```

### Step 4：轉換結果陣列為一般陣列並回傳

最後，我們將結果從 `Uint32Array` 轉換為一般陣列

```typescript
// 完成所有計算後，轉為一般陣列回傳結果
return Array.from(resultArray);
```

## 時間複雜度

- 每個元素至多掃描 31 位元並更新 31 個位元位置，操作複雜度為 $O(31)$，可視為常數 $O(1)$。
- 共有 $n$ 個元素，因此整體複雜度為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用固定大小（31）的輔助陣列，以及儲存答案的陣列（$O(n)$）。
- 沒有使用其他動態擴充資料結構，因此額外的空間僅為常數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
