# 3331. Find Subtree Sizes After Changes

You are given a tree rooted at node 0 that consists of `n` nodes numbered from `0` to `n - 1`. 
The tree is represented by an array `parent` of size `n`, where `parent[i]` is the parent of node `i`. 
Since node 0 is the root, `parent[0] == -1`.

You are also given a string `s` of length `n`, where `s[i]` is the character assigned to node `i`.

We make the following changes on the tree one time simultaneously for all nodes x from `1` to `n - 1`:

- Find the closest node `y` to node `x` such that `y` is an ancestor of `x`, and `s[x] == s[y]`.
- If node `y` does not exist, do nothing.
- Otherwise, remove the edge between `x` and its current parent and 
  make node `y` the new parent of `x` by adding an edge between them.

Return an array `answer` of size n where `answer[i]` is the size of the subtree rooted at node i in the final tree.

**Constraints:**

- `n == parent.length == s.length`
- `1 <= n <= 10^5`
- `0 <= parent[i] <= n - 1` for all `i >= 1`.
- `parent[0] == -1`
- `parent` represents a valid tree.
- `s` consists only of lowercase English letters.

## 基礎思路

本題給定一棵以節點 0 為根的樹，每個節點帶有一個字元。所有非根節點會同時把父節點改為「最近且字元相同的祖先」，若不存在則維持原父節點。題目要求回傳調整後新樹中每個節點的子樹大小。節點數最多可達 $10^5$，必須以線性時間完成，並避免遞迴過深。

在思考解法時，可掌握以下核心觀察：

- **所有調整都以原始樹為依據**：
  由於變更是同時發生的，每個節點尋找祖先時看的是原始樹上的根路徑，而非調整中的樹，因此只需在原始樹上走訪一次即可決定所有新父節點。

- **最近同字元祖先只與當前根路徑有關**：
  走訪到某節點時，只要知道當前根路徑上每種字元最深的持有者，就能以常數時間查出它的新父節點。

- **路徑資訊具有堆疊性質**：
  進入節點時更新該字元的最深持有者，離開時還原為進入前的狀態，即可讓每個子樹看到正確的根路徑資訊。

- **新父節點必為原樹中的祖先**：
  新父節點一定位於原始根路徑上，因此在深度優先走訪中，它必定比該節點更晚完成。只要在離開節點時把已完成的子樹大小累加到新父節點，就能由下而上正確算出新樹的子樹大小。

- **遞迴深度可能過大**：
  樹可能退化成一條長鏈，深度可達 $10^5$，因此需要改用顯式堆疊模擬深度優先走訪。

依據以上特性，可以採用以下策略：

- **先以鏈結串列建立每個節點的子節點清單**，以便在迭代走訪中逐一取出子節點。
- **以顯式堆疊進行深度優先走訪**，並維護每種字元在當前根路徑上的最深持有者。
- **進入節點時決定其新父節點**，同時保存並覆寫該字元的持有者。
- **離開節點時還原持有者**，並將該節點的子樹大小累加至新父節點。

此策略只需一次走訪即可同時完成「重新接枝」與「子樹大小計算」，並完全避免遞迴深度問題。

## 解題步驟

### Step 1：初始化節點數量與子節點鏈結結構

先取得節點總數，並配置三個陣列：

- 字元快取陣列：記錄每個節點的字元索引。
- 第一個子節點陣列：記錄每個節點的第一個子節點，初始值設為 `-1` 表示沒有子節點。
- 下一個兄弟節點陣列：記錄每個節點的下一個兄弟節點。

```typescript
const nodeCount = parent.length;
const characterOfNode = new Uint8Array(nodeCount);
const firstChild = new Int32Array(nodeCount).fill(-1);
const nextSibling = new Int32Array(nodeCount);
```

### Step 2：單次掃描快取字元並建立子節點鏈結串列

先記錄根節點的字元索引，再由後往前掃描其餘節點。掃描時同時做兩件事：

- 快取該節點的字元索引。
- 以前插方式把該節點掛到其父節點的子節點鏈結串列上。

由於是由後往前前插，最終串列中的子節點會依編號遞增排列。

```typescript
// 單次掃描：快取字元索引，並以前插方式建立子節點鏈結串列
characterOfNode[0] = s.charCodeAt(0) - 97;
for (let node = nodeCount - 1; node > 0; node--) {
  characterOfNode[node] = s.charCodeAt(node) - 97;
  const parentNode = parent[node];
  nextSibling[node] = firstChild[parentNode];
  firstChild[parentNode] = node;
}
```

### Step 3：配置走訪所需的輔助陣列

準備以下輔助結構：

- `newParent`：記錄每個節點在新樹中的父節點。
- `previousLatest`：保存每個節點進入前，該字元原本的最深持有者，以便離開時還原。
- `depthStack`：模擬深度優先走訪的顯式堆疊。
- `latestNodeOfCharacter`：記錄當前根路徑上每種字元的最深持有者，初始值 `-1` 表示尚無持有者。
- `subtreeSize`：每個節點的子樹大小，初始皆為 1，代表節點本身。

