# 3310. Remove Methods From Project

You are maintaining a project that has `n` methods numbered from `0` to `n - 1`.

You are given two integers `n` and `k`, and a 2D integer array invocations, 
where `invocations[i] = [a_i, b_i]` indicates that method `a_i` invokes method `b_i`.

There is a known bug in method `k`. Method `k`, along with any method invoked by it, either directly or indirectly, 
are considered suspicious and we aim to remove them.

A group of methods can only be removed if no method outside the group invokes any methods within it.

Return an array containing all the remaining methods after removing all the suspicious methods. 
You may return the answer in any order. 
If it is not possible to remove all the suspicious methods, none should be removed.

**Constraints:**

- `1 <= n <= 10^5`
- `0 <= k <= n - 1`
- `0 <= invocations.length <= 2 * 10^5`
- `invocations[i] == [a_i, b_i]`
- `0 <= a_i, b_i <= n - 1`
- `a_i != b_i`
- `invocations[i] != invocations[j]`

## 基礎思路

本題的核心在於：從方法 `k` 出發，找出所有被它直接或間接呼叫的方法，這些方法皆屬於「可疑集合」。然而，可疑集合能否被移除還有一個前提條件——**不能有任何位於集合之外的方法呼叫集合內的方法**，否則整組都不能移除。

在思考解法時，可掌握以下核心觀察：

- **可疑集合是一種可達性問題**：
  從 `k` 出發沿著呼叫關係前進，凡是能抵達的方法都屬於可疑範圍，因此本質上是一次圖上的遍歷（DFS 或 BFS）。

- **移除條件是一種「入口封閉性」檢查**：
  一個群組能被移除，等價於沒有任何外部節點指向群組內部；換言之，所有指向可疑集合的邊，其來源也必須是可疑的。

- **資料規模要求高效的圖表示法**：
  節點數與邊數皆可達十萬量級，若使用巢狀陣列或遞迴遍歷，容易造成效能瓶頸或堆疊溢位，因此需採用扁平化的鄰接結構與迭代式遍歷。

依據以上特性，可以採用以下策略：

- **先以 CSR（壓縮稀疏行）格式建立鄰接結構**，將邊列扁平化，使後續遍歷僅需讀取型別化陣列。
- **以迭代式 DFS 標記所有可疑方法**，避免遞迴帶來的堆疊風險。
- **透過一次線性掃描所有邊，檢查是否存在外部指向可疑集合的呼叫**；若存在則無法移除，回傳全部方法，否則回傳所有非可疑方法。

此策略能在線性時間內完成建圖、遍歷與驗證，安全且高效。

## 解題步驟

### Step 1：扁平化邊列並統計各節點的出邊數量

先取得邊的總數，並以三個型別化陣列分別記錄每條邊的來源、目標，以及各節點的鄰接起點；遍歷邊列時，將來源與目標填入，同時在偏移一格的位置累計出邊數量，使後續的前綴和可直接轉為桶的起始位置。

```typescript
const edgeCount = invocations.length;

// 一次性扁平化巢狀邊列；之後每次遍歷只需讀取型別化陣列
const edgeCaller = new Int32Array(edgeCount);
const edgeCallee = new Int32Array(edgeCount);
const adjacencyStart = new Int32Array(n + 1);

for (let index = 0; index < edgeCount; index++) {
  const edge = invocations[index];
  const caller = edge[0];
  edgeCaller[index] = caller;
  edgeCallee[index] = edge[1];
  // 偏移一格的計數槽，讓下方的前綴和同時兼作桶的起點
  adjacencyStart[caller + 1]++;
}
```

### Step 2：以前綴和將出度轉為 CSR 桶邊界

將各節點的出邊數量累加成前綴和，使 `adjacencyStart` 從「出度統計」轉變為「每個節點在鄰接陣列中的起始邊界」。

```typescript
// 前綴和將出度轉換為 CSR 桶邊界
for (let node = 0; node < n; node++) {
  adjacencyStart[node + 1] += adjacencyStart[node];
}
```

