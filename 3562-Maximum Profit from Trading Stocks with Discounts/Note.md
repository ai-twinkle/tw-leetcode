# 3562. Maximum Profit from Trading Stocks with Discounts

You are given an integer `n`, representing the number of employees in a company. 
Each employee is assigned a unique ID from 1 to `n`, and employee 1 is the CEO. 
You are given two 1-based integer arrays, `present` and `future`, each of length n, where:

- `present[i]` represents the current price at which the $i^{th}$ employee can buy a stock today.
- `future[i]` represents the expected price at which the $i^{th}$ employee can sell the stock tomorrow.

The company's hierarchy is represented by a 2D integer array `hierarchy`, 
where `hierarchy[i] = [u_i, v_i]` means that employee `u_i` is the direct boss of employee `v_i`.

Additionally, you have an integer `budget` representing the total funds available for investment.

However, the company has a discount policy: if an employee's direct boss purchases their own stock, 
then the employee can buy their stock at half the original price (`floor(present[v] / 2)`).

Return the maximum profit that can be achieved without exceeding the given budget.

Note:

- You may buy each stock at most once.
- You cannot use any profit earned from future stock prices to fund additional investments and must buy only from `budget`.

**Constraints:**

- `1 <= n <= 160`
- `present.length, future.length == n`
- `1 <= present[i], future[i] <= 50`
- `hierarchy.length == n - 1`
- `hierarchy[i] == [u_i, v_i]`
- `1 <= u_i, v_i <= n`
- `u_i != v_i`
- `1 <= budget <= 160`
- There are no duplicate edges.
- Employee 1 is the direct or indirect boss of every employee.
- The input graph `hierarchy` is guaranteed to have no cycles.

## 基礎思路

本題要在公司階層樹上做「選股票投資」的最佳化：每位員工最多買一次，花費不得超過 `budget`，收益是 `future[i] - buyCost`。另外有一個**父子折扣規則**：若主管買了自己的股票，直屬下屬買入價變成 `floor(present[v]/2)`。

在思考解法時，需要抓住幾個核心結構：

* **階層是一棵樹**：CEO 為根，每位員工只有一個主管，因此可以用「子樹」作為獨立合併單位。
* **折扣只依賴「父節點是否購買」**：對於某員工 `v`，其買入成本只有兩種情況：父買/父不買。這表示我們在 DP 狀態中必須保留「父親是否購買」這個旗標。
* **預算限制 = 樹上背包合併**：每個子樹都像一個「投資組合」，要把多個子樹的最佳收益在不同花費下做合併（典型 knapsack merge）。
* **自底向上計算最自然**：要先算完子節點子樹，父節點才能把子樹結果合併起來；因此需要後序（postorder）處理。

因此整體策略是：

1. 把樹建好（鄰接表）。
2. 用 DFS 取得一個遍歷序，並反向處理達成「由葉到根」。
3. 設計 DP：對每個員工子樹，分別記錄「父不買 / 父買」兩種情況下，在每個花費 `0..budget` 的最大收益。
4. 對每個節點：先把所有子節點子樹的 DP 做背包合併成「子樹總收益」，再決定自己買或不買（並影響孩子看到的折扣旗標）。

## 解題步驟

### Step 1：初始化基本常數、預算步長與價格陣列

先整理 `n / budget` 等常數，並建立三個價格表：原價、明日價、折扣價（floor(present/2)）。同時定義 DP 不可達狀態的極小值 `MIN_PROFIT`。

```typescript
const employeeCount = n;
const budgetLimit = budget;
const edgeCount = employeeCount - 1;
const budgetStride = budgetLimit + 1;

// 用極小值標記 DP 中不可達狀態
const MIN_PROFIT = -1_000_000_000;

// 使用 TypedArray 儲存價格（以員工編號 1-indexed 存取更快）
const presentPrice = new Int16Array(employeeCount + 1);
const futurePrice = new Int16Array(employeeCount + 1);
const discountedPrice = new Int16Array(employeeCount + 1);
```

### Step 2：填入每位員工的價格資料（含折扣價）

