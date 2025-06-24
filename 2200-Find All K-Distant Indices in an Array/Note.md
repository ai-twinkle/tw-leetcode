# 2200. Find All K-Distant Indices in an Array

You are given a 0-indexed integer array `nums` and two integers `key` and `k`. 
A k-distant index is an index `i` of `nums` for which there exists at least one index `j` such that `|i - j| <= k` and `nums[j] == key`.

Return a list of all k-distant indices sorted in increasing order.

**Constraints:**

- `1 <= nums.length <= 1000`
- `1 <= nums[i] <= 1000`
- `key` is an integer from the array `nums`.
- `1 <= k <= nums.length`

## 基礎思路

本題的核心在於尋找所有「距離 $k$ 以內」且與陣列中特定值 `key` 相關的索引位置（我們稱之為 $k$-遠距索引）。
也就是說，對於陣列中任一索引 $i$，只要存在某個索引 $j$ 滿足以下兩個條件：

- $|i - j| \leq k$
- $nums[j] = key$

那麼索引 $i$ 就應被納入最終答案。

為了高效實現這個需求，我們可以將流程拆解為兩個關鍵步驟：

1. **預處理階段**：先遍歷一次陣列，將所有值等於 `key` 的索引位置收集起來，並形成一個天然排序的索引列表。
                 這個列表方便我們後續直接定位所有可能成為“中心點”的 `key`。
2. **線性指標掃描**：接著，我們逐一檢查每個索引 $i$，同時利用一個單調不回頭的指標，線性地比對上述列表中是否存在索引 $j$ 落在 $[i - k, i + k]$ 範圍內。
                  這樣一來，每個元素只需檢查一次，避免重複、低效的窮舉，大幅提升運算效率。

透過這樣的設計，我們就能以一次完整掃描（one-pass）完成所有判斷，並保證整體時間複雜度為線性的 $O(n)$，適用於本題的所有資料範圍。

## 解題步驟

### Step 1：預處理階段，收集所有值等於 `key` 的索引位置

- 遍歷整個陣列 `nums`，每當找到符合條件的索引位置（即值為 `key`），立即將此位置記錄到陣列 `keyPositions` 中。
- 此時，該陣列天然為升序排列，因為我們是從左到右遍歷的。

```typescript
const n = nums.length;

// 1. 收集所有 nums[j] === key 的位置
const keyPositions: number[] = [];
for (let index = 0; index < n; ++index) {
  if (nums[index] === key) {
    keyPositions.push(index);
  }
}
```

### Step 2：以雙指標掃描法遍歷每個索引，判斷距離條件

- `leftPointer` 用於追蹤當前可接受的最左邊的 `key` 索引。
- 每次移動指標以跳過所有已超出下限（小於 `i - k`）的索引位置。
- 當前若仍在可接受範圍（`i + k`）內，則索引 `i` 符合條件並加入結果。

```typescript
const result: number[] = [];
let leftPointer = 0;

for (let i = 0; i < n; ++i) {
  // 向右移動 leftPointer，直到 keyPositions[leftPointer] 滿足位置 >= i - k
  while (
    leftPointer < keyPositions.length &&
    keyPositions[leftPointer] < i - k
  ) {
    ++leftPointer;
  }
  
  // 若當前的 keyPositions[leftPointer] 在位置 i + k 範圍內，將 i 加入結果
  if (
    leftPointer < keyPositions.length &&
    keyPositions[leftPointer] <= i + k
  ) {
    result.push(i);
  }
}
```

### Step 3：返回最終結果陣列

最後返回結果，由於此陣列天然為升序排列，故無需額外排序。

```typescript
return result;
```

## 時間複雜度

- 第一次掃描記錄符合條件的位置，耗時為 $O(n)$。
- 第二次掃描索引，指標最多向右移動 $n$ 次，每次操作 $O(1)$，共 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用額外的陣列（`keyPositions`、`result`），最多分別儲存 $n$ 個元素。
- 總空間複雜度為 $O(n)$。

> $O(n)$
