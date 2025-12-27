# 1929. Concatenation of Array

Given an integer array `nums` of length `n`, you want to create an array `ans` of length `2n` 
where `ans[i] == nums[i]` and `ans[i + n] == nums[i]` for `0 <= i < `n (0-indexed).

Specifically, `ans` is the concatenation of two `nums` arrays.

Return the array `ans`.

**Constraints:**

- `n == nums.length`
- `1 <= n <= 1000`
- `1 <= nums[i] <= 1000`

## 基礎思路

本題要求回傳一個長度為 `2n` 的陣列 `ans`，其前半段與 `nums` 相同、後半段也與 `nums` 相同，等同於把 `nums` 串接兩次形成新陣列。

在思考解法時，我們注意到：

* 題目明確要求「串接兩份相同內容」，不需要重排或額外運算；
* 最直接的策略是建立一個新陣列，將原陣列內容複製兩次；
* 在語言提供的標準函式中，陣列串接通常會一次性配置新陣列並依序複製元素，能滿足題目需求且程式碼簡潔。

因此，採用「把陣列與自身做串接」即可得到答案。

## 解題步驟

### Step 1：直接串接陣列並回傳結果

題目要的 `ans` 就是 `nums` 接上 `nums`。
使用陣列的串接操作可直接得到新陣列。

```typescript
// 等同於將陣列與自身做串接。
return nums.concat(nums);
```

## 時間複雜度

- `concat` 需要建立一個長度為 `2n` 的新陣列，並複製 `nums` 的元素兩次，共複製 `2n` 個元素。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 回傳的新陣列長度為 `2n`，需要額外配置 `2n` 的空間以存放結果。
- 其他輔助變數為常數級。
- 總空間複雜度為 $O(n)$。

> $O(n)$
