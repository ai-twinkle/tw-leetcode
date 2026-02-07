# 3013. Divide an Array Into Subarrays With Minimum Cost II

You are given a 0-indexed array of integers `nums` of length `n`, and two positive integers `k` and `dist`.

The cost of an array is the value of its first element. 
For example, the cost of `[1,2,3]` is `1` while the cost of `[3,4,1]` is `3`.

You need to divide `nums` into `k` disjoint contiguous subarrays, 
such that the difference between the starting index of the second subarray and 
the starting index of the $k^{th}$ subarray should be less than or equal to `dist`. 
In other words, if you divide `nums` into the subarrays $\text{nums}[0..(i_1 - 1)], \text{nums}[i_1..(i_2 - 1)], ..., \text{nums}[i_{k-1}..(n - 1)]$, 
then $i_{k-1} - i_1 \le \text{dist}$.

Return the minimum possible sum of the cost of these subarrays.

**Constraints:**

- `3 <= n <= 10^5`
- `1 <= nums[i] <= 10^9`
- `3 <= k <= n`
- `k - 2 <= dist <= n - 2`

## 基礎思路

本題要把陣列切成 `k` 段連續子陣列，且第 2 段起點 `i1` 到第 `k` 段起點 `i_{k-1}` 的距離需滿足 `i_{k-1} - i1 <= dist`。
每段成本是該段第一個元素，因此總成本是「各段起點元素」的總和。

關鍵觀察如下：

* **第一段起點固定為 0**：第一段一定從 `nums[0]` 開始，因此 `nums[0]` 必然被計入成本。
  問題等價於：在剩餘位置中選出 `k-1` 個段起點，使得它們的索引落在某個受限範圍內，並使起點值總和最小。
* **距離限制轉為滑動視窗限制**：限制的是「第 2 段起點」到「第 k 段起點」的起點索引距離，因此 `k-1` 個起點（不含 0）必須全部落在某個長度為 `dist+1` 的索引區間內（以第 2 段起點為左端，最遠到第 k 段起點）。
* **每個視窗只需選最小的 `k-1` 個值**：對於每個合法索引視窗（只在 `1..n-1` 之間滑動），只要能快速維護「視窗內最小的 `k-1` 個元素和」，就能取全域最小值，再加上必選的 `nums[0]`。
* **動態維護最小 k 個的典型做法**：用兩個堆（或等價結構）維持：

    * 已選集合：當前視窗內最小的 `k-1` 個元素（需要能快速移除最大值，故用最大堆）
    * 未選集合：視窗內其餘元素（需要能快速取最小值補位，故用最小堆）
      由於視窗滑動時會有元素離開、元素進入，且堆內刪除可採用「延遲刪除」避免昂貴的任意刪除成本。

透過「滑動視窗 + 兩堆維護最小 `k-1` 和」，即可在大輸入範圍下有效求出最小成本。

## 解題步驟

### Step 1：抽象堆底層 `BaseBinaryHeap` — 欄位與建構子

使用兩個 TypedArray 分別存值與索引，並以 `heapSize` 管理堆大小；同時保留 `poppedValue/poppedIndex` 供 `popToFields` 回填。

```typescript
abstract class BaseBinaryHeap {
  protected readonly valueHeap: Int32Array;
  protected readonly indexHeap: Int32Array;
  protected heapSize = 0;

  public poppedValue = 0;
  public poppedIndex = 0;

  /**
   * @param capacity 可存放的最大元素數
   */
  constructor(capacity: number) {
    this.valueHeap = new Int32Array(capacity);
    this.indexHeap = new Int32Array(capacity);
  }

  // ...
}
```

### Step 2：`isEmpty` — 判斷堆是否為空

```typescript
abstract class BaseBinaryHeap {
  // Step 1：抽象堆底層 — 欄位與建構子

  /**
   * @returns 堆是否沒有任何元素
   */
  public isEmpty(): boolean {
    return this.heapSize === 0;
  }

  // ...
}
```

### Step 3：`peekValue` / `peekIndex` — 取得堆頂 (value, index)

```typescript
abstract class BaseBinaryHeap {
  // Step 1：抽象堆底層 — 欄位與建構子

  // Step 2：`isEmpty` — 判斷堆是否為空

  /**
   * @returns 堆頂的值
   */
  public peekValue(): number {
    return this.valueHeap[0];
  }

  /**
   * @returns 堆頂的索引
   */
  public peekIndex(): number {
    return this.indexHeap[0];
  }

  // ...
}
```

### Step 4：`push` — 插入 (value, index) 並向上調整

插入至尾端後，上浮直到父節點具有更高優先權。

