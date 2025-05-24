# 2551. Put Marbles in Bags

You have `k` bags. 
You are given a 0-indexed integer array `weights` where `weights[i]` is the weight of the $i^{th}$ marble. 
You are also given the integer `k`.

Divide the marbles into the `k` bags according to the following rules:

- No bag is empty.
- If the $i^{th}$ marble and $j^{th}$ marble are in a bag, 
  then all marbles with an index between the $i^{th}$ and $j^{th}$ indices should also be in that same bag.
- If a bag consists of all the marbles with an index from `i` to `j` inclusively, 
  then the cost of the bag is `weights[i] + weights[j]`.

The score after distributing the marbles is the sum of the costs of all the `k` bags.

Return the difference between the maximum and minimum scores among marble distributions.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^9`
- `1 <= k <= (nums.length + 1)/2`

## 基礎思路

題目要求將一排球依序分成 `k` 個袋子，每個袋子的成本是該袋子「第一顆」與「最後一顆」球重量的總和。

我們可以先觀察到，若所有球不切割直接放在同一個袋子，成本固定為 `weights[0] + weights[n - 1]`。

而每當我們進行一次切割（切在相鄰兩顆球之間），就會額外增加一次成本，成本為這兩顆相鄰球的重量總和。因此，問題變成：

- 從 `n - 1` 對相鄰的球中，挑選出 `k - 1` 對來切割，找到「最大成本」與「最小成本」的差值。

因此，整題關鍵在於如何快速找到：

- 前 `k - 1` 個**最小的相鄰球對成本**（用於求最小成本）
- 前 `k - 1` 個**最大的相鄰球對成本**（用於求最大成本）

我們使用的策略為：

- 如果要挑選的數量（`k - 1`）較多，直接將全部排序再挑選更有效率。
- 如果挑選的數量較少，用快速選擇（Quickselect）局部排序來挑選更有效率。

## 解題步驟

### Step 1：計算相鄰球對成本

先建立一個新陣列 `diffs`，長度為 `n - 1`，用來儲存每對相鄰球的成本：

```typescript
const m = n - 1;
const diffs: number[] = new Array(m);

for (let i = 0; i < m; i++) {
  diffs[i] = weights[i] + weights[i + 1];
}
```

這樣之後我們就能直接從中挑選出適合切割的位置。

### Step 2：選擇「排序」或「快速選擇」策略

先定義需要挑選的切割點數量為 `num = k - 1`。  
如果 `num <= 0`，表示只有一個袋子，不需切割，直接返回 `0`。

接著根據 `num` 的大小選擇不同的策略：

- 若 `num` 較大（超過一半），我們就直接排序。
- 若 `num` 較小，則用快速選擇演算法來加速挑選過程。

```typescript
const num = k - 1;
if (num <= 0) {
  return 0;
}

let minSum = 0, maxSum = 0;

if (num > m / 2) {
  // num較大，直接排序
  diffs.sort((a, b) => a - b);
  for (let i = 0; i < num; i++) {
    minSum += diffs[i];             // 加總前 num 個最小的
    maxSum += diffs[m - 1 - i];     // 加總後 num 個最大的
  }
} else {
  // num較小，用快速選擇演算法

  // 找出前 num 個最小成本總和
  const diffSmall = diffs.slice();
  quickSelect(diffSmall, 0, diffSmall.length - 1, num - 1);
  for (let i = 0; i < num; i++) {
    minSum += diffSmall[i];
  }

  // 找出後 num 個最大成本總和
  const diffLarge = diffs.slice();
  quickSelect(diffLarge, 0, diffLarge.length - 1, diffLarge.length - num);
  for (let i = diffLarge.length - num; i < diffLarge.length; i++) {
    maxSum += diffLarge[i];
  }
}
```

### Step 3：快速選擇算法（Quickselect）解析

快速選擇（Quickselect）演算法能有效地找到陣列中第 k 大（或小）的元素，而不用完整排序陣列。

它需要用到三個函數：

#### (1) quickSelect 函數

- 不斷地選一個基準（pivot），將陣列分割成兩邊。
- 根據基準的位置，持續調整範圍，直到第 k 個元素放到正確位置為止。

```typescript
function quickSelect(arr: number[], left: number, right: number, k: number): void {
  while (left < right) {
    const pivotIndex = left + Math.floor(Math.random() * (right - left + 1)); // 隨機選基準提高效率
    const newPivotIndex = partition(arr, left, right, pivotIndex);
    if (newPivotIndex === k) {
      return;
    } else if (k < newPivotIndex) {
      right = newPivotIndex - 1;
    } else {
      left = newPivotIndex + 1;
    }
  }
}
```

#### (2) partition 函數（陣列分割函數）

- 以一個 pivot 為基準，將比 pivot 小的數字放到 pivot 的左邊，大於或等於 pivot 的數字放到右邊。
- 最後將 pivot 放到它正確的位置，並回傳這個位置。

```typescript
function partition(arr: number[], left: number, right: number, pivotIndex: number): number {
  const pivotValue = arr[pivotIndex];
  swap(arr, pivotIndex, right);

  let storeIndex = left;
  for (let i = left; i < right; i++) {
    if (arr[i] < pivotValue) {
      swap(arr, storeIndex, i);
      storeIndex++;
    }
  }

  swap(arr, storeIndex, right);
  return storeIndex;
}
```

#### (3) swap 函數（交換函數）

- 交換陣列中指定的兩個元素。

```typescript
function swap(arr: number[], i: number, j: number): void {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}
```

利用 Quickselect 可避免完整排序，平均時間複雜度為 $O(n)$。

### Step 4：回傳答案

最後一步，計算完最大與最小成本後，回傳兩者的差值：

```typescript
return maxSum - minSum;
```

## 時間複雜度

- **相鄰成本計算**：遍歷一次，為 $O(n)$。
- **排序策略**：若進行排序則為 $O(n\log n)$。
- **快速選擇策略**：平均情況下 $O(n)$，但最壞情況下（如資料不斷選到最差的基準值）可能退化為 $O(n^2)$。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 建立相鄰成本的 `diffs` 陣列需額外空間 $O(n)$。
- 快速選擇操作為原地進行，僅額外需要複製兩次 `diffs` 陣列，因此空間為 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
