# 3321. Find X-Sum of All K-Long Subarrays II

You are given an array `nums` of `n` integers and two integers `k` and `x`.

The x-sum of an array is calculated by the following procedure:

- Count the occurrences of all elements in the array.
- Keep only the occurrences of the top `x` most frequent elements. If two elements have the same number of occurrences, the element with the bigger value is considered more frequent.
- Calculate the sum of the resulting array.

Note that if an array has less than `x` distinct elements, its x-sum is the sum of the array.

Return an integer array `answer` of length `n - k + 1` where `answer[i]` is the x-sum of the subarray `nums[i...i + k - 1]`.

**Constraints:**

- `nums.length == n`
- `1 <= n <= 10^5`
- `1 <= nums[i] <= 10^9`
- `1 <= x <= k <= nums.length`

## 基礎思路

本題要我們對陣列的每一個長度為 `k` 的滑動視窗，計算所謂的 **x-sum**：
先統計視窗中每個數值的出現次數，僅保留**出現次數最高的前 `x` 個不同數值**（若次數相同，**值較大者優先**），最後將「保留下來的數值乘上各自的次數」加總，作為該視窗的 x-sum。若視窗中的不同數值少於 `x`，則保留全部不同數值。

在思考解法時，我們需要注意：

- **排序準則是二鍵排序**：先以頻率高低排序、頻率相同時以**數值大小**排序（越大越前）。
- **每次只需要前 `x` 名**：無須完整排序所有不同值，維持兩個集合即可：

    1. 目前**被選中的前 `x` 名**，2) 其餘作為**候選**，並可在邊界交換。
- **滑動視窗動態維護**：每次滑動只加入一個值、移除一個值，應以 $O(\log k)$ 的代價更新資料結構，避免重算整個視窗。
- **加總需求**：x-sum 其實是「前 `x` 名的（值 × 次數）之和」，可隨元素晉升/降級時**即時更新**，避免重掃。

為了達成上述目標，我們可以採用以下策略：

- **雙堆維護前 `x`**：用一個結構維持「選中集合」（前 `x` 名，依**最弱者在頂端**便於被踢出），另一個結構維持「候選集合」（依**最強者在頂端**便於晉升）。
- **可更新堆**：每個不同值以「ID」代表，外部陣列保存頻率與數值，堆的比較器讀外部陣列，並支援就地 `update/remove`。
- **邊界交換（rebalance）**：當候選頂端比選中頂端更強（頻率更高或同頻率值更大）時，就**交換**兩者，同步調整加總；同時維持選中集合的大小不超過 `x`。
- **滑動更新**：對於新增/移除的值，更新其頻率並呼叫 `rebalance`；x-sum 可用一個**累加變數**即時維護。

## 解題步驟

### Step 1：成員狀態列舉 — 區分元素身分

使用列舉表示某個「不同值 ID」目前在何種集合：未在堆、在選中堆、或在候選堆。

```typescript
/**
 * 堆內成員狀態（儲存在 Int8Array）。
 */
const enum Membership {
  None = 0,        // 不在任何堆中
  Selected = 1,    // 在 selectedHeap（維護前 x 名）
  Candidate = 2,   // 在 candidateHeap（維護其餘元素）
}
```

### Step 2：可更新的整數 ID 堆 — 以外部陣列做比較鍵

此類別以整數 ID 表示元素，堆的優先順序由外部提供的比較器決定；支援 `push/pop/remove/update/top/size`，並使用 `positionById` 做 $O(1)$ 定位，讓 `update/remove` 成本為 $O(\log k)$。

