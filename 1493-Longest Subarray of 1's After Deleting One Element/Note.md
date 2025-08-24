# 1493. Longest Subarray of 1's After Deleting One Element

Given a binary array `nums`, you should delete one element from it.

Return the size of the longest non-empty subarray containing only `1`'s in the resulting array. 
Return `0` if there is no such subarray.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `nums[i]` is either `0` or `1`.

## 基礎思路

題目要求在刪除一個元素後，找到最長的只包含 1 的子陣列長度。
觀察可知：

- 若陣列中沒有 0，刪除一個 1 後結果是 $n-1$。
- 若陣列中存在 0，那麼我們希望找到「最多包含一個 0 的最長區間」，刪除那個 0 後就能得到全 1 的子陣列。

這樣的問題非常適合 **滑動視窗（two pointers）** 解法：

- 維護一個區間 $[left, right]$，確保區間內 0 的數量不超過 1。
- 每次移動 $right$ 擴張視窗，若 0 超過 1，則移動 $left$ 縮小。
- 在合法視窗下，候選長度為 $right - left$（因為必須刪除一個元素）。
- 最終答案為所有候選長度中的最大值。

## 解題步驟

### Step 1：邊界處理與初始化

先處理長度小於等於 1 的邊界情況，並初始化左右指標、視窗內 0 的數量與答案。

```typescript
const length = nums.length;
if (length <= 1) {
    return 0;
}

let leftIndex = 0;
let zeroCountInWindow = 0;
let maximumLengthAfterDeletion = 0;
```

### Step 2：滑動視窗遍歷

右指標擴張視窗；若 0 的數量超過 1，左指標收縮直到合法。每次計算候選長度並更新最大值，並加入可選的提前停止。

```typescript
for (let rightIndex = 0; rightIndex < length; rightIndex++) {
    if (nums[rightIndex] === 0) {
        zeroCountInWindow++;
    }

    while (zeroCountInWindow > 1) {
        if (nums[leftIndex] === 0) {
            zeroCountInWindow--;
        }
        leftIndex++;
    }

    // 在視窗中刪除恰好一個元素之後
    const candidateLength = rightIndex - leftIndex;
    if (candidateLength > maximumLengthAfterDeletion) {
        maximumLengthAfterDeletion = candidateLength;
    }

    // 可選的提前停止
    if (maximumLengthAfterDeletion >= length - leftIndex - 1) {
        break;
    }
}
```

### Step 3：回傳結果

最後輸出答案。

```typescript
return maximumLengthAfterDeletion;
```

## 時間複雜度

- **滑動視窗**：左右指標各最多線性移動一次，時間複雜度為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅需常數額外變數，無額外結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
