# 368. Largest Divisible Subset

Given a set of distinct positive integers `nums`, 
return the largest subset `answer` such that every pair `(answer[i], answer[j])` of elements in this subset satisfies:

- `answer[i] % answer[j] == 0`, or
- `answer[j] % answer[i] == 0`

If there are multiple solutions, return any of them.

## 基礎思路

題目要求在一組正整數中找到一個最大的子集，使得這個子集中任意兩個數字之間，都必須滿足「其中一個數字能整除另一個數字」的條件。

要有效地解決這個問題，可以採用動態規劃（Dynamic Programming）來處理，其核心思路可分成以下三個步驟：

1. **排序數字**  
   首先，將輸入的數字從小到大進行排序。排序後的數字會有一個重要特性：若一個數能被另一個數整除，那麼較小的數一定位於較大的數前面。這能大幅簡化後續檢查整除關係的難度。

2. **建立動態規劃狀態**  
   接下來定義一個狀態陣列 `dp`，讓 `dp[i]` 代表「以第 `i` 個數字為結尾，能構成的最大整除子集的長度」。此外，還需要一個 `prev` 陣列用來追蹤這個最大子集中，每個數字前一個數的索引，方便後續重建子集。

3. **回溯找出答案**  
   透過狀態陣列，我們能知道最大子集的長度及結尾索引，再利用 `prev` 陣列逐步回溯，從而重建出完整的子集。回溯完成後，將子集反轉為正確順序，即為我們要的答案。

透過以上三個步驟，便能高效地找出滿足題目條件的最大整除子集。

## 解題步驟

### Step 1：初始化與資料結構

首先，獲取數組長度 `n`。若數組為空則直接返回空陣列。接著，將 `nums` 陣列進行升冪排序，這有助於後續確認較小數可以整除較大數的關係。

```typescript
const n = nums.length;

if (n === 0) {
  return [];
}

// 將數字由小到大排序
nums.sort((a, b) => a - b);
```

接著，我們初始化兩個陣列：
- **dp 陣列**：初始化為全 1，表示每個數字本身可以構成一個子集（長度為 1）。
- **prev 陣列**：初始化為 -1，記錄在構建最大子集時，前一個數字的索引，初始值 -1 表示無前驅。

```typescript
// dp[i] 表示以 nums[i] 為結尾的最大整除子集長度
const dp = new Uint16Array(n).fill(1);

// prev[i] 用來記錄構成最大子集時，nums[i] 前一個數的索引
const prev = new Int16Array(n).fill(-1);
```

### Step 2：動態規劃更新 dp 與 prev 陣列

利用雙層迴圈，對每個數字 `nums[i]`（i 從 1 至 n-1）檢查所有位於其之前的數字 `nums[j]`（j 從 0 到 i-1），若滿足 `nums[i] % nums[j] === 0`，
則表示 `nums[i]` 能夠跟 `nums[j]` 組成一個合法的整除關係。

在滿足條件的情況下：
- 如果透過 `nums[j]` 能使 `dp[i]` 更新（即 `dp[i] < dp[j] + 1`），則更新 `dp[i]` 為 `dp[j] + 1`。
- 同時將 `prev[i]` 設為 j，表示在最大子集中，`nums[j]` 是 `nums[i]` 的前一個數字。

另外，透過變數 `maxSize` 與 `maxIndex` 持續追蹤目前發現的最大子集長度及其結尾索引。

```typescript
let maxSize = 1;
let maxIndex = 0;
for (let i = 1; i < n; i++) {
  for (let j = 0; j < i; j++) {
    // 如果 nums[i] 能被 nums[j] 整除，且通過 nums[j] 能取得更長的子集
    if (nums[i] % nums[j] === 0 && dp[i] < dp[j] + 1) {
      dp[i] = dp[j] + 1;
      prev[i] = j;
    }
  }
  // 更新全局最大子集的長度及結尾索引
  if (dp[i] > maxSize) {
    maxSize = dp[i];
    maxIndex = i;
  }
}
```

### Step 3：回溯重建子集

根據 `prev` 陣列，我們從記錄的最大子集結尾 `maxIndex` 開始，依次回溯每個數字的前驅，直到索引為 -1。
收集到的數字即為從後往前的子集，最後再將結果反轉成正確的順序。

```typescript
// 利用 prev 陣列回溯重建最大整除子集
const result: number[] = [];
while (maxIndex !== -1) {
  result.push(nums[maxIndex]);
  maxIndex = prev[maxIndex];
}

// 將結果反轉成正確順序後返回
result.reverse();
return result;
```

## 時間複雜度

- **排序**：排序的時間複雜度為 $O(n\log n)$。
- **雙層迴圈 (動態規劃)**：兩層迴圈使時間複雜度為 $O(n^2)$，此部分為主要計算成本。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- **dp 與 prev 陣列**：兩個陣列均需額外的 $O(n)$ 空間。
- 除此之外，其他變數均為常數空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