```typescript
abstract class BaseBinaryHeap {
  // Step 1：抽象堆底層 — 欄位與建構子

  // Step 2：`isEmpty` — 判斷堆是否為空

  // Step 3：`peekValue` / `peekIndex` — 取得堆頂

  /**
   * 將 (value, index) 插入堆中。
   * @param value 元素值
   * @param index 元素索引
   */
  public push(value: number, index: number): void {
    let currentPosition = this.heapSize;
    this.valueHeap[currentPosition] = value;
    this.indexHeap[currentPosition] = index;
    this.heapSize += 1;

    while (currentPosition > 0) {
      const parentPosition = (currentPosition - 1) >> 1;
      if (this.hasHigherPriority(parentPosition, currentPosition)) {
        break;
      }

      this.swap(parentPosition, currentPosition);
      currentPosition = parentPosition;
    }
  }

  // ...
}
```

### Step 5：`popToFields` — 彈出堆頂並存入 popped 欄位

將堆頂放到 `poppedValue/poppedIndex`，再把最後元素搬到堆頂並下沉修復。

```typescript
abstract class BaseBinaryHeap {
  // Step 1：抽象堆底層 — 欄位與建構子

  // Step 2：`isEmpty` — 判斷堆是否為空

  // Step 3：`peekValue` / `peekIndex` — 取得堆頂

  // Step 4：`push` — 插入並向上調整

  /**
   * 彈出堆頂元素並存入 poppedValue / poppedIndex。
   */
  public popToFields(): void {
    const lastPosition = this.heapSize - 1;

    this.poppedValue = this.valueHeap[0];
    this.poppedIndex = this.indexHeap[0];

    this.heapSize = lastPosition;
    if (lastPosition === 0) {
      return;
    }

    this.valueHeap[0] = this.valueHeap[lastPosition];
    this.indexHeap[0] = this.indexHeap[lastPosition];

    this.siftDown(0);
  }

  // ...
}
```

### Step 6：`swap` — 交換兩個堆位置

```typescript
abstract class BaseBinaryHeap {
  // Step 1：抽象堆底層 — 欄位與建構子

  // Step 2：`isEmpty` — 判斷堆是否為空

  // Step 3：`peekValue` / `peekIndex` — 取得堆頂

  // Step 4：`push` — 插入並向上調整

  // Step 5：`popToFields` — 彈出堆頂

  /**
   * @param firstPosition 第一個位置
   * @param secondPosition 第二個位置
   */
  protected swap(firstPosition: number, secondPosition: number): void {
    const firstValue = this.valueHeap[firstPosition];
    const firstIndex = this.indexHeap[firstPosition];

    this.valueHeap[firstPosition] = this.valueHeap[secondPosition];
    this.indexHeap[firstPosition] = this.indexHeap[secondPosition];

    this.valueHeap[secondPosition] = firstValue;
    this.indexHeap[secondPosition] = firstIndex;
  }

  // ...
}
```

### Step 7：`siftDown` — 下沉修復堆性質

每次選出較佳子節點，若子節點優先於當前節點則交換並繼續。

```typescript
abstract class BaseBinaryHeap {
  // Step 1：抽象堆底層 — 欄位與建構子

  // Step 2：`isEmpty` — 判斷堆是否為空

  // Step 3：`peekValue` / `peekIndex` — 取得堆頂

  // Step 4：`push` — 插入並向上調整

  // Step 5：`popToFields` — 彈出堆頂

  // Step 6：`swap` — 交換堆位置

  /**
   * @param startPosition 下沉起點
   */
  protected siftDown(startPosition: number): void {
    let currentPosition = startPosition;

    while (true) {
      const leftChildPosition = currentPosition * 2 + 1;
      if (leftChildPosition >= this.heapSize) {
        break;
      }

      const rightChildPosition = leftChildPosition + 1;
      let bestChildPosition = leftChildPosition;

      if (rightChildPosition < this.heapSize) {
        if (this.hasHigherPriority(rightChildPosition, leftChildPosition)) {
          bestChildPosition = rightChildPosition;
        }
      }

      if (this.hasHigherPriority(currentPosition, bestChildPosition)) {
        break;
      }

      this.swap(currentPosition, bestChildPosition);
      currentPosition = bestChildPosition;
    }
  }

  // ...
}
```

### Step 8：抽象比較 `hasHigherPriority` — 由子類決定最小堆或最大堆

```typescript
abstract class BaseBinaryHeap {
  // Step 1：抽象堆底層 — 欄位與建構子

  // Step 2：`isEmpty` — 判斷堆是否為空

  // Step 3：`peekValue` / `peekIndex` — 取得堆頂

  // Step 4：`push` — 插入並向上調整

  // Step 5：`popToFields` — 彈出堆頂

  // Step 6：`swap` — 交換堆位置

  // Step 7：`siftDown` — 下沉修復

  /**
   * 決定兩個堆位置的優先權。
   * @param firstPosition 第一個位置
   * @param secondPosition 第二個位置
   * @returns 若 firstPosition 優先權高於 secondPosition 則回傳 true
   */
  protected abstract hasHigherPriority(firstPosition: number, secondPosition: number): boolean;
}
```

