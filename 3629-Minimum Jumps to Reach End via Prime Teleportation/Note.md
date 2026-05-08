# 3629. Minimum Jumps to Reach End via Prime Teleportation

You are given an integer array nums of length `n`.

You start at index 0, and your goal is to reach index `n - 1`.

From any index `i`, you may perform one of the following operations:

- Adjacent Step: Jump to index `i + 1` or `i - 1`, if the index is within bounds.
- Prime Teleportation: If `nums[i]` is a prime number p, you may instantly jump to any index `j != i` such that `nums[j] % p == 0`.

Return the minimum number of jumps required to reach index `n - 1`.

**Constraints:**

- `1 <= n == nums.length <= 10^5`
- `1 <= nums[i] <= 10^6`

## 基礎思路

本題要求從索引 0 出發，以最少的跳躍次數到達索引 `n - 1`。每一步可向左右相鄰索引移動，或在當前值為質數時，瞬間跳往所有能被該質數整除的索引。由於目標是最短路徑，自然採用 BFS 逐層展開。

在思考解法時，可掌握以下核心觀察：

- **問題本質為最短路徑搜索**：
  每個索引為節點，相鄰跳與質數傳送為邊，層次 BFS 能保證在第一次觸達終點時即為最少跳躍數。

- **質數傳送形成「質數群」**：
  所有能被同一個質數整除的索引，彼此之間皆可一步互達，可視為同屬一個傳送群組。只要建立質數到索引清單的映射，傳送時直接批次加入即可。

- **質數群只需消費一次**：
  一旦某個質數群中的所有索引都已被加入 BFS 佇列，該群組便不再有任何新節點可貢獻。應在消費後立即刪除，避免重複走訪造成時間浪費。

- **最小質因數篩可高效分解**：
  預先以線性篩建立每個正整數的最小質因數表，可在對數時間內完整分解任意值，且只需建立一次便可跨呼叫重複使用。

- **質數傳送的觸發條件**：
  只有當前索引的值本身為質數時，才能觸發傳送，而非任何含有質因子的值皆可。兩者的判斷都能透過最小質因數表快速完成。

依據以上特性，可以採用以下策略：

- **預先分解每個值的所有質因數，建立質數至索引清單的映射**，方便 BFS 時批次加入傳送目標。
- **BFS 逐層展開，每層代表一次跳躍**，每次同時處理相鄰步與質數傳送，並在消費質數群後立即從映射中移除。
- **使用型別陣列儲存 BFS 佇列與走訪狀態**，降低記憶體分配開銷，確保在大規模輸入下保持效率。

此策略能確保每條邊最多被走訪一次，整體複雜度維持線性，適用於本題的資料規模。

## 解題步驟

### Step 1：以線性篩預先建立最小質因數表

在所有呼叫之前，先對 `[2, MAX_VALUE)` 範圍內的整數建立最小質因數篩。
對於每個尚未被標記的數 `i`（即質數），將其作為所有倍數的最小質因數填入；已有標記者略過，以確保只保留最小的質因數。

```typescript
// 每個 nums[i] 的最大可能值，依據題目約束
const MAX_VALUE = 1_000_001;

// 最小質因數篩，預先計算一次並可重複使用
// spf[v] = 整除 v 的最小質數（spf[v] === v 表示 v 本身為質數）
const smallestPrimeFactor = new Int32Array(MAX_VALUE);
for (let i = 2; i < MAX_VALUE; i++) {
    // 若尚未設定，則保留最小質因數
    if (smallestPrimeFactor[i] === 0) {
        for (let j = i; j < MAX_VALUE; j += i) {
            if (smallestPrimeFactor[j] === 0) {
                smallestPrimeFactor[j] = i;
            }
        }
    }
}
```

### Step 2：快速處理陣列長度為 1 的情況

若陣列僅有一個元素，起點即終點，不需任何跳躍，直接回傳 0。

```typescript
const n = nums.length;
// 簡單情況：已在目標位置
if (n <= 1) {
    return 0;
}
```

### Step 3：建立質數至索引清單的映射

逐一走訪每個索引，利用最小質因數篩分解其對應值的所有相異質因數。
每找到一個質因數，就將當前索引加入對應的清單；分解後需持續去除該質因數的所有次冪，確保每個質因數只記錄一次。

```typescript
// 以質數為鍵，收錄所有含該質因數之索引
// primeToIndices：質數 p -> 所有滿足 p | nums[i] 的索引 i 清單
const primeToIndices = new Map<number, number[]>();
for (let i = 0; i < n; i++) {
    let value = nums[i];
    // 使用最小質因數篩分解出所有相異質因數
    while (value > 1) {
        const prime = smallestPrimeFactor[value];
        let bucket = primeToIndices.get(prime);
        if (bucket === undefined) {
            bucket = [];
            primeToIndices.set(prime, bucket);
        }
        bucket.push(i);
        // 去除此質因數的所有次冪，確保質因數不重複記錄
        while (value % prime === 0) {
            value = (value / prime) | 0;
        }
    }
}
```

