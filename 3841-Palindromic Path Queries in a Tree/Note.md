# 3841. Palindromic Path Queries in a Tree

You are given an undirected tree with `n` nodes labeled 0 to `n - 1`. 
This is represented by a 2D array `edges` of length `n - 1`, 
where `edges[i] = [u_i, v_i]` indicates an undirected edge between nodes `u_i` and `v_i`.

You are also given a string `s` of length `n` consisting of lowercase English letters, 
where `s[i]` represents the character assigned to node `i`.

You are also given a string array `queries`, where each `queries[i]` is either:

- `"update u_i c"`: Change the character at node `u_i` to `c`. 
  Formally, update `s[u_i] = c`.
- `"query u_i v_i"`: Determine whether the string formed by the characters on the unique path from `u_i` to `v_i` (inclusive) 
  can be rearranged into a palindrome.

Return a boolean array `answer`, where `answer[j]` is `true` 
if the $j^{th}$ query of type `"query u_i v_i"` can be rearranged into a palindrome, and `false` otherwise.

**Constraints:**

- `1 <= n == s.length <= 5 * 10^4`
- `edges.length == n - 1`
- `edges[i] = [u_i, v_i]`
- `0 <= u_i, v_i <= n - 1`
- `s` consists of lowercase English letters.
- The input is generated such that edges represents a valid tree.
- `1 <= queries.length <= 5 * 10^4`
  - `queries[i] = "update u_i c"` or
  - `queries[i] = "query u_i v_i"`
  - `0 <= u_i, v_i <= n - 1`
  - `c` is a lowercase English letter.

## 基礎思路

本題要求在一棵帶有字母的樹上，支援兩種操作：修改單一節點的字母，以及詢問兩節點之間路徑上的字母能否重排成回文。由於節點數與操作數皆可達 $5 \times 10^4$，若每次詢問都沿路徑逐一統計字母，最壞情況將退化為每次線性，整體無法負荷，因此需要將路徑資訊轉化為可快速合成的形式。

在思考解法時，可掌握以下核心觀察：

- **回文判定只與各字母出現次數的奇偶性有關**：
  一組字母能重排成回文，若且唯若至多只有一種字母出現奇數次。因此每個字母可用一個位元表示，整段路徑的奇偶狀態即為所有節點位元的 xor，判定只需檢查結果是否至多一個位元為 1。

- **路徑資訊可由根前綴拆解**：
  若預先知道「從根到每個節點」的 xor 值，則兩節點間路徑的 xor 等於兩端前綴 xor 再相互抵銷。由於最近共同祖先在兩條前綴中各出現一次而被抵銷，必須再補回該祖先自身的位元。

- **單點修改會影響整棵子樹的前綴值**：
  修改某節點的字母時，所有以它為祖先的節點，其根前綴 xor 都會一起改變。而在深度優先搜尋的進入順序下，一棵子樹恰好對應一段連續區間，因此問題轉化為「區間 xor 修改、單點查詢」。

- **區間修改可透過差分陣列配合樹狀陣列完成**：
  在差分陣列的區間起點與終點後一位各 xor 一次，單點的實際變化量即為該位置的前綴 xor，可用樹狀陣列在對數時間內維護。

- **最近共同祖先可離線一次求出**：
  樹的結構在所有操作中不變，因此所有詢問的最近共同祖先可預先求得。藉由 Tarjan 離線演算法，可與建立前綴 xor、進出時間的深度優先搜尋合併在同一趟走訪中完成。

依據以上特性，可以採用以下策略：

- **以壓縮鄰接表儲存樹，並預先解析所有指令**，避免在主流程中重複處理字串。
- **以單次迭代式深度優先搜尋**，同時求出每個節點的進出時間、根前綴 xor，以及每個詢問的最近共同祖先，並避免遞迴過深。
- **以樹狀陣列維護子樹區間的 xor 修改量**，在詢問時將靜態前綴值與累積修改量合成，再補上共同祖先的字母位元。
- **以「至多一個位元為 1」判定是否可形成回文**。

此策略讓每次修改與詢問皆只需對數時間，整體能在限制內高效完成。

## 解題步驟

