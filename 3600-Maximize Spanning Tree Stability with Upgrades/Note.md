# 3600. Maximize Spanning Tree Stability with Upgrades

You are given an integer `n`, representing `n` nodes numbered from 0 to `n - 1` and a list of edges, 
where `edges[i] = [u_i, v_i, s_i, must_i]`:

- `u_i` and `v_i` indicates an undirected edge between nodes `u_i` and `v_i`.
- `s_i` is the strength of the edge.
- `must_i` is an integer (0 or 1). 
  If `must_i == 1`, the edge must be included in the spanning tree. These edges cannot be upgraded.

You are also given an integer `k`, the maximum number of upgrades you can perform. 
Each upgrade doubles the strength of an edge, and each eligible edge (with `must_i == 0`) can be upgraded at most once.

The stability of a spanning tree is defined as the minimum strength score among all edges included in it.

Return the maximum possible stability of any valid spanning tree. If it is impossible to connect all nodes, return `-1`.

Note: A spanning tree of a graph with n nodes is a subset of the edges that connects all nodes together 
(i.e. the graph is connected) without forming any cycles, and uses exactly `n - 1` edges.

**Constraints:**

- `2 <= n <= 10^5`
- `1 <= edges.length <= 10^5`
- `edges[i] = [u_i, v_i, s_i, must_i]`
- `0 <= u_i, v_i < n`
- `u_i != v_i`
- `1 <= s_i <= 10^5`
- `must_i` is either `0` or `1`.
- `0 <= k <= n`
- There are no duplicate edges.

## 基礎思路

本題要求在所有合法生成樹中，最大化其穩定度，而穩定度定義為樹上所有邊權中的最小值。除此之外，題目還加入了兩個額外限制：部分邊必須被選入生成樹，且只有非必要邊才允許升級，升級後邊權會變成原本的兩倍，並且升級次數最多為 `k` 次。

在思考解法時，可掌握以下核心觀察：

* **生成樹的穩定度本質上是一個門檻問題**：
  若我們固定一個目標穩定度，問題就轉化為：是否能選出一棵合法生成樹，使得樹上的每一條邊都至少達到這個門檻。

* **必要邊會先決定可行性的下限與結構限制**：
  所有必要邊都必須被納入答案，因此它們不能形成環，且其最小邊權也會直接限制整體穩定度不可能超過該值。

* **必要邊可先壓縮成連通塊**：
  既然必要邊一定得選，我們可以先用它們把圖中的點合併成若干個連通塊。後續真正要處理的，就是如何用可選邊把這些連通塊接成一棵樹。

* **可選邊只需保留能連接不同連通塊的部分**：
  若某條可選邊的兩端原本就在同一個必要邊連通塊中，那麼它不可能幫助最終連通，因此可直接排除。

* **對於固定門檻，連通策略可分成兩階段**：
  先優先使用原本就達標的可選邊來連接連通塊；若仍不足，再考慮那些升級後才達標的可選邊，並統計實際使用的升級次數是否超過上限。

* **最大答案可用二分搜尋**：
  若某個穩定度門檻可以做到，那麼所有更小的門檻也一定可以做到，因此整體可行性具有單調性，適合以二分搜尋最大可行答案。

依據以上特性，可以採用以下策略：

* **先用並查集處理必要邊，檢查是否有環，並建立必要邊形成的連通塊。**
* **將圖壓縮到連通塊層級，只保留真正有助於連通的可選邊。**
* **對答案範圍做二分搜尋，每次檢查某個目標穩定度是否可行。**
* **在可行性檢查中，先用原本已達標的邊連接，再用升級後可達標的邊補足，並控制升級次數。**

此策略同時處理了必要邊約束、升級限制與最大最小值最佳化問題，能在題目的大資料範圍下有效求解。

## 解題步驟

### Step 1：初始化必要邊並查集與基礎統計變數

