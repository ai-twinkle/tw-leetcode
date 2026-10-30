# 3970. Shortest Path With At Most K Consecutive Identical Characters

You are given an integer `n` representing the number of nodes in a directed weighted graph, numbered from `0` to `n - 1`. 
This is represented by a 2D integer array edges, 
where `edges[i] = [u_i, v_i, w_i]` represents a directed edge from node `u_i` to node `v_i` with weight `w_i`.

You are also given a string `labels` of length `n`, 
where `labels[i]` is the character assigned to node `i`, and an integer `k`.

Return the minimum total edge weight of a path from node 0 to node `n - 1` 
such that the concatenation of the labels of the nodes along the path contains at most `k` consecutive identical characters. 
If no valid path exists, return `-1`.

**Constraints:**

- `1 <= n == labels.length <= 5 * 10^4`
- `0 <= edges.length <= 5 * 10^4`
- `edges[i] == [u_i, v_i, w_i]`
- `0 <= u_i, v_i <= n - 1`
- `u_i != v_i`
- `1 <= w_i <= 10^4`
- `labels` consists of lowercase English letters
- `1 <= k <= 50`

## 基礎思路

本題要求在有向帶權圖中，找出從起點到終點的最小總權重路徑，但路徑上節點標籤串接後，不得出現超過 `k` 個連續相同字元。與一般最短路徑不同，這個限制使「抵達同一節點」的不同方式不再等價。

在思考解法時，可掌握以下核心觀察：

- **單純的節點距離不足以描述狀態**：
  抵達同一節點時，若目前累積的相同字元連續長度不同，後續可走的路徑也不同。因此狀態必須同時包含「所在節點」與「目前連續長度」。

- **連續長度只取決於相鄰節點標籤是否相同**：
  沿一條邊前進時，若兩端標籤相同，連續長度加一；否則重置為一。這個性質可在建圖時預先計算，避免搜尋時重複比較。

- **邊權皆為正，適用 Dijkstra 演算法**：
  在擴展後的狀態空間上，每個狀態第一次以最小距離取出時即為最佳值；而終點第一次被定案時，就是全域最小解。

- **連續長度較小者具有支配性**：
  若某節點已用較小的連續長度定案，那麼之後才取出、距離不更短且連續長度不更小的狀態，其後續可能性完全被涵蓋，可直接剪除。

依據以上特性，可以採用以下策略：

- **以壓縮的鄰接結構儲存圖**，並在建圖時預先標記每條邊兩端標籤是否相同。
- **將「節點 × 連續長度」編碼為單一狀態**，在此狀態空間上執行 Dijkstra。
- **以陣列實作二元最小堆並採延遲刪除**，降低物件配置的開銷。
- **對每個節點記錄已定案的最小連續長度**，剪除被支配的狀態，並在終點首次定案時立即回傳。

此策略能在滿足連續字元限制的前提下，正確且高效地求出最短路徑。

## 解題步驟

### Step 1：將節點標籤編碼為整數

先取得邊數，並將每個節點的小寫字母標籤轉為 `0` 至 `25` 的整數，以便後續快速比較兩節點標籤是否相同。

```typescript
const edgeCount = edges.length;

// 將標籤編碼為小整數以便快速比較
const labelCodes = new Uint8Array(n);
for (let node = 0; node < n; node++) {
  labelCodes[node] = labels.charCodeAt(node) - 97;
}
```

### Step 2：計算出度並建立 CSR 起始索引

為以 CSR（壓縮稀疏列）格式儲存鄰接表，先統計每個節點的出度，再做前綴和，使 `adjacencyStart[node]` 到 `adjacencyStart[node + 1]` 對應該節點所有出邊的區間。

```typescript
// 建立 CSR 鄰接表：先計算出度
const adjacencyStart = new Int32Array(n + 1);
for (let index = 0; index < edgeCount; index++) {
  adjacencyStart[edges[index][0] + 1]++;
}
for (let node = 0; node < n; node++) {
  adjacencyStart[node + 1] += adjacencyStart[node];
}
```