### Step 1：宣告全域共用的記憶體池

為了避免多次呼叫時反覆配置大量陣列，先在全域宣告整數與位元組兩種共用記憶體池，後續依需求擴充並切分使用。

```typescript
let INT_POOL = new Int32Array(0);
let BYTE_POOL = new Uint8Array(0);
```

### Step 2：計算所需空間並確保記憶體池足夠

依節點數與指令數估算所需的整數與位元組數量；若現有記憶體池不足則重新配置，並初始化切分位置。

```typescript
const commandCount = queries.length;
const requiredIntegerCount = 14 * n + 8 + 8 * commandCount;
if (INT_POOL.length < requiredIntegerCount) {
  INT_POOL = new Int32Array(requiredIntegerCount);
}
if (BYTE_POOL.length < n + commandCount) {
  BYTE_POOL = new Uint8Array(n + commandCount);
}
let poolOffset = 0;
```

### Step 3：建立從記憶體池切分視圖的輔助函數

此函數依序從整數記憶體池中切出指定長度的視圖，並推進切分位置，讓所有輔助陣列共用同一塊記憶體。

```typescript
/**
 * 從共用整數池中取出下一段視圖。
 *
 * @param length - 所需的整數數量。
 * @returns 具有指定長度的記憶體池視圖。
 */
const takePoolView = (length: number) => {
  const poolView = INT_POOL.subarray(poolOffset, poolOffset + length);
  poolOffset += length;
  return poolView;
};
```

### Step 4：以計數排序建立壓縮鄰接表

先統計每個節點的度數，再以前綴和求出每個節點鄰居區段的起點，最後依寫入位置把每條無向邊的兩個方向填入鄰接表。

```typescript
// 以計數排序建立壓縮鄰接表
const adjacencyStart = takePoolView(n + 1);
const adjacencyList = takePoolView(2 * n);
adjacencyStart.fill(0);
for (let edgeIndex = 0; edgeIndex < n - 1; edgeIndex++) {
  adjacencyStart[edges[edgeIndex][0] + 1]++;
  adjacencyStart[edges[edgeIndex][1] + 1]++;
}
for (let nodeIndex = 0; nodeIndex < n; nodeIndex++) {
  adjacencyStart[nodeIndex + 1] += adjacencyStart[nodeIndex];
}
const adjacencyWritePosition = adjacencyStart.slice(0, n);
for (let edgeIndex = 0; edgeIndex < n - 1; edgeIndex++) {
  const edgeFirstNode = edges[edgeIndex][0];
  const edgeSecondNode = edges[edgeIndex][1];
  adjacencyList[adjacencyWritePosition[edgeFirstNode]++] = edgeSecondNode;
  adjacencyList[adjacencyWritePosition[edgeSecondNode]++] = edgeFirstNode;
}
```

### Step 5：將每個節點的字母轉為單一位元遮罩

每個字母對應一個位元，之後即可用 xor 運算追蹤各字母出現次數的奇偶性。

```typescript
// 將每個節點的字母表示為單一位元
const letterMask = takePoolView(n);
for (let nodeIndex = 0; nodeIndex < n; nodeIndex++) {
  letterMask[nodeIndex] = 1 << (s.charCodeAt(nodeIndex) - 97);
}
```

### Step 6：解析指令類型與第一個節點

逐一掃描每條指令字串：以首字元判斷是否為更新指令，並依指令類型決定數字起始位置，逐字元解析出第一個節點編號，直到遇到空白為止。

```typescript
// 每個指令僅解析一次，取得其類型、節點，以及字母或第二個節點
const isUpdateCommand = BYTE_POOL.subarray(0, commandCount);
const commandNode = takePoolView(commandCount);
const commandValue = takePoolView(commandCount);
for (let commandIndex = 0; commandIndex < commandCount; commandIndex++) {
  const commandText = queries[commandIndex];
  const isUpdate = commandText.charCodeAt(0) === 117;
  let characterPosition = isUpdate ? 7 : 6;
  let parsedNode = 0;
  while (commandText.charCodeAt(characterPosition) !== 32) {
    parsedNode = parsedNode * 10 + commandText.charCodeAt(characterPosition++) - 48;
  }
  characterPosition++;
  isUpdateCommand[commandIndex] = isUpdate ? 1 : 0;
  commandNode[commandIndex] = parsedNode;

  // ...
}
```

