# 2492. Minimum Score of a Path Between Two Cities

You are given a positive integer `n` representing `n` cities numbered from `1` to `n`. 
You are also given a 2D array `roads` where `roads[i] = [a_i, b_i, distance_i]` indicates 
that there is a bidirectional road between cities `a_i` and `b_i` with a distance equal to `distance_i`. 
The cities graph is not necessarily connected.

The score of a path between two cities is defined as the minimum distance of a road in this path.

Return the minimum possible score of a path between cities `1` and `n`.

Note:

- A path is a sequence of roads between two cities.
- It is allowed for a path to contain the same road multiple times, 
  and you can visit cities `1` and `n` multiple times along the path.

The test cases are generated such that there is at least one path between `1` and `n`.

**Constraints:**

- `2 <= n <= 10^5`
- `1 <= roads.length <= 10^5`
- `roads[i].length == 3`
- `1 <= a_i, b_i <= n`
- `a_i != b_i`
- `1 <= distance_i <= 10^4`
- There are no repeated edges.
- There is at least one path between `1` and `n`.

## 基礎思路

本題要求找出城市 `1` 到城市 `n` 的路徑中，所有可能路徑得分的最小值，而路徑得分定義為該路徑上最小的邊權重。

由於題目允許重複走同一條道路，可以觀察以下核心要點：

- **路徑得分由最小邊權重決定**：
  只要能抵達某條邊，就可以無限次地來回走這條邊，因此路徑得分即為途中可經過的最小邊權重。

- **連通分量決定可達邊集合**：
  城市 `1` 所在的連通分量中的所有邊，都可以透過重複走訪而被納入路徑，因此答案即為城市 `1` 所在連通分量中所有邊的最小權重。

- **圖的稀疏表示對效能至關重要**：
  節點數與邊數均可達 `10^5`，應採用鄰接表或壓縮格式儲存圖，以避免不必要的空間與時間浪費。

- **深度優先搜尋可完整遍歷連通分量**：
  從城市 `1` 出發進行 DFS，走過所有可達節點，同時記錄所有遇到的邊權重，取其最小值即為答案。

依據以上特性，可採用以下策略：

- **以 CSR（Compressed Sparse Row）格式建立鄰接表**，減少動態記憶體分配的開銷。
- **從城市 `1` 開始進行迭代式 DFS**，遍歷其連通分量中的所有節點與邊。
- **在遍歷過程中持續更新最小邊權重**，遍歷結束後即得到答案。

## 解題步驟

### Step 1：計算每個城市的度數

遍歷所有道路，統計每個城市出現的次數（即度數），作為後續建立 CSR 格式鄰接表的基礎。

```typescript
const roadCount = roads.length;

// 以型別化陣列建立壓縮鄰接表（CSR 格式）
const degree = new Int32Array(n + 1);
for (let index = 0; index < roadCount; index++) {
  const road = roads[index];
  degree[road[0]]++;
  degree[road[1]]++;
}
```

### Step 2：計算每個城市鄰居區塊的起始偏移量

利用度數做前綴和，計算出每個城市在 CSR 鄰接表中的起始位置，以便後續直接索引。

```typescript
// 計算每個城市鄰居區塊的起始偏移量
const offset = new Int32Array(n + 2);
for (let city = 1; city <= n; city++) {
  offset[city + 1] = offset[city] + degree[city];
}
```

### Step 3：填入鄰居節點與對應邊權重

依照偏移量，將每條道路的兩端點與距離填入 CSR 格式的 `neighbor` 與 `weight` 陣列中，並以 `cursor` 追蹤各城市當前的寫入位置。

```typescript
// 將鄰居與權重填入正確位置
const totalEndpoints = roadCount * 2;
const neighbor = new Int32Array(totalEndpoints);
const weight = new Int32Array(totalEndpoints);
const cursor = offset.slice(0, n + 1);
for (let index = 0; index < roadCount; index++) {
  const road = roads[index];
  const cityA = road[0];
  const cityB = road[1];
  const distance = road[2];
  const positionA = cursor[cityA]++;
  neighbor[positionA] = cityB;
  weight[positionA] = distance;
  const positionB = cursor[cityB]++;
  neighbor[positionB] = cityA;
  weight[positionB] = distance;
}
```

### Step 4：初始化迭代式 DFS 所需的資料結構

建立訪問標記陣列與明確的堆疊，從城市 `1` 開始出發，並將最小得分初始化為整數最大值。

```typescript
// 以明確堆疊對城市 1 的連通分量進行 DFS，並追蹤最小邊權重
const visited = new Uint8Array(n + 1);
const stack = new Int32Array(n);
let stackSize = 0;
stack[stackSize++] = 1;
visited[1] = 1;
let minimumScore = 0x7fffffff;
```

### Step 5：遍歷連通分量並更新最小邊權重

從堆疊中取出當前城市，遍歷其所有相鄰邊；每條邊的權重都直接參與最小值更新，因為連通分量內的所有邊皆可重複走訪而納入路徑；若相鄰節點尚未訪問，則將其推入堆疊。

```typescript
while (stackSize > 0) {
  const city = stack[--stackSize];
  const start = offset[city];
  const end = offset[city + 1];
  for (let position = start; position < end; position++) {
    const edgeWeight = weight[position];

    // 此連通分量中的每條邊皆可到達，因此都可貢獻至答案
    if (edgeWeight < minimumScore) {
      minimumScore = edgeWeight;
    }
    const next = neighbor[position];
    if (visited[next] === 0) {
      visited[next] = 1;
      stack[stackSize++] = next;
    }
  }
}
```

### Step 6：回傳最小得分

DFS 結束後，`minimumScore` 即為城市 `1` 連通分量中所有邊的最小權重，直接回傳。

```typescript
return minimumScore;
```

## 時間複雜度

- 統計度數與填入 CSR 各需遍歷全部邊一次，共 $O(m)$，其中 $m$ 為道路數量；
- 計算偏移量需遍歷所有城市，共 $O(n)$；
- DFS 遍歷連通分量中每個節點與每條邊各一次，共 $O(n + m)$。
- 總時間複雜度為 $O(n + m)$。

> $O(n + m)$

## 空間複雜度

- CSR 格式的 `offset` 陣列大小為 $O(n)$；
- `neighbor` 與 `weight` 陣列大小各為 $O(m)$；
- DFS 使用的 `visited` 與 `stack` 陣列大小為 $O(n)$。
- 總空間複雜度為 $O(n + m)$。

> $O(n + m)$
