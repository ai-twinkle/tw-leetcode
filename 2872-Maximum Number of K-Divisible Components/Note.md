# 2872. Maximum Number of K-Divisible Components

There is an undirected tree with `n` nodes labeled from `0` to `n - 1`. 
You are given the integer `n` and a 2D integer array `edges` of length `n - 1`, 
where `edges[i] = [a_i, b_i]` indicates that there is an edge between nodes `a_i` and `b_i` in the tree.

You are also given a 0-indexed integer array `values` of length `n`, where `values[i]` is the value associated with the $i^{th}$ node, and an integer `k`.

A valid split of the tree is obtained by removing any set of edges, possibly empty, 
from the tree such that the resulting components all have values that are divisible by `k`, 
where the value of a connected component is the sum of the values of its nodes.

Return the maximum number of components in any valid split.

**Constraints:**

- `1 <= n <= 3 * 10^4`
- `edges.length == n - 1`
- `edges[i].length == 2`
- `0 <= a_i, b_i < n`
- `values.length == n`
- `0 <= values[i] <= 10^9`
- `1 <= k <= 10^9`
- Sum of `values` is divisible by `k`.
- The input is generated such that `edges` represents a valid tree.

## 基礎思路

題目給定一棵無向樹，每個節點有一個非負權重，要求透過刪除任意集合的邊（也可以一條都不刪），使得最後形成的所有連通元件，其「節點權重總和」都可以被給定的整數 `k` 整除，並在所有合法切割方案中，最大化連通元件的數量。

要理解這個問題，可以掌握以下幾個關鍵觀察：

* **樹結構的任意切割等價於切斷若干邊**
  由於輸入是一棵樹，不包含環，每切斷一條邊就會多出一個連通元件。因此，只要知道有哪些子樹的總和可以被 `k` 整除，就可以決定是否在該子樹與其父節點之間切邊。

* **子樹總和是否可被 `k` 整除是局部可決策的**
  若某節點的整個子樹權重總和可被 `k` 整除，則可以在該子樹與父節點之間切斷邊，將這整個子樹視為一個獨立連通元件；反之，必須把這個子樹的「餘數部分」往上合併到父節點。

* **後序遍歷天然適合自底向上的子樹計算**
  子樹總和必須包含所有子節點的貢獻，適合採用自底向上的 DFS 後序遍歷：先處理完所有子節點，再回到父節點，根據子樹總和是否能被 `k` 整除，決定是否增加一個新元件，並把餘數往上傳遞。

* **使用取餘而非原始總和即可判斷可否切割**
  只需關心每棵子樹的權重總和對 `k` 的餘數：

    * 若餘數為 `0`，表示該子樹本身可以形成一個合法元件。
    * 若餘數不為 `0`，則必須與父節點的餘數相加後再取餘，繼續向上合併。

* **迭代式 DFS 可避免遞迴堆疊風險**
  在節點數上界為 `3 * 10^4` 的情況下，遞迴 DFS 雖然大多情況可行，但為了在語言層級避免呼叫堆疊限制，採用顯式堆疊的迭代式後序遍歷更為穩健，也便於精確控制每個節點「進入」與「完成」時機。

基於以上觀察，可以採用以下策略：

* 先將樹轉換為緊湊的鄰接串列表示，以利快速遍歷。
* 將每個節點的權重預先轉為對 `k` 的餘數，後續只在餘數空間 `[0, k)` 中累積。
* 使用顯式堆疊進行後序 DFS：

    * 當所有子節點處理完畢後，計算當前子樹餘數；
    * 若餘數為 `0`，計數一個合法元件，並向父節點傳遞 `0`；
    * 否則將餘數加到父節點的累積餘數中並取餘。
* 最終累計的元件數，即為可以達成的最大合法連通元件數。

## 解題步驟

### Step 1：使用緊湊型別陣列建構樹的鄰接串列

首先，以預先配置好的型別陣列表示鄰接串列：
使用 `adjacencyHead` 紀錄每個節點對應的第一條邊索引，並以兩個平行陣列 `adjacencyToNode`、`adjacencyNextEdgeIndex` 串起所有邊，達成記憶體連續且快取友善的結構。