```typescript
/**
 * 以整數 ID 表示元素且支援就地更新的堆。
 * 每個堆元素以整數 ID 表示。
 * 比較器從外部陣列（頻率與值）取得優先權。
 */
class IdHeap {
  private readonly heapStorage: Int32Array;   // 儲存元素的 ID
  private heapSize: number;                   // 目前堆內元素數量
  private readonly positionById: Int32Array;  // 映射 ID → 在 heapStorage 的索引（不在堆中為 -1）
  private readonly isHigherPriority: (aId: number, bId: number) => boolean; // 比較器

  /**
   * @param capacity 堆可容納的最大元素數
   * @param positionById 共享的位置陣列（由堆更新）
   * @param isHigherPriority 若 A 應該高於 B，回傳 true
   */
  constructor(
    capacity: number,
    positionById: Int32Array,
    isHigherPriority: (aId: number, bId: number) => boolean
  ) {
    this.heapStorage = new Int32Array(capacity);
    this.heapSize = 0;
    this.positionById = positionById;
    this.isHigherPriority = isHigherPriority;
  }

  /**
   * 取得堆的大小。
   * @returns 堆內元素數
   */
  size(): number {
    return this.heapSize;
  }

  /**
   * 取得頂端 ID（不移除）。
   * @returns 頂端 ID；若堆為空回傳 -1
   */
  top(): number {
    if (this.heapSize === 0) {
      return -1;
    }
    return this.heapStorage[0];
  }

  /**
   * 插入新的 ID。
   * @param id 要插入的元素 ID
   */
  push(id: number) {
    const index = this.heapSize;
    this.heapStorage[index] = id;
    this.positionById[id] = index;
    this.heapSize += 1;
    this.siftUp(index);
  }

  /**
   * 移除並回傳頂端 ID。
   * @returns 被移除的頂端 ID；若堆為空回傳 -1
   */
  pop(): number {
    if (this.heapSize === 0) {
      return -1;
    }

    const topId = this.heapStorage[0];
    const lastIndex = this.heapSize - 1;
    const lastId = this.heapStorage[lastIndex];
    this.heapSize = lastIndex;

    if (lastIndex > 0) {
      this.heapStorage[0] = lastId;
      this.positionById[lastId] = 0;
      this.siftDown(0);
    }

    this.positionById[topId] = -1;
    return topId;
  }

  /**
   * 若存在於堆中，移除指定 ID。
   * @param id 要移除的元素 ID
   */
  remove(id: number) {
    const index = this.positionById[id];
    if (index < 0) {
      return;
    }

    const lastIndex = this.heapSize - 1;
    const lastId = this.heapStorage[lastIndex];
    this.heapSize = lastIndex;
    this.positionById[id] = -1;

    if (index !== lastIndex) {
      this.heapStorage[index] = lastId;
      this.positionById[lastId] = index;
      this.siftUp(index);
      this.siftDown(index);
    }
  }

  /**
   * 當元素優先權改變時，更新其堆序。
   * @param id 優先權改變的元素 ID
   */
  update(id: number) {
    const index = this.positionById[id];
    if (index < 0) {
      return;
    }
    this.siftUp(index);
    this.siftDown(index);
  }

  /**
   * 往上調整，直到滿足堆序。
   * @param index 起始索引
   * @private
   */
  private siftUp(index: number) {
    let child = index;
    while (child > 0) {
      const parent = (child - 1) >> 1;
      const childId = this.heapStorage[child];
      const parentId = this.heapStorage[parent];

      if (!this.isHigherPriority(childId, parentId)) {
        break;
      }
      this.swap(child, parent);
      child = parent;
    }
  }

  /**
   * 往下調整，直到滿足堆序。
   * @param index 起始索引
   * @private
   */
  private siftDown(index: number) {
    let parent = index;
    const total = this.heapSize;

    while (true) {
      let best = parent;
      const leftChild = (parent << 1) + 1;
      const rightChild = leftChild + 1;

      if (leftChild < total) {
        const leftId = this.heapStorage[leftChild];
        const bestId = this.heapStorage[best];
        if (this.isHigherPriority(leftId, bestId)) {
          best = leftChild;
        }
      }

      if (rightChild < total) {
        const rightId = this.heapStorage[rightChild];
        const bestId = this.heapStorage[best];
        if (this.isHigherPriority(rightId, bestId)) {
          best = rightChild;
        }
      }

      if (best === parent) {
        break;
      }

      this.swap(parent, best);
      parent = best;
    }
  }

  /**
   * 交換兩個索引位置並更新其位置表。
   * @param i 第一個索引
   * @param j 第二個索引
   * @private
   */
  private swap(i: number, j: number) {
    const aId = this.heapStorage[i];
    const bId = this.heapStorage[j];
    this.heapStorage[i] = bId;
    this.heapStorage[j] = aId;
    this.positionById[aId] = j;
    this.positionById[bId] = i;
  }
}
```

### Step 3：主函式 `findXSum` — 雙堆 + 滑動視窗骨架

宣告各種狀態陣列（頻率、身分、在堆中的位置）、值↔ID 映射、回收 ID 堆疊，以及兩個堆的比較器（候選堆為**大根**，選中堆為**小根**），最後建立雙堆與一些累計狀態。

