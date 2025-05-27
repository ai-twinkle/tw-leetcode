# 1752. Check if Array Is Sorted and Rotated

Given an array `nums`, return `true` if the array was originally sorted in non-decreasing order, 
then rotated some number of positions (including zero). Otherwise, return `false`.

There may be duplicates in the original array.

Note: An array `A` rotated by `x` positions results in an array `B` of the same length such that 
`A[i] == B[(i+x) % A.length]`, where `%` is the modulo operation.

## 基礎思路

我們可以分解這題的思維，可以切分成以下幾個 Case:

- Case 1: 陣列長度為 1，直接回傳 `True`
- Case 2: 陣列長度大於 1，但是已經排序過，直接回傳 `True`
- Case 3: 陣列長度大於 1，且沒有排序過，我們可以透過以下步驟來判斷:
    - 用個 Flag 紀錄陣列發生 Decreasing。
    - 當發生第二次 Decreasing 時，直接回傳 `False`
    - 否則，檢查陣列最後一個元素是否小於第一個元素 (這樣就能把後半段的陣列接到前半段，形成排序過的陣列)

這樣就能獲得高效率的解法。

## 解題步驟

### Step 1: 紀錄陣列長度並檢查是否長度為 1

```typescript
const n = nums.length;

// If the array is only one element, it is sorted.
if (n === 1) {
  return true;
}
```

### Step 2: 檢查 Decreasing 順帶檢查是否排序過

```typescript
let findDecreasing = false;

for (let i = 1; i < n; i++) {
  // 如果當前元素大於前一個元素，則陣列沒有排序過。
  if (nums[i] < nums[i - 1]) {
    // 當它發生第二次時，它不能被旋轉。
    if (findDecreasing) {
      return false;
    }

    findDecreasing = true;
  }
}
```

### Step 3: 檢查是否排序過

```typescript
// 如果陣列沒有排序過，則直接回傳 True
if (!findDecreasing) {
  return true;
}
```

### Step 4: 檢查是否可以 Rotate

```typescript
// 如果陣列未被排序，且 Decreasing 只發生一次，則檢查是否可以 Rotate
// 如果最後一個元素小於第一個元素，則可以 Rotate
return nums[0] >= nums[n - 1];
```

## 時間複雜度

- 需要遍歷整個陣列，時間複雜度為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 只需要固定的常數旗標，空間複雜度為 $O(1)$。
- 總空間複雜度為 $O(1)$。

> $O(1)$
