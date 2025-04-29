# 2962. Count Subarrays Where Max Element Appears at Least K Times

You are given an integer array `nums` and a positive integer `k`.

Return the number of subarrays where the maximum element of `nums` appears at least k times in that subarray.

A subarray is a contiguous sequence of elements within an array.

## 基礎思路

題目要求計算所有子陣列中，「最大元素」至少出現 $k$ 次的子陣列總數。我們可以透過以下方式快速求解：

- **找到陣列中的全域最大值**：題目只關注這個數字出現的次數，其餘數字並不影響結果。
- **紀錄最大值出現位置**：透過一個固定大小的隊列（使用 `Int32Array` 提升效能）來儲存每個最大值的索引。
- **遍歷一次陣列計算符合條件的子陣列數量**：
   - 當累積的最大值次數達到 $k$ 時，以當前索引作為子陣列的結尾，我們能快速判斷有多少個子陣列符合條件。

透過以上思路，我們只需兩次線性掃描即可完成求解，達成高效能需求。

## 解題步驟

### Step 1：尋找陣列的全域最大值

首先我們取得陣列的長度並掃描一次，找到並紀錄整個陣列中的最大元素值 (`globalMax`)。

```typescript
const n = nums.length;
let globalMax = -Infinity;
for (let i = 0; i < n; ++i) {
  const v = nums[i];
  if (v > globalMax) {
    globalMax = v;
  }
}
```

### Step 2：初始化紀錄最大值索引的隊列

接著，我們初始化一個固定大小的隊列 (`positions`)，用來存放每次遇到全域最大值的位置索引，以快速進行後續計算。

```typescript
const positions = new Int32Array(n);
let tail = 0;            // 指向隊列的下一個插入位置
let maxCountSoFar = 0;   // 紀錄目前為止遇到的最大值總數
let result = 0;          // 累計合法子陣列數量
```

### Step 3：滑動視窗計算合法子陣列數量

再次掃描陣列，將每個全域最大值的位置儲存起來，並在當前最大值的累積數量達到或超過 $k$ 時，計算出以目前索引為結尾的子陣列中，有多少符合題意的子陣列。

```typescript
for (let i = 0; i < n; ++i) {
  if (nums[i] === globalMax) {
    positions[tail++] = i;
    ++maxCountSoFar;
  }

  // 若當前已經累積至少 k 個最大值
  if (maxCountSoFar >= k) {
    // 第 (tail - k) 個位置是第 k 個最近出現的最大值
    // 因此子陣列起點在 [0, positions[tail-k]] 範圍內皆合法
    result += positions[tail - k] + 1;
  }
}
```

### Step 4：返回最終答案

所有合法子陣列的數量儲存在變數 `result` 中，直接回傳即可。

```typescript
return result;
```

## 時間複雜度

- 第一次掃描找全域最大值需 $O(n)$。
- 第二次掃描透過滑動視窗計算合法子陣列數量也需 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用了一個固定大小的 `positions` 陣列，長度為 $n$，空間複雜度為 $O(n)$。
- 其他變數皆為常數空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