### Step 7：解析新字母或第二個節點

若為更新指令，剩下的部分是新字母，將其轉為字母編號；若為詢問指令，則繼續解析出第二個節點編號。

```typescript
for (let commandIndex = 0; commandIndex < commandCount; commandIndex++) {
  // Step 6：解析指令類型與第一個節點

  if (isUpdate) {
    commandValue[commandIndex] = commandText.charCodeAt(characterPosition) - 97;
  } else {
    let parsedSecondNode = 0;
    for (; characterPosition < commandText.length; characterPosition++) {
      parsedSecondNode = parsedSecondNode * 10 + commandText.charCodeAt(characterPosition) - 48;
    }
    commandValue[commandIndex] = parsedSecondNode;
  }
}
```

### Step 8：配置深度優先搜尋所需的節點資訊陣列

為每個節點準備進入時間、離開時間、根前綴 xor 與父節點的儲存空間。

```typescript
const entryTime = takePoolView(n);
const exitTime = takePoolView(n);
const rootXor = takePoolView(n);
const parentNode = takePoolView(n);
```

### Step 9：將每個詢問連結到其兩個端點

為了讓深度優先搜尋走訪到某個節點時，能找出所有以它為端點的詢問，將每個詢問拆成兩條連結，分別以串列形式掛在兩個端點上，並記錄各自的另一個端點。

```typescript
// 將每個路徑查詢連結到兩個端點，讓搜尋過程可以求出其共同祖先
const firstQueryLinkAt = takePoolView(n).fill(-1);
const nextQueryLink = takePoolView(2 * commandCount);
const linkedEndpoint = takePoolView(2 * commandCount);
const lowestCommonAncestor = takePoolView(commandCount);
for (let commandIndex = 0; commandIndex < commandCount; commandIndex++) {
  if (isUpdateCommand[commandIndex] === 0) {
    const firstEndpoint = commandNode[commandIndex];
    const secondEndpoint = commandValue[commandIndex];
    const firstLink = 2 * commandIndex;
    const secondLink = firstLink + 1;
    nextQueryLink[firstLink] = firstQueryLinkAt[firstEndpoint];
    firstQueryLinkAt[firstEndpoint] = firstLink;
    linkedEndpoint[firstLink] = secondEndpoint;
    nextQueryLink[secondLink] = firstQueryLinkAt[secondEndpoint];
    firstQueryLinkAt[secondEndpoint] = secondLink;
    linkedEndpoint[secondLink] = firstEndpoint;
  }
}
```

### Step 10：配置並查集、拜訪標記與迭代搜尋堆疊

準備 Tarjan 離線演算法所需的並查集父指標與拜訪標記，以及迭代式深度優先搜尋所用的堆疊與每層下一條待處理邊的位置。

```typescript
const setParent = takePoolView(n);
const isVisited = BYTE_POOL.subarray(commandCount, commandCount + n);
const searchStack = takePoolView(n);
const nextEdgePosition = takePoolView(n);
isVisited.fill(0);
```

### Step 11：建立並查集的代表元查找函數

先沿父指標找到集合代表元，再走第二趟將途經的節點直接指向代表元，達成路徑壓縮。

```typescript
/**
 * 尋找節點所屬集合的代表元，並在過程中壓縮路徑。
 *
 * @param startNode - 欲查詢其集合的節點。
 * @returns 代表節點，即該集合目前對應的祖先。
 */
const findSetRepresentative = (startNode: number) => {
  let representative = startNode;
  while (setParent[representative] !== representative) {
    representative = setParent[representative];
  }
  let currentNode = startNode;
  while (setParent[currentNode] !== representative) {
    const followingNode = setParent[currentNode];
    setParent[currentNode] = representative;
    currentNode = followingNode;
  }
  return representative;
};
```

### Step 12：初始化以節點 0 為根的深度優先搜尋

