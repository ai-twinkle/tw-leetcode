# 2163. Minimum Difference in Sums After Removal of Elements

You are given a 0-indexed integer array `nums` consisting of `3 * n` elements.

You are allowed to remove any subsequence of elements of size exactly `n` from `nums`. 
The remaining `2 * n` elements will be divided into two equal parts:

- The first `n` elements belonging to the first part and their sum is $sum_{first}$.
- The next `n` elements belonging to the second part and their sum is $sum_{second}$. 

The difference in sums of the two parts is denoted as $sum_{first} - sum_{second}$.

- For example, if $sum_{first} = 3$ and $sum_{second} = 2$, their difference is `1`.
- Similarly, if $sum_{first} = 2$ and $sum_{second} = 3$, their difference is `-1`.

Return the minimum difference possible between the sums of the two parts after the removal of `n` elements.

**Constraints:**

- `nums.length == 3 * n`
- `1 <= n <= 10^5`
- `1 <= nums[i] <= 10^5`

## 基礎思路

本題給定一個長度為 $3n$ 的整數陣列，要求從中移除恰好 $n$ 個元素後，使得剩餘的 $2n$ 個元素切成前後各 $n$ 個元素兩個部分，兩部分之和的差值最小。

我們可以透過以下步驟來解決這個問題：

- 首先觀察到移除的 $n$ 個元素必定是中間區域的一段連續區間，因為若非如此，將無法使得剩餘元素清楚劃分為前後各 $n$ 個元素。
- 基於上述觀察，我們考慮從左往右掃描，動態維護前段的**最小可能和**（即選取前段最小的 $n$ 個元素）以及從右往左掃描，動態維護後段的**最大可能和**（即選取後段最大的 $n$ 個元素）。
- 透過堆（Heap）結構動態調整並記錄前段最小和與後段最大和，最終透過掃描一遍可能的切分點，即可找到最小的前後段差值。

## 解題步驟

## 解題步驟

### Step 1：初始化輔助變數與陣列結構

首先，將輸入陣列與輔助陣列進行初始化，方便後續運算：

```typescript
const arrayLength = nums.length;
const oneThirdLength = (arrayLength / 3) | 0;
const valuesArray = Int32Array.from(nums);

const prefixSmallestSums = new Float64Array(arrayLength);  // 儲存從左邊開始前綴最小和
const suffixLargestSums = new Float64Array(arrayLength);   // 儲存從右邊開始後綴最大和
```

### Step 2：透過最大堆 (max-heap) 計算前綴最小和

從左到右遍歷陣列，動態維護目前為止最小的 $n$ 個元素之和：

```typescript
const maxHeapSmallest = new Int32Array(oneThirdLength + 1);
let maxHeapCurrentSize = 0;
let prefixSumCurrent = 0;

for (let index = 0; index < arrayLength; ++index) {
  const currentValue = valuesArray[index];

  // 將目前元素加入到 max-heap 中
  let heapPosition = maxHeapCurrentSize++;
  maxHeapSmallest[heapPosition] = currentValue;
  // 向上調整堆，維持最大堆性質
  while (heapPosition > 0) {
    const parentPosition = (heapPosition - 1) >> 1;
    if (maxHeapSmallest[parentPosition] >= maxHeapSmallest[heapPosition]) {
      break;
    }
    const temp = maxHeapSmallest[parentPosition];
    maxHeapSmallest[parentPosition] = maxHeapSmallest[heapPosition];
    maxHeapSmallest[heapPosition] = temp;
    heapPosition = parentPosition;
  }
  prefixSumCurrent += currentValue;

  // 若堆內元素超過 n，移除最大元素
  if (maxHeapCurrentSize > oneThirdLength) {
    const removedValue = maxHeapSmallest[0];
    prefixSumCurrent -= removedValue;
    maxHeapCurrentSize--;
    maxHeapSmallest[0] = maxHeapSmallest[maxHeapCurrentSize];

    // 向下調整堆，維持最大堆性質
    let downPosition = 0;
    while (true) {
      const leftChild = (downPosition << 1) + 1;
      if (leftChild >= maxHeapCurrentSize) {
        break;
      }
      const rightChild = leftChild + 1;
      let swapChild = leftChild;
      if (
        rightChild < maxHeapCurrentSize &&
        maxHeapSmallest[rightChild] > maxHeapSmallest[leftChild]
      ) {
        swapChild = rightChild;
      }
      if (maxHeapSmallest[swapChild] <= maxHeapSmallest[downPosition]) {
        break;
      }
      const temp = maxHeapSmallest[downPosition];
      maxHeapSmallest[downPosition] = maxHeapSmallest[swapChild];
      maxHeapSmallest[swapChild] = temp;
      downPosition = swapChild;
    }
  }

  // 當前位置至少包含 n 個元素時，記錄此時的前綴最小和
  if (index >= oneThirdLength - 1) {
    prefixSmallestSums[index] = prefixSumCurrent;
  }
}
```