### Step 3：填入鄰接目標、權重與同標籤標記

依每條邊的起點，將目標節點與權重寫入對應位置，並預先標記該邊兩端標籤是否相同。搜尋時就能直接判斷連續長度應累加還是重置。

```typescript
const adjacencyTarget = new Int32Array(edgeCount);
const adjacencyWeight = new Int32Array(edgeCount);
const adjacencySameLabel = new Uint8Array(edgeCount);
const fillCursor = adjacencyStart.slice(0, n);
for (let index = 0; index < edgeCount; index++) {
  const edge = edges[index];
  const from = edge[0];
  const to = edge[1];
  const position = fillCursor[from]++;
  adjacencyTarget[position] = to;
  adjacencyWeight[position] = edge[2];
  adjacencySameLabel[position] = labelCodes[from] === labelCodes[to] ? 1 : 0;
}
```

### Step 4：初始化狀態距離與各節點已定案的連續長度

將「節點 × 連續長度」編碼為單一狀態索引，並以 `Float64Array` 儲存距離，避免超出 32 位元整數範圍。

`finalizedRun` 記錄每個節點已定案的最小連續長度，初始值設為 `k + 1`，代表尚未定案。

```typescript
// 狀態 = node * k + (runLength - 1)；距離可能超出 int32 範圍
const stateCount = n * k;
const distance = new Float64Array(stateCount).fill(Infinity);

// 每個節點已定案的最小連續長度；之後彈出的較大連續長度會被支配
const finalizedRun = new Int32Array(n).fill(k + 1);
```

### Step 5：配置二元最小堆的儲存空間

以兩個平行的型別化陣列分別存放鍵值（距離）與狀態，實作採延遲刪除的二元最小堆。容量依可能的最大推入次數預先配置。

```typescript
// 以平行型別化陣列實作的二元最小堆（延遲刪除）
const heapCapacity = edgeCount * k + 2;
const heapKey = new Float64Array(heapCapacity);
const heapState = new Int32Array(heapCapacity);
let heapSize = 0;
```

### Step 6：實作推入堆的函數

新元素從堆尾開始向上浮動：只要父節點的鍵值較大，就將父節點往下移，最後把新元素放到正確位置。

```typescript
/**
 * 將一個狀態連同其暫定距離推入堆中。
 * @param key 狀態的暫定距離
 * @param state 編碼後的狀態索引
 */
const heapPush = (key: number, state: number): void => {
  let position = heapSize++;
  while (position > 0) {
    const parent = (position - 1) >> 1;
    if (heapKey[parent] <= key) {
      break;
    }
    heapKey[position] = heapKey[parent];
    heapState[position] = heapState[parent];
    position = parent;
  }
  heapKey[position] = key;
  heapState[position] = state;
};
```

### Step 7：實作彈出堆頂的函數

移除堆頂後，將堆尾元素從根部向下沉：每次與較小的子節點比較，若子節點較小則上移，直到恢復堆序。

```typescript
/**
 * 移除堆頂並恢復堆序。
 */
const heapPop = (): void => {
  heapSize--;
  if (heapSize === 0) {
    return;
  }
  const key = heapKey[heapSize];
  const state = heapState[heapSize];
  let position = 0;
  const half = heapSize >> 1;
  while (position < half) {
    let child = 2 * position + 1;
    const right = child + 1;
    if (right < heapSize && heapKey[right] < heapKey[child]) {
      child = right;
    }
    if (heapKey[child] >= key) {
      break;
    }
    heapKey[position] = heapKey[child];
    heapState[position] = heapState[child];
    position = child;
  }
  heapKey[position] = key;
  heapState[position] = state;
};
```

### Step 8：設定終點並將起點狀態放入堆中

起點為節點 `0`，連續長度為 1，對應狀態索引 `0`。將其距離設為 0 並推入堆中，作為 Dijkstra 的起始。

```typescript
const target = n - 1;
distance[0] = 0;
heapPush(0, 0);
```

### Step 9：取出堆頂狀態並解碼