一開始先建立處理必要邊的並查集，讓每個節點各自成為獨立集合；
接著準備後續預處理會用到的統計變數與可選邊儲存空間，用來記錄必要邊帶來的限制、可能的答案上界，以及後續要進一步篩選的可選邊資料。

```typescript
const mustParent = new Int32Array(n);
const mustSize = new Int32Array(n);

// 初始化必要邊的並查集
for (let node = 0; node < n; node++) {
  mustParent[node] = node;
  mustSize[node] = 1;
}

// 記錄最終答案搜尋所需的邊界資訊
let minimumMustStrength = 1 << 30;
let hasMustEdge = false;
let mustEdgeCount = 0;
let maximumUpgradeableStrength = 0;

// 以分離陣列儲存可選邊，降低後續存取成本
const optionalFromList: number[] = [];
const optionalToList: number[] = [];
const optionalStrengthList: number[] = [];
```

### Step 2：實作必要邊並查集的查找函式

這個函式負責在必要邊形成的並查集中找到某個節點所屬集合的代表元；
查找完成後，會順便進行路徑壓縮，讓之後的查找效率更高。

```typescript
/**
 * 在必要邊並查集中尋找根節點。
 * @param node 要查詢的節點
 * @returns 根節點
 */
function findMustRoot(node: number): number {
  let current = node;

  // 持續往上走，直到抵達集合代表元
  while (mustParent[current] !== current) {
    current = mustParent[current];
  }

  // 壓縮走過的路徑，加速後續查詢
  while (mustParent[node] !== node) {
    const nextNode = mustParent[node];
    mustParent[node] = current;
    node = nextNode;
  }

  return current;
}
```

### Step 3：實作必要邊並查集的合併函式

這個函式用來把兩個節點所屬的集合合併起來；
若兩點原本已在同一集合，表示加入這條必要邊會形成環，函式就會回傳失敗；
否則便使用按大小合併的方式把兩個集合結合。

```typescript
/**
 * 在必要邊並查集中合併兩個節點。
 * @param firstNode 第一個節點
 * @param secondNode 第二個節點
 * @returns 是否成功合併
 */
function unionMust(firstNode: number, secondNode: number): boolean {
  let firstRoot = findMustRoot(firstNode);
  let secondRoot = findMustRoot(secondNode);

  // 若兩點已屬於同一集合，則不需合併
  if (firstRoot === secondRoot) {
    return false;
  }

  // 將較小的樹掛到較大的樹下面
  if (mustSize[firstRoot] < mustSize[secondRoot]) {
    const temp = firstRoot;
    firstRoot = secondRoot;
    secondRoot = temp;
  }

  // 合併兩個集合並更新合併後的大小
  mustParent[secondRoot] = firstRoot;
  mustSize[firstRoot] += mustSize[secondRoot];

  return true;
}
```

### Step 4：預處理所有邊並先處理必要邊的限制

接著逐一掃描所有邊。
若是必要邊，就記錄必要邊是否存在、必要邊數量，以及必要邊中的最小邊權；
同時嘗試將其併入必要邊並查集，若合併失敗，代表必要邊自身已形成環，無法構成合法生成樹，直接回傳 `-1`。

```typescript
// 預處理所有邊
for (let index = 0; index < edges.length; index++) {
  const edge = edges[index];
  const fromNode = edge[0];
  const toNode = edge[1];
  const strength = edge[2];
  const isMustEdge = edge[3];

  if (isMustEdge === 1) {
    // 計數並記錄必要邊帶來的限制
    hasMustEdge = true;
    mustEdgeCount++;

    // 記錄必要邊中的最小強度
    if (strength < minimumMustStrength) {
      minimumMustStrength = strength;
    }

    // 必要邊不能形成環
    if (!unionMust(fromNode, toNode)) {
      return -1;
    }

    continue;
  }

  // ...
}
```

### Step 5：收集可選邊並更新升級後的最大可能邊權

