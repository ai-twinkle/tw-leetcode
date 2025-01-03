# 2270. Number of Ways to Split Array

You are given a 0-indexed integer array nums of length n.
nums contains a valid split at index i if the following are true:

* The sum of the first i + 1 elements is greater than or equal to the sum of the last n - i - 1 elements.
* There is at least one element to the right of i. That is, 0 <= i < n - 1.
  
Return the number of valid splits in nums.

## 基礎思路
利用前綴和與後綴和的概念，我們可以計算出每個位置的前綴和與後綴和。只要前綴和大於等於後綴和，就可以計為一個有效的分割。

## 解題步驟

### Step 1: 初始化前綴和與後綴和

```ts
const prefixSum = new Array(nums.length + 1).fill(0);
const postfixSum = new Array(nums.length + 1).fill(0);
```

### Step 2: 計算前綴和與後綴和

```ts
for (let i = 1; i <= nums.length; i++) {
  prefixSum[i] = prefixSum[i - 1] + nums[i - 1];
  postfixSum[nums.length - i] = postfixSum[nums.length - i + 1] + nums[nums.length - i];
}
```

### Step 3: 計算有效分割

```ts
let validSplits = 0;
for (let i = 1; i < nums.length; i++) {
  if (prefixSum[i] >= postfixSum[i]) {
    validSplits++;
  }
}
```

## 時間複雜度
由於 nums 的長度為 n，所以時間複雜度為 O(n)。

## 空間複雜度
由於我們需要兩個暫存來記錄前綴和與後綴和，所以空間複雜度為 O(n)。