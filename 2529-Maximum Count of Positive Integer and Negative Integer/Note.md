# 2529. Maximum Count of Positive Integer and Negative Integer

Given an array `nums` sorted in non-decreasing order, 
return the maximum between the number of positive integers and the number of negative integers.

- In other words, if the number of positive integers in `nums` is `pos` and the number of negative integers is `neg`, 
  then return the maximum of `pos` and `neg`.

Note that `0` is neither positive nor negative.

**Constraints:**

- `1 <= nums.length <= 2000`
- `-2000 <= nums[i] <= 2000`
- `nums` is sorted in a non-decreasing order.

## 基礎思路

這題最簡單方法是用兩個變數分別記錄正數和負數的個數，然後返回兩者中的最大值。
然而這個方法的時間複雜度是 $O(n)$，回過頭來看這個題目，我們可以發現這個陣列是有序的，所以我們可以用二分法來解這個問題。

我們實際只要找到最後一個 Negative Number 的位置，以及第一個 Positive Number 的位置，就能有效的計算出正數和負數的個數。
這就可以利用二元搜尋法來找到這兩個位置，進一步降低時間複雜度到 $O(\log n)$。

## 解題步驟

### Step 1: 紀錄陣列的長度

```typescript
const n = nums.length;
```

### Step 2: 二元搜尋法找到最後一個 Negative Number 的位置

我們先初始化 low 與 high 指標，分別指向陣列的頭尾，然後進行二元搜尋法，直到找到最後一個 Negative Number 的位置。

```typescript
let low = 0, high = n - 1; //從頭尾開始
let firstNonNegative = n;
while (low <= high) {
  const mid = Math.floor((low + high) / 2);
  if (nums[mid] >= 0) {
    firstNonNegative = mid;
    high = mid - 1;
  } else {
    low = mid + 1;
  }
}
```

### Step 3: 二元搜尋法找到第一個 Positive Number 的位置

同樣的，我們重置 low 到最後一個 Negative Number 的位置，並重置 high 到陣列的尾端，然後進行二元搜尋法，直到找到第一個 Positive Number 的位置。

```typescript
low = firstNonNegative; // 我們不需要再從頭開始，因為已經確認在這之前都是負數
high = n - 1;           // 移動 high 到陣列的尾端
let firstPositive = n;
while (low <= high) {
  const mid = Math.floor((low + high) / 2);
  if (nums[mid] > 0) {
    firstPositive = mid;
    high = mid - 1;
  } else {
    low = mid + 1;
  }
}
```

### Step 4: 計算正數和負數的個數

最後我們可以計算出正數和負數的個數。

```typescript
const negativeCount = firstNonNegative;
const positiveCount = n - firstPositive;
```

### Step 5: 返回正數和負數的最大值

```typescript
return Math.max(negativeCount, positiveCount);
```


## 時間複雜度

- 我們使用二元搜尋法來找到最後一個 Negative Number 的位置，以及第一個 Positive Number 的位置，所以時間複雜度是 $O(\log n)$。
- 總時間複雜度是 $O(\log n)$。

> $O(\log n)$

## 空間複雜度

- 我們只使用了固定的變數，所以空間複雜度是 $O(1)$。
- 總空間複雜度是 $O(1)$。

> $O(1)$
