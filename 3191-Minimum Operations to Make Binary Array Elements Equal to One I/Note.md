# 3191. Minimum Operations to Make Binary Array Elements Equal to One I

You are given a binary array `nums`.

You can do the following operation on the array any number of times (possibly zero):

- Choose any 3 consecutive elements from the array and flip all of them.

Flipping an element means changing its value from 0 to 1, and from 1 to 0.

Return the minimum number of operations required to make all elements in `nums` equal to 1. 
If it is impossible, return -1.

**Constraints:**

- `3 <= nums.length <= 10^5`
- `0 <= nums[i] <= 1`

## 基礎思路

我們從左邊開始，一個一個往右看，看到是 0 就直接翻它跟它後面兩個元素，因為如果不在這裡翻的話，之後就再也沒有機會回頭處理這個位置的 0。
因此，每次遇到 0 就立即翻轉，是唯一能確保不遺漏任何 0 的方式，這樣能保證找到的翻轉次數一定是最少的。

每翻一次就記一下次數，繼續往後看，直到倒數第三個元素為止。

最後檢查一下，後面兩個元素是不是都變成 1 了：

- 如果是，就回傳翻的次數。
- 如果還有 0 存在，那代表沒辦法翻成全部都是 1，就回傳 `-1`。

## 解題步驟

### Step 1: 模擬翻轉

從左邊開始，一個一個往右看，看到是 0 就直接翻它跟它後面兩個元素。

```typescript
let count = 0;

for (let i = 0; i < nums.length - 2; i++) {
  if (nums[i] === 0) {
    // 當前元素是 0 時，我們需要翻轉這三個元素
    nums[i] = 1;
    nums[i + 1] = nums[i + 1] === 0 ? 1 : 0;
    nums[i + 2] = nums[i + 2] === 0 ? 1 : 0;

    // 增加翻轉次數
    count++;
  }
}
```

### Step 2: 檢查最後兩個元素

檢查最後兩個元素是不是都變成 1 了：
- 如果是，就回傳翻的次數。
- 如果還有 0 存在，那代表沒辦法翻成全部都是 1，就回傳 `-1`。

```typescript
if (nums[nums.length - 1] === 1 && nums[nums.length - 2] === 1) {
  // 當最後兩個元素都是 1 時，代表我們已經滿足條件
  return count;
}

// 反之，代表無法翻轉成全部都是 1
return -1;
```

## 時間複雜度

- 我們需要遍歷一次 `nums`，從 0 到 `nums.length - 2`。其時間複雜度為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 我們僅使用常數紀錄翻轉次數，因此空間複雜度為 $O(1)$。
- 總空間複雜度為 $O(1)$。

> $O(1)$
