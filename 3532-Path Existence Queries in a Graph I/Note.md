# 3532. Path Existence Queries in a Graph I

You are given an integer `n` representing the number of nodes in a graph, labeled from 0 to `n - 1`.

You are also given an integer array `nums` of length `n` sorted in non-decreasing order, and an integer `maxDiff`.

An undirected edge exists between nodes `i` and `j` 
if the absolute difference between `nums[i]` and `nums[j]` is at most maxDiff (i.e., `|nums[i] - nums[j]| <= maxDiff`).

You are also given a 2D integer array `queries`. 
For each `queries[i] = [u_i, v_i]`, determine whether there exists a path between nodes `u_i` and `v_i`.

Return a boolean array `answer`, where `answer[i]` is `true` 
if there exists a path between `u_i` and `v_i` in the $i^{th}$ query and `false` otherwise.

**Constraints:**

- `1 <= n == nums.length <= 10^5`
- `0 <= nums[i] <= 10^5`
- `nums` is sorted in non-decreasing order.
- `0 <= maxDiff <= 10^5`
- `1 <= queries.length <= 10^5`
- `queries[i] == [u_i, v_i]`
- `0 <= u_i, v_i < n`

## 基礎思路

本題給定一個以非遞減順序排序的陣列 `nums`，並定義：若兩節點的值差距不超過 `maxDiff`，則它們之間存在一條邊。對於每筆查詢，需判斷兩節點之間是否存在路徑。

在思考解法時，可掌握以下核心觀察：

- **圖的連通性由排序特性決定**：
  由於 `nums` 已排序，節點 `i` 與節點 `j`（`i < j`）之間有邊，等價於 `nums[j] - nums[i] <= maxDiff`。換言之，只要相鄰節點之間的差距不超過 `maxDiff`，它們就必然同屬一個連通分量。

- **連通分量可以線性掃描識別**：
  由於排序保證了值的單調性，只需從左到右掃描一次，遇到相鄰差距超過 `maxDiff` 的位置即視為「斷點」，從斷點處起始一個新的連通分量。

- **路徑存在性等價於分量相同**：
  兩節點之間存在路徑，當且僅當它們屬於同一個連通分量，因此每筆查詢只需比較兩節點的分量編號即可。

依據以上特性，可以採用以下策略：

- **線性掃描一次，為每個節點分配連通分量編號**，遇到差距超過 `maxDiff` 的位置則令分量編號遞增。
- **對每筆查詢直接比較兩節點的分量編號**，相同則回傳 `true`，不同則回傳 `false`。

此策略將原本複雜的圖連通性問題轉化為一次線性掃描加上常數時間的查詢回答，效率極高。

## 解題步驟

### Step 1：線性掃描並分配連通分量編號

從索引 1 開始逐一掃描，比較當前節點與前一節點的值差距：
若差距超過 `maxDiff`，則視為斷點，令當前節點的分量編號為前一節點加一；否則繼承前一節點的分量編號。
索引 0 的節點預設為分量 0，由 `Int32Array` 初始化自動保證。

```typescript
// 為每個節點分配分量編號；差距超過 maxDiff 時即產生斷點。
const componentId = new Int32Array(n);

for (let index = 1; index < n; index++) {
  // 若差距過大則開啟新分量，否則延續前一分量。
  if (nums[index] - nums[index - 1] > maxDiff) {
    componentId[index] = componentId[index - 1] + 1;
  } else {
    componentId[index] = componentId[index - 1];
  }
}
```

### Step 2：初始化查詢結果陣列

建立與查詢數量等長的布林陣列，用於儲存每筆查詢的結果。

```typescript
const queryCount = queries.length;
const pathExistenceResults: boolean[] = new Array(queryCount);
```

### Step 3：逐筆查詢比對分量編號並回傳結果

對每筆查詢，取出兩個節點編號，比較它們的分量編號是否相同：
相同則兩節點連通，寫入 `true`；不同則寫入 `false`。

```typescript
// 兩節點連通若且唯若它們共享相同的分量編號。
for (let index = 0; index < queryCount; index++) {
  const query = queries[index];
  pathExistenceResults[index] = componentId[query[0]] === componentId[query[1]];
}

return pathExistenceResults;
```

## 時間複雜度

- 分配分量編號需掃描所有節點一次，耗時 $O(n)$；
- 回答每筆查詢只需一次常數時間的比較，共 $O(q)$，其中 $q$ 為查詢數量。
- 總時間複雜度為 $O(n + q)$。

> $O(n + q)$

## 空間複雜度

- 使用長度為 $n$ 的 `componentId` 陣列儲存每個節點的分量編號；
- 使用長度為 $q$ 的陣列儲存查詢結果；
- 無其他額外動態空間。
- 總空間複雜度為 $O(n + q)$。

> $O(n + q)$