若目前邊不是必要邊，就先把它存入可選邊陣列，供後續門檻檢查使用；
同時也記錄這條邊升級一次之後的邊權，持續更新所有可選邊中可能出現的最大值，作為最終二分搜尋的上界候選。

```typescript
for (let index = 0; index < edges.length; index++) {
  // Step 4：處理必要邊的限制

  // 收集可選邊，供後續門檻檢查使用
  optionalFromList.push(fromNode);
  optionalToList.push(toNode);
  optionalStrengthList.push(strength);

  // 記錄升級後可能達到的最大強度
  const upgradedStrength = strength << 1;

  if (upgradedStrength > maximumUpgradeableStrength) {
    maximumUpgradeableStrength = upgradedStrength;
  }
}
```

### Step 6：先檢查必要邊數量是否合法，並將必要邊連通塊重新編號

完成所有邊的預處理後，先檢查必要邊數量是否已超過生成樹可容納的邊數上限；
若合法，便把必要邊並查集中的各個根節點壓縮成連續的連通塊編號，方便後續在壓縮圖上操作。

```typescript
// 若必要邊數量已超過生成樹可容納的邊數，則不可能成立
if (mustEdgeCount > n - 1) {
  return -1;
}

const rootToComponent = new Int32Array(n);
rootToComponent.fill(-1);

let componentCount = 0;

// 將並查集根節點壓縮成連通塊編號
for (let node = 0; node < n; node++) {
  const root = findMustRoot(node);

  if (rootToComponent[root] === -1) {
    rootToComponent[root] = componentCount;
    componentCount++;
  }
}
```

### Step 7：處理必要邊已全圖連通的特例

若壓縮後只剩下一個連通塊，表示單靠必要邊就已經把所有節點接起來；
此時唯一可能的生成樹就是由必要邊決定的結構，因此答案直接由必要邊中的最小邊權決定。
若圖中甚至沒有任何必要邊，則代表沒有邊可用來形成合法答案，回傳 `-1`。

```typescript
// 必要邊已經連通所有節點
if (componentCount === 1) {
  return hasMustEdge ? minimumMustStrength : -1;
}
```

### Step 8：篩掉無法幫助連接連通塊的可選邊

接下來只保留那些兩端分屬不同必要邊連通塊的可選邊。
因為只有這類邊才可能真正幫助把壓縮後的連通塊接起來；
若篩選後一條都不剩，就代表不可能完成整體連通，直接回傳 `-1`。

```typescript
const usefulOptionalFrom: number[] = [];
const usefulOptionalTo: number[] = [];
const usefulOptionalStrength: number[] = [];

// 篩選能連接不同連通塊的邊
for (let index = 0; index < optionalFromList.length; index++) {
  const componentFrom = rootToComponent[findMustRoot(optionalFromList[index])];
  const componentTo = rootToComponent[findMustRoot(optionalToList[index])];

  if (componentFrom !== componentTo) {
    // 只保留真正能幫助連接壓縮後連通塊的邊
    usefulOptionalFrom.push(componentFrom);
    usefulOptionalTo.push(componentTo);
    usefulOptionalStrength.push(optionalStrengthList[index]);
  }
}

if (usefulOptionalFrom.length === 0) {
  return -1;
}
```

### Step 9：建立後續檢查用的資料結構與答案搜尋範圍

把前一步篩出的可選邊轉成 `TypedArray`，提升後續反覆掃描時的效率；
接著根據必要邊是否存在，決定二分搜尋的最大上界。
若上界為 `0`，表示沒有任何可行的邊權門檻可搜尋，直接回傳 `-1`。
最後建立可行性檢查時使用的第二組並查集陣列。

```typescript
// 轉成 TypedArray 以加速迭代
const optionalFrom = Int32Array.from(usefulOptionalFrom);
const optionalTo = Int32Array.from(usefulOptionalTo);
const optionalStrength = Int32Array.from(usefulOptionalStrength);

const searchUpperBound = hasMustEdge
  ? Math.max(minimumMustStrength, maximumUpgradeableStrength)
  : maximumUpgradeableStrength;

if (searchUpperBound === 0) {
  return -1;
}

const connectParent = new Int32Array(componentCount);
const connectSize = new Int32Array(componentCount);
```

