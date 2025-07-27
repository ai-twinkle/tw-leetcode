# 2210. Count Hills and Valleys in an Array

You are given a 0-indexed integer array `nums`. 
An index `i` is part of a hill in `nums` if the closest non-equal neighbors of `i` are smaller than `nums[i]`. 
Similarly, an index `i` is part of a valley in `nums` if the closest non-equal neighbors of `i` are larger than `nums[i]`. 
Adjacent indices `i` and `j` are part of the same hill or valley if `nums[i] == nums[j]`.

Note that for an index to be part of a hill or valley, it must have a non-equal neighbor on both the left and right of the index.

Return the number of hills and valleys in `nums`.

**Constraints:**

- `3 <= nums.length <= 100`
- `1 <= nums[i] <= 100`

## 基礎思路

本題的核心策略是透過先去除陣列中連續的重複數字，以簡化接下來的判斷流程。
由於題目規定一個索引要成為山峰（hill）或山谷（valley），必須滿足其最近左右兩側非相等鄰居都比自己小或大。
因此，先透過前處理方式去除相鄰重複數字，使得後續判斷時，每個數字的左右鄰居一定是非相等數字，如此便能清楚地判斷哪些索引是山峰或山谷，最後統計數量即可。

## 解題步驟

### Step 1：預處理陣列以去除相鄰重複元素

遍歷原始陣列一次，去除所有連續重複的數字，留下每個連續區域的第一個元素即可，這可使後續判斷變得簡潔明確。

```typescript
// 預處理：移除連續重複元素以提升效率與清晰度
const length = nums.length;
const filteredArray = new Uint8Array(length);
let filteredLength = 0;
let previousValue = -1;
for (let i = 0; i < length; ++i) {
  if (nums[i] !== previousValue) {
    filteredArray[filteredLength++] = nums[i];
    previousValue = nums[i];
  }
}
```

### Step 2：遍歷處理後的陣列，判斷山峰與山谷的數量

僅需遍歷去除重複後的陣列的內部元素（索引從1到`filteredLength - 2`），因為邊界元素不滿足同時有左右兩側鄰居的條件。

```typescript
let count = 0;
// 僅需檢查內部元素 (即索引 1 到 filteredLength - 2)
for (let i = 1; i < filteredLength - 1; ++i) {
  const leftNeighbor = filteredArray[i - 1];
  const rightNeighbor = filteredArray[i + 1];
  const currentValue = filteredArray[i];

  // 檢查是否符合山峰或山谷的定義（左右鄰居皆較小或皆較大）
  if (
    (currentValue > leftNeighbor && currentValue > rightNeighbor) || // 山峰
    (currentValue < leftNeighbor && currentValue < rightNeighbor)    // 山谷
  ) {
    count++;
  }
}
```

### Step 3：回傳最終的山峰與山谷數量

最後直接回傳計算完成的山峰與山谷總數即可。

```typescript
return count;
```

## 時間複雜度

- 需遍歷原始陣列一次進行預處理，時間複雜度為 $O(n)$。
- 再遍歷處理後的陣列一次進行判斷，時間複雜度亦為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用一個額外陣列`filteredArray`，最差情況與原陣列相同長度，因此空間複雜度為 $O(n)$。
- 其他輔助變數使用常數空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
