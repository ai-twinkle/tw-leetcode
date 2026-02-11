# 3721. Longest Balanced Subarray II

You are given an integer array `nums`.

A subarray is called balanced if the number of distinct even numbers in the subarray is equal to the number of distinct odd numbers.

Return the length of the longest balanced subarray.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^5`

## 基礎思路

本題要找最長子陣列，使其「不同的偶數值數量」等於「不同的奇數值數量」。關鍵難點在於：

* **計的是 distinct（不同值）而不是出現次數**：同一個數在子陣列中出現多次只能算 1。
* **子陣列要連續**：因此必須能在往右擴展時，快速更新「目前子陣列中 distinct 偶數/奇數的差值」，並能快速找到最早的左端使差值為 0。
* **值域與長度都很大**：`nums.length` 可到 `10^5`，若每次都重算 distinct 集合會超時。

為了有效處理 distinct，常用策略是：

* **把每個值的「是否為 distinct」轉為事件**：對於固定右端點 `right`，某個數 `value` 是否被視為 distinct，取決於左端點是否在它「最後一次出現位置」之後。
* **把「distinct 偶數 − distinct 奇數」視為一個平衡值**：若某段子陣列平衡值為 0，就代表 balanced。
* **需要支援大量的區間加減與快速查找平衡點**：因為當右端右移，很多左端點對應的平衡值都會一起變動，所以要能對一段前綴範圍做加法更新，並能快速找到某個目標值（此解用「找最左 0」）。

因此整體策略是：

* 用資料結構維護「對所有可能左端點」而言的平衡值（會隨 right 更新）。
* 每次把 right 向右推進時，只做與「此次新增值」及其「上次出現位置」相關的更新。
* 每次更新後，快速找到最左端使平衡值為 0，進而更新答案長度。

## 解題步驟

### Step 1：類別欄位宣告 — `SegmentTreeRangeAddMinMax`

此類別是一棵線段樹，核心目標是支援兩件事：

1. **區間加法（lazy propagation）**：一次更新一段區間的所有值。
2. **查詢最左的 0**：快速找出目前值等於 0 的最小索引（若不存在回傳 -1）。

```typescript
class SegmentTreeRangeAddMinMax {
  private readonly size: number;
  private readonly validLength: number;
  private readonly minTree: Int32Array;
  private readonly maxTree: Int32Array;
  private readonly lazy: Int32Array;

  // 可重複使用的堆疊，用以消除遞迴開銷
  private readonly nodeStack: Int32Array;
  private readonly leftBoundaryStack: Int32Array;
  private readonly rightBoundaryStack: Int32Array;
  private readonly traversalStateStack: Int8Array;

  // ...
}
```

### Step 2：建構子 — 初始化線段樹與堆疊

建構子做三件事：

* 把樹大小擴到**下一個 2 的次方**，方便 child index 計算。
* 配置 `minTree / maxTree / lazy` 三組陣列（用於區間最小值、最大值與 lazy 標記）。
* 配置迭代版 DFS 用的固定容量堆疊（避免遞迴）。

```typescript
class SegmentTreeRangeAddMinMax {
  // Step 1：類別欄位宣告 — `SegmentTreeRangeAddMinMax`

  /**
   * 支援以下功能的線段樹：
   * 1. Lazy propagation 的區間加法
   * 2. 查詢值等於 0 的最左索引
   *
   * @param n 有效索引範圍為 [0, n - 1]
   */
  constructor(n: number) {
    this.validLength = n;

    // 擴展到下一個 2 的次方以簡化子節點索引
    let powerOfTwoSize = 1;
    while (powerOfTwoSize < n) {
      powerOfTwoSize <<= 1;
    }
    this.size = powerOfTwoSize;

    const treeArrayLength = powerOfTwoSize << 1;
    this.minTree = new Int32Array(treeArrayLength);
    this.maxTree = new Int32Array(treeArrayLength);
    this.lazy = new Int32Array(treeArrayLength);

    // 固定堆疊容量足夠：樹高 <= log2(1e5) < 20
    const stackCapacity = 256;
    this.nodeStack = new Int32Array(stackCapacity);
    this.leftBoundaryStack = new Int32Array(stackCapacity);
    this.rightBoundaryStack = new Int32Array(stackCapacity);
    this.traversalStateStack = new Int8Array(stackCapacity);
  }

  // ...
}
```

### Step 3：`rangeAdd` — 對區間做加法更新（迭代 + lazy）

`rangeAdd(left, right, delta)` 會把 `[left, right]` 範圍內的所有值都加上 `delta`，流程包含：

* 先做合法化（裁切到 `[0, n-1]`）。
* 使用堆疊模擬遞迴 DFS：

  * state=0：往下走，處理覆蓋與分裂。
  * state=1：子節點更新完回來後，重新計算當前節點的 min/max。
* 碰到完全覆蓋的節點就用 `applyDelta` 做 lazy 更新。
* 往下走之前用 `pushDown` 把 lazy 往子節點推。

```typescript
class SegmentTreeRangeAddMinMax {
  // Step 1：類別欄位宣告 — `SegmentTreeRangeAddMinMax`