```typescript
/**
 * 以高效的 TypedArray 與雙堆計算每個視窗的 x-sum。
 * @param nums 輸入數列
 * @param k 視窗大小
 * @param x 依（頻率降序，值降序）選出的前 x 個不同值
 * @returns 每個視窗的 x-sum 陣列
 */
function findXSum(nums: number[], k: number, x: number): number[] {
  const totalNumbers = nums.length;
  if (totalNumbers === 0 || k === 0) {
    return [];
  }

  // 任一視窗內最多的不同值數量
  const capacity = k;

  // 用 TypedArray 儲存每個 ID 的狀態資訊
  const frequencyById = new Int32Array(capacity);       // 每個 ID 的出現次數
  const membershipById = new Int8Array(capacity);       // 目前成員身分（Selected/Candidate/None）
  const positionInSelected = new Int32Array(capacity);  // 在 selected 堆中的索引
  const positionInCandidate = new Int32Array(capacity); // 在 candidate 堆中的索引
  positionInSelected.fill(-1);
  positionInCandidate.fill(-1);

  // 實際數值 ↔ 緊湊 ID 的映射
  const idByValue = new Map<number, number>();          // 值 -> ID
  const valueById: number[] = new Array(capacity);      // ID -> 值

  // 回收可用的 ID
  const freeIds: number[] = new Array(capacity);
  for (let i = 0; i < capacity; i += 1) {
    freeIds[i] = capacity - 1 - i; // 預先填入，便於 pop()
  }

  // 候選堆的比較器（大根堆：頻率高、值大者優先）
  const candidateIsHigher = (aId: number, bId: number): boolean => {
    const freqA = frequencyById[aId];
    const freqB = frequencyById[bId];
    if (freqA !== freqB) {
      return freqA > freqB;
    }
    return valueById[aId] > valueById[bId];
  };

  // 選中堆的比較器（小根堆：頻率低、值小者優先）
  const selectedIsHigher = (aId: number, bId: number): boolean => {
    const freqA = frequencyById[aId];
    const freqB = frequencyById[bId];
    if (freqA !== freqB) {
      return freqA < freqB;
    }
    return valueById[aId] < valueById[bId];
  };

  // 建立兩個堆
  const candidateHeap = new IdHeap(capacity, positionInCandidate, candidateIsHigher);
  const selectedHeap = new IdHeap(capacity, positionInSelected, selectedIsHigher);

  // 滑動視窗相關狀態
  let distinctValueCount = 0;          // 當前視窗的不同值數量
  let selectedElementCount = 0;        // 選中堆中的不同值數量（最多 x）
  let currentSelectedWeightedSum = 0;  // 目前選中集合的 Σ(value * freq)

  // ...
}
```

### Step 4：輔助函式 `getOrCreateId` — 值到緊湊 ID 的取得/建立

將實際數值映射到緊湊 ID，若不存在則配置新 ID 並初始化狀態。

```typescript
function findXSum(nums: number[], k: number, x: number): number[] {
  // Step 3：主函式 `findXSum` — 雙堆 + 滑動視窗骨架
  
  /**
   * 取得值的既有 ID；若無則新建一個。
   * @param value 實際數值
   * @returns 該數值對應的緊湊 ID
   */
  function getOrCreateId(value: number): number {
    const existingId = idByValue.get(value);
    if (existingId !== undefined) {
      return existingId;
    }

    const id = freeIds.pop() as number;
    valueById[id] = value;
    frequencyById[id] = 0;
    membershipById[id] = Membership.None;
    idByValue.set(value, id);
    return id;
  }
  
  // ...
}
```

### Step 5：輔助函式 `addValue` — 視窗加入一個值

更新該值的頻率；若是新出現的不同值，先加入候選堆；若已在選中堆，更新加總與堆序；否則更新候選堆序。

