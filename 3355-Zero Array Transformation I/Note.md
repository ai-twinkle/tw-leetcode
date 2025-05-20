# 3355. Zero Array Transformation I

You are given an integer array `nums` of length `n` and a 2D array `queries`, 
where `queries[i] = [l_i, r_i]`.

For each `queries[i]`:

- Select a subset of indices within the range `[l_i, r_i]` in `nums`.
- Decrement the values at the selected indices by 1.

A Zero Array is an array where all elements are equal to 0.

Return `true` if it is possible to transform `nums` into a Zero Array after processing all the queries sequentially, 
otherwise return `false`.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `0 <= nums[i] <= 10^5`
- `1 <= queries.length <= 10^5`
- `queries[i].length == 2`
- `0 <= l_i <= r_i < nums.length`

## 基礎思路

題目給定一個整數陣列 `nums` 和一系列的操作區間 `queries`，目標是判斷經過這些操作後，是否能將整個陣列的所有元素都降為 $0$（即所謂的「零陣列」）。

每一次的操作中，可以從指定區間 `[l_i, r_i]` 中任意選擇一個子集，將所選元素全部減少 $1$。由於每次操作能自由選取子集，因此只要一個元素所在的位置被涵蓋足夠次數，就可以將其減至 $0$。

因此，我們需要確認陣列內的每一個元素，都至少被這些操作區間覆蓋到其值所需要的次數。

- 若存在任何元素的初始數值，大於所有涵蓋該位置的操作次數總和，則不可能成功完成目標。

要有效地追蹤每個位置被操作的次數，可透過「差分陣列 (Difference Array)」技巧，將區間的增加或減少以簡單的頭尾標記方式儲存，再透過前綴和快速計算每個位置總共受到多少次操作影響。如此便能快速驗證陣列能否被降至零。

## 解題步驟

### Step 1：初始化與差分陣列構建

首先取得原始陣列長度，並建立長度為 `arrayLength + 1` 的差分陣列 (`differenceArray`)。為了提高執行效率並避免溢位問題，這裡特別使用了 `Int32Array`。

這個陣列將用於紀錄每個位置所受到的操作次數變化（差分標記）：

```typescript
const arrayLength = nums.length;

// 使用 Int32Array 以提升增減效率並避免溢位
const differenceArray = new Int32Array(arrayLength + 1);
```

### Step 2：將所有操作區間標記到差分陣列中

接下來，遍歷每個操作區間 `[l, r]`，在差分陣列上進行標記：

- 在區間起點位置 `l` 加上 $1$，表示從此處開始受操作影響。
- 在區間終點的下一個位置 `r + 1` 減去 $1$，表示此處之後操作影響停止。

透過這種方式，能高效地記錄每個位置受到的操作次數變化：

```typescript
const queryCount = queries.length;
for (let i = 0; i < queryCount; ++i) {
  const currentQuery = queries[i];
  // currentQuery[0] ∈ [0..arrayLength-1], currentQuery[1]+1 ∈ [1..arrayLength]
  differenceArray[currentQuery[0]] += 1;
  differenceArray[currentQuery[1] + 1] -= 1;
}
```

### Step 3：前綴和計算並逐一驗證是否可降至零

此時，我們逐步遍歷原始陣列每一位置，同時計算差分陣列的前綴和，以得到每個位置累積受到的操作總數 `cumulativeOperations`。

對於每個位置：

- 若原本數值 `nums[currentIndex]` 大於所累積的操作次數，表示該位置無法透過現有的操作次數歸零，立刻返回 `false`。
- 否則，持續往後驗證。

```typescript
let cumulativeOperations = 0;
for (let currentIndex = 0; currentIndex < arrayLength; ++currentIndex) {
  cumulativeOperations += differenceArray[currentIndex];
  // 若原始值大於能提供的操作次數，則無法歸零
  if (nums[currentIndex] > cumulativeOperations) {
    return false;
  }
}
```

### Step 4：確認所有位置皆可成功歸零後回傳結果

若遍歷完畢且無任何位置無法歸零，表示此操作序列是可行的，因此返回 `true`：

```typescript
return true;
```

## 時間複雜度

- **差分標記步驟**：需要遍歷每個查詢區間一次，因此此部分複雜度為 $O(q)$，其中 $q$ 表示 `queries` 的長度。
- **前綴和與驗證步驟**：需要遍歷原始陣列每個位置一次，時間複雜度為 $O(n)$，其中 $n$ 表示 `nums` 的長度。
- 總時間複雜度為 $O(n + q)$。

> $O(n + q)$

## 空間複雜度

- **差分陣列**：需要額外的陣列儲存差分資訊，其長度為原始陣列長度加一，因此空間複雜度為 $O(n)$。
- 其他變數僅使用常數空間，忽略不計。
- 總空間複雜度為 $O(n)$。

> $O(n)$
