# 898. Bitwise ORs of Subarrays

Given an integer array `arr`, return the number of distinct bitwise ORs of all the non-empty subarrays of `arr`.

The bitwise OR of a subarray is the bitwise OR of each integer in the subarray. The bitwise OR of a subarray of one integer is that integer.

A subarray is a contiguous non-empty sequence of elements within an array.

**Constraints:**

- `1 <= arr.length <= 5 * 10^4`
- `0 <= arr[i] <= 10^9`

## 基礎思路

本題要求計算陣列中所有非空連續子陣列的位元 OR 結果共有多少種不同的值。若直接窮舉每個子陣列來計算，效率會非常低。因此我們透過以下觀察來優化策略：

- 連續子陣列的位元 OR 運算具有單調性：隨著子陣列向前延伸，OR 的結果只會不變或增加位元，不可能減少。
- 對於以特定元素作為結尾的所有子陣列，從該元素開始向前 OR，若某個位置之後 OR 結果不再變動，即可提前停止。
- 藉由這個特性，每次只需往前計算到 OR 結果不再變動的位置，便能高效求解所有不同的 OR 結果。

因此，我們透過集合來記錄所有曾經出現過的不同位元 OR 結果，最終集合的大小即為答案。

## 解題步驟

### Step 1：初始化所需資料結構

首先，我們建立一個集合 `distinctBitwiseOrSet`，用來儲存所有子陣列計算出的位元 OR 結果，以確保結果的唯一性。
同時取得輸入陣列的長度：

```typescript
// 儲存所有子陣列位元 OR 的唯一結果
const distinctBitwiseOrSet = new Set<number>();
const length = arr.length;
```

### Step 2：逐一處理每個元素，計算其向前延伸的位元 OR 結果

從左到右遍歷陣列，針對每個位置：

- 將「只包含該元素」的子陣列 OR 結果加入集合中。
- 接著從該元素往前延伸，每次將新的元素加入後，若位元 OR 的結果會改變，則繼續向前延伸；若結果不再改變則終止該輪循環。

```typescript
for (let startIndex = 0; startIndex < length; startIndex++) {
  // 將當前元素自己作為子陣列的結果加入集合
  distinctBitwiseOrSet.add(arr[startIndex]);

  // 向前遍歷，直到 OR 結果不再改變或到達陣列起點
  for (
    let endIndex = startIndex - 1;
    endIndex >= 0 && (arr[startIndex] | arr[endIndex]) !== arr[endIndex];
    endIndex--
  ) {
    // 更新位置 endIndex 的 OR 結果（將當前元素 OR 上去）
    arr[endIndex] |= arr[startIndex];

    // 將新結果加入集合
    distinctBitwiseOrSet.add(arr[endIndex]);
  }
}
```

### Step 3：回傳集合大小作為最終答案

當我們處理完所有元素後，集合 `distinctBitwiseOrSet` 中就會包含所有可能的 OR 結果。
因此最終只需回傳集合的大小即可：

```typescript
return distinctBitwiseOrSet.size;
```

## 時間複雜度

- 外層迴圈遍歷陣列所有元素一次，時間為 $O(n)$。
- 內層迴圈，每次最多延伸 OR 結果的次數取決於整數位元數（最多約 30 位元），因此內層為 $O(B)$，其中 $B$ 是整數的位元數。
- 總時間複雜度為 $O(n \cdot B)$。

> $O(n \cdot B)$

## 空間複雜度

- 額外使用集合儲存所有可能的不同 OR 結果，最差情況下可能會達到 $O(n \cdot B)$ 個元素。
- 總空間複雜度為 $O(n \cdot B)$。

> $O(n \cdot B)$