將根節點放入堆疊，設定其父節點、根前綴 xor、進入時間與並查集，並標記為已拜訪；接著處理所有以根為端點、且另一端已拜訪的詢問。

```typescript
// 從節點 0 開始的迭代式深度優先搜尋：進入與離開時間、根前綴 xor、離線求共同祖先
let stackTop = 0;
let timer = 0;
searchStack[0] = 0;
nextEdgePosition[0] = adjacencyStart[0];
parentNode[0] = -1;
rootXor[0] = letterMask[0];
entryTime[0] = timer++;
setParent[0] = 0;
isVisited[0] = 1;
for (let queryLink = firstQueryLinkAt[0]; queryLink >= 0; queryLink = nextQueryLink[queryLink]) {
  if (isVisited[linkedEndpoint[queryLink]]) {
    lowestCommonAncestor[queryLink >> 1] = findSetRepresentative(linkedEndpoint[queryLink]);
  }
}
```

### Step 13：處理已走訪完所有鄰居的節點

每輪取出堆疊頂端節點與其下一條待處理邊；若該節點的鄰居皆已處理完，則記錄離開時間以封閉其子樹區間，並將它併入父節點的集合後出堆疊。

```typescript
while (stackTop >= 0) {
  const currentNode = searchStack[stackTop];
  const edgePosition = nextEdgePosition[stackTop];
  if (edgePosition >= adjacencyStart[currentNode + 1]) {
    // 所有子節點皆已處理完畢：封閉子樹區間並合併至父節點的集合
    exitTime[currentNode] = timer - 1;
    if (parentNode[currentNode] >= 0) {
      setParent[currentNode] = parentNode[currentNode];
    }
    stackTop--;
    continue;
  }

  // ...
}
```

### Step 14：進入下一個子節點並記錄其資訊

推進目前節點的邊位置並取出鄰居；若鄰居為父節點則略過。否則記錄子節點的父節點、根前綴 xor、進入時間，並初始化其並查集與拜訪標記。

```typescript
while (stackTop >= 0) {
  // Step 13：處理已走訪完所有鄰居的節點

  nextEdgePosition[stackTop] = edgePosition + 1;
  const childNode = adjacencyList[edgePosition];
  if (childNode === parentNode[currentNode]) {
    continue;
  }
  parentNode[childNode] = currentNode;
  rootXor[childNode] = rootXor[currentNode] ^ letterMask[childNode];
  entryTime[childNode] = timer++;
  setParent[childNode] = childNode;
  isVisited[childNode] = 1;

  // ...
}
```

### Step 15：離線求出最近共同祖先並將子節點推入堆疊

對所有以此子節點為端點的詢問，若另一端點已拜訪，其最近共同祖先即為該端點所屬集合的代表元；處理完後將子節點推入堆疊，繼續向下搜尋。

```typescript
while (stackTop >= 0) {
  // Step 13：處理已走訪完所有鄰居的節點

  // Step 14：進入下一個子節點並記錄其資訊

  // 若查詢的另一端點已被拜訪，其最近共同祖先即為該集合的代表元
  for (let queryLink = firstQueryLinkAt[childNode]; queryLink >= 0; queryLink = nextQueryLink[queryLink]) {
    if (isVisited[linkedEndpoint[queryLink]]) {
      lowestCommonAncestor[queryLink >> 1] = findSetRepresentative(linkedEndpoint[queryLink]);
    }
  }
  searchStack[++stackTop] = childNode;
  nextEdgePosition[stackTop] = adjacencyStart[childNode];
}
```

### Step 16：建立樹狀陣列與單點 xor 更新函數

以樹狀陣列維護差分陣列；此函數將遮罩 xor 進指定位置，並沿樹狀陣列向上更新所有涵蓋該位置的節點。

```typescript
const fenwickTree = takePoolView(n + 1).fill(0);

/**
 * 將遮罩 xor 進 Fenwick 差分陣列的指定 0-based 位置。
 *
 * @param position - 欲更新的 0-based 位置。
 * @param mask - 欲 xor 進去的遮罩。
 */
const fenwickXorAt = (position: number, mask: number) => {
  for (let treeIndex = position + 1; treeIndex <= n; treeIndex += treeIndex & -treeIndex) {
    fenwickTree[treeIndex] ^= mask;
  }
};
```

