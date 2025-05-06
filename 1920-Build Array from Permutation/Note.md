# 1920. Build Array from Permutation

Given a zero-based permutation `nums` (0-indexed), build an array `ans` of the same length 
where `ans[i] = nums[nums[i]]` for each `0 <= i < nums.length` and return it.

A zero-based permutation `nums` is an array of distinct integers from `0` to `nums.length - 1` (inclusive).

**Constraints:**

- `1 <= nums.length <= 1000`
- `0 <= nums[i] < nums.length`
- The elements in `nums` are distinct.

## 基礎思路

我們只要對原陣列的每個元素取值作為新的索引，再從原陣列讀取一次，即可獲得結果，因此可直接使用陣列的 `map` 方法，一次遍歷完成映射。

## 解題步驟

### Step 1：使用 `map` 映射

利用 `nums.map(...)` 對原陣列做一次遍歷。
對於每個元素 `value`（即原本的 `nums[i]`），我們取 `nums[value]` 並放入新陣列中，最終直接 `return` 該結果：

```typescript
return nums.map(value => nums[value]);
```

## 時間複雜度

- **一次 `map` 遍歷**：對長度為 $n$ 的陣列遍歷一次，對每個元素執行常數時間操作，時間複雜度為 $O(1)$，累計總計為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- **輸出陣列**：需要額外空間儲存長度為 $n$ 的新陣列，空間複雜度為 $O(n)$。
- 其他常數個變數佔用 $O(1)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
