# 1550. Three Consecutive Odds

Given an integer array `arr`, 
return `true` if there are three consecutive odd numbers in the array. 
Otherwise, return `false`.

**Constraints:**

- `1 <= arr.length <= 1000`
- `1 <= arr[i] <= 1000`

## 基礎思路

題目要求判斷給定的整數陣列中，是否存在連續三個奇數的情況。

我們可以使用陣列遍歷的方式，檢查每個元素及其後續兩個元素，是否均為奇數：

- 若存在，則返回 `true`。
- 若遍歷完畢仍未找到，則返回 `false`。

對於單次遍歷的情況，我們可以使用陣列的 `some` 方法來簡化邏輯，這樣可以避免使用額外的迴圈或變數。

## 解題步驟

### Step 1：使用陣列的 some 方法判斷是否有連續三個奇數

```typescript
return arr.some((_, i) => arr[i] % 2 && arr[i + 1] % 2 && arr[i + 2] % 2);
```

## 時間複雜度

- **陣列遍歷**：使用陣列的內建方法遍歷，每個元素僅會被訪問一次，操作為常數時間 $O(1)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- **未額外使用其他資料結構**，僅使用常數空間作為臨時變數。
- 總空間複雜度為 $O(1)$。

> $O(1)$