### Step 17：建立前綴 xor 查詢函數

差分陣列的前綴 xor 即為該位置累積的實際修改量，此函數沿樹狀陣列向下累積求得。

```typescript
/**
 * 回傳差分陣列至指定 0-based 位置的前綴 xor。
 *
 * @param position - 欲讀取的 0-based 位置。
 * @returns 涵蓋該位置之所有更新的累積 xor。
 */
const fenwickPrefixXor = (position: number) => {
  let accumulatedXor = 0;
  for (let treeIndex = position + 1; treeIndex > 0; treeIndex -= treeIndex & -treeIndex) {
    accumulatedXor ^= fenwickTree[treeIndex];
  }
  return accumulatedXor;
};
```

### Step 18：依序處理指令中的更新操作

逐一處理指令；遇到更新指令時，計算新舊字母位元的差異。若確實有變化，則更新節點字母，並對其子樹所對應的進出時間區間進行差分 xor 修改。

```typescript
const palindromePossible: boolean[] = [];
for (let commandIndex = 0; commandIndex < commandCount; commandIndex++) {
  if (isUpdateCommand[commandIndex] === 1) {
    const updatedNode = commandNode[commandIndex];
    const newLetterMask = 1 << commandValue[commandIndex];
    const maskChange = letterMask[updatedNode] ^ newLetterMask;
    if (maskChange !== 0) {
      // 翻轉整個子樹區間 [entryTime, exitTime]
      letterMask[updatedNode] = newLetterMask;
      fenwickXorAt(entryTime[updatedNode], maskChange);
      if (exitTime[updatedNode] + 1 < n) {
        fenwickXorAt(exitTime[updatedNode] + 1, maskChange);
      }
    }
  } else {
    // ...
  }
}
```

### Step 19：處理詢問指令並判定能否形成回文

對於詢問指令，將兩端點的靜態根前綴 xor 各自合上樹狀陣列中的累積修改量後互相 xor，再補回最近共同祖先目前的字母位元，即得路徑的奇偶遮罩；若遮罩至多一個位元為 1，則可重排成回文。

```typescript
for (let commandIndex = 0; commandIndex < commandCount; commandIndex++) {
  if (isUpdateCommand[commandIndex] === 1) {
    // Step 18：處理更新指令
  } else {
    const firstEndpoint = commandNode[commandIndex];
    const secondEndpoint = commandValue[commandIndex];
    const ancestorNode = lowestCommonAncestor[commandIndex];
    const pathMask = rootXor[firstEndpoint] ^ fenwickPrefixXor(entryTime[firstEndpoint])
      ^ rootXor[secondEndpoint] ^ fenwickPrefixXor(entryTime[secondEndpoint])
      ^ letterMask[ancestorNode];
    // 當至多只有一個字母出現奇數次時，即可重排為回文
    palindromePossible.push((pathMask & (pathMask - 1)) === 0);
  }
}
```

### Step 20：回傳所有詢問的結果

所有指令處理完畢後，回傳依序記錄的判定結果。

```typescript
return palindromePossible;
```

## 時間複雜度

- 設 $n$ 為節點數、$q$ 為指令數。
- 建立壓縮鄰接表與字母遮罩皆為 $O(n)$。
- 解析指令時，每條指令長度受節點編號位數限制，整體為 $O(q)$。
- 深度優先搜尋走訪每個節點與邊一次，並查集配合路徑壓縮處理所有詢問，整體為 $O((n + q)\log n)$ 以內。
- 每次更新與詢問皆執行常數次樹狀陣列操作，每次為 $O(\log n)$，共 $O(q \log n)$。
- 總時間複雜度為 $O((n + q)\log n)$。

> $O((n + q)\log n)$

## 空間複雜度

- 鄰接表、節點資訊、並查集、搜尋堆疊與樹狀陣列皆為 $O(n)$。
- 指令解析結果、詢問連結與共同祖先記錄皆為 $O(q)$。
- 總空間複雜度為 $O(n + q)$。

> $O(n + q)$
