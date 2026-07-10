# 3534. Path Existence Queries in a Graph II

You are given an integer `n` representing the number of nodes in a graph, labeled from 0 to `n - 1`.

You are also given an integer array `nums` of length `n` and an integer `maxDiff`.

An undirected edge exists between nodes `i` and `j` 
if the absolute difference between `nums[i]` and `nums[j]` is at most `maxDiff` 
(i.e., `|nums[i] - nums[j]| <= maxDiff`).

You are also given a 2D integer array `queries`. 
For each `queries[i] = [u_i, v_i]`, find the minimum distance between nodes `u_i` and `v_i`. 
If no path exists between the two nodes, return -1 for that query.

Return an array `answer`, where `answer[i]` is the result of the $i^{th}$ query.

Note: The edges between the nodes are unweighted.

**Constraints:**

- `1 <= n == nums.length <= 10^5`
- `0 <= nums[i] <= 10^5`
- `0 <= maxDiff <= 10^5`
- `1 <= queries.length <= 10^5`
- `queries[i] == [u_i, v_i]`
- `0 <= u_i, v_i < n`

## 基礎思路

本題要求在一個以數值差異定義邊的無向圖中，回答多組節點對之間的最短路徑距離查詢。由於邊的存在條件僅取決於數值差的絕對值是否不超過 `maxDiff`，圖的結構有其特殊性可以利用。

在思考解法時，可掌握以下核心觀察：

- **圖的連通性由數值排序決定**：
  若將節點依數值排序後，兩節點之間若有邊，代表其值的差距在閾值內；因此連通分量可用排序後的值差是否超出 `maxDiff` 來劃分——一旦出現斷口，即形成獨立分量。

- **最短距離等於排序後的「跳躍次數」**：
  在排序後的節點序列中，每次「跳躍」可以到達當前節點能直接連接的最遠節點；最短路徑即為從較小秩跳到較大秩所需的最少跳躍次數加一。

- **用滑動視窗預計算每個節點的最遠可達秩**：
  對排序後的每個節點，利用雙指針維護的滑動視窗，可在線性時間內確定每個節點透過單次跳躍能到達的最遠排名。

- **二進位提升加速多次跳躍查詢**：
  對每個查詢個別線性模擬跳躍的成本過高；透過預建「跳表」（binary lifting table），可在 $O(\log n)$ 時間內貪心地完成所需跳躍數的計算。

依據以上特性，可以採用以下策略：

- **對節點按數值排序，並建立排名映射**，以便後續操作在排序空間中進行。
- **線性掃描排序後的相鄰差值，以標記連通分量邊界**，若差距大於 `maxDiff` 則切換至新分量。
- **透過滑動視窗計算每個排名的最遠可達排名**，作為跳表第 0 層的基礎。
- **建立二進位提升跳表**，以倍增層數加速多跳查詢。
- **對每個查詢先做連通性檢查，再用貪心倒序跳躍計算最短距離**，若不同分量則回傳 -1。

此策略可將整體查詢複雜度從暴力 BFS 的 $O(q \cdot n)$ 降低至預處理 $O(n \log n)$ 加查詢 $O(\log n)$，大幅提升效率。

## 解題步驟

### Step 1：處理 n = 1 的邊界情況

當圖中只有一個節點時，所有查詢的起終點必定相同，距離皆為 0，可直接回傳並跳過後續處理。

```typescript
const queryCount = queries.length;
const queryResults = new Array<number>(queryCount);

// 單節點圖：每個查詢皆為同一節點，距離為 0。
if (n === 1) {
  for (let i = 0; i < queryCount; i++) {
    queryResults[i] = 0;
  }
  return queryResults;
}
```

### Step 2：依數值排序節點並建立排名與數值映射

將節點索引依其對應數值由小到大排序，獲得 `sortedIndexArray`；
接著為每個節點記錄其在排序後的排名（`positionInSorted`），以及排序後各排名對應的實際數值（`sortedValues`），以便後續操作。

```typescript
// 依節點數值排序節點索引，讓連通性問題轉化為鏈上問題。
const sortedIndexArray = Array.from({ length: n }, (_, index) => index);
sortedIndexArray.sort((a, b) => nums[a] - nums[b]);

// positionInSorted[node] 儲存節點在排序後的排名。
const positionInSorted = new Int32Array(n);
const sortedValues = new Int32Array(n);
for (let rank = 0; rank < n; rank++) {
  const node = sortedIndexArray[rank];
  positionInSorted[node] = rank;
  sortedValues[rank] = nums[node];
}
```

### Step 3：掃描排序後的相鄰差值，標記連通分量

依序比較相鄰排名的數值差；若差值大於 `maxDiff`，代表這兩個節點之間不存在邊，屬於不同連通分量，需遞增分量編號並記錄。