### Step 4：初始化 BFS 佇列與走訪狀態

使用型別陣列建立定長佇列，避免動態陣列的記憶體開銷。
將索引 0 標記為已走訪並加入佇列，初始跳躍數為 0。

```typescript
// BFS 狀態：使用型別陣列佇列，避免一般陣列 push/shift 的額外開銷
const visitedIndex = new Uint8Array(n);
const queue = new Int32Array(n);
let head = 0;
let tail = 0;

queue[tail++] = 0;
visitedIndex[0] = 1;
let jumps = 0;
```

### Step 5：BFS 逐層展開，並在每層中處理相鄰步與質數傳送

以 `layerEnd` 標記當前層的結束位置，確保每次迴圈只處理同一跳躍層級的節點。
對每個節點，先確認是否已到達終點；若是則立即回傳目前跳躍數。

```typescript
while (head < tail) {
    // 一次處理整個 BFS 層
    const layerEnd = tail;
    while (head < layerEnd) {
        const current = queue[head++];
        // 在目前跳躍數下已到達目的地
        if (current === n - 1) {
            return jumps;
        }

        // ...
    }
    jumps++;
}
```

### Step 6：嘗試向前與向後的相鄰跳躍

對當前節點，分別嘗試索引加一（向前）與索引減一（向後）的相鄰移動；
若目標索引在範圍內且尚未走訪，則標記並加入佇列。

```typescript
while (head < tail) {
    const layerEnd = tail;
    while (head < layerEnd) {
        const current = queue[head++];
        // Step 5：確認是否到達終點

        // 向前相鄰跳
        const next = current + 1;
        if (next < n && visitedIndex[next] === 0) {
            visitedIndex[next] = 1;
            queue[tail++] = next;
        }

        // 向後相鄰跳
        const previous = current - 1;
        if (previous >= 0 && visitedIndex[previous] === 0) {
            visitedIndex[previous] = 1;
            queue[tail++] = previous;
        }

        // ...
    }
    jumps++;
}
```

### Step 7：若當前值為質數，執行質數傳送並消費該群組

判斷當前節點的值是否本身為質數（透過最小質因數等於自身來確認）；
若是，則批次將該質數群中所有未走訪的索引加入佇列，並在加入後立即刪除此群組，確保每個質數群至多被消費一次。

```typescript
while (head < tail) {
    const layerEnd = tail;
    while (head < layerEnd) {
        const current = queue[head++];
        // Step 5：確認是否到達終點

        // Step 6：向前與向後相鄰跳

        // 質數傳送：僅在 nums[current] 本身為質數時有效
        const valueAtCurrent = nums[current];
        if (valueAtCurrent > 1 && smallestPrimeFactor[valueAtCurrent] === valueAtCurrent) {
            const bucket = primeToIndices.get(valueAtCurrent);
            if (bucket !== undefined) {
                // 將此質數群中所有索引加入佇列，再刪除該群組
                // 每個質數群只消費一次，確保總工作量為線性
                for (let k = 0, len = bucket.length; k < len; k++) {
                    const target = bucket[k];
                    if (visitedIndex[target] === 0) {
                        visitedIndex[target] = 1;
                        queue[tail++] = target;
                    }
                }
                primeToIndices.delete(valueAtCurrent);
            }
        }
    }
    jumps++;
}
```

### Step 8：依題目保證不可能到不了終點，防禦性回傳 -1

BFS 結束後若仍未回傳，表示無法到達終點；依題目保證此情況不會發生，但仍以 -1 防禦性回傳。

```typescript
// 依題目保證不應到達此處，但防禦性地回傳 -1
return -1;
```

## 時間複雜度

- 建立最小質因數篩需 $O(V \log \log V)$，其中 $V$ 為值域上界（本題為 $10^6$），此為一次性前置作業；
- 建立質數至索引映射時，每個元素的質因數分解需 $O(\log V)$，共 $n$ 個元素，合計 $O(n \log V)$；
- BFS 中每個索引最多入隊一次，相鄰步共 $O(n)$；每個質數群最多被消費一次，所有傳送邊合計 $O(n)$；
- 總時間複雜度為 $O(V \log \log V + n \log V)$。

> $O(V \log \log V + n \log V)$

## 空間複雜度

- 最小質因數篩佔用 $O(V)$ 空間；
- 質數至索引映射中，所有清單的索引總數等於各元素的相異質因數總數，合計 $O(n \log V)$；
- BFS 佇列與走訪陣列各佔 $O(n)$；
- 總空間複雜度為 $O(V + n \log V)$。

> $O(V + n \log V)$
