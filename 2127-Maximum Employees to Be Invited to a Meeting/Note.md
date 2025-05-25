# 2127. Maximum Employees to Be Invited to a Meeting

A company is organizing a meeting and has a list of `n` employees, waiting to be invited.  
They have arranged for a large circular table, capable of seating any number of employees.

The employees are numbered from `0` to `n - 1`.  
Each employee has a favorite person, and they will attend the meeting only if they can sit next to their favorite person at the table.  
The favorite person of an employee is not themselves.

Given a 0-indexed integer array `favorite`, where `favorite[i]` denotes the favorite person of the $i_{th}$ employee,  
return the maximum number of employees that can be invited to the meeting.

**Constraints:**

- `n == favorite.length`
- `2 <= n <= 10^5`
- `0 <= favorite[i] <= n - 1`
- `favorite[i] != i`

## 基礎思路

本題要求計算在一個環形桌子上，最多能邀請多少員工參加會議，每個員工參加的條件是能坐在他最喜歡的人旁邊。我們可以將題目抽象成一個有向圖問題：

- 員工表示為圖中的節點，每個節點有一條指向其最愛員工的有向邊。
- 圖中的循環（Cycle）表示可坐成一圈互相滿足條件的員工群體。
- 非循環節點是以鏈（Chain）的形式指向循環。這些鏈可以視為延伸循環的人數，但僅適用於「大小為2」的互相喜歡的循環。

因此，策略可分成以下幾點：

1. **建構有向圖**，計算每個員工的入度（被喜歡的次數）。
2. 使用**拓撲排序**方式移除無法成為循環一部分的節點，找出所有節點的最長鏈。
3. **識別循環**並分類處理：

   - 對於長度大於2的循環，整個循環的人都能被邀請。
   - 對於長度為2的循環，則可額外附加各自最長的鏈。

4. 最終取兩類循環情境中的較大值，即可獲得最大參與人數。

## 解題步驟

### Step 1：初始化變數與計算入度

首先我們需要定義變數並計算每個節點的入度（每個人被喜歡的次數）：

```typescript
const favoriteList = favorite;
const numberOfEmployees = favoriteList.length;

// 建立入度陣列，紀錄每位員工被其他員工喜歡的次數
const inDegree = new Uint32Array(numberOfEmployees);
for (let e = 0; e < numberOfEmployees; e++) {
  inDegree[favoriteList[e]]++;
}
```

### Step 2：使用BFS拓撲排序處理非循環節點

接下來我們以BFS方式逐層移除入度為0的員工（沒有人喜歡的節點），同時計算每個節點指向循環節點的最長鏈長度：

```typescript
// 初始化 BFS 佇列，將所有入度為0的員工（葉節點）放入佇列
const bfsQueue = new Uint32Array(numberOfEmployees);
let queueHead = 0, queueTail = 0;
for (let e = 0; e < numberOfEmployees; e++) {
   if (inDegree[e] === 0) {
      bfsQueue[queueTail++] = e;
   }
}

// 用以儲存每個節點向內到達循環前最長的鏈長度
const longestChainTo = new Uint32Array(numberOfEmployees);

// 透過拓撲排序逐層移除非循環節點，更新鏈長
while (queueHead < queueTail) {
  const curr = bfsQueue[queueHead++];          // 取出當前節點
  const fav = favoriteList[curr];              // 當前節點最喜歡的人
  const candLength = longestChainTo[curr] + 1; // 更新鏈的長度候選值
  if (candLength > longestChainTo[fav]) {
    longestChainTo[fav] = candLength; // 更新為最長鏈
  }
  if (--inDegree[fav] === 0) {        // 如果fav成為新的葉節點則放入佇列
    bfsQueue[queueTail++] = fav;
  }
}
```

### Step 3：偵測循環並計算可邀請人數

經過拓撲排序後，剩餘的節點必定為循環。我們必須掃描所有剩餘的循環節點，並分別處理：

- 長度為2的循環需特別處理，可加上最長鏈人數。
- 長度大於2的循環，則以整個循環計算邀請人數。

```typescript
let largestCycleSize = 0;     // 紀錄大於2循環的最大長度
let totalMutualChainSize = 0; // 紀錄所有2循環及附加鏈的總人數

// 掃描每個節點，識別循環節點
for (let e = 0; e < numberOfEmployees; e++) {
  if (inDegree[e] !== 1) {
    continue; // 非循環節點跳過
  }

  // 計算當前循環的長度
  let cycleSize = 0;
  let walker = e;
  do {
    inDegree[walker] = 0; // 標記已訪問的循環節點
    cycleSize++;
    walker = favoriteList[walker];
  } while (inDegree[walker] === 1);

  if (cycleSize === 2) {
    // 2人互相喜歡的情況，可加上各自最長鏈
    const a = e;
    const b = favoriteList[e];
    totalMutualChainSize += 2 + longestChainTo[a] + longestChainTo[b];
  } else if (cycleSize > largestCycleSize) {
    // 長度大於2的循環僅保留最大者
    largestCycleSize = cycleSize;
  }
}
```

### Step 4：回傳最終結果

最後，比較所有的2人循環及其鏈的總數，和最大的循環大小，回傳較大的即為所求的最大邀請人數：

```typescript
// 回傳最終的最大邀請人數
return totalMutualChainSize > largestCycleSize
  ? totalMutualChainSize
  : largestCycleSize;
```

## 時間複雜度

- 計算入度陣列需要遍歷所有節點一次，為 $O(n)$。
- 拓撲排序過程每個節點至多被訪問一次，為 $O(n)$。
- 偵測循環最多也遍歷所有節點一次，為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用了三個大小為 $n$ 的額外陣列：`inDegree`、`bfsQueue` 與 `longestChainTo`。
- 總空間複雜度為 $O(n)$。

> $O(n)$