```typescript
function findXSum(nums: number[], k: number, x: number): number[] {
  // Step 3：主函式 `findXSum` — 雙堆 + 滑動視窗骨架

  // Step 4：輔助函式 `getOrCreateId` — 值到緊湊 ID 的取得/建立

  /**
   * 將一個值加入當前視窗（頻率 +1，並調整所在堆）。
   * @param value 要加入的值
   */
  function addValue(value: number) {
    const id = getOrCreateId(value);
    const previousFrequency = frequencyById[id];
    frequencyById[id] = previousFrequency + 1;

    if (previousFrequency === 0) {
      // 新的不同值，先作為候選
      distinctValueCount += 1;
      membershipById[id] = Membership.Candidate;
      candidateHeap.push(id);
    } else {
      const currentMembership = membershipById[id];
      if (currentMembership === Membership.Selected) {
        // 若在選中集合，value * freq 的變化等於 +value（因為 freq +1）
        currentSelectedWeightedSum += valueById[id];
        selectedHeap.update(id);
      } else {
        candidateHeap.update(id);
      }
    }
  }

  // ...
}
```

### Step 6：輔助函式 `removeValue` — 視窗移除一個值

頻率 −1；若掉到 0，將其自對應堆移除並回收 ID；若仍大於 0，僅更新其所在堆序。若原本在選中堆，需先從加總扣除一份 `value`。

```typescript
function findXSum(nums: number[], k: number, x: number): number[] {
  // Step 3：主函式 `findXSum` — 雙堆 + 滑動視窗骨架

  // Step 4：輔助函式 `getOrCreateId` — 值到緊湊 ID 的取得/建立
  
  // Step 5：輔助函式 `addValue` — 視窗加入一個值
  
  /**
   * 從當前視窗移除一個值（頻率 -1，並調整所在堆）。
   * @param value 要移除的值
   */
  function removeValue(value: number) {
    const id = idByValue.get(value);
    if (id === undefined) {
      return;
    }

    const previousFrequency = frequencyById[id];
    if (previousFrequency === 0) {
      return;
    }

    const newFrequency = previousFrequency - 1;
    const currentMembership = membershipById[id];

    if (currentMembership === Membership.Selected) {
      // 從選中集合移除一個實例，Σ(value*freq) 會 -value
      currentSelectedWeightedSum -= valueById[id];
    }

    if (newFrequency === 0) {
      // 完全離開視窗：從堆與映射中清除，回收 ID
      frequencyById[id] = 0;

      if (currentMembership === Membership.Selected) {
        selectedHeap.remove(id);
        selectedElementCount -= 1;
      } else if (currentMembership === Membership.Candidate) {
        candidateHeap.remove(id);
      }

      membershipById[id] = Membership.None;
      distinctValueCount -= 1;

      idByValue.delete(value);
      freeIds.push(id);
    } else {
      // 仍有出現次數：更新頻率並調整所在堆序
      frequencyById[id] = newFrequency;

      if (currentMembership === Membership.Selected) {
        selectedHeap.update(id);
      } else {
        candidateHeap.update(id);
      }
    }
  }

  // ...
}
```

### Step 7：輔助函式 `rebalance` — 維持「前 x」的不變式與邊界交換

確保選中集合大小為 `min(x, 當前不同值數)`；若不足，從候選提拔；若超過，從選中剔除最弱。之後檢查候選頂端是否比選中頂端更強，若是就**交換**，並同步調整加總。