把輸入的 `present / future` 轉進 TypedArray，並同步算好折扣價以避免重複計算。

```typescript
// 初始化價格陣列
for (let employeeId = 1; employeeId <= employeeCount; employeeId++) {
  const presentValue = present[employeeId - 1] | 0;
  const futureValue = future[employeeId - 1] | 0;

  presentPrice[employeeId] = presentValue;
  futurePrice[employeeId] = futureValue;

  // 折扣價為 floor(present / 2)，對正整數使用位移是安全的
  discountedPrice[employeeId] = presentValue >> 1;
}
```

### Step 3：建立階層樹的鄰接表（boss → children）

用壓平的鏈式前向星（head/next/to）來存樹，避免大量小陣列開銷。

```typescript
// 每個主管的鄰接表頭指標
const headEdgeIndex = new Int16Array(employeeCount + 1);
headEdgeIndex.fill(-1);

// 邊資料：toEmployee[i] 是第 i 條邊的子節點
const toEmployee = new Int16Array(edgeCount);

// nextEdgeIndex 串成每個主管的鏈結串列
const nextEdgeIndex = new Int16Array(edgeCount);

// 由 hierarchy 建立鄰接表
for (let index = 0; index < edgeCount; index++) {
  const bossId = hierarchy[index][0] | 0;

  toEmployee[index] = hierarchy[index][1] | 0;
  nextEdgeIndex[index] = headEdgeIndex[bossId];
  headEdgeIndex[bossId] = index;
}
```

### Step 4：用迭代 DFS 產生 preorder，之後反向處理達成 postorder 效果

避免遞迴深度與呼叫成本，先用 stack 做 DFS 得到 `preorderList`，最後反向走即可確保「孩子先算完」。

```typescript
// 迭代 DFS 的堆疊，避免遞迴成本
const traversalStack = new Int16Array(employeeCount);
let traversalStackSize = 0;

// 用 preorder 記錄訪問順序，之後反向處理得到 postorder 效果
const preorderList = new Int16Array(employeeCount);
let preorderSize = 0;

// 從 CEO（員工 1）開始
traversalStack[traversalStackSize++] = 1;

// DFS 產生 preorder
while (traversalStackSize > 0) {
  traversalStackSize--;
  const currentNode = traversalStack[traversalStackSize];

  // 記錄訪問順序
  preorderList[preorderSize++] = currentNode;

  // 將所有直屬下屬推入堆疊
  for (let edge = headEdgeIndex[currentNode]; edge !== -1; edge = nextEdgeIndex[edge]) {
    traversalStack[traversalStackSize++] = toEmployee[edge];
  }
}
```

### Step 5：宣告 DP 與合併用緩衝陣列

DP 需要同時考慮「父買 / 父不買」兩種狀態，且每種狀態都要對 `0..budget` 花費記錄最大收益；另外準備孩子合併用的暫存陣列以做背包合併。

```typescript
// dp 儲存每個員工子樹的最大收益：依父是否購買、以及花費預算決定
const dp = new Int32Array((employeeCount + 1) * 2 * budgetStride);
dp.fill(MIN_PROFIT);

// 當前員工「不買」時，累積所有孩子的合併結果
const childrenProfitWhenNotBought = new Int32Array(budgetStride);

// 當前員工「買」時，累積所有孩子的合併結果
const childrenProfitWhenBought = new Int32Array(budgetStride);

// 背包合併的暫存緩衝
const mergeBuffer = new Int32Array(budgetStride);
```

### Step 6：自底向上處理每個節點（外層 postorder 迴圈骨架）

反向走 `preorderList`，確保每個節點處理時，孩子 DP 已完成。

```typescript
// 由下而上處理，確保孩子先完成計算
for (let postIndex = preorderSize - 1; postIndex >= 0; postIndex--) {
  const employeeId = preorderList[postIndex];

  // ...
}
```

### Step 7：在節點迴圈中重置孩子合併陣列，準備逐個合併孩子

每個節點開始時，孩子合併結果先設為「花費 0 的收益為 0」，其餘不可達。

