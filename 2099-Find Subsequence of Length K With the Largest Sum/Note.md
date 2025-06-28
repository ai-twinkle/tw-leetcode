# 2099. Find Subsequence of Length K With the Largest Sum

You are given an integer array `nums` and an integer `k`. 
You want to find a subsequence of `nums` of length `k` that has the largest sum.

Return any such subsequence as an integer array of length `k`.

A subsequence is an array that can be derived from another array by deleting some or no elements without changing the order of the remaining elements.

**Constraints:**

- `1 <= nums.length <= 1000`
- `-10^5 <= nums[i] <= 10^5`
- `1 <= k <= nums.length`

## 基礎思路

本題要求我們從給定的整數陣列 `nums` 中，選出長度為 `k` 且總和最大的子序列。子序列必須保持原有順序，因此直接排序整個陣列是不行的。

我們可以採用以下步驟來解決這個問題：

- **挑選最大值**：我們需要找出陣列中數值最大的 `k` 個元素，這些元素必定會形成總和最大的子序列。
- **保留順序**：雖然我們可以利用排序找出最大的元素，但必須注意題目要求「保持原有順序」，因此要額外紀錄元素的索引，以便最後還原原本的次序。
- **還原子序列**：取得這 `k` 個最大元素後，依照它們原本在陣列中的索引順序重新排序，再映射回元素值，即可獲得正確答案。

## 解題步驟

### Step 1：建立原始索引陣列

首先透過 `Array.from` 建立一個索引陣列，紀錄原始元素的位置。

```typescript
const n = nums.length;
// 建立索引陣列 [0, 1, 2, ..., n-1]
const indices = Array.from({ length: n }, (_, i) => i);
```

### Step 2：將索引依照對應元素值由大到小排序

將索引陣列 `indices` 根據元素值進行排序，讓最大的元素排在前面。

```typescript
// 依照 nums 中的值大小降冪排序索引
indices.sort((a, b) => nums[b] - nums[a]);
```

### Step 3：取出前 k 個索引並排序還原順序

取出排序後前 `k` 個索引，再將這些索引按原本的順序（由小到大）排序，來保持元素原始順序。

```typescript
// 取得前 k 大的索引
const topK = indices.slice(0, k);
// 還原原本的索引順序
topK.sort((a, b) => a - b);
```

### Step 4：根據索引取出原始元素值作為結果

最後透過映射將這些索引轉換回原本的元素，即為答案。

```typescript
// 映射回原始陣列 nums 的元素
return topK.map(i => nums[i]);
```

## 時間複雜度

- 建立索引陣列花費時間為 $O(n)$。
- 排序索引陣列需要花費 $O(n \log n)$。
- 取出前 `k` 個元素後排序花費為 $O(k \log k)$，但最壞情況下（$k = n$）也為 $O(n \log n)$。
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- 使用了額外的索引陣列，長度為 $n$，即 $O(n)$ 的空間。
- 使用了另一個長度為 $k$ 的陣列 `topK`，但因為 $k$ 最多為 $n$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
