# 154. Find Minimum in Rotated Sorted Array II

Suppose an array of length `n` sorted in ascending order is rotated between `1` and `n` times. 
For example, the array `nums = [0,1,4,4,5,6,7]` might become:

- `[4,5,6,7,0,1,4]` if it was rotated 4 times.
- `[0,1,4,4,5,6,7]` if it was rotated 7 times.
Notice that rotating an array `[a[0], a[1], a[2], ..., a[n-1]]` 1 time results in the array `[a[n-1], a[0], a[1], a[2], ..., a[n-2]]`.

Given the sorted rotated array `nums` that may contain duplicates, return the minimum element of this array.

You must decrease the overall operation steps as much as possible.

**Constraints:**

- `n == nums.length`
- `1 <= n <= 5000`
- `-5000 <= nums[i] <= 5000`
- `nums` is sorted and rotated between `1` and `n` times.

## 基礎思路

本題要求在一個經過旋轉且可能含有重複元素的排序陣列中，找出最小值。由於陣列是由已排序陣列旋轉而來，其中存在一個「轉折點」，最小值即位於該轉折點處。

在思考解法時，可掌握以下核心觀察：

- **旋轉陣列的結構特性**：
  旋轉後的陣列可被分為左右兩段各自遞增的區間，最小值恰好位於右段的起始位置（即轉折點）。

- **中間值與右端值的大小關係決定最小值所在區間**：
  若中間值大於右端值，最小值必定在中間值的右側；若中間值小於右端值，最小值在中間值位置或其左側；若兩者相等，則無法確定最小值位於哪一側，但可安全縮小右邊界一步。

- **重複元素造成的不確定性**：
  當中間值與右端值相等時，最小值可能在任意一側，此時無法像無重複情況直接跳躍，只能保守地縮小搜尋範圍。

- **提前終止的最佳化**：
  若陣列頭尾已呈嚴格遞增，代表沒有發生有效旋轉（或恰好旋轉整圈），最小值即為第一個元素，可立即回傳。

依據以上特性，可以採用以下策略：

- **先以首尾比較進行快速判斷**，排除無需搜尋的情況。
- **以二分搜尋逼近轉折點**，依照中間值與右端值的關係縮小搜尋範圍。
- **遇到相等情況時保守縮小右邊界**，確保不會跳過最小值。

此策略能在大多數情況下達到對數時間複雜度，即便存在重複元素，仍能正確找出最小值。

## 解題步驟

### Step 1：初始化左右邊界

使用左右兩個指標分別指向陣列的頭尾，作為二分搜尋的初始範圍。

```typescript
let left = 0;
let right = nums.length - 1;
```

### Step 2：提前終止——陣列未發生有效旋轉時直接回傳

若首元素嚴格小於尾元素，代表整個陣列仍保持遞增排列，最小值即為第一個元素，無須進入搜尋迴圈。

```typescript
// 提前終止：若首元素小於尾元素，代表陣列未發生有效旋轉
if (nums[left] < nums[right]) {
  return nums[left];
}
```

### Step 3：二分搜尋轉折點——計算中間位置並取得對應值

進入二分搜尋迴圈，每一輪以無符號右移計算中間索引，並取出中間值與右端值，作為後續判斷的依據。

```typescript
// 二分搜尋轉折點（即最小元素所在位置）
while (left < right) {
  // 使用無符號右移快速計算整數中點
  const middle = (left + right) >>> 1;
  const middleValue = nums[middle];
  const rightValue = nums[right];

  // ...
}
```

### Step 4：依中間值與右端值的關係縮小搜尋範圍

根據中間值與右端值的比較結果，決定如何移動邊界：
- 若中間值大於右端值，最小值必定在中間值的右半部，將左邊界移至中間的右側；
- 若中間值小於右端值，最小值在中間值或其左側，將右邊界縮至中間；
- 若兩者相等，無法判斷最小值位置，保守地將右邊界向左縮一步。

```typescript
while (left < right) {
  // Step 3：計算中間位置並取得對應值

  if (middleValue > rightValue) {
    // 最小值嚴格位於右半部
    left = middle + 1;
  } else if (middleValue < rightValue) {
    // 最小值位於中間或左半部
    right = middle;
  } else {
    // 值相等：安全地將右邊界縮小一步
    right = right - 1;
  }
}
```

### Step 5：回傳收斂後的最小值

當左右邊界重合時，該位置即為轉折點，對應陣列中的最小元素，直接回傳。

```typescript
return nums[left];
```

## 時間複雜度

- 一般情況下，每次迴圈將搜尋範圍縮小一半，共需 $O(\log n)$ 次；
- 最壞情況下（全部元素相同），每次只縮小一步，退化為 $O(n)$；
- 總時間複雜度為 $O(n)$（最壞情況）。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的輔助變數；
- 無任何額外陣列或動態空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