```typescript
for (let postIndex = preorderSize - 1; postIndex >= 0; postIndex--) {
  // Step 6：自底向上處理每個節點（外層 postorder 迴圈骨架）

  const employeeId = preorderList[postIndex];

  // 合併前先重置孩子彙總陣列
  childrenProfitWhenNotBought.fill(MIN_PROFIT);
  childrenProfitWhenBought.fill(MIN_PROFIT);
  childrenProfitWhenNotBought[0] = 0;
  childrenProfitWhenBought[0] = 0;

  // ...
}
```

### Step 8：合併每個孩子子樹（背包合併，分別處理「自己不買」與「自己買」兩種父旗標）

這段是核心：對每個孩子，把「目前已合併的結果」與「孩子 dp」做背包合併。
同一個孩子要合併兩次：

* 當自己不買時，孩子看到 `parentBought = false`
* 當自己買時，孩子看到 `parentBought = true`（孩子可用折扣）

```typescript
for (let postIndex = preorderSize - 1; postIndex >= 0; postIndex--) {
  // Step 6：自底向上處理每個節點（外層 postorder 迴圈骨架）

  // Step 7：重置孩子合併陣列

  // 逐一合併直屬下屬
  for (let edge = headEdgeIndex[employeeId]; edge !== -1; edge = nextEdgeIndex[edge]) {
    const childId = toEmployee[edge];

    // 合併：假設當前員工「不買」
    mergeBuffer.fill(MIN_PROFIT);
    const childBaseNotBought = (childId << 1) * budgetStride;

    // 枚舉目前已合併的花費狀態
    for (let spentSoFar = 0; spentSoFar <= budgetLimit; spentSoFar++) {
      const currentProfit = childrenProfitWhenNotBought[spentSoFar];
      if (currentProfit === MIN_PROFIT) {
        continue;
      }

      const remainingBudget = budgetLimit - spentSoFar;

      // 將孩子子樹的花費分配進來做組合
      for (let childSpent = 0; childSpent <= remainingBudget; childSpent++) {
        const childProfit = dp[childBaseNotBought + childSpent];
        if (childProfit === MIN_PROFIT) {
          continue;
        }

        const totalSpent = spentSoFar + childSpent;
        const totalProfit = currentProfit + childProfit;

        if (totalProfit > mergeBuffer[totalSpent]) {
          mergeBuffer[totalSpent] = totalProfit;
        }
      }
    }

    // 提交「不買」情況的合併結果
    childrenProfitWhenNotBought.set(mergeBuffer);

    // 合併：假設當前員工「買」
    mergeBuffer.fill(MIN_PROFIT);
    const childBaseBought = childBaseNotBought + budgetStride;

    // 同樣的合併流程，但孩子看到 parentBought = true
    for (let spentSoFar = 0; spentSoFar <= budgetLimit; spentSoFar++) {
      const currentProfit = childrenProfitWhenBought[spentSoFar];
      if (currentProfit === MIN_PROFIT) {
        continue;
      }

      const remainingBudget = budgetLimit - spentSoFar;

      for (let childSpent = 0; childSpent <= remainingBudget; childSpent++) {
        const childProfit = dp[childBaseBought + childSpent];
        if (childProfit === MIN_PROFIT) {
          continue;
        }

        const totalSpent = spentSoFar + childSpent;
        const totalProfit = currentProfit + childProfit;

        if (totalProfit > mergeBuffer[totalSpent]) {
          mergeBuffer[totalSpent] = totalProfit;
        }
      }
    }

    // 提交「買」情況的合併結果
    childrenProfitWhenBought.set(mergeBuffer);
  }

  // ...
}
```

### Step 9：把「不買自己」的狀態寫回 dp（父買/父不買同樣繼承）

若自己不買，收益完全來自孩子合併結果，且自己是否被父折扣不影響（因為沒買自己）。