### Step 3：填入鄰接目標，完成 CSR 結構

複製一份起始位置作為填入游標，再次遍歷所有邊，將每條邊的目標依來源的游標位置寫入鄰接陣列，並推進該游標。

```typescript
const adjacencyTarget = new Int32Array(edgeCount);
const fillCursor = adjacencyStart.slice(0, n);

for (let index = 0; index < edgeCount; index++) {
  adjacencyTarget[fillCursor[edgeCaller[index]]++] = edgeCallee[index];
}
```

### Step 4：初始化迭代式 DFS 的相關結構並將起點入堆疊

準備標記陣列、遍歷堆疊與可疑計數；先將方法 `k` 標記為可疑並推入堆疊，作為遍歷的起點。

```typescript
// 迭代式 DFS 避免遞迴開銷與 n = 10^5 時的堆疊溢位
const isSuspicious = new Uint8Array(n);
const traversalStack = new Int32Array(n);
let stackSize = 0;
let suspiciousCount = 1;

isSuspicious[k] = 1;
traversalStack[stackSize++] = k;
```

### Step 5：迭代遍歷所有可達節點，標記整個可疑集合

不斷從堆疊取出節點，走訪其在 CSR 中對應的所有鄰接目標；凡是尚未標記的目標，即標記為可疑、累加計數並推入堆疊，直到堆疊清空為止。

```typescript
while (stackSize > 0) {
  const node = traversalStack[--stackSize];
  const bucketEnd = adjacencyStart[node + 1];

  for (let index = adjacencyStart[node]; index < bucketEnd; index++) {
    const callee = adjacencyTarget[index];

    if (isSuspicious[callee] === 0) {
      isSuspicious[callee] = 1;
      suspiciousCount++;
      traversalStack[stackSize++] = callee;
    }
  }
}
```

### Step 6：線性掃描所有邊，檢查是否存在外部指向可疑集合的呼叫

以一次線性掃描檢視每條邊：若某條邊的目標為可疑、但來源並非可疑，代表有外部方法指向可疑集合，此時判定為無法移除並立即中止掃描。

```typescript
// 單次線性掃描邊列，偵測是否有乾淨的方法指向群組內部
let isRemovable = true;

for (let index = 0; index < edgeCount; index++) {
  if (isSuspicious[edgeCallee[index]] === 1 && isSuspicious[edgeCaller[index]] === 0) {
    isRemovable = false;
    break;
  }
}
```

### Step 7：若無法移除，回傳所有方法

當判定為不可移除時，代表沒有任何方法應被刪除，因此建立並回傳包含全部方法編號的陣列。

```typescript
if (isRemovable === false) {
  const everyMethod = new Array<number>(n);

  for (let node = 0; node < n; node++) {
    everyMethod[node] = node;
  }

  return everyMethod;
}
```

### Step 8：可移除時，收集並回傳所有非可疑方法

由於可疑數量已知，可精確配置輸出陣列的大小，避免動態成長；接著線性掃描所有節點，將未被標記為可疑者依序寫入結果並回傳。

```typescript
// 輸出大小已知，因此結果陣列無須動態成長
const remaining = new Array<number>(n - suspiciousCount);
let writeIndex = 0;

for (let node = 0; node < n; node++) {
  if (isSuspicious[node] === 0) {
    remaining[writeIndex++] = node;
  }
}

return remaining;
```

## 時間複雜度

- 建立 CSR 結構需遍歷所有邊與節點，為 $O(n + m)$；
- 迭代式 DFS 每個節點與每條邊各處理一次，為 $O(n + m)$；
- 檢查移除條件與收集結果皆為線性掃描，為 $O(n + m)$。
- 總時間複雜度為 $O(n + m)$。

> $O(n + m)$

## 空間複雜度

- CSR 結構（邊來源、目標、鄰接起點與目標）需 $O(n + m)$；
- 標記陣列、遍歷堆疊與輸出陣列皆為 $O(n)$。
- 總空間複雜度為 $O(n + m)$。

> $O(n + m)$
