# 2127. Maximum Employees to Be Invited to a Meeting

A company is organizing a meeting and has a list of `n` employees, waiting to be invited.  
They have arranged for a large circular table, capable of seating any number of employees.

The employees are numbered from `0` to `n - 1`.  
Each employee has a favorite person, and they will attend the meeting only if they can sit next to their favorite person at the table.  
The favorite person of an employee is not themselves.

Given a 0-indexed integer array `favorite`, where `favorite[i]` denotes the favorite person of the $i_{th}$ employee,  
return the maximum number of employees that can be invited to the meeting.

## 基礎思路

我們可以將問題轉化為一個「有向圖」(directed graph) 的問題：
- 節點 (node) 代表員工。
- 每個員工指向自己最喜歡的人 (favorite[i])，形成有向邊。

在一張圓桌上，如果一組員工能圍成一個「迴圈」(cycle)，那麼就能彼此相鄰。  
所以有兩種情形可以幫我們找最大可邀請人數：
1. **尋找圖中最長的迴圈 (cycle)**。
2. **尋找所有「互相喜歡」的 2-cycle (雙人互相指向) 加上各自延伸進來的「鏈」(chain) 長度後，再把它們合計起來。**

> Tips
> - 若整個圖中最大的迴圈長度大於所有 2-cycle 加它們外圍鏈的總合，答案就是最大迴圈。
> - 否則，我們就選擇所有 2-cycle 配上它們的鏈，並把總長加起來。
> - 兩者取其最大值即為答案。

## 解題步驟

以下步驟對應到主要程式邏輯，並附上重點程式片段說明。

### Step 1: 預處理入度與初始化鏈長度

1. 計算每個節點的入度，記錄有多少人最喜歡該節點。
2. 初始化所有節點的鏈長度為 `1`（因為自身就構成最短的鏈）。

```typescript
// 紀錄員工人數
const n = favorite.length;

// 紀錄每個人的入度 (被多少人喜歡)
const inDegree = Array(n).fill(0);

// 計算每個節點的入度 (被多少人喜歡)
for (const person of favorite) {
  inDegree[person] += 1;
}

// 陣列紀錄節點是否被拜訪過，以及每個節點的最長鏈長度
const visited = Array(n).fill(false);
const longestChain = Array(n).fill(1);
```

### Step 2: 拓撲排序處理鏈長度

1. 將入度為 `0` 的節點加入隊列，並標記為已拜訪。
2. 不斷處理隊列中的節點，更新其「鏈長度」到下一個節點，並減少下一個節點的入度。
3. 如果下一個節點的入度變為 `0`，加入隊列。

```typescript
// 初始化隊列
const queue: number[] = [];

// 將所有入度為 0 (沒有人喜歡) 的節點加入隊列，並標記為已拜訪
for (let i = 0; i < n; i++) {
  if (inDegree[i] === 0) {
    queue.push(i);
    visited[i] = true;
  }
}

// 進行拓撲排序，計算鏈長度
while (queue.length > 0) {
  const currentNode = queue.pop()!;
  const nextNode = favorite[currentNode];

  // 若把 currentNode 接在 nextNode 前面，可以使 longestChain[nextNode] 更長
  longestChain[nextNode] = Math.max(longestChain[nextNode], longestChain[currentNode] + 1);

  // 因為使用了 currentNode 這條邊，所以 nextNode 的入度要減 1
  inDegree[nextNode]--;

  // 如果 nextNode 的入度歸 0，則放入 queue，並標記為已拜訪
  if (inDegree[nextNode] === 0) {
    queue.push(nextNode);
    visited[nextNode] = true;
  }
}
```

### Step 3: 計算圖中的迴圈與 2-cycle

1. 遍歷所有節點，找出尚未處理過的迴圈。
2. 對於長度大於 `2` 的迴圈，記錄最大迴圈長度。
3. 對於 2-cycle，計算兩邊鏈的總長度並累加。

> Tips
> 我們在該步驟中同時紀錄最大迴圈長度與所有 2-cycle 的鏈長度總和。
> 這能提升效率。

```typescript
// 最大迴圈長度
let maxCycleLength = 0;

// 所有 2-cycle 的鏈長度總和
let twoCycleChainLength = 0;

// 遍歷所有節點，找出迴圈與 2-cycle 的鏈長度
for (let i = 0; i < n; i++) {
  // 若節點已經被拜訪過，則跳過
  if (visited[i]) continue;

  let currentNode = i;
  let cycleLength = 0;

  // 遍歷迴圈，並標記節點為已拜訪
  while (!visited[currentNode]) {
    visited[currentNode] = true;
    currentNode = favorite[currentNode];
    cycleLength++;
  }

  // 若迴圈長度大於 2，則更新最大迴圈長度
  if (cycleLength > 2) {
    maxCycleLength = Math.max(maxCycleLength, cycleLength);
  }
  // 若剛好是 2-cycle，則計算兩邊鏈的總長度
  else if (cycleLength === 2) {
    const node1 = i;
    const node2 = favorite[i];
    twoCycleChainLength += longestChain[node1] + longestChain[node2];
  }
}
```

### Step 4: 返回最大值

將最大迴圈長度與所有 2-cycle 加上其鏈的總長度比較，取最大值作為答案。

```typescript
return Math.max(maxCycleLength, twoCycleChainLength);
```

## 時間複雜度
- 計算入度與初始化鏈長度需要 $O(n)$。
- 拓撲排序處理鏈長度需要 $O(n)$，因為每條邊只處理一次。
- 找出所有迴圈與 2-cycle 需要 $O(n)$。

> $O(n)$

## 空間複雜度
- `inDegree`、`visited`、`longestChain` 等陣列需要 $O(n)$。 
- 拓撲排序隊列的空間最多為 $O(n)$。

> $O(n)$
