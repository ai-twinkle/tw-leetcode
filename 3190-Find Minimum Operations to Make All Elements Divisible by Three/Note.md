# 3190. Find Minimum Operations to Make All Elements Divisible by Three

You are given an integer array `nums`. 
In one operation, you can add or subtract 1 from any element of `nums`.

Return the minimum number of operations to make all elements of `nums` divisible by 3.

**Constraints:**

- `1 <= nums.length <= 50`
- `1 <= nums[i] <= 50`

## 基礎思路

本題要求讓陣列 `nums` 中的所有元素都能被 3 整除，而每次操作允許對任一元素加 1 或減 1。
要判斷每個元素需要幾次操作，使其變成 3 的倍數，可以觀察以下性質：

- 若一個數 `x` 對 3 取餘數為 `0`，即 `x % 3 == 0`，則它已經能被 3 整除，不需任何操作。
- 若餘數為 `1`，只要加 1 或減 1 就能變成 3 的倍數。
- 若餘數為 `2`，同樣加 1 或減 1 即可轉為 3 的倍數。

因此，每個非 3 的倍數的數字都只需要 **1 次操作** 就能修正。
整體答案就是計算整個陣列中餘數不為 0 的元素個數。

本題所需的操作方式非常直接，因此能以線性掃描完成，時間複雜度為 $O(n)$。

## 解題步驟

### Step 1：初始化操作次數並取得陣列長度

建立計數變數 `totalOperations` 與陣列長度 `length`，用於後續統計。

```typescript
// 總共需要的操作次數
let totalOperations = 0;

const length = nums.length;
```

### Step 2：逐一檢查每個元素是否可被 3 整除

若 `value % 3 !== 0`，此元素需要 1 次操作，因此累加計數。

```typescript
for (let index= 0; index < length; index++) {
  const value = nums[index];
  const remainder = value % 3;

  // 若餘數不為 0，則此元素需要 1 次操作
  if (remainder !== 0) {
    totalOperations = totalOperations + 1;
  }
}
```

### Step 3：回傳最終操作次數

所有元素處理完後，即可回傳累積結果。

```typescript
return totalOperations;
```

## 時間複雜度

- 單一迴圈掃描所有元素，每個元素判斷成本為 $O(1)$；
- **總時間複雜度為 $O(n)$**。

> $O(n)$

## 空間複雜度

- 僅使用常數額外變數；
- **總空間複雜度為 $O(1)$**。

> $O(1)$
