# 3740. Minimum Distance Between Three Equal Elements I

You are given an integer array `nums`.

A tuple `(i, j, k)` of 3 distinct indices is good if `nums[i] == nums[j] == nums[k]`.

The distance of a good tuple is `abs(i - j) + abs(j - k) + abs(k - i)`, 
where `abs(x)` denotes the absolute value of `x.`

Return an integer denoting the minimum possible distance of a good tuple. 
If no good tuples exist, return `-1`.

**Constraints:**

- `1 <= n == nums.length <= 100`
- `1 <= nums[i] <= n`

## 基礎思路

本題要求在整數陣列中找出三個相同值的索引組合，使得這三個索引之間的絕對距離總和最小。距離定義為 `abs(i - j) + abs(j - k) + abs(k - i)`，若不存在符合條件的組合則回傳 `-1`。

在思考解法時，可掌握以下核心觀察：

- **距離公式可化簡**：
  對於三個已排序的索引 `a ≤ b ≤ c`，距離公式 `abs(a - b) + abs(b - c) + abs(a - c)` 恆等於 `2 * (c - a)`，中間索引 `b` 不影響結果，因此只需關注最小與最大索引的差距。

- **相同值的索引天然有序**：
  若依照遍歷順序蒐集索引，同一個值的所有索引本身即為遞增序列，不需額外排序。

- **最佳三元組必為連續三個索引**：
  在有序索引序列中，跨越越多索引，首尾差距只會更大；因此最小距離必然來自相鄰的三個索引組合。

- **值域有界可直接對應陣列**：
  題目限制值域在 `[1, n]` 之間，可以使用固定大小的陣列作為分組容器，避免雜湊表的額外開銷。

依據以上特性，可以採用以下策略：

- **以單次遍歷將每個索引歸入對應值的分組**，建立各值的有序索引清單。
- **對每個擁有至少三個索引的分組，以滑動視窗枚舉所有連續三元組**，計算 `2 * (最大索引 - 最小索引)`。
- **全域追蹤目前最小距離**，最終回傳結果。

此策略只需一次線性掃描建表，再以滑動視窗線性掃描各分組，整體效率遠優於暴力枚舉所有三元組。

## 解題步驟

### Step 1：初始化索引分組容器

由於值域限制在 `[1, n]`，可以直接用長度為 `n + 1` 的陣列作為分組容器，索引即為值本身，避免額外的映射結構。

```typescript
const length = nums.length;

// 依照值分組索引；值域在 [1, n] 之間，使用固定大小的陣列
const indexGroups: number[][] = new Array(length + 1);
```

### Step 2：單次遍歷將每個位置歸入對應分組

遍歷整個陣列，將每個位置依照其值附加到對應的索引清單中；
由於遍歷本身由小到大，同一分組內的索引自然保持遞增順序，無需額外排序。

```typescript
// 單次遍歷：將每個位置加入對應值的索引清單
for (let position = 0; position < length; position++) {
  const value = nums[position];

  if (indexGroups[value] === undefined) {
    indexGroups[value] = [];
  }

  indexGroups[value].push(position);
}
```

### Step 3：初始化全域最小距離

在開始枚舉之前，先將最小距離設為 `-1`，作為「尚未找到任何有效三元組」的哨兵值。

```typescript
let minimumDist = -1;
```

### Step 4：對每個有效分組以滑動視窗枚舉連續三元組並計算距離

只有索引數量達到三個以上的分組才可能構成合法三元組，其餘分組直接略過；
對於符合條件的分組，使用滑動視窗枚舉所有連續三個索引的組合，根據化簡後的距離公式 `2 * (最大索引 - 最小索引)` 計算距離，並更新全域最小值。

```typescript
// 對每個擁有至少 3 個索引的值，以 3 元素滑動視窗進行枚舉
for (let value = 1; value <= length; value++) {
  const indices = indexGroups[value];

  if (indices === undefined || indices.length < 3) {
    continue;
  }

  const groupSize = indices.length;

  // 每組連續三元組 (t, t+1, t+2) 的距離為 2*(indices[t+2] - indices[t])
  for (let windowStart = 0; windowStart + 2 < groupSize; windowStart++) {
    const distance = 2 * (indices[windowStart + 2] - indices[windowStart]);

    if (minimumDist === -1 || distance < minimumDist) {
      minimumDist = distance;
    }
  }
}
```

### Step 5：回傳最終結果

所有分組枚舉完畢後，`minimumDist` 若仍為 `-1` 表示整個陣列中不存在任何合法三元組，否則即為所求的最小距離。

```typescript
return minimumDist;
```

## 時間複雜度

- 建立索引分組需一次線性遍歷，耗時 $O(n)$；
- 枚舉所有分組的連續三元組，所有分組的索引總數之和等於 $n$，滑動視窗遍歷總耗時亦為 $O(n)$；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 索引分組容器的大小為 $O(n)$，各分組儲存的索引總數亦為 $O(n)$；
- 總空間複雜度為 $O(n)$。

> $O(n)$