```typescript
const newParent = new Int32Array(nodeCount);
const previousLatest = new Int32Array(nodeCount);
const depthStack = new Int32Array(nodeCount);

// 目前根路徑上，持有各字元的最深節點
const latestNodeOfCharacter = new Int32Array(26).fill(-1);

// 最終樹中各節點的子樹大小，由下而上建構並直接回傳
const subtreeSize: number[] = new Array(nodeCount).fill(1);
```

### Step 4：將根節點推入堆疊作為走訪起點

根節點的處理方式如下：

- 將根節點設為其字元的最深持有者。
- 根節點沒有先前的持有者，也沒有父節點，兩者皆設為 `-1`。
- 將根節點放入堆疊，作為走訪起點。

```typescript
// 進入根節點
latestNodeOfCharacter[characterOfNode[0]] = 0;
previousLatest[0] = -1;
newParent[0] = -1;
let stackSize = 1;
```

### Step 5：取出堆疊頂端節點，並為下一個子節點決定新父節點

只要堆疊不為空就持續走訪。每一輪先查看堆疊頂端節點，並取出它尚未處理的第一個子節點。若子節點存在：

- 先從串列中消耗此子節點，讓下次造訪時接續處理其兄弟節點。
- 查詢該子節點字元在當前根路徑上的最深持有者。
- 若持有者存在，該持有者即為新父節點；否則保留原父節點。

```typescript
while (stackSize > 0) {
  const currentNode = depthStack[stackSize - 1];
  const childNode = firstChild[currentNode];

  if (childNode !== -1) {
    // 消耗此子節點，使下次造訪時接續處理其兄弟節點
    firstChild[currentNode] = nextSibling[childNode];

    const character = characterOfNode[childNode];
    const sameCharacterAncestor = latestNodeOfCharacter[character];

    // 重新接到最近的同字元祖先，否則保留原父節點
    if (sameCharacterAncestor !== -1) {
      newParent[childNode] = sameCharacterAncestor;
    } else {
      newParent[childNode] = currentNode;
    }

    // ...
  } else {
    // ...
  }
}
```

### Step 6：更新字元持有者並將子節點推入堆疊

在進入子節點之前，先把該字元原本的最深持有者保存起來，再把持有者覆寫為此子節點，讓其後代能查到它。最後將子節點推入堆疊，往下一層繼續走訪。

```typescript
while (stackSize > 0) {
  // Step 5：取出堆疊頂端節點與下一個待處理子節點

  if (childNode !== -1) {
    // Step 5：消耗子節點並決定其新父節點

    // 保存並覆寫此字元的最新持有者，供後代使用
    previousLatest[childNode] = sameCharacterAncestor;
    latestNodeOfCharacter[character] = childNode;
    depthStack[stackSize++] = childNode;
  } else {
    // ...
  }
}
```

### Step 7：離開節點時還原持有者並累加子樹大小

若堆疊頂端節點已沒有未處理的子節點，代表它的整棵子樹都已完成，接著依序執行：

- 將其字元的最深持有者還原為進入前的狀態。
- 將它從堆疊中彈出。
- 若它不是根節點，將其已完成的子樹大小累加到新父節點。

由於新父節點必為原樹中的祖先，此時它仍在堆疊中、尚未完成，因此累加結果正確。

```typescript
while (stackSize > 0) {
  // Step 5：取出堆疊頂端節點與下一個待處理子節點

  if (childNode !== -1) {
    // Step 5：消耗子節點並決定其新父節點

    // Step 6：更新字元持有者並推入堆疊
  } else {
    // 離開節點：還原其字元持有者，並將完成的子樹大小累加至新父節點
    latestNodeOfCharacter[characterOfNode[currentNode]] = previousLatest[currentNode];
    stackSize--;
    if (stackSize > 0) {
      subtreeSize[newParent[currentNode]] += subtreeSize[currentNode];
    }
  }
}
```

### Step 8：回傳最終各節點的子樹大小

走訪結束後，`subtreeSize` 已記錄新樹中每個節點的子樹大小，直接回傳即可。

```typescript
return subtreeSize;
```

## 時間複雜度

- 建立子節點鏈結串列需掃描所有節點一次，為 $O(n)$；
- 深度優先走訪中，每個節點恰好進入堆疊一次、離開堆疊一次，每次操作皆為常數時間；
- 查詢與還原字元持有者皆為常數時間；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 字元快取、子節點鏈結、新父節點、先前持有者、堆疊與子樹大小陣列皆為 $O(n)$；
- 字元持有者陣列大小固定為 26，為常數空間；
- 總空間複雜度為 $O(n)$。

> $O(n)$