### Step 9：`MinBinaryHeap` — 最小堆的優先權規則

```typescript
class MinBinaryHeap extends BaseBinaryHeap {
  /**
   * @param firstPosition 第一個位置
   * @param secondPosition 第二個位置
   * @returns 若 firstPosition 優先權高於 secondPosition 則回傳 true
   */
  protected hasHigherPriority(firstPosition: number, secondPosition: number): boolean {
    return this.valueHeap[firstPosition] <= this.valueHeap[secondPosition];
  }
}
```

### Step 10：`MaxBinaryHeap` — 最大堆的優先權規則

```typescript
class MaxBinaryHeap extends BaseBinaryHeap {
  /**
   * @param firstPosition 第一個位置
   * @param secondPosition 第二個位置
   * @returns 若 firstPosition 優先權高於 secondPosition 則回傳 true
   */
  protected hasHigherPriority(firstPosition: number, secondPosition: number): boolean {
    return this.valueHeap[firstPosition] >= this.valueHeap[secondPosition];
  }
}
```

### Step 11：`minimumCost` — 初始化與將輸入轉為 TypedArray

先複製 `nums` 到 `Int32Array` 以降低存取與型別成本，並初始化需要的計數、答案與輔助結構。

```typescript
function minimumCost(nums: number[], k: number, dist: number): number {
  const length = nums.length;

  // 使用 TypedArray 以加速存取並降低 overhead
  const values = new Int32Array(length);
  for (let index = 0; index < length; index++) {
    values[index] = nums[index] | 0;
  }

  const requiredSelectedCount = k - 1;
  let currentSelectedSum = 0;
  let bestWindowSum = Number.POSITIVE_INFINITY;

  // 用 0/1 旗標比 Set 查詢更快
  const isSelected = new Uint8Array(length);

  // 堆存 (value, index)，並以 isSelected / 視窗邊界做延遲刪除
  const selectedMaxHeap = new MaxBinaryHeap(length);
  const unselectedMinHeap = new MinBinaryHeap(length);

  let selectedCount = 0;

  // ...
}
```

### Step 12：主迴圈骨架 — 右端擴展並計算視窗左端

此迴圈以 `rightIndex` 從 1 走到尾端，維護「合法索引視窗」，並動態維持視窗內最小的 `k-1` 個值之和。

```typescript
function minimumCost(nums: number[], k: number, dist: number): number {
  // Step 11：初始化與將輸入轉為 TypedArray

  for (let rightIndex = 1; rightIndex < length; rightIndex++) {
    const leftIndex = rightIndex - dist - 1;

    // ...
  }

  // ...
}
```

### Step 13：視窗左端右移 — 若離開元素屬於已選集合，需補位

當 `leftIndex > 0` 且該索引離開視窗時，若它原本在已選集合，就必須：

1. 從已選集合扣掉它
2. 從未選集合中挑最小者補回已選集合
   並且對未選堆做必要的延遲清理（丟棄已不在視窗內的索引）。

```typescript
function minimumCost(nums: number[], k: number, dist: number): number {
  // Step 11：初始化與將輸入轉為 TypedArray

  for (let rightIndex = 1; rightIndex < length; rightIndex++) {
    // Step 12：主迴圈骨架 — 計算視窗左端

    if (leftIndex > 0) {
      if (isSelected[leftIndex] === 1) {
        // 移除離開視窗的已選元素
        isSelected[leftIndex] = 0;
        selectedCount -= 1;
        currentSelectedSum -= values[leftIndex];

        // 丟棄已在視窗左側之外的未選元素（延遲清理）
        while (!unselectedMinHeap.isEmpty()) {
          if (unselectedMinHeap.peekIndex() < leftIndex) {
            unselectedMinHeap.popToFields();
          } else {
            break;
          }
        }

        if (!unselectedMinHeap.isEmpty()) {
          // 將最小的未選元素補進已選集合
          unselectedMinHeap.popToFields();
          const promotedValue = unselectedMinHeap.poppedValue;
          const promotedIndex = unselectedMinHeap.poppedIndex;

          selectedMaxHeap.push(promotedValue, promotedIndex);
          isSelected[promotedIndex] = 1;
          selectedCount += 1;
          currentSelectedSum += promotedValue;
        }
      }
    }

    // ...
  }

  // ...
}
```

### Step 14：將右端新元素加入結構 — 先填滿已選集合到 `k-1`

若已選數量不足 `k-1`，直接加入已選集合並更新總和；這是初期建立視窗最小集合的階段。