```typescript
// 使用緊湊的型別陣列建構鄰接串列以提升快取存取效率
const adjacencyHead = new Int32Array(n);
adjacencyHead.fill(-1);

const totalEdges = (n - 1) * 2;
const adjacencyNextEdgeIndex = new Int32Array(totalEdges);
const adjacencyToNode = new Int32Array(totalEdges);

let edgeWriteIndex = 0;
for (let edgeArrayIndex = 0; edgeArrayIndex < edges.length; edgeArrayIndex++) {
  const nodeA = edges[edgeArrayIndex][0];
  const nodeB = edges[edgeArrayIndex][1];

  // 新增邊 nodeA -> nodeB
  adjacencyToNode[edgeWriteIndex] = nodeB;
  adjacencyNextEdgeIndex[edgeWriteIndex] = adjacencyHead[nodeA];
  adjacencyHead[nodeA] = edgeWriteIndex;
  edgeWriteIndex++;

  // 新增邊 nodeB -> nodeA
  adjacencyToNode[edgeWriteIndex] = nodeA;
  adjacencyNextEdgeIndex[edgeWriteIndex] = adjacencyHead[nodeB];
  adjacencyHead[nodeB] = edgeWriteIndex;
  edgeWriteIndex++;
}
```

### Step 2：預先計算每個節點的權重對 k 的餘數

為避免在 DFS 過程中重複進行取模運算，先將每個節點的權重轉為對 `k` 的餘數，之後僅在餘數空間內進行加總與合併。

```typescript
// 預先計算每個節點的權重對 k 的餘數，以避免重複取模
const valuesModulo = new Int32Array(n);
for (let nodeIndex = 0; nodeIndex < n; nodeIndex++) {
  const nodeValue = values[nodeIndex];
  valuesModulo[nodeIndex] = nodeValue % k;
}
```

### Step 3：準備父節點紀錄與迭代 DFS 所需堆疊結構

為了在無遞迴的情況下完成後序遍歷，需要顯式維護父節點資訊與多個堆疊：

* `parentNode`：避免從子節點經由邊走回父節點形成「逆向重訪」。
* `nodeStack`：每一層堆疊上對應的當前節點。
* `edgeIteratorStack`：紀錄每個節點目前遍歷到哪一條鄰接邊。
* `remainderStack`：紀錄每個節點子樹目前累積的餘數。
  同時定義一個特殊的終結標記值，用來表示該節點的所有子節點都已處理完畢，下一步應該進行「收尾計算」。

```typescript
// 父節點陣列，用來避免沿著邊走回父節點
const parentNode = new Int32Array(n);
parentNode.fill(-1);

// 顯式堆疊以進行迭代式後序 DFS
const nodeStack = new Int32Array(n);          // 每層堆疊對應的節點編號
const edgeIteratorStack = new Int32Array(n);  // 每個節點目前遍歷到的鄰接邊索引
const remainderStack = new Int32Array(n);     // 每個節點子樹累積的餘數值

// 特殊標記值：表示該節點所有子節點均已處理完畢，下一步需進行收尾
const FINALIZE_SENTINEL = -2;

let stackSize: number;
```

### Step 4：初始化 DFS 根節點與元件計數

選擇節點 `0` 作為 DFS 根，將其推入堆疊作為起始狀態：
設定其初始餘數為自身權重的餘數，並記錄父節點為 `-1` 代表無父節點。
同時初始化計數器，用來累積可形成的合法元件數。

```typescript
// 從根節點 0 開始初始化 DFS
nodeStack[0] = 0;
edgeIteratorStack[0] = adjacencyHead[0];
remainderStack[0] = valuesModulo[0];
parentNode[0] = -1;
stackSize = 1;

let componentCount = 0;
```

### Step 5：以單次迭代式後序 DFS 計算可切成的合法元件數

透過 `while` 迴圈維護一個顯式堆疊，實作後序 DFS：

