# 2616. Minimize the Maximum Difference of Pairs

You are given a 0-indexed integer array `nums` and an integer `p`. 
Find `p` pairs of indices of `nums` such that the maximum difference amongst all the pairs is minimized. 
Also, ensure no index appears more than once amongst the p pairs.

Note that for a pair of elements at the index `i` and `j`, the difference of this pair is `|nums[i] - nums[j]|`, 
where `|x|` represents the absolute value of `x`.

Return the minimum maximum difference among all `p` pairs. 
We define the maximum of an empty set to be zero.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `0 <= nums[i] <= 10^9`
- `0 <= p <= (nums.length)/2`

## 基礎思路

本題目核心要求從數列中選出指定數量的配對，使得這些配對之間的最大差值最小化。我們首先觀察：

1. 將數列排序後，差值最小的配對必然出現在相鄰元素之間。
2. 若我們假設最大允許差值的上限為某個值，則可以貪婪地從排序後的數列由小到大地進行配對，若滿足差值限制，立即配對且跳過後面的元素，以此方式能快速計算出可形成多少對。
3. 基於上述貪婪策略，可以透過二分搜尋高效地找到最小可能的最大差值。

因此，我們可以利用以下的步驟來解決問題：

- 先排序數列。
- 二分搜尋最大允許差值，並利用貪婪策略驗證差值是否可行。
- 最終二分搜尋完成後的下限即為所求答案。

## 解題步驟

### Step 1：處理邊界條件與排序數列

- 若配對數量為零或數列長度不足直接回傳 `0`。
- 複製數列並以數值排序，方便後續貪婪策略。

```typescript
const length = nums.length;
if (p === 0 || length < 2) {
  return 0;
}

// 1. 使用 Typed-array 複製並進行原生數值排序
const sortedNums = Uint32Array.from(nums);
sortedNums.sort();
```

### Step 2：預先計算排序後的相鄰元素差值

- 將排序後的差值提前計算並儲存，加速後續的判斷步驟。

```typescript
// 2. 預先計算相鄰差值一次
const nMinusOne = length - 1;
const diffs = new Uint32Array(nMinusOne);
for (let i = 0; i < nMinusOne; i++) {
  diffs[i] = sortedNums[i + 1] - sortedNums[i];
}
```

### Step 3：利用二分搜尋找出最小最大差值

- 持續透過貪婪配對策略縮小搜尋範圍。
- 若貪婪策略在差值限制下可行（可配出足夠數量），則縮小最大上限；否則提升下限。

```typescript
// 3. 在 [0 .. 最大值−最小值] 範圍內進行二分搜尋
let lowerBound = 0;
let upperBound = sortedNums[length - 1] - sortedNums[0];

while (lowerBound < upperBound) {
  const middle = (lowerBound + upperBound) >>> 1;

  // 3.1 貪婪地計算差值 ≤ middle 的配對數
  let count = 0;
  for (let i = 0; i < nMinusOne && count < p; ) {
    if (diffs[i] <= middle) {
      count++;
      i += 2;
    } else {
      i += 1;
    }
  }

  // 3.2 根據計算結果調整二分範圍
  if (count >= p) {
    upperBound = middle;
  } else {
    lowerBound = middle + 1;
  }
}
```

### Step 4：回傳最終結果

- 二分搜尋完成後，下界即為符合條件的最小最大差值。

```typescript
// 4. 回傳下界作為結果
return lowerBound;
```

## 時間複雜度

- 排序步驟：$O(n \log n)$
- 預先計算差值：$O(n)$
- 二分搜尋（含貪婪策略檢查）：$O(n \log(\max(nums)-\min(nums)))$，一般情況可簡化成 $O(n \log n)$
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- 儲存排序後的數列與差值陣列，空間需求為 $O(n)$
- 使用少量固定額外變數，$O(1)$
- 總空間複雜度為 $O(n)$。

> $O(n)$
