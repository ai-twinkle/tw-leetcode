# 2419. Longest Subarray With Maximum Bitwise AND

You are given an integer array `nums` of size `n`.

Consider a non-empty subarray from `nums` that has the maximum possible bitwise AND.

- In other words, let `k` be the maximum value of the bitwise AND of any subarray of `nums`. 
  Then, only subarrays with a bitwise AND equal to k should be considered.

Return the length of the longest such subarray.

The bitwise AND of an array is the bitwise AND of all the numbers in it.

A subarray is a contiguous sequence of elements within an array.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^6`

## 基礎思路

要找到 bitwise AND 最大的子陣列，需先掌握 bitwise AND 的特性：

- 對任一子陣列，其 bitwise AND 的結果必然小於或等於此子陣列中的最小元素，且絕不會超過此子陣列中的最大元素。
- 為了達到整個陣列中最大的 bitwise AND，必須讓子陣列中所有元素的值完全相同且為陣列中的最大值。

因此，我們的策略是：

- **第一步**：先掃描陣列，找到整個陣列中的最大元素。
- **第二步**：再次掃描陣列，找到最長的一段連續元素，其值皆等於第一步找到的最大值。這段子陣列即為題目所求，返回其長度即可。

## 解題步驟

### Step 1：找到整個陣列中的最大值

先初始化一個變數儲存最大值，遍歷陣列中的每個元素，持續更新並確定找到最大值。

```typescript
// 1. 找到 nums 中的最大值
let maximumValue = -1;
for (let i = 0; i < nums.length; ++i) {
  if (nums[i] > maximumValue) {
    maximumValue = nums[i];
  }
}
```
### Step 2：找出最長連續子陣列，其值皆等於最大值

利用兩個變數追蹤當前連續子陣列的長度與最長紀錄，遍歷整個陣列：

- 每當元素值與最大值相同時，當前連續子陣列長度增加 1，並比較是否超過歷史最長。
- 當元素與最大值不同時，表示連續區段中斷，當前長度重置為 0。

```typescript
// 2. 找出值為 maximumValue 的最長連續子陣列長度
let longestLength = 0; // 歷史最長長度
let currentLength = 0; // 目前連續區段的長度

for (let i = 0; i < nums.length; ++i) {
  if (nums[i] === maximumValue) {
    // 若當前元素等於最大值，則當前區段長度增加
    currentLength += 1;
    // 更新歷史最長長度（若有更長）
    if (currentLength > longestLength) {
      longestLength = currentLength;
    }
  } else {
    // 若元素不等於最大值，重置當前區段長度
    currentLength = 0;
  }
}
```

### Step 3：返回最長連續子陣列的長度

```typescript
return longestLength;
```
## 時間複雜度

- 遍歷陣列找最大值為 $O(n)$，遍歷找最長區段亦為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的輔助變數 (`maximumValue`, `longestLength`, `currentLength`)。
- 總空間複雜度為 $O(1)$。

> $O(1)$
