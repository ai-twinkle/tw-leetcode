# 3362. Zero Array Transformation III

You are given an integer array `nums` of length `n` and a 2D array queries where `queries[i] = [l_i, r_i]`.

Each `queries[i]` represents the following action on `nums`:

- Decrement the value at each index in the range `[l_i, r_i]` in `nums` by at most 1.
- The amount by which the value is decremented can be chosen independently for each index.

A Zero Array is an array with all its elements equal to 0.

Return the maximum number of elements that can be removed from `queries`, 
such that `nums` can still be converted to a zero array using the remaining queries. 
If it is not possible to convert `nums` to a zero array, return -1.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `0 <= nums[i] <= 10^5`
- `1 <= queries.length <= 10^5`
- `queries[i].length == 2`
- `0 <= l_i <= r_i < nums.length`

## 基礎思路

本題的核心問題為：「如何移除最多的區間，仍能確保將給定數組轉為全零（Zero Array）？」

我們可將此問題抽象成一個 **區間覆蓋問題**：

- 每個位置的數字代表「此位置至少需要被多少個區間覆蓋」。
- 每個區間可以選擇性地將其範圍內每個位置減少 1。
- 為達成移除最多區間的目的，我們必須盡可能「節省區間的使用」，即使用最少數量的區間來滿足每個位置的需求。

因此，本題的高階解題策略為：

1. **轉換問題**：將原問題轉換成「最少區間覆蓋」的形式。
2. **貪心策略**：優先選取能夠覆蓋「當前位置」且其「右端點最遠」的區間，盡量節省後續需求所需的額外區間。
3. 若任一位置無法滿足需求，即無解。

## 解題步驟

### Step 1：根據左端點排序區間（Counting Sort）

為快速知道每個位置有哪些區間可以啟用，我們先利用 counting sort，依據區間的左端點排序區間。

```typescript
const n = nums.length;
const queryCount = queries.length;

// 以區間左端點為基準做 counting sort 的桶
const startCounts = new Int32Array(n + 1);
for (let i = 0; i < queryCount; i++) {
  startCounts[queries[i][0]]++;
}

// 前綴和，獲得排序區間所需的索引位置
for (let i = 1; i <= n; i++) {
  startCounts[i] += startCounts[i - 1];
}

// 根據 counting sort 結果重排 queries
const sortedStart = new Int32Array(queryCount);
const sortedEnd = new Int32Array(queryCount);

for (let i = queryCount - 1; i >= 0; i--) {
  const leftIndex = queries[i][0];
  const rightIndex = queries[i][1];
  startCounts[leftIndex]--;

  const position = startCounts[leftIndex];
  sortedStart[position] = leftIndex;
  sortedEnd[position] = rightIndex;
}
```

### Step 2：維護可用與執行中的區間

為貪心地選取區間，我們設定：

- `availableCounts`：記錄右端點為 `i` 的區間中還沒使用的數量。
- `runningCounts`：記錄右端點為 `i` 的區間中正在使用中的數量。

此外，用幾個變數維持狀態：

- `totalAvailable`：尚未使用的區間總數。
- `totalRunning`：當前正在作用（已選中）的區間數。
- `currentMaxAvailableEnd`：當前可用區間中最遠的右端點。
- `currentMinRunningEnd`：當前執行中區間中最早到期的右端點。

```typescript
const availableCounts = new Int32Array(n);
const runningCounts = new Int32Array(n);

let totalAvailable = queryCount;
let totalRunning = 0;
let currentMaxAvailableEnd = -1;
let currentMinRunningEnd = 0;

let readPointer = 0; // 指向排序後的區間索引
```

### Step 3：逐位置貪心選取區間覆蓋需求

從位置 0 到 `n-1` 依序檢查：

- 將所有以當前位置為左端點（或更前方）的區間放入可用區間中。
- 移除已過期的執行中區間。
- 如果當前位置被覆蓋次數不足，則不斷選取可用區間中右端點最遠的區間來滿足需求。

```typescript
for (let position = 0; position < n; position++) {
  // 將左端點在 position 或之前的區間標記為可用
  while (readPointer < queryCount && sortedStart[readPointer] <= position) {
    const endPosition = sortedEnd[readPointer++];
    availableCounts[endPosition] += 1;
    if (endPosition > currentMaxAvailableEnd) {
      currentMaxAvailableEnd = endPosition;
    }
  }

  // 移除所有不再覆蓋當前位置的區間
  while (currentMinRunningEnd < position) {
    const count = runningCounts[currentMinRunningEnd];
    if (count !== 0) {
      totalRunning -= count;
      runningCounts[currentMinRunningEnd] = 0;
    }
    currentMinRunningEnd++;
  }

  // 若當前位置還需覆蓋更多次數，則選取更多區間
  let needed = nums[position] - totalRunning;
  while (needed > 0) {
    // 若沒有區間可覆蓋當前位置，則無法完成任務
    if (currentMaxAvailableEnd < position) {
      return -1;
    }
    
    // 貪心地選取右端點最遠的區間
    const chosenEnd = currentMaxAvailableEnd;
    availableCounts[chosenEnd]--;
    totalAvailable--;

    // 更新可用區間中最遠的右端點
    if (availableCounts[chosenEnd] === 0) {
      while (
        currentMaxAvailableEnd >= 0 &&
        availableCounts[currentMaxAvailableEnd] === 0
      ) {
        currentMaxAvailableEnd--;
      }
    }

    // 將此區間標記為執行中
    runningCounts[chosenEnd]++;
    totalRunning++;
    needed--;
  }
}
```

### Step 4：回傳最終可移除區間數量

最終還未使用的區間數量，即為本題所求答案。

```typescript
return totalAvailable;
```

## 時間複雜度

- **Counting Sort 排序區間**：區間排序僅遍歷一次區間及 nums，複雜度為 $O(n + q)$。
- **主迴圈處理區間選取**：每個位置最多檢查常數次（因每個區間最多用一次），複雜度為 $O(n + q)$。
- 總時間複雜度為 $O(n + q)$。

> $O(n + q)$

## 空間複雜度

- **輔助陣列**：
  - 使用長度為 $n$ 的 `startCounts`、`availableCounts`、`runningCounts` 陣列。
  - 使用長度為 $q$ 的 `sortedStart`、`sortedEnd` 陣列。
- 總空間複雜度為 $O(n + q)$。

> $O(n + q)$
