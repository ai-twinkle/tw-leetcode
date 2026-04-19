# 1855. Maximum Distance Between a Pair of Values

You are given two non-increasing 0-indexed integer arrays `nums1` and `nums2`.

A pair of indices `(i, j)`, where `0 <= i < nums1.length` and `0 <= j < nums2.length`, 
is valid if both `i <= j` and `nums1[i] <= nums2[j]`. 
The distance of the pair is `j - i`.

Return the maximum distance of any valid pair `(i, j)`. 
If there are no valid pairs, return `0`.

An array arr is non-increasing if `arr[i-1] >= arr[i]` for every `1 <= i < arr.length`.

**Constraints:**

- `1 <= nums1.length, nums2.length <= 10^5`
- `1 <= nums1[i], nums2[j] <= 10^5`
- Both `nums1` and `nums2` are non-increasing.

## 基礎思路

本題要求在兩個非遞增陣列中，找出滿足條件 `i <= j` 且 `nums1[i] <= nums2[j]` 的合法配對，並回傳最大距離 `j - i`。

在思考解法時，可掌握以下核心觀察：

- **兩個陣列皆非遞增**：
  對於固定的 `i`，隨著 `j` 增大，`nums2[j]` 只會越來越小；而要使 `nums1[i] <= nums2[j]` 成立，越靠右的 `j` 越難滿足條件。
  這意味著對每個 `i` 而言，合法的 `j` 存在一個上界，超過後就不再成立。

- **最大距離偏好較小的 `i`**：
  距離 `j - i` 要最大，希望 `i` 盡量小；而 `i` 越小，`nums1[i]` 越大（非遞增），對應的 `nums2[j]` 也需要更大，因此合法的 `j` 範圍更受限。
  這使得對每個 `i` 直接暴力搜尋 `j` 的代價過高。

- **二分搜尋加速定位右端界**：
  對固定的 `i`，在 `nums2` 中尋找最右邊仍滿足 `nums1[i] <= nums2[j]` 且 `j >= i` 的位置，等同於在一段非遞增序列中尋找邊界，可以使用二分搜尋完成。

- **問題轉換為在 `nums2` 中找最遠合法位置**：
  對每個合法的起點 `i`，在 `nums2[i..n-1]` 中找最右邊滿足 `nums2[j] >= nums1[i]` 的 `j`，即為該 `i` 所能達到的最大距離。

依據以上特性，可以採用以下策略：

- **對每個 `i`，在 `nums2` 中以二分搜尋找出最右邊仍滿足條件的 `j`**，搜尋範圍限定在 `[i, nums2.length - 1]`。
- **維護全域最大距離**，逐一比較每個 `i` 對應的最佳距離並取最大值。
- 若某個 `i` 在 `nums2[i]` 處已不滿足條件，則該 `i` 無任何合法配對，直接跳過。

此策略能將每個 `i` 的查詢從線性降至對數時間，整體效率大幅提升。

## 解題步驟

### Step 1：初始化維度資訊與最大距離累積變數

記錄兩個陣列的長度以便後續使用，並初始化用來追蹤全域最大距離的變數。

```typescript
const length1 = nums1.length;
const length2 = nums2.length;
let maximumDistance = 0;
```

### Step 2：對每個起點 `i` 以二分搜尋找最遠合法 `j`

對 `nums1` 中的每個索引 `i`，在 `nums2` 的範圍 `[i, length2 - 1]` 中進行二分搜尋，尋找最右邊仍滿足 `nums2[j] >= nums1[i]` 的位置。
搜尋區間左端初始為 `i`（確保 `i <= j`），右端為 `nums2` 的最後一個索引。

```typescript
for (let i = 0; i < length1; i++) {
  let left = i;
  let right = length2 - 1;

  // ...
}
```

### Step 3：以二分搜尋縮小範圍，找出最右合法 `j`

在每一輪中計算中間點 `mid`：
若 `nums2[mid] >= nums1[i]`，代表 `mid` 是一個合法位置，嘗試繼續往右找更大的距離，將左端移至 `mid + 1`；
否則，右端收縮至 `mid - 1`，排除不合法的右半段。

```typescript
for (let i = 0; i < length1; i++) {
  // Step 2：初始化二分搜尋區間

  while (left <= right) {
    const mid = (left + right) >> 1;

    if (nums2[mid] >= nums1[i]) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  // ...
}
```

### Step 4：計算此輪的最佳距離並更新全域最大值

二分搜尋結束後，`right` 指向最右邊仍合法的位置（若 `right >= i` 則存在合法配對）。
計算距離 `right - i`，若大於目前最大值則更新。

```typescript
for (let i = 0; i < length1; i++) {
  // Step 2：初始化二分搜尋區間

  // Step 3：二分搜尋找出最右合法 j

  const distance = right - i;
  if (distance > maximumDistance) {
    maximumDistance = distance;
  }
}
```

### Step 5：回傳最終的最大距離

所有起點都處理完後，回傳累積的最大距離。若從未有合法配對，初始值 `0` 即為正確答案。

```typescript
return maximumDistance;
```

## 時間複雜度

- 外層迴圈對 `nums1` 的每個索引執行一次，共 $m$ 次（`m = nums1.length`）；
- 每次二分搜尋在長度至多為 $n$ 的 `nums2` 中執行，耗時 $O(\log n)$（`n = nums2.length`）；
- 總時間複雜度為 $O(m \log n)$。

> $O(m \log n)$

## 空間複雜度

- 僅使用固定數量的輔助變數；
- 無任何額外陣列或動態空間配置。
- 總空間複雜度為 $O(1)$。

> $O(1)$
