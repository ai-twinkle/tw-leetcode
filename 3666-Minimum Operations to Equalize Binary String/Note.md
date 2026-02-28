# 3666. Minimum Operations to Equalize Binary String

You are given a binary string `s`, and an integer `k`.

In one operation, you must choose exactly `k` different indices and flip each `'0'` to `'1'` and each `'1'` to `'0'`.

Return the minimum number of operations required to make all characters in the string equal to `'1'`. 
If it is not possible, return -1.

**Constraints:**

- `1 <= s.length <= 10`
- `s[i]` is either `'0'` or `'1'`.
- `1 <= k <= s.length`

## 基礎思路

本題每次操作必須選出剛好 `k` 個不同位置進行翻轉，目標是讓整個字串都變成 `'1'`。由於翻轉僅改變 `'0'` 與 `'1'` 的數量分佈，因此可以將問題抽象為「目前字串中有多少個 `0`」，並在此狀態空間上尋找到達 `0` 的最少步數。

核心觀察如下：

* **狀態可用「0 的個數」完全描述**：
  一次操作選 `k` 個位置翻轉，只會改變 `0` 與 `1` 的數量，不需要追蹤每個位置的具體配置。

* **一次操作的轉移只與「被翻到的 0 數量」有關**：
  若本次選到 `x` 個 `0`（其餘 `k - x` 個為 `1`），則 `0` 的總數會變為
  `nextZeros = currentZeros + k - 2*x`，並且 `x` 的可行範圍由當前 `0/1` 數量限制。

* **可行下一狀態形成等差序列且具有固定奇偶性**：
  因為 `nextZeros` 以 `2` 為步長變化，因此從同一狀態出發的所有下一狀態會落在同一個奇偶類別中，適合用「按奇偶分組」的方式快速枚舉。

* **在 `0..n` 的小狀態空間上求最短路徑**：
  狀態數最多 `n + 1`（`n <= 10`），可用 BFS 求最少操作次數；並透過奇偶分類的 DSU 跳過已訪問狀態，使區間枚舉過程保持乾淨且不重複。

因此策略為：

* 計算初始 `0` 的個數作為起點；
* 在狀態 `0..n` 上進行 BFS；
* 每次根據當前 `0` 數量計算所有可達的下一狀態區間；
* 使用「奇偶 DSU」只枚舉尚未訪問的狀態；
* 一旦到達 `0` 即回傳步數，否則最終回傳 `-1`。

## 解題步驟

### Step 1：統計初始的 0 數量並處理已完成情況

先統計目前字串中 `'0'` 的數量作為起始狀態；若一開始就沒有 `0`，表示已全為 `'1'`，可直接回傳 `0`。

```typescript
const length = s.length;

// 計算初始的 0 數量。
let zeroCount = 0;
for (let i = 0; i < length; i++) {
  if (s.charCodeAt(i) === 48) {
    zeroCount++;
  }
}

if (zeroCount === 0) {
  return 0;
}
```

### Step 2：建立奇偶 DSU 結構與哨兵值

由於下一狀態會以步長 `2` 變化，因此將偶數狀態與奇數狀態分開管理，並設置尾端哨兵作為結束標記。

```typescript
// 奇偶 DSU 使用的哨兵值（步長 = 2）。
const dsuArraySize = length + 6;
const evenSentinel = (((length + 2) & 1) === 0) ? (length + 2) : (length + 3);
const oddSentinel = evenSentinel ^ 1;

// parent 陣列儲存「同奇偶類別中下一個可用值」。
const nextEvenParent = new Int32Array(dsuArraySize);
const nextOddParent = new Int32Array(dsuArraySize);

for (let i = 0; i < dsuArraySize; i++) {
  nextEvenParent[i] = i;
  nextOddParent[i] = i;
}
```

### Step 3：初始化 BFS 結構並標記起始狀態

建立距離表與佇列，將起始狀態入列並標記為已訪問，同時從對應奇偶 DSU 中移除。

```typescript
// 每個可能的 0 數量（0..length）的 BFS 距離。
const minSteps = new Int32Array(length + 1);
minSteps.fill(-1);

const queue = new Int32Array(length + 1);
let queueHead = 0;
let queueTail = 0;

// 標記起始狀態。
minSteps[zeroCount] = 0;
queue[queueTail++] = zeroCount;

// 從對應奇偶 DSU 移除起始值以標記已訪問。
if ((zeroCount & 1) === 0) {
  nextEvenParent[zeroCount] = (zeroCount + 2 <= evenSentinel) ? (zeroCount + 2) : evenSentinel;
} else {
  nextOddParent[zeroCount] = (zeroCount + 2 <= oddSentinel) ? (zeroCount + 2) : oddSentinel;
}
```

### Step 4：建立 DSU 查詢函數