```typescript
function minimumCost(nums: number[], k: number, dist: number): number {
  // Step 11：初始化與將輸入轉為 TypedArray

  for (let rightIndex = 1; rightIndex < length; rightIndex++) {
    // Step 12：主迴圈骨架 — 計算視窗左端

    // Step 13：視窗左端右移 — 離開元素補位

    const currentValue = values[rightIndex];

    if (selectedCount < requiredSelectedCount) {
      // 將已選集合填滿到 (k - 1)
      selectedMaxHeap.push(currentValue, rightIndex);
      isSelected[rightIndex] = 1;
      selectedCount += 1;
      currentSelectedSum += currentValue;
    } else {
      // ...
    }

    // ...
  }

  // ...
}
```

### Step 15：已選集合已滿 — 以最大堆堆頂維持「最小 k-1 個」

當已選集合已滿：

* 先延遲清理最大堆中失效元素（`isSelected` 已為 0）
* 若新值比已選集合中的最大值更小，則交換以保持已選集合為最小 `k-1` 個
* 否則放入未選最小堆

```typescript
function minimumCost(nums: number[], k: number, dist: number): number {
  // Step 11：初始化與將輸入轉為 TypedArray

  for (let rightIndex = 1; rightIndex < length; rightIndex++) {
    // Step 12：主迴圈骨架 — 計算視窗左端

    // Step 13：視窗左端右移 — 離開元素補位

    // Step 14：右端新元素加入（填滿已選集合）

    const currentValue = values[rightIndex];

    if (selectedCount < requiredSelectedCount) {
      // ...
    } else {
      // 確保最大堆堆頂有效（延遲清理）
      while (!selectedMaxHeap.isEmpty()) {
        const topIndex = selectedMaxHeap.peekIndex();
        if (isSelected[topIndex] === 0) {
          selectedMaxHeap.popToFields();
        } else {
          break;
        }
      }

      if (!selectedMaxHeap.isEmpty() && currentValue < selectedMaxHeap.peekValue()) {
        // 交換掉已選集合中最大的值，以維持 (k - 1) 個最小值
        selectedMaxHeap.popToFields();
        const removedValue = selectedMaxHeap.poppedValue;
        const removedIndex = selectedMaxHeap.poppedIndex;

        isSelected[removedIndex] = 0;
        selectedCount -= 1;

        unselectedMinHeap.push(removedValue, removedIndex);

        selectedMaxHeap.push(currentValue, rightIndex);
        isSelected[rightIndex] = 1;
        selectedCount += 1;

        // 以差值更新總和，避免重算
        currentSelectedSum += currentValue - removedValue;
      } else {
        unselectedMinHeap.push(currentValue, rightIndex);
      }
    }

    // ...
  }

  // ...
}
```

### Step 16：視窗成形後更新最佳答案，並回傳最終最小成本

當 `leftIndex >= 0` 代表已形成合法視窗（可容納 `k-1` 個起點候選），用當前已選總和更新最佳值；迴圈結束後回傳 `values[0] + bestWindowSum`。

```typescript
function minimumCost(nums: number[], k: number, dist: number): number {
  // Step 11：初始化與將輸入轉為 TypedArray

  for (let rightIndex = 1; rightIndex < length; rightIndex++) {
    // Step 12：主迴圈骨架 — 計算視窗左端

    // Step 13：視窗左端右移 — 離開元素補位

    // Step 14：右端新元素加入（填滿已選集合）

    // Step 15：已選集合已滿 — 維持最小 (k - 1) 個

    if (leftIndex >= 0) {
      if (currentSelectedSum < bestWindowSum) {
        bestWindowSum = currentSelectedSum;
      }
    }
  }

  return values[0] + bestWindowSum;
}
```

## 時間複雜度

- 建立 `values` 的複製迴圈：走訪 `n` 次，時間為 $O(n)$。
- 主迴圈 `rightIndex = 1..n-1`：共 $n-1$ 次迭代，屬於 $O(n)$ 次外層迭代。
- 在主迴圈內的堆操作：
  - 每次迭代最多做常數次 `push`（最多 2 次）與 `popToFields`（最多常數次），每次堆操作成本為 $O(\log n)$（堆容量上界為 $n$）。
  - 延遲清理的 `while` 迴圈雖可能在單次迭代中多次 `popToFields`，但每個元素被彈出（清理）最多一次，因此全程彈出次數總和為 $O(n)$，對應總成本為 $O(n \log n)$。
- 綜合以上，主迴圈總成本為 $O(n \log n)$，再加上前處理 $O(n)$ 仍被主項涵蓋。
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- `values`、`isSelected`：各為長度 `n` 的 TypedArray，空間為 $O(n)$。
- `selectedMaxHeap`、`unselectedMinHeap`：各自內部包含兩個長度 `n` 的 `Int32Array`，合計仍為 $O(n)$。
- 其餘變數為常數空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
