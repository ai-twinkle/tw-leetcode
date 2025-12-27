# 1470. Shuffle the Array

Given the array `nums` consisting of `2n` elements in the form `[x_1,x_2,...,x_n,y_1,y_2,...,y_n]`.

Return the array in the form `[x_1,y_1,x_2,y_2,...,x_n,y_n]`.

**Constraints:**

- `1 <= n <= 500`
- `nums.length == 2n`
- `1 <= nums[i] <= 10^3`

## 基礎思路

本題給定一個長度為 `2n` 的陣列，前半段是 `x_1 ... x_n`，後半段是 `y_1 ... y_n`，目標是輸出交錯排列後的新陣列：`x_1, y_1, x_2, y_2, ... , x_n, y_n`。

在思考解法時，需要注意：

* **輸入結構固定且可直接對應**：每個 `x_i` 與 `y_i` 的位置在原陣列中是規律分布的，能一一配對重排。
* **輸出長度已知**：結果陣列的長度就是 `2n`，可以一次性配置好，避免動態擴張。
* **一對一搬移即可完成**：每組 `(x_i, y_i)` 只需各放入結果的固定位置，因此只需一次線性掃描即可完成重排。

因此策略是：建立一個同樣大小的新陣列，按順序將每組元素交錯放入對應位置，最後回傳結果。

## 解題步驟

### Step 1：建立結果陣列

先配置與輸入相同長度的結果陣列，用來承接交錯排列後的元素。

```typescript
const result = new Array(nums.length);
```

### Step 2：遍歷每組 `(x_i, y_i)` 並交錯寫入結果

依序處理 `i = 0..n-1` 的每一組元素，將 `x_i` 放到偶數位置、`y_i` 放到下一個奇數位置，完成交錯排列。

```typescript
// 預先配置並用索引指定，避免 push() 造成的動態擴張成本。
for (let index = 0; index < n; index++) {
  const resultIndex = index * 2;
  result[resultIndex] = nums[index];
  result[resultIndex + 1] = nums[index + n];
}
```

### Step 3：回傳結果

遍歷完成後，結果陣列即為題目要求的排列，直接回傳。

```typescript
return result;
```

## 時間複雜度

- 只需遍歷 `index = 0..n-1` 共 `n` 次，每次操作皆為常數時間的索引存取與賦值。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 額外配置一個長度為 `2n` 的結果陣列，使用空間為 `2n`。
- 其餘變數皆為常數級。
- 總空間複雜度為 $O(n)$。

> $O(n)$