  // Step 2：建構子 — 初始化線段樹與堆疊

  /**
   * 對 [left, right]（含）內每個位置加上 delta。
   *
   * @param left 起點（含）
   * @param right 終點（含）
   * @param delta 加到每個位置的值
   */
  public rangeAdd(left: number, right: number, delta: number): void {
    if (left > right) {
      return;
    }

    // 將更新範圍限制在原陣列有效區間內
    if (left < 0) {
      left = 0;
    }
    const lastValidIndex = this.validLength - 1;
    if (right > lastValidIndex) {
      right = lastValidIndex;
    }
    if (left > right) {
      return;
    }

    let stackTop = 0;

    // 從根節點開始
    this.nodeStack[stackTop] = 1;
    this.leftBoundaryStack[stackTop] = 0;
    this.rightBoundaryStack[stackTop] = this.size - 1;
    this.traversalStateStack[stackTop] = 0;
    stackTop++;

    while (stackTop > 0) {
      stackTop--;
      const node = this.nodeStack[stackTop];
      const segmentLeft = this.leftBoundaryStack[stackTop];
      const segmentRight = this.rightBoundaryStack[stackTop];
      const state = this.traversalStateStack[stackTop];

      if (state === 0) {
        // 與更新範圍完全不重疊
        if (segmentLeft > right || segmentRight < left) {
          continue;
        }

        // 當前區間被完全覆蓋
        if (left <= segmentLeft && segmentRight <= right) {
          this.applyDelta(node, delta);
          continue;
        }

        // 探索子節點前先下推 lazy
        this.pushDown(node);

        // 子節點更新完後要回來重算
        this.nodeStack[stackTop] = node;
        this.leftBoundaryStack[stackTop] = segmentLeft;
        this.rightBoundaryStack[stackTop] = segmentRight;
        this.traversalStateStack[stackTop] = 1;
        stackTop++;

        const midpointIndex = (segmentLeft + segmentRight) >> 1;

        // 先推右子節點，確保左子節點先被處理
        this.nodeStack[stackTop] = (node << 1) | 1; // 右子節點
        this.leftBoundaryStack[stackTop] = midpointIndex + 1;
        this.rightBoundaryStack[stackTop] = segmentRight;
        this.traversalStateStack[stackTop] = 0;
        stackTop++;

        this.nodeStack[stackTop] = node << 1; // 左子節點
        this.leftBoundaryStack[stackTop] = segmentLeft;
        this.rightBoundaryStack[stackTop] = midpointIndex;
        this.traversalStateStack[stackTop] = 0;
        stackTop++;
      } else {
        // 由子節點重算 min 與 max
        const leftChildNode = node << 1;
        const rightChildNode = leftChildNode | 1;

        const leftMin = this.minTree[leftChildNode];
        const rightMin = this.minTree[rightChildNode];
        this.minTree[node] = leftMin < rightMin ? leftMin : rightMin;

        const leftMax = this.maxTree[leftChildNode];
        const rightMax = this.maxTree[rightChildNode];
        this.maxTree[node] = leftMax > rightMax ? leftMax : rightMax;
      }
    }
  }

  // ...
}
```

### Step 4：`findLeftmostZero` — 找到值等於 0 的最左索引

此函式從根一路往下走：

* 若整段的 `min > 0` 或 `max < 0`，代表整段不可能含 0，直接回傳 -1。
* 否則每次優先走「仍可能含 0」的左子樹，確保找到的是最左索引。
* 走到底後還要排除 padding 超出 `validLength` 的索引。

```typescript
class SegmentTreeRangeAddMinMax {
  // Step 1：類別欄位宣告 — `SegmentTreeRangeAddMinMax`

  // Step 2：建構子 — 初始化線段樹與堆疊

  // Step 3：`rangeAdd` — 對區間做加法更新（迭代 + lazy）

  /**
   * 找出值等於 0 的最小索引。
   *
   * @returns 最左的值為 0 的索引；若不存在則回傳 -1
   */
  public findLeftmostZero(): number {
    let node = 1;
    let segmentLeft = 0;
    let segmentRight = this.size - 1;

    // 若整段永遠不可能跨過 0，則無解
    if (this.minTree[node] > 0 || this.maxTree[node] < 0) {
      return -1;
    }

    while (segmentLeft !== segmentRight) {
      this.pushDown(node);

      const leftChildNode = node << 1;
      const rightChildNode = leftChildNode | 1;
      const midpointIndex = (segmentLeft + segmentRight) >> 1;

      // 優先走左子樹，以保證最左位置
      if (this.minTree[leftChildNode] <= 0 && this.maxTree[leftChildNode] >= 0) {
        node = leftChildNode;
        segmentRight = midpointIndex;
      } else {
        node = rightChildNode;
        segmentLeft = midpointIndex + 1;
      }
    }

    // 排除超出原始長度的 padding 索引
    if (segmentLeft >= this.validLength) {
      return -1;
    }

    return this.minTree[node] === 0 ? segmentLeft : -1;
  }