每一輪取出目前距離最小的狀態。若其距離大於已記錄的距離，代表這是延遲刪除留下的過期項目，直接略過。否則從狀態索引還原出所在節點與連續長度。

```typescript
while (heapSize > 0) {
  const currentDistance = heapKey[0];
  const state = heapState[0];
  heapPop();

  if (currentDistance > distance[state]) {
    continue;
  }
  const node = (state / k) | 0;
  const runLength = state - node * k + 1;

  // ...
}
```

### Step 10：剪除被支配的狀態並檢查是否抵達終點

先前定案的狀態距離不會更長。若該節點已以不大於目前的連續長度定案，則目前狀態被支配，可略過；否則更新該節點的定案連續長度。

若此節點正是終點，則此時的距離即為最佳解，直接回傳。

```typescript
while (heapSize > 0) {
  // Step 9：取出堆頂狀態並解碼

  // 被支配：同一節點已以更短或相等的距離與更小的連續長度定案
  if (runLength >= finalizedRun[node]) {
    continue;
  }
  finalizedRun[node] = runLength;

  // 終點第一個定案的狀態即為最佳解
  if (node === target) {
    return currentDistance;
  }

  // ...
}
```

### Step 11：走訪出邊並計算下一個狀態的連續長度

透過 CSR 區間走訪目前節點的所有出邊：

- 若邊兩端標籤相同，連續長度加一，超過 `k` 即違反限制而略過。
- 若標籤不同，連續長度重置為 1。

```typescript
while (heapSize > 0) {
  // Step 9：取出堆頂狀態並解碼

  // Step 10：剪除被支配的狀態並檢查是否抵達終點

  for (let position = adjacencyStart[node], end = adjacencyStart[node + 1]; position < end; position++) {
    const next = adjacencyTarget[position];
    let nextRun = 1;
    if (adjacencySameLabel[position] === 1) {
      nextRun = runLength + 1;
      if (nextRun > k) {
        continue;
      }
    }

    // ...
  }
}
```

### Step 12：剪除已被支配的鄰居狀態並進行鬆弛

若鄰居節點已以不大於 `nextRun` 的連續長度定案，則此狀態不可能更優，直接略過。

否則計算新狀態的距離；若比目前紀錄更短，就更新距離並推入堆中。

```typescript
while (heapSize > 0) {
  // Step 9：取出堆頂狀態並解碼

  // Step 10：剪除被支配的狀態並檢查是否抵達終點

  for (let position = adjacencyStart[node], end = adjacencyStart[node + 1]; position < end; position++) {
    // Step 11：計算下一個狀態的連續長度

    // 略過已被更小的定案連續長度所支配的狀態
    if (nextRun >= finalizedRun[next]) {
      continue;
    }
    const nextState = next * k + nextRun - 1;
    const nextDistance = currentDistance + adjacencyWeight[position];
    if (nextDistance < distance[nextState]) {
      distance[nextState] = nextDistance;
      heapPush(nextDistance, nextState);
    }
  }
}
```

### Step 13：無法抵達終點時回傳 -1

若堆已清空仍未定案終點，代表不存在符合連續字元限制的路徑，回傳 `-1`。

```typescript
return -1;
```

## 時間複雜度

- 設 $n$ 為節點數、$m$ 為邊數，則編碼標籤與建立 CSR 鄰接表需 $O(n + m)$。
- 每個節點的定案連續長度嚴格遞減，因此最多被展開 $k$ 次，所有出邊的鬆弛總次數為 $O(m \cdot k)$。
- 每次鬆弛最多推入一次堆，堆大小為 $O(m \cdot k)$，每次堆操作需 $O(\log(m \cdot k))$。
- 總時間複雜度為 $O(n + m + m \cdot k \log(m \cdot k))$。

> $O(n + m + m \cdot k \log(m \cdot k))$

## 空間複雜度

- CSR 鄰接結構與標籤編碼需 $O(n + m)$。
- 狀態距離陣列需 $O(n \cdot k)$。
- 堆的容量為 $O(m \cdot k)$。
- 總空間複雜度為 $O((n + m) \cdot k)$。

> $O((n + m) \cdot k)$
