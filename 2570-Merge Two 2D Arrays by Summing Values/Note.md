# 2570. Merge Two 2D Arrays by Summing Values

You are given two 2D integer arrays `nums1` and `nums2`.

- `nums1[i] = [id_i, val_i]` indicate that the number with the id `id_i` has a value equal to `val_i`.
- `nums2[i] = [id_i, val_i]` indicate that the number with the id `id_i` has a value equal to `val_i`.

Each array contains unique ids and is sorted in ascending order by id.

Merge the two arrays into one array that is sorted in ascending order by id, respecting the following conditions:

- Only ids that appear in at least one of the two arrays should be included in the resulting array.
- Each id should be included only once and its value should be the sum of the values of this id in the two arrays. 
  If the id does not exist in one of the two arrays, then assume its value in that array to be `0`.

Return the resulting array. The returned array must be sorted in ascending order by id.


## 基礎思路

我們可以用兩個指針來追蹤當前處理的位置，然後分成三種情況來處理：

- 如果數字 nums1 的 id 小於 nums2 的 id，則將 nums1 的數字加入結果中，並將 nums1 的指針向前移動。
- 同理，如果 nums2 的 id 小於 nums1 的 id，則將 nums2 的數字加入結果中，並將 nums2 的指針向前移動。
- 如果 nums1 和 nums2 的 id 相等，則將兩個數字相加，並將結果加入結果中，然後將兩個指針向前移動。

為了進一步減少判定時間，當其中一個指針到達結尾時，我們可以直接將另一個數組的剩餘部分加入結果中。

## 解題步驟

### Step 1: 初始化指針和結果

我們可以初始化兩個指針 `i` 和 `j` 來追蹤當前處理的位置，以及一個 index 來追蹤結果的位置。
同時，我們可以初始化一個結果數組，其大小為兩個數組的大小之和 (最大可能的大小)。

```typescript
let i = 0;
let j = 0;
let index = 0;
const result = new Array(nums1.length + nums2.length);
```

### Step 2: 遍歷兩個數組

我們可以遍歷兩個數組，並根據上面的基礎思路來處理。

```typescript
while (i < nums1.length && j < nums2.length) {
  if (nums1[i][0] < nums2[j][0]) {
    // 如果 nums1 的 id 小於 nums2 的 id，
    // 則將 nums1 的數字加入結果中，並將 nums1 的指針向前移動。
    result[index] = nums1[i];
    index++;
    i++;
    continue;
  }

  if (nums1[i][0] > nums2[j][0]) {
    // 如果 nums2 的 id 小於 nums1 的 id，
    // 則將 nums2 的數字加入結果中，並將 nums2 的指針向前移動。
    result[index] = nums2[j];
    index++;
    j++;
    continue;
  }

  // 如果 nums1 和 nums2 的 id 相等，
  // 則將兩個數字相加，並將結果加入結果中，然後將兩個指針向前移動。
  result[index] = [nums1[i][0], nums1[i][1] + nums2[j][1]];
  index++;
  i++;
  j++;
}
```

### Step 3: 將剩餘部分加入結果

當其中一個指針到達結尾時，我們可以直接將另一個數組的剩餘部分加入結果中。

```typescript
while (i < nums1.length) {
  result[index] = nums1[i];
  index++;
  i++;
}
while (j < nums2.length) {
  result[index] = nums2[j];
  index++;
  j++;
}
```

### Step 4: 返回結果

最後，我們可以將結果數組的長度調整為 index，然後返回結果。

```typescript
result.length = index;
return result;
```

## 時間複雜度

- 在執行遍歷兩個數組時，最壞的情況下，我們需要遍歷兩個數組的所有元素，因此時間複雜度為 $O(n + m)$。
- 在填充剩餘部分時，我們需要遍歷剩餘部分的所有元素，因此時間複雜度為 $O(n)$ 或 $O(m)$。
- 總時間複雜度為 $O(n + m)$。

> $O(n + m)$

## 空間複雜度

- 我們需要一個結果數組來存儲結果，其最大可能的大小為兩個數組的大小之和，因此空間複雜度為 $O(n + m)$。
- 其餘變量的空間複雜度為 $O(1)$。
- 總空間複雜度為 $O(n + m)$。

> $O(n + m)$
