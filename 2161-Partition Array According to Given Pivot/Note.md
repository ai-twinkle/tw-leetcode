# 2161. Partition Array According to Given Pivot

You are given a 0-indexed integer array `nums` and an integer `pivot`. 
Rearrange `nums` such that the following conditions are satisfied:

- Every element less than `pivot` appears before every element greater than `pivot`.
- Every element equal to `pivot` appears in between the elements less than and greater than pivot.
- The relative order of the elements less than `pivot` and the elements greater than `pivot` is maintained.
  - More formally, consider every $p_i$, $p_j$ where $p_i$ is the new position of the $i_{th}$ element and 
    $p_j$ is the new position of the $j_{th}$ element. If `i < j` and both elements are smaller (or larger) than `pivot`, then $p_i < p_j$.

Return `nums` after the rearrangement.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `-10^6 <= nums[i] <= 10^6`
- `pivot` equals to an element of `nums`.

## 基礎思路

首先，這個問題的基本思路是將數字依據與 pivot 的大小關係分成三個部分：
- 小於 pivot 的
- 等於 pivot 的
- 大於 pivot 的

在一開始，我使用三個獨立的 O(n) 迴圈來完成這個任務。每個迴圈都是一個`if`條件判斷，將符合條件的數字推入結果陣列中。

進一步觀察後，我們發現其實可以在第一個迴圈中，同時完成兩個任務：
- 一方面將小於 pivot 的數字推入結果陣列
- 另一方面計算等於 pivot 的數字個數

由於 pivot 本身不需要保持原來的順序，因此這些等於 pivot 的數字只需要記錄數量，並在後續直接填充到結果陣列中，而不必進行單獨的遍歷。

最後，當第一個迴圈結束後，我們可以根據之前記錄的等於 pivot 的數量，將相應個數的 pivot 值直接填充到結果陣列中。
隨後，再用一次迴圈處理大於 pivot 的數字，將它們依序推入陣列，這樣我們能獲得相對較快的執行效率。

## 解題步驟

### Step 1: 初始化變數

首先，我們需要初始化一些變數，包括：
- 數字個數 n
- 結果陣列與索引
- 紀錄等於 pivot 的數量

```typescript
const n = numbers.length;

// 結果陣列與索引 (我們使用固定大小的陣列，用指針方式會比`push`更快)
let resultIndex = 0;
const resultArray: number[] = new Array(n);

// 紀錄洽等於 pivot 的數量
let pivotCount = 0;
```

### Step 2: 遍歷數字處理小於或等於 pivot 的數字

接下來，我們遍歷數字，將小於 pivot 的數字推入結果陣列，並記錄等於 pivot 的數量。

```typescript
for (let i = 0; i < n; i++) {
  const currentNumber = numbers[i];
  if (currentNumber === pivot) {
    pivotCount++;
  } else if (currentNumber < pivot) {
    resultArray[resultIndex] = currentNumber;
    resultIndex++;
  }
}
```

### Step 3: 填充等於 pivot 的數字

在第一個迴圈結束後，我們可以根據之前記錄的等於 pivot 的數量，將相應個數的 pivot 值直接填充到結果陣列中。

```typescript
while (pivotCount > 0) {
  resultArray[resultIndex] = pivot;
  resultIndex++;
  pivotCount--;
}
```

### Step 4: 遍歷數字處理大於 pivot 的數字

最後，再用一次迴圈處理大於 pivot 的數字，將它們依序推入陣列。

```typescript
for (let i = 0; i < n; i++) {
  const currentNumber = numbers[i];
  if (currentNumber > pivot) {
    resultArray[resultIndex] = currentNumber;
    resultIndex++;
  }
}
```


## 時間複雜度

- 第一次遍歷：$O(n)$
- 塞入等於 pivot 的極端條件是 $O(n)$，但是通常情況下會比較小。
- 第二次遍歷：$O(n)$
- 總時間複雜度為 $O(n)$

> $O(n)$

## 空間複雜度

- 我們使用了一個固定大小的結果陣列，因此空間複雜度是 $O(n)$。
- 其他變數的空間複雜度是 $O(1)$。
- 總空間複雜度為 $O(n)$

> $O(n)$
