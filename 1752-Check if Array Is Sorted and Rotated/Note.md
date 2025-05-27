# 1752. Check if Array Is Sorted and Rotated

Given an array `nums`, return `true` if the array was originally sorted in non-decreasing order, 
then rotated some number of positions (including zero). Otherwise, return `false`.

There may be duplicates in the original array.

Note: An array `A` rotated by `x` positions results in an array `B` of the same length such that 
`A[i] == B[(i+x) % A.length]`, where `%` is the modulo operation.

**Constraints:**

- `1 <= nums.length <= 100`
- `1 <= nums[i] <= 100`

## 基礎思路

題目要求判斷一個陣列是否原本是非遞減排序（允許重複）後經過旋轉，這裡的「旋轉」指的是將前面一段元素移到最後，其餘順序不變。

在解題前，我們要明確拆解什麼情形下，陣列能被視為「排序後旋轉」：

- 完全排序情形：如果整個陣列本身已經是非遞減排序（完全沒旋轉或旋轉次數剛好等於陣列長度），當然成立。
- 旋轉一次的情形：如果在整個陣列中，只發生了一次「降序」（`nums[i] < nums[i-1]`）的位置，那麼將降序點「切開」並將兩段拼接，就可以得到一個排序好的陣列。
               換句話說，除了該降序點，其他地方都應該保持非遞減。 
- 出現多次降序：只要降序位置超過一次，無論怎麼旋轉都不可能還原成非遞減排序，直接回傳 false。

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