```typescript
function findXSum(nums: number[], k: number, x: number): number[] {
  // Step 3：主函式 `findXSum` — 雙堆 + 滑動視窗骨架

  // Step 4：輔助函式 `getOrCreateId` — 值到緊湊 ID 的取得/建立

  // Step 5：輔助函式 `addValue` — 視窗加入一個值

  // Step 6：輔助函式 `removeValue` — 視窗移除一個值

  /**
   * 維持雙堆的不變式：選中集合維持前 x 強，並與候選堆保持邊界正確。
   * 需要時會在兩堆間進行提拔/降級與邊界交換。
   */
  function rebalance() {
    const targetSelectedCount = Math.min(x, distinctValueCount);

    // 若選中集合不足，從候選堆提拔最強者
    while (selectedElementCount < targetSelectedCount) {
      const candidateTopId = candidateHeap.top();
      if (candidateTopId < 0) {
        break;
      }
      candidateHeap.pop();

      membershipById[candidateTopId] = Membership.Selected;
      selectedHeap.push(candidateTopId);
      selectedElementCount += 1;

      currentSelectedWeightedSum += valueById[candidateTopId] * frequencyById[candidateTopId];
    }

    // 若選中集合過多，踢出最弱者到候選堆
    while (selectedElementCount > targetSelectedCount) {
      const selectedTopId = selectedHeap.top();
      if (selectedTopId < 0) {
        break;
      }
      selectedHeap.pop();

      membershipById[selectedTopId] = Membership.Candidate;
      candidateHeap.push(selectedTopId);
      selectedElementCount -= 1;

      currentSelectedWeightedSum -= valueById[selectedTopId] * frequencyById[selectedTopId];
    }

    // 邊界交換：若候選頂端比選中頂端更強（頻率高或同頻率值更大），則交換
    while (candidateHeap.size() > 0 && selectedHeap.size() > 0) {
      const candidateTopId = candidateHeap.top();
      const selectedTopId = selectedHeap.top();
      if (candidateTopId < 0 || selectedTopId < 0) {
        break;
      }

      const candidateFreq = frequencyById[candidateTopId];
      const selectedFreq = frequencyById[selectedTopId];
      const candidateVal = valueById[candidateTopId];
      const selectedVal = valueById[selectedTopId];

      // 候選更強則交換
      if (candidateFreq > selectedFreq || (candidateFreq === selectedFreq && candidateVal > selectedVal)) {
        candidateHeap.pop();
        selectedHeap.pop();

        membershipById[candidateTopId] = Membership.Selected;
        selectedHeap.push(candidateTopId);

        membershipById[selectedTopId] = Membership.Candidate;
        candidateHeap.push(selectedTopId);

        // 交換對加總的影響：+候選(value*freq) -選中(value*freq)
        currentSelectedWeightedSum += candidateVal * candidateFreq;
        currentSelectedWeightedSum -= selectedVal * selectedFreq;
      } else {
        break;
      }
    }
  }

  // ...
}
```

### Step 8：初始化第一個視窗並計算首個答案

將前 `k` 個元素加入、`rebalance()` 後，x-sum 即為 `currentSelectedWeightedSum`。

```typescript
function findXSum(nums: number[], k: number, x: number): number[] {
  // Step 3：主函式 `findXSum` — 雙堆 + 滑動視窗骨架

  // Step 4：輔助函式 `getOrCreateId` — 值到緊湊 ID 的取得/建立

  // Step 5：輔助函式 `addValue` — 視窗加入一個值

  // Step 6：輔助函式 `removeValue` — 視窗移除一個值

  // Step 7：輔助函式 `rebalance` — 維持「前 x」的不變式與邊界交換

  // 初始化第一個視窗
  for (let index = 0; index < k; index += 1) {
    addValue(nums[index]);
  }
  rebalance();

  // 準備輸出陣列，填入第一個視窗答案
  const resultLength = totalNumbers - k + 1;
  const resultArray: number[] = new Array(resultLength);
  resultArray[0] = currentSelectedWeightedSum;

  // ...
}
```

### Step 9：滑動視窗並逐一填答

每次移除左端、加入右端，呼叫 `rebalance()`，將新的加總寫入答案陣列。

```typescript
function findXSum(nums: number[], k: number, x: number): number[] {
  // Step 3：主函式 `findXSum` — 雙堆 + 滑動視窗骨架

  // Step 4：輔助函式 `getOrCreateId` — 值到緊湊 ID 的取得/建立

  // Step 5：輔助函式 `addValue` — 視窗加入一個值

  // Step 6：輔助函式 `removeValue` — 視窗移除一個值

  // Step 7：輔助函式 `rebalance` — 維持「前 x」的不變式與邊界交換
  
  // Step 8：初始化第一個視窗並計算首個答案
  
  // 逐步滑動視窗，維持雙堆不變式並填入答案
  for (let left = 0, right = k; right < totalNumbers; left += 1, right += 1) {
    removeValue(nums[left]);   // 移除滑出元素
    addValue(nums[right]);     // 加入滑入元素
    rebalance();               // 恢復不變式
    resultArray[left + 1] = currentSelectedWeightedSum;
  }

  return resultArray;
}
```

## 時間複雜度

- 單次滑動（移除一個、加入一個、`rebalance`）涉及有限次堆操作，每次為 $O(\log k)$。
- 總共滑動約 $n$ 次（含初始化 $k$ 次插入）。
- 總時間複雜度為 $O(n \log k)$。

> $O(n \log k)$

## 空間複雜度

- 兩個堆、頻率/身分/位置等狀態，以及值↔ID 映射，僅與**視窗內最多不同值數量**成正比，上界為 $k$。
- 額外使用的緊湊陣列與暫存變數同階。
- 總空間複雜度為 $O(k)$。

> $O(k)$