此函數用來找出同奇偶類別中，最小且大於等於指定值的可用狀態。

```typescript
/**
 * 使用路徑壓縮，在同奇偶下找出最小的可用值 >= x。
 * @param parent - 單一奇偶類別的 DSU parent 陣列
 * @param x - 查詢值
 * @param sentinel - 哨兵索引（結束標記）
 */
function findNextAvailable(parent: Int32Array, x: number, sentinel: number): number {
  if (x > sentinel) {
    return sentinel;
  }

  let node = x;
  while (parent[node] !== node) {
    parent[node] = parent[parent[node]];
    node = parent[node];
  }
  return node;
}
```

### Step 5：建立 DSU 移除函數

當某狀態被訪問後，需要將其從 DSU 中移除，避免重複枚舉。

```typescript
/**
 * 將值 x 從 DSU 中移除，做法是把它連到同奇偶的下一個值（x + 2）。
 * @param parent - 單一奇偶類別的 DSU parent 陣列
 * @param x - 要移除的值
 * @param sentinel - 哨兵索引（結束標記）
 */
function removeAvailableValue(parent: Int32Array, x: number, sentinel: number): void {
  const nextValue = x + 2;
  if (nextValue <= sentinel) {
    parent[x] = findNextAvailable(parent, nextValue, sentinel);
  } else {
    parent[x] = sentinel;
  }
}
```

### Step 6：進行 BFS 並處理提前結束

從佇列中取出當前狀態與步數；若已到達 `0`，直接回傳。

```typescript
while (queueHead < queueTail) {
  const currentZeroCount = queue[queueHead++];
  const currentSteps = minSteps[currentZeroCount];

  if (currentZeroCount === 0) {
    return currentSteps;
  }

  // ...
}
```

### Step 7：計算可達下一狀態的區間

根據當前 `0` 數量與 `k`，推導本次可翻到的 `0` 數量範圍，進而計算下一狀態的最小與最大值。

```typescript
while (queueHead < queueTail) {
  // Step 6：取出當前狀態並檢查是否完成

  // 可行的「被翻到的 0」數量範圍：
  // x <= min(currentZeroCount, k)
  // x >= max(0, k - (length - currentZeroCount))
  const minFlippedZeros = (k > (length - currentZeroCount)) ? (k - (length - currentZeroCount)) : 0;
  const maxFlippedZeros = (currentZeroCount < k) ? currentZeroCount : k;

  // nextZeros = currentZeroCount + k - 2*x
  const nextZeroMin = currentZeroCount + k - (maxFlippedZeros << 1);
  const nextZeroMax = currentZeroCount + k - (minFlippedZeros << 1);

  // ...
}
```

### Step 8：利用奇偶 DSU 枚舉區間內尚未訪問的狀態

根據區間起點奇偶決定使用哪個 DSU，將區間內所有尚未訪問的狀態加入 BFS，並立即移除以標記已訪問。

```typescript
while (queueHead < queueTail) {
  // Step 6：取出當前狀態並檢查是否完成

  // Step 7：計算下一狀態區間

  // 在 [nextZeroMin, nextZeroMax] 中以步長 2 枚舉尚未訪問的狀態。
  if ((nextZeroMin & 1) === 0) {
    let start = nextZeroMin;
    if ((start & 1) !== 0) {
      start++;
    }

    let candidate = findNextAvailable(nextEvenParent, start, evenSentinel);
    while (candidate <= nextZeroMax) {
      if (candidate >= 0 && candidate <= length) {
        minSteps[candidate] = currentSteps + 1;
        queue[queueTail++] = candidate;
      }

      removeAvailableValue(nextEvenParent, candidate, evenSentinel);
      candidate = findNextAvailable(nextEvenParent, candidate, evenSentinel);
    }
  } else {
    let start = nextZeroMin;
    if ((start & 1) === 0) {
      start++;
    }

    let candidate = findNextAvailable(nextOddParent, start, oddSentinel);
    while (candidate <= nextZeroMax) {
      if (candidate >= 0 && candidate <= length) {
        minSteps[candidate] = currentSteps + 1;
        queue[queueTail++] = candidate;
      }

      removeAvailableValue(nextOddParent, candidate, oddSentinel);
      candidate = findNextAvailable(nextOddParent, candidate, oddSentinel);
    }
  }
}
```

### Step 9：無法到達時回傳 -1

若 BFS 結束仍未抵達 `0`，表示無法將字串變為全 `'1'`。

```typescript
return -1;
```

## 時間複雜度

- 狀態總數為 `n + 1`，其中 `n = s.length`。
- 每個狀態最多被加入 BFS 一次。
- 奇偶 DSU 確保每個狀態只被枚舉與移除一次。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- BFS 距離表與佇列需要 $O(n)$。
- 兩個奇偶 DSU parent 陣列為 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