```typescript
for (let postIndex = preorderSize - 1; postIndex >= 0; postIndex--) {
  // Step 6：自底向上處理每個節點（外層 postorder 迴圈骨架）

  // Step 7：重置孩子合併陣列
  
  // Step 8：合併每個孩子子樹

  const nodeBaseParentNotBought = (employeeId << 1) * budgetStride;
  const nodeBaseParentBought = nodeBaseParentNotBought + budgetStride;

  // 情況：不買自己 → 收益只來自孩子合併
  for (let spent = 0; spent <= budgetLimit; spent++) {
    const inheritedProfit = childrenProfitWhenNotBought[spent];
    dp[nodeBaseParentNotBought + spent] = inheritedProfit;
    dp[nodeBaseParentBought + spent] = inheritedProfit;
  }

  // ...
}
```

### Step 10：計算自己買的收益（父不買用原價、父買用折扣價），更新 dp

自己買時，會消耗成本，並讓孩子看到 `parentBought = true`（因此使用 `childrenProfitWhenBought`）。
分兩種父旗標更新：

* 父不買：用 `presentPrice`，更新 `dp[parentNotBought]`
* 父買：用 `discountedPrice`，更新 `dp[parentBought]`

```typescript
for (let postIndex = preorderSize - 1; postIndex >= 0; postIndex--) {
  // Step 6：自底向上處理每個節點（外層 postorder 迴圈骨架）

  // Step 7：重置孩子合併陣列
  
  // Step 8：合併每個孩子子樹
  
  // Step 9：寫回「不買自己」狀態

  const normalCost = presentPrice[employeeId];
  const discountedCostValue = discountedPrice[employeeId];

  const normalProfit = (futurePrice[employeeId] - normalCost) | 0;
  const discountedProfit = (futurePrice[employeeId] - discountedCostValue) | 0;

  // 情況：父不買 → 自己用原價買
  for (let spent = normalCost; spent <= budgetLimit; spent++) {
    const childrenSpent = spent - normalCost;
    const childrenProfit = childrenProfitWhenBought[childrenSpent];
    if (childrenProfit === MIN_PROFIT) {
      continue;
    }

    const candidateProfit = childrenProfit + normalProfit;
    if (candidateProfit > dp[nodeBaseParentNotBought + spent]) {
      dp[nodeBaseParentNotBought + spent] = candidateProfit;
    }
  }

  // 情況：父買 → 自己用折扣價買
  for (let spent = discountedCostValue; spent <= budgetLimit; spent++) {
    const childrenSpent = spent - discountedCostValue;
    const childrenProfit = childrenProfitWhenBought[childrenSpent];
    if (childrenProfit === MIN_PROFIT) {
      continue;
    }

    const candidateProfit = childrenProfit + discountedProfit;
    if (candidateProfit > dp[nodeBaseParentBought + spent]) {
      dp[nodeBaseParentBought + spent] = candidateProfit;
    }
  }
}
```

### Step 11：從 CEO 的 dp 中取出不超過預算的最大收益

CEO 沒有父節點，因此其父旗標固定為 `0`（parent not bought）。遍歷 `spent` 找最大 profit。

```typescript
// CEO 沒有父節點，因此 parentBoughtFlag 必為 0
const rootBase = (1 << 1) * budgetStride;
let bestProfit = 0;

// 找出預算限制內的最大收益
for (let spent = 0; spent <= budgetLimit; spent++) {
  const profitValue = dp[rootBase + spent];
  if (profitValue > bestProfit) {
    bestProfit = profitValue;
  }
}

return bestProfit;
```

## 時間複雜度

- 建樹與 DFS：$O(n)$。
- DP 主要成本在「子樹背包合併」：每次合併是 $O(B^2)$，在所有節點上累計為 $O(n \cdot B^2)$（其中 $B$ 為 `budget`）。
- 總時間複雜度為 $O(n \cdot B^2)$。

> $O(n \cdot B^2)$

## 空間複雜度

- `dp` 需要記錄每個員工、兩種父旗標、每個預算花費：$O(n \cdot B)$。
- 其餘輔助陣列（孩子合併、緩衝、鄰接表）為 $O(n + B)$。
- 總空間複雜度為 $O(n \cdot B)$。

> $O(n \cdot B)$
