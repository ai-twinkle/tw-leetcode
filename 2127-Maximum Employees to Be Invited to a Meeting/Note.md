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

---

### Step 1: 找出圖中最大的迴圈長度

```typescript
function findLargestCycle(favorite: number[]): number {
  const n = favorite.length;
  const visited: boolean[] = Array(n).fill(false);
  let maxCycleLength = 0;

  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;   // 若已拜訪過，略過

    const currentPath: number[] = [];
    let currentNode = i;

    // 走訪直到遇到一個拜訪過的節點為止
    while (!visited[currentNode]) {
      visited[currentNode] = true;
      currentPath.push(currentNode);
      currentNode = favorite[currentNode];
    }

    // currentNode 是第一次出現的重複節點，找出迴圈起始
    for (let j = 0; j < currentPath.length; j++) {
      if (currentPath[j] === currentNode) {
        // 計算迴圈長度 = (整條路徑長度 - 迴圈開始索引 j)
        const cycleLength = currentPath.length - j;
        maxCycleLength = Math.max(maxCycleLength, cycleLength);
        break;
      }
    }
  }

  return maxCycleLength;
}
```
- 使用 `visited` 陣列記錄哪些節點已經處理過，減少重複計算。
- 遇到重複節點即為迴圈入口，從那裡算出迴圈長度。

---

### Step 2: 找出所有 2-cycle 及其「鏈」長度總合

這一步專門處理「互相喜歡」(2-cycle) 的情形，並計算對應的鏈(一條單向路徑) 能夠延伸多長。

#### Step 2.1 計算每個節點的入度 (inDegree)
```typescript
function calculateChainsForMutualFavorites(favorite: number[]): number {
  const n = favorite.length;
  const inDegree: number[] = Array(n).fill(0);
  const longestChain: number[] = Array(n).fill(1); // 每個節點至少自身長度 1

  // 計算入度
  for (const person of favorite) {
    inDegree[person]++;
  }

  // ...
}
```
- `inDegree[i]` 表示「有多少人最喜歡 i」。
- 之後能找到入度為 0 的節點，當作「鏈」的最開頭。

#### Step 2.2 使用類拓撲排序 (Topological Sort) 更新鏈長度
```typescript
function calculateChainsForMutualFavorites(favorite: number[]): number {
  // 2.1 計算每個節點的入度 (inDegree)

  // 尋找所有入度為 0 的節點，當作初始化 queue
  const queue: number[] = [];
  for (let i = 0; i < n; i++) {
    if (inDegree[i] === 0) {
      queue.push(i);
    }
  }

  // 不斷地從 queue 取出節點，將其鏈長度更新到下一個節點
  while (queue.length > 0) {
    const currentNode = queue.pop()!;
    const nextNode = favorite[currentNode];

    // 若把 currentNode 接在 nextNode 前面，可以使 longestChain[nextNode] 更長
    longestChain[nextNode] = Math.max(longestChain[nextNode], longestChain[currentNode] + 1);

    // 因為使用了 currentNode 這條邊，所以 nextNode 的入度要減 1
    inDegree[nextNode]--;

    // 如果 nextNode 的入度歸 0，則放入 queue
    if (inDegree[nextNode] === 0) {
      queue.push(nextNode);
    }
  }

  // ...
}
```
- 這種方法能有效找出「鏈」的最大長度，因為每個節點都會最終把它的最大鏈長度「傳遞」給後繼節點。

#### Step 2.3 對於每個 2-cycle，將兩邊的鏈長度加總
```typescript
function calculateChainsForMutualFavorites(favorite: number[]): number {
  // 2.1 計算每個節點的入度 (inDegree)
  
  // 2.2 使用類拓撲排序 (Topological Sort) 更新鏈長度
  
  let totalContribution = 0;
  // 檢查 (i, favorite[i]) 是否形成互相喜歡 (2-cycle)
  for (let i = 0; i < n; i++) {
    const j = favorite[i];
    // 確保只算一次 (i < j)，且 i 與 j 互相指向
    if (j !== i && i === favorite[j] && i < j) {
      totalContribution += longestChain[i] + longestChain[j];
    }
  }
  return totalContribution;
}
```
- 互相喜歡即是 i -> j 與 j -> i；對此組合，我們把它們兩邊延伸進來的鏈長度相加。
- 多個不同的 2-cycle 不會互相重疊，所以可以直接累加其貢獻。

---

### Step 3: 取最大值

在 `maximumInvitations()` 主函式中，我們分別呼叫上述兩個函式，並選取「最大迴圈長度」與「所有 2-cycle 貢獻總合」的較大者作為答案。

```typescript
function maximumInvitations(favorite: number[]): number {
  // 1) 找出最大的迴圈
  const largestCycle = findLargestCycle(favorite);

  // 2) 找出 2-cycle + 其鏈貢獻總合
  const totalChains = calculateChainsForMutualFavorites(favorite);

  // 取兩者較大者
  return Math.max(largestCycle, totalChains);
}
```

---

## 時間複雜度
1. **找最大迴圈**：
    - 對每個節點做 DFS/走訪，平均為 $O(n)$，因為每個節點只會被走訪一次。
2. **計算 2-cycle + 鏈貢獻**：
    - 先計算所有節點的入度 $O(n)$。
    - 使用 queue 做類拓撲排序，整體也在 $O(n)$ 範圍。
    - 最後再檢查 2-cycle 也只需 $O(n)$。

因此整體時間複雜度約為 $O(n)$。

> $O(n)$

## 空間複雜度
- 需要使用 `visited`、`inDegree`、`longestChain` 等陣列，各佔用 $O(n)$。
- `currentPath`、`queue` 亦會在過程中最多使用到 $O(n)$ 大小。

綜合來看，空間複雜度為 $O(n)$。

> $O(n)$