  // ...
}
```

### Step 5：`applyDelta` — 節點套用增量並累積 lazy

對單一節點同時更新：

* `minTree[node]`
* `maxTree[node]`
* `lazy[node]`

```typescript
class SegmentTreeRangeAddMinMax {
  // Step 1：類別欄位宣告 — `SegmentTreeRangeAddMinMax`

  // Step 2：建構子 — 初始化線段樹與堆疊

  // Step 3：`rangeAdd` — 對區間做加法更新（迭代 + lazy）

  // Step 4：`findLeftmostZero` — 找到值等於 0 的最左索引

  /**
   * 對節點套用 delta，並累積 lazy 值。
   *
   * @param node 樹節點索引
   * @param delta 要加的值
   */
  private applyDelta(node: number, delta: number): void {
    this.minTree[node] += delta;
    this.maxTree[node] += delta;
    this.lazy[node] += delta;
  }

  // ...
}
```

### Step 6：`pushDown` — 下推 lazy 到子節點

若 `lazy[node]` 不為 0，代表子節點尚未反映此增量，需一次性推下去並清空父節點的 lazy。

```typescript
class SegmentTreeRangeAddMinMax {
  // Step 1：類別欄位宣告 — `SegmentTreeRangeAddMinMax`

  // Step 2：建構子 — 初始化線段樹與堆疊

  // Step 3：`rangeAdd` — 對區間做加法更新（迭代 + lazy）

  // Step 4：`findLeftmostZero` — 找到值等於 0 的最左索引

  // Step 5：`applyDelta` — 節點套用增量並累積 lazy

  /**
   * 將 lazy 值下推到子節點。
   *
   * @param node 樹節點索引
   */
  private pushDown(node: number): void {
    const pendingDelta = this.lazy[node];
    if (pendingDelta === 0) {
      return;
    }

    const leftChildNode = node << 1;
    const rightChildNode = leftChildNode | 1;

    this.minTree[leftChildNode] += pendingDelta;
    this.maxTree[leftChildNode] += pendingDelta;
    this.lazy[leftChildNode] += pendingDelta;

    this.minTree[rightChildNode] += pendingDelta;
    this.maxTree[rightChildNode] += pendingDelta;
    this.lazy[rightChildNode] += pendingDelta;

    this.lazy[node] = 0;
  }
}
```

### Step 7：主函式 `longestBalanced` — 維護 distinct 貢獻並更新答案

主函式的核心流程：

* `lastOccurrence[value]` 記錄每個值上次出現位置，用於判斷 distinct 的「切換點」。
* 每次右端點 `right` 增加一個值 `value`：

  * 若此值曾出現過，代表 distinct 貢獻的影響範圍需要調整：對 `[0, previousIndex]` 做一次反向更新。
  * 再把本次出現納入 distinct 貢獻：對 `[0, right]` 做一次更新。
* 更新後呼叫 `findLeftmostZero()` 找到最早可使平衡為 0 的左端，更新最長長度。

```typescript
function longestBalanced(nums: number[]): number {
  const n = nums.length;

  // 追蹤每個值最後一次出現的位置，以處理 distinct
  const lastOccurrence = new Int32Array(100001);
  lastOccurrence.fill(-1);

  const segmentTree = new SegmentTreeRangeAddMinMax(n);

  let bestLength = 0;

  for (let right = 0; right < n; right++) {
    const value = nums[right];
    const delta = (value & 1) === 0 ? 1 : -1;

    const previousIndex = lastOccurrence[value];

    // 若該值之前出現過，移除舊的 distinct 貢獻
    if (previousIndex !== -1) {
      segmentTree.rangeAdd(0, previousIndex, -delta);
    }

    // 加入當前 distinct 貢獻
    segmentTree.rangeAdd(0, right, delta);
    lastOccurrence[value] = right;

    const left = segmentTree.findLeftmostZero();
    if (left !== -1) {
      const currentLength = right - left + 1;
      if (currentLength > bestLength) {
        bestLength = currentLength;
      }
    }
  }

  return bestLength;
}
```

## 時間複雜度

- `rangeAdd(left, right, delta)`：線段樹高度為 `h = ⌈log2(size)⌉`，每次更新沿樹走訪並回溯重算，時間為 $O(h)=O(\log n)$。
- `findLeftmostZero()`：每次從根走到葉，走訪深度為 $O(\log n)$。
- 主迴圈跑 `n` 次；每次最多呼叫 `rangeAdd` 兩次、`findLeftmostZero` 一次，故每次成本為 $O(\log n)$。
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- 線段樹內部陣列大小與 `size`（下一個 2 的次方）成正比，`size ≤ 2n`，故線段樹空間為 $O(n)$。
- `lastOccurrence` 為固定大小 `100001` 的陣列，空間為 $O(1)$（在題目值域上界固定的前提下），不隨 `n` 成長。
- 其餘變數為常數級。
- 總空間複雜度為 $O(n)$。

> $O(n)$
