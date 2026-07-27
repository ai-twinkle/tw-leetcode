# 1464. Maximum Product of Two Elements in an Array

Given the array of integers `nums`, 
you will choose two different indices `i` and `j` of that array. 
Return the maximum value of `(nums[i]-1)*(nums[j]-1)`.

**Constraints:**

- `2 <= nums.length <= 500`
- `1 <= nums[i] <= 10^3`

## 基礎思路

本題要求從陣列中選出兩個不同索引的元素，使得 `(nums[i]-1)*(nums[j]-1)` 的乘積最大。由於每個數字都會先減去 1，且題目保證所有數值皆為正整數，因此減 1 後的結果仍為非負數。

在思考解法時，可掌握以下核心觀察：

- **乘積最大化取決於最大的兩個值**：
  由於所有元素減 1 後皆為非負數，乘積要達到最大，只需選出整體最大與次大的兩個數即可，無須考慮負數相乘反轉正負的情況。

- **無須完整排序**：
  若僅為了取得前兩大的值而對整個陣列排序，將付出多餘的成本；實際上只需在一次遍歷中持續維護目前的最大與次大值即可。

- **維護兩個候選值的更新邏輯**：
  遍歷每個元素時，若當前值超過最大值，則原最大值退位為次大值，並更新最大值；否則若當前值僅超過次大值，則只更新次大值。

依據以上特性，可以採用以下策略：

- **以單次遍歷維護最大值與次大值**，避免任何排序開銷。
- **遍歷結束後，直接以兩個候選值套入公式計算結果**。

此策略能在線性時間內完成，簡潔且高效。

## 解題步驟

### Step 1：初始化最大值與次大值

使用兩個變數分別記錄目前所見過的最大值與次大值，初始皆設為 0（因減 1 後最小為 0，此初始值安全）。

```typescript
// 追蹤目前為止所見過的最大值與次大值
let largest = 0;
let secondLargest = 0;

const length = nums.length;
```

### Step 2：單次遍歷維護前兩大的值

透過一次遍歷處理每個元素：
若當前值大於最大值，則原最大值退位為次大值，並更新最大值；
否則若當前值僅大於次大值，則只更新次大值。

```typescript
// 單次遍歷僅保留前兩大的值，避免任何排序開銷
for (let index = 0; index < length; index++) {
  const current = nums[index];

  if (current > largest) {
    secondLargest = largest;
    largest = current;
  } else if (current > secondLargest) {
    secondLargest = current;
  }
}
```

### Step 3：依公式計算並回傳結果

遍歷完成後，將最大值與次大值各自減 1 後相乘，即為所求的最大乘積。

```typescript
return (largest - 1) * (secondLargest - 1);
```

## 時間複雜度

- 僅需單次遍歷整個陣列，逐一比較並更新候選值；
- 每次操作皆為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的變數儲存最大值與次大值；
- 無任何額外陣列或動態空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