### Step 10：建立可行性檢查函式並先處理門檻與初始化

這個函式用來判斷某個目標穩定度是否可行。
一開始先檢查必要邊是否已直接限制了目標門檻；
若門檻高於必要邊中的最小邊權，就不可能成立。
若仍有機會，便重新初始化用來檢查連通性的並查集。

```typescript
/**
 * 檢查是否能達成穩定度 >= targetStrength。
 * @param targetStrength 需要滿足的最小邊權
 * @returns 是否可達成
 */
function canBuild(targetStrength: number): boolean {
  // 必要邊會限制穩定度上限
  if (hasMustEdge && targetStrength > minimumMustStrength) {
    return false;
  }

  // 重設並查集
  for (let component = 0; component < componentCount; component++) {
    connectParent[component] = component;
    connectSize[component] = 1;
  }

  // ...
}
```

### Step 11：在可行性檢查中實作連通性並查集的查找函式

為了在壓縮後的連通塊之間判斷是否已連通，
先實作這組並查集的查找函式，同樣採用路徑壓縮來提升效率。

```typescript
/**
 * 檢查是否能達成穩定度 >= targetStrength。
 * @param targetStrength 需要滿足的最小邊權
 * @returns 是否可達成
 */
function canBuild(targetStrength: number): boolean {
  // Step 10：先處理必要邊門檻並重設並查集

  /**
   * 在連通性並查集中尋找連通塊根節點。
   * @param component 連通塊編號
   * @returns 根連通塊
   */
  function findComponentRoot(component: number): number {
    let current = component;

    // 持續往上走，直到抵達連通塊代表元
    while (connectParent[current] !== current) {
      current = connectParent[current];
    }

    // 壓縮走過的路徑，方便後續連通性檢查
    while (connectParent[component] !== component) {
      const next = connectParent[component];
      connectParent[component] = current;
      component = next;
    }

    return current;
  }

  // ...
}
```

### Step 12：在可行性檢查中實作連通性並查集的合併函式

接著實作這組並查集的合併函式。
若兩個連通塊原本已連通，則此次合併無效；
否則便以按大小合併的方式結合兩個集合，供後續邊掃描時使用。

```typescript
/**
 * 檢查是否能達成穩定度 >= targetStrength。
 * @param targetStrength 需要滿足的最小邊權
 * @returns 是否可達成
 */
function canBuild(targetStrength: number): boolean {
  // Step 10：先處理必要邊門檻並重設並查集

  // Step 11：實作連通性並查集的查找函式

  /**
   * 合併兩個連通塊。
   * @param a 第一個連通塊
   * @param b 第二個連通塊
   * @returns 是否成功合併
   */
  function unionComponent(a: number, b: number): boolean {
    let rootA = findComponentRoot(a);
    let rootB = findComponentRoot(b);

    // 若兩端已連通，則不需合併
    if (rootA === rootB) {
      return false;
    }

    // 將較小的連通塊樹掛到較大的樹下面
    if (connectSize[rootA] < connectSize[rootB]) {
      const temp = rootA;
      rootA = rootB;
      rootB = temp;
    }

    // 合併兩個連通塊並累加大小
    connectParent[rootB] = rootA;
    connectSize[rootA] += connectSize[rootB];

    return true;
  }

  // ...
}
```

### Step 13：先使用原本就達到門檻的可選邊進行連通

在固定門檻下，先掃描所有可選邊中那些原本邊權就已不低於門檻的邊。
只有當該邊真的能合併兩個尚未連通的連通塊時，才算成功使用；
每成功一次，就代表未連通的連通塊數量減少一個。
若此時已全部接通，便可直接回傳成功。