### Step 3：透過最小堆 (min-heap) 計算後綴最大和

從右到左遍歷陣列，動態維護從當前位置到陣列尾端中最大的 $n$ 個元素之和：

```typescript
const minHeapLargest = new Int32Array(oneThirdLength + 1);
let minHeapCurrentSize = 0;
let suffixSumCurrent = 0;

for (let index = arrayLength - 1; index >= 0; --index) {
  const currentValue = valuesArray[index];

  // 將目前元素加入到 min-heap 中
  let heapPosition = minHeapCurrentSize++;
  minHeapLargest[heapPosition] = currentValue;
  // 向上調整堆，維持最小堆性質
  while (heapPosition > 0) {
    const parentPosition = (heapPosition - 1) >> 1;
    if (minHeapLargest[parentPosition] <= minHeapLargest[heapPosition]) {
      break;
    }
    const temp = minHeapLargest[parentPosition];
    minHeapLargest[parentPosition] = minHeapLargest[heapPosition];
    minHeapLargest[heapPosition] = temp;
    heapPosition = parentPosition;
  }
  suffixSumCurrent += currentValue;

  // 若堆內元素超過 n，移除最小元素
  if (minHeapCurrentSize > oneThirdLength) {
    const removedValue = minHeapLargest[0];
    suffixSumCurrent -= removedValue;
    minHeapCurrentSize--;
    minHeapLargest[0] = minHeapLargest[minHeapCurrentSize];

    // 向下調整堆，維持最小堆性質
    let downPosition = 0;
    while (true) {
      const leftChild = (downPosition << 1) + 1;
      if (leftChild >= minHeapCurrentSize) {
        break;
      }
      const rightChild = leftChild + 1;
      let swapChild = leftChild;
      if (
        rightChild < minHeapCurrentSize &&
        minHeapLargest[rightChild] < minHeapLargest[leftChild]
      ) {
        swapChild = rightChild;
      }
      if (minHeapLargest[swapChild] >= minHeapLargest[downPosition]) {
        break;
      }
      const temp = minHeapLargest[downPosition];
      minHeapLargest[downPosition] = minHeapLargest[swapChild];
      minHeapLargest[swapChild] = temp;
      downPosition = swapChild;
    }
  }

  // 當前位置到結尾至少包含 n 個元素時，記錄此時的後綴最大和
  if (index <= 2 * oneThirdLength) {
    suffixLargestSums[index] = suffixSumCurrent;
  }
}
```

### Step 4：遍歷所有切分點找出最小差值

遍歷所有合法的切分點位置，計算前後段差值，並取最小差值作為答案：

```typescript
let minimumDifferenceResult = Number.POSITIVE_INFINITY;
for (
  let middleIndex = oneThirdLength - 1;
  middleIndex < 2 * oneThirdLength;
  ++middleIndex
) {
  const difference =
    prefixSmallestSums[middleIndex] -
    suffixLargestSums[middleIndex + 1];
  if (difference < minimumDifferenceResult) {
    minimumDifferenceResult = difference;
  }
}
```

### Step 5：返回最小差值結果

```typescript
return minimumDifferenceResult;
```

## 時間複雜度

- 使用堆維護前綴最小和與後綴最大和，每次插入與移除操作的複雜度為 $O(\log n)$，共需執行 $O(n)$ 次，合計為 $O(n \log n)$。
- 最後的線性遍歷掃描切分點，複雜度為 $O(n)$。
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- 使用固定大小（最多為 $n+1$）的兩個堆結構 (maxHeapSmallest 與 minHeapLargest)。
- 另外使用了前綴和與後綴和陣列 (prefixSmallestSums, suffixLargestSums)，長度皆為 $3n$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
