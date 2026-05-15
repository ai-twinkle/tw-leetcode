# 153. Find Minimum in Rotated Sorted Array

Suppose an array of length `n` sorted in ascending order is rotated between `1` and `n` times. 
For example, the array `nums = [0,1,2,4,5,6,7]` might become:

- `[4,5,6,7,0,1,2]` if it was rotated `4` times.
- `[0,1,2,4,5,6,7]` if it was rotated `7` times.

Notice that rotating an array `[a[0], a[1], a[2], ..., a[n-1]]` 1 time results in the array `[a[n-1], a[0], a[1], a[2], ..., a[n-2]]`.

Given the sorted rotated array `nums` of unique elements, return the minimum element of this array.

You must write an algorithm that runs in `O(log n)` time.

**Constraints:**

- `n == nums.length`
- `1 <= n <= 5000`
- `-5000 <= nums[i] <= 5000`
- All the integers of `nums` are unique.
- `nums` is sorted and rotated between 1 and n times.

## 基礎思路

本題給定一個由升序陣列旋轉若干次後的陣列，要求在 $O(\log n)$ 時間內找出其中的最小值。由於陣列元素皆唯一，旋轉後的結構具有明確的可分析性。

在思考解法時，可掌握以下核心觀察：

- **旋轉陣列具有局部有序性**：
  旋轉後的陣列可拆成兩段各自遞增的子陣列，最小值必定位於兩段交接處（即「折點」）。

- **可透過與最右端元素比較來判斷當前位置所在的段**：
  若某位置的值大於陣列最右端的值，則該位置必定位於左段（旋轉前的較大半部），最小值在其右側；反之，該位置位於右段或折點本身。

- **未旋轉或旋轉整圈的情況可快速判斷**：
  若陣列首元素不大於尾元素，代表整體仍為升序，最小值即為第一個元素，無需進行二元搜尋。

- **二元搜尋的收斂策略**：
  每次比較中間值與最右端值，可保證搜尋範圍持續縮小，且最小值始終保留在搜尋範圍之內，直到左右指標重合時即為解。

依據以上特性，可以採用以下策略：

- **先判斷是否需要搜尋**，若首尾已呈升序則直接回傳首元素。
- **以最右端值作為判斷基準進行二元搜尋**，每次依中間值與右端值的大小關係縮減搜尋範圍。
- **當左右指標收斂至同一位置時，即為折點，即最小值所在**。

此策略確保每次迭代都排除至少一半的候選範圍，達成嚴格的 $O(\log n)$ 時間複雜度。

## 解題步驟

### Step 1：記錄陣列長度與最右端值，並處理未旋轉的快速路徑

先取得陣列長度與最右端的值作為後續比較的基準；
若首元素不大於最右端值，代表整個陣列仍維持升序（未旋轉或旋轉整圈），最小值即為首元素，可直接回傳。

```typescript
const length = nums.length;
let right = length - 1;
const rightmostValue = nums[right];

// 快速退出：若陣列未有效旋轉，則首元素即為最小值
if (nums[0] <= rightmostValue) {
  return nums[0];
}
```

### Step 2：初始化左指標並開始二元搜尋，依中間值與右端值的關係縮減搜尋範圍

確認陣列確實發生旋轉後，以左右指標包夾搜尋範圍：
每輪計算中間位置，並與最右端值比較——若中間值較大，表示折點（最小值）在中間的右側，左指標移至中間右邊；否則折點在中間或其左側，右指標收縮至中間位置。

```typescript
let left = 0;
// 二元搜尋折點（最小值所在位置）
while (left < right) {
  // 使用無符號右移快速計算中點，避免溢位
  const middle = (left + right) >>> 1;
  const middleValue = nums[middle];

  // 若中間值大於最右端值，表示最小值在右半部
  if (middleValue > nums[right]) {
    left = middle + 1;
  } else {
    // 最小值在中間或左半部（中間是候選位置）
    right = middle;
  }
}
```

### Step 3：回傳收斂後的最小值

當左右指標重合時，所指位置即為折點，也就是整個陣列中的最小元素。

```typescript
return nums[left];
```

## 時間複雜度

- 每次迭代將搜尋範圍縮減一半，共需 $O(\log n)$ 次；
- 快速路徑與最終回傳皆為常數時間操作。
- 總時間複雜度為 $O(\log n)$。

> $O(\log n)$

## 空間複雜度

- 僅使用固定數量的輔助變數（左右指標、中間值等）；
- 未使用任何額外陣列或遞迴堆疊空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