```typescript
// 根據排序後相鄰節點的數值差，為每個排名指定連通分量 id。
const componentId = new Int32Array(n);
let currentComponent = 0;
componentId[0] = 0;
for (let rank = 1; rank < n; rank++) {
  // 差距超過 maxDiff 代表鏈斷裂，進入新的分量。
  if (sortedValues[rank] - sortedValues[rank - 1] > maxDiff) {
    currentComponent++;
  }
  componentId[rank] = currentComponent;
}
```

### Step 4：用滑動視窗計算每個排名的單跳最遠可達排名

使用雙指針維護滑動視窗：對每個排名 `rank`，向右延伸 `windowEnd`，直到下一個排名的數值差超過 `maxDiff`；此時 `windowEnd` 即為從 `rank` 出發單次跳躍能到達的最遠排名。

```typescript
// furthestReach[rank] 是從 rank 出發，單次跳躍可抵達的最大排名。
const furthestReach = new Int32Array(n);
let windowEnd = 0;
for (let rank = 0; rank < n; rank++) {
  if (windowEnd < rank) {
    windowEnd = rank;
  }
  // 向右延伸，只要值差仍在 maxDiff 範圍內。
  while (windowEnd + 1 < n && sortedValues[windowEnd + 1] - sortedValues[rank] <= maxDiff) {
    windowEnd++;
  }
  furthestReach[rank] = windowEnd;
}
```

### Step 5：建立二進位提升跳表

以 `furthestReach` 作為跳表第 0 層；對每一層，利用前一層的結果計算「跳兩次等於此層跳一次」的對應排名，逐層建立直到 $\lceil \log_2 n \rceil + 1$ 層。

```typescript
// 以最遠可達指標為基礎，建立二進位提升跳表。
const levelCount = Math.max(1, Math.ceil(Math.log2(n)) + 1);
const jumpTable: Int32Array[] = new Array(levelCount);
jumpTable[0] = furthestReach;
for (let level = 1; level < levelCount; level++) {
  const previousLevel = jumpTable[level - 1];
  const currentLevel = new Int32Array(n);
  for (let rank = 0; rank < n; rank++) {
    // 前一層跳兩次等於此層跳一次。
    currentLevel[rank] = previousLevel[previousLevel[rank]];
  }
  jumpTable[level] = currentLevel;
}
```

### Step 6：處理每個查詢的起始情況與連通性檢查

對每個查詢，先判斷起終點是否相同（距離為 0），再將兩節點轉換至排序排名並確保 `lowerRank <= upperRank`，最後透過 `componentId` 判斷是否連通，若不同分量則直接回傳 -1。

```typescript
// 對每個查詢，利用分量檢查與貪心二進位提升跳躍求解。
for (let i = 0; i < queryCount; i++) {
  const startNode = queries[i][0];
  const endNode = queries[i][1];

  // 同一節點距離為 0。
  if (startNode === endNode) {
    queryResults[i] = 0;
    continue;
  }

  let lowerRank = positionInSorted[startNode];
  let upperRank = positionInSorted[endNode];
  if (lowerRank > upperRank) {
    const temporary = lowerRank;
    lowerRank = upperRank;
    upperRank = temporary;
  }

  // 不同分量代表不存在路徑。
  if (componentId[lowerRank] !== componentId[upperRank]) {
    queryResults[i] = -1;
    continue;
  }

  // ...
}
```

### Step 7：貪心倒序使用跳表計算最短跳躍數

從最大層數開始，倒序嘗試每一層的跳躍；若跳躍後的排名尚未超過目標排名，則接受此跳躍並累計跳數；最終補上最後一跳，得到總距離。

```typescript
for (let i = 0; i < queryCount; i++) {
  // Step 6：處理起始情況與連通性檢查

  // 貪心地從最大層開始，取不超過目標排名的最大跳躍。
  let hopCount = 0;
  let currentRank = lowerRank;
  for (let level = levelCount - 1; level >= 0; level--) {
    const nextRank = jumpTable[level][currentRank];
    if (nextRank < upperRank) {
      currentRank = nextRank;
      hopCount += 1 << level;
    }
  }

  // 最後一跳補足剩餘距離至目標排名。
  queryResults[i] = hopCount + 1;
}
```

### Step 8：回傳所有查詢的結果陣列

```typescript
return queryResults;
```

## 時間複雜度

- 節點排序需要 $O(n \log n)$；
- 建立排名與數值映射、掃描分量、滑動視窗各需 $O(n)$；
- 建立跳表共 $O(\log n)$ 層，每層處理 $n$ 個節點，需 $O(n \log n)$；
- 每個查詢透過跳表在 $O(\log n)$ 時間內完成，共 $q$ 個查詢需 $O(q \log n)$；
- 總時間複雜度為 $O((n + q) \log n)$。

> $O((n + q) \log n)$

## 空間複雜度

- 排序索引陣列、排名映射、數值陣列、分量陣列、最遠可達陣列各佔 $O(n)$；
- 跳表共 $O(\log n)$ 層，每層長度為 $n$，總計 $O(n \log n)$；
- 結果陣列佔 $O(q)$；
- 總空間複雜度為 $O(n \log n + q)$。

> $O(n \log n + q)$
