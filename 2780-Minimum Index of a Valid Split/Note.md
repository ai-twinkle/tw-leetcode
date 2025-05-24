# 2780. Minimum Index of a Valid Split

An element `x` of an integer array `arr` of length `m` is dominant if more than half the elements of `arr` have a value of `x`.

You are given a 0-indexed integer array `nums` of length `n` with one dominant element.

You can split nums at an index i into two arrays `nums[0, ..., i]` and `nums[i + 1, ..., n - 1]`, 
but the split is only valid if:

- `0 <= i < n - 1`
- `nums[0, ..., i]`, and `nums[i + 1, ..., n - 1]` have the same dominant element.

Here, `nums[i, ..., j]` denotes the subarray of `nums` starting at index `i` and ending at index `j`, 
both ends being inclusive. Particularly, if `j < i` then `nums[i, ..., j]` denotes an empty subarray.

Return the minimum index of a valid split. If no valid split exists, return `-1`.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^9`
- `nums` has exactly one dominant element.

## 基礎思路

本題給定一個整數陣列，並保證該陣列存在一個**主導元素**（dominant element），即該元素的出現次數**超過陣列長度的一半**。
我們必須找到一個最小的有效分割點，將陣列切分成兩個子陣列（前綴與後綴），使兩個子陣列都擁有相同的主導元素。

在看到這個問題時，我們會直覺地想到：

- 如果能夠快速地知道主導元素「從陣列起點到任意位置」的累計出現次數，將有助於我們高效檢驗每個可能分割點的有效性。
  這時候自然聯想到使用 **前綴和（prefixSum）** 來優化計算效率。

為了找到最小的有效分割點，我們可採用以下兩個步驟：

1. **利用 Boyer-Moore 多數投票法找出主導元素**  
   因為題目已保證主導元素一定存在（次數超過一半），Boyer-Moore 多數投票法可在 $O(n)$ 時間內高效地找到該元素。

2. **透過前綴和（prefixSum）快速驗證每個可能的分割點**  
   預先計算主導元素在每個前綴區間內的累計出現次數，這樣我們就能以 $O(1)$ 的時間，高效地檢查每個分割點前後兩側是否皆符合主導條件（即出現次數超過子陣列的一半）。

> Tips：
> **前綴和（prefixSum）** 通常用於快速計算陣列中特定區段內的累計資料，例如總和、出現次數等等。
> - 使用 prefixSum 後，我們無需重複遍歷即可迅速取得任意區間內的累計次數或總和，時間複雜度僅需 $O(1)$；
> - 本題的核心需求正是要快速判斷任一分割點兩側區間內主導元素的出現次數，因此 prefixSum 特別適合用來解決此問題。

## 解題步驟

### Step 1：利用 Boyer-Moore 多數投票法找出主導元素

**Boyer-Moore 多數投票法**的核心概念為：

- 初始化候選元素（`candidate`）和計數器（`count`）。
- 遍歷陣列時：
    - 若計數器為 0，表示目前無主導元素，將候選元素更新為當前數字。
    - 若目前元素等於候選元素，則計數器加 1；反之則減 1。
- 因為題目已保證有主導元素，遍歷完成後的候選元素即為正確答案。

```typescript
let candidate = nums[0]; // 預設第一個元素為候選
let count = 0;

for (const num of nums) {
  if (count === 0) {      // 若沒有候選元素，則更新為當前元素
    candidate = num;
  }
  count += (num === candidate ? 1 : -1); // 更新計數
}
```

### Step 2：計算主導元素的總出現次數

取得候選主導元素後，再次遍歷陣列，計算該元素的總出現次數。  
後續步驟會用到這個數據來判斷各個分割點是否有效。

```typescript
const totalCount = nums.reduce((acc, num) => num === candidate ? acc + 1 : acc, 0);
const n = nums.length;
```

### Step 3：檢查各分割點的有效性

遍歷每個合法的分割點（範圍為 `0 ≤ i < n-1`），並且：

- 計算前綴（0 至 i）中候選主導元素的出現次數。
- 推算後綴（i+1 至 n-1）中候選主導元素的出現次數（透過總出現次數扣除前綴）。
- 驗證兩側是否皆符合主導條件：
    - 前綴：`prefixCount > (i + 1) / 2`
    - 後綴：`(totalCount - prefixCount) > (n - i - 1) / 2`

```typescript
let prefixCount = 0;

for (let i = 0; i < n - 1; i++) {
  if (nums[i] === candidate) {
    prefixCount++; // 更新前綴主導元素出現次數
  }

  // 若前綴與後綴皆滿足主導條件，即為有效分割點
  if (prefixCount > (i + 1) / 2 && (totalCount - prefixCount) > (n - i - 1) / 2) {
    return i; // 返回最小有效分割點
  }
}
```

### Step 4：若無有效分割點，返回 -1

若遍歷完仍無法找到有效的分割點，返回 -1：

```typescript
return -1;
```

## 時間複雜度

- **找主導元素**：遍歷一次陣列，$O(n)$
- **計算總出現次數**：再遍歷一次陣列，$O(n)$
- **遍歷分割點**：再次遍歷一次陣列，$O(n)$
- 總時間複雜度為 $O(n)$

> $O(n)$

## 空間複雜度

- 僅使用常數個輔助變數（候選元素、計數器），不使用額外的資料結構，因此空間複雜度為：
- 總空間複雜度為 $O(1)$

> $O(1)$