* 若當前節點被標記為終結狀態，說明所有子節點都已處理完畢：

    * 檢查整個子樹餘數是否為 `0`，若是則記錄一個合法元件；
    * 將該子樹的餘數加回父節點的累積餘數並適度取模；
    * 將此節點從堆疊彈出。
* 若尚未終結，持續從鄰接串列中尋找尚未拜訪的子節點：

    * 跳過指向父節點的邊；
    * 將子節點推入堆疊，延伸 DFS；
    * 若不再有子節點可前往，將當前節點標記為終結狀態，待下一輪處理收尾。

```typescript
// 單次迭代的後序 DFS，用於計算最多可切出的 k 可整除元件數
while (stackSize > 0) {
  const stackTopIndex = stackSize - 1;
  const currentNode = nodeStack[stackTopIndex];
  let currentEdgeIterator = edgeIteratorStack[stackTopIndex];

  // 若目前標記為終結狀態，表示所有子節點已處理完畢，進入收尾階段
  if (currentEdgeIterator === FINALIZE_SENTINEL) {
    const currentRemainder = remainderStack[stackTopIndex];

    // 若整個子樹的和可被 k 整除，則形成一個合法元件
    if (currentRemainder === 0) {
      componentCount++;
    }

    // 將當前節點自堆疊彈出
    stackSize--;

    // 若存在父節點，則將此子樹的餘數累加到父節點的餘數中
    if (stackSize > 0) {
      const parentStackIndex = stackSize - 1;
      let parentRemainder = remainderStack[parentStackIndex] + currentRemainder;

      // 透過少量取模操作，將父節點餘數維持在 [0, k) 區間內
      if (parentRemainder >= k) {
        parentRemainder %= k;
      }

      remainderStack[parentStackIndex] = parentRemainder;
    }

    continue;
  }

  // 嘗試尋找尚未拜訪的子節點以繼續向下 DFS
  let hasUnvisitedChild = false;
  while (currentEdgeIterator !== -1) {
    const neighborNode = adjacencyToNode[currentEdgeIterator];
    currentEdgeIterator = adjacencyNextEdgeIndex[currentEdgeIterator];

    // 略過指回父節點的反向邊，避免往回走
    if (neighborNode === parentNode[currentNode]) {
      continue;
    }

    // 記錄稍後從哪條邊開始繼續遍歷此節點的其他鄰居
    edgeIteratorStack[stackTopIndex] = currentEdgeIterator;

    // 將子節點推入堆疊以進一步遍歷
    const childStackIndex = stackSize;
    nodeStack[childStackIndex] = neighborNode;
    parentNode[neighborNode] = currentNode;
    edgeIteratorStack[childStackIndex] = adjacencyHead[neighborNode];
    remainderStack[childStackIndex] = valuesModulo[neighborNode];
    stackSize++;

    hasUnvisitedChild = true;
    break;
  }

  // 若再也沒有子節點可拜訪，將此節點標記為終結狀態，等待下一輪收尾處理
  if (!hasUnvisitedChild) {
    edgeIteratorStack[stackTopIndex] = FINALIZE_SENTINEL;
  }
}
```

### Step 6：回傳最多可切出的合法連通元件數

當 DFS 完成時，所有子樹的餘數已正確向上合併，並在每次子樹餘數為 `0` 時累加了元件數，最終直接回傳累計結果。

```typescript
// componentCount 此時即為最多可切出的 k 可整除連通元件數
return componentCount;
```

## 時間複雜度

- 建構樹的鄰接串列需要遍歷全部 `n - 1` 條邊，為線性時間。
- 預先計算每個節點權重對 `k` 的餘數需要遍歷所有 `n` 個節點。
- 迭代式後序 DFS 會走訪每條邊與每個節點常數次，整體仍為線性時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 鄰接串列使用大小為 `O(n)` 的型別陣列儲存所有邊。
- 額外使用 `O(n)` 大小的堆疊、父節點陣列與餘數陣列。
- 除上述結構外，僅有常數數量的輔助變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