```typescript
function canBuild(targetStrength: number): boolean {
  // Step 10：先處理必要邊門檻並重設並查集

  // Step 11：實作連通性並查集的查找函式

  // Step 12：實作連通性並查集的合併函式

  let remainingComponents = componentCount;
  let usedUpgrades = 0;

  // 先使用原本就符合門檻的邊
  for (let index = 0; index < optionalStrength.length; index++) {
    if (optionalStrength[index] < targetStrength) {
      // 略過未升級時邊權不足的邊
      continue;
    }

    if (!unionComponent(optionalFrom[index], optionalTo[index])) {
      // 略過無法減少連通塊數量的邊
      continue;
    }

    // 每次成功合併都會少掉一個未連通的連通塊
    remainingComponents--;
    if (remainingComponents === 1) {
      return true;
    }
  }

  // ...
}
```

### Step 14：再使用升級後可達門檻的可選邊補齊連通

若第一階段仍未完成連通，就再考慮那些原本不達門檻、但升級一次後能達門檻的邊。
同樣只有在真的改善連通性時才計入使用，且每使用一條就消耗一次升級額度；
若升級次數超過上限，立即判定失敗。
若在限制內成功把所有連通塊接成一個，則目標門檻可行，否則不可行。

```typescript
function canBuild(targetStrength: number): boolean {
  // Step 10：先處理必要邊門檻並重設並查集

  // Step 11：實作連通性並查集的查找函式

  // Step 12：實作連通性並查集的合併函式

  // Step 13：先使用原本就達到門檻的可選邊進行連通

  // 再使用可升級後達標的邊
  for (let index = 0; index < optionalStrength.length; index++) {
    const strength = optionalStrength[index];

    if (strength >= targetStrength) {
      continue;
    }

    if ((strength << 1) < targetStrength) {
      // 略過即使升級一次後仍不足的邊
      continue;
    }

    if (!unionComponent(optionalFrom[index], optionalTo[index])) {
      // 略過無法改善連通性的邊
      continue;
    }

    // 只有當這條邊真的被使用時，才計算一次升級
    usedUpgrades++;
    if (usedUpgrades > k) {
      return false;
    }

    // 每次成功合併都會少掉一個未連通的連通塊
    remainingComponents--;
    if (remainingComponents === 1) {
      return true;
    }
  }

  return false;
}
```

### Step 15：以二分搜尋找出最大的可行穩定度

由於門檻越小越容易達成，因此可行性具有單調性。
我們便在合法範圍內做二分搜尋：
若某個中間值可行，就嘗試往更大的穩定度搜尋；
否則往更小的範圍縮減。
最終留下的最大可行值就是答案。

```typescript
// 二分搜尋最大穩定度
let left = 1;
let right = searchUpperBound;
let answer = -1;

while (left <= right) {
  const middle = left + ((right - left) >> 1);

  if (canBuild(middle)) {
    answer = middle;
    left = middle + 1;
  } else {
    right = middle - 1;
  }
}

return answer;
```

## 時間複雜度

- 預處理所有邊、建立必要邊連通塊、篩選可選邊，總共需要線性掃描，成本為 $O(n + m)$。
- 每次可行性檢查都會重設並查集並掃描所有保留下來的可選邊，時間為 $O(n + m)$，並查集操作可視為均攤近似常數。
- 二分搜尋的範圍上界來自邊權與升級後邊權，最多為常數級數值範圍，因此需要進行 $O(\log S)$ 次檢查，其中 $S$ 為答案搜尋上界。
- 總時間複雜度為 $O((n + m)\log S)$。

> $O((n + m)\log S)$

## 空間複雜度

- 需要兩組並查集結構來處理必要邊連通塊與門檻檢查過程，成本為 $O(n)$。
- 需要額外儲存所有可選邊與篩選後的壓縮圖邊資訊，成本為 $O(m)$。
- 總空間複雜度為 $O(n + m)$。

> $O(n + m)$
