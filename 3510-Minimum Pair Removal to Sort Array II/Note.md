# 3510. Minimum Pair Removal to Sort Array II

Given an array `nums`, you can perform the following operation any number of times:

Select the adjacent pair with the minimum sum in `nums`. 
If multiple such pairs exist, choose the leftmost one.
Replace the pair with their sum.
Return the minimum number of operations needed to make the array non-decreasing.

An array is said to be non-decreasing if each element is greater than or equal to its previous element (if it exists).

**Constraints:**

- `1 <= nums.length <= 10^5`
- `-10^9 <= nums[i] <= 10^9`

## 基礎思路

本題每次操作都必須選擇「相鄰且和最小」的那一對（若有多對並列，取最左邊），並把這一對合併成一個數；重複操作直到整個陣列變成非遞減，要求最少操作次數。

在思考解法時，需要掌握幾個核心重點：

* **操作規則是強制的**：每一步都只能合併「最小相鄰和」的最左對，因此整個過程不是任意策略，而是需要高效模擬這個既定規則。
* **合併只會影響局部相鄰關係**：一次合併只會改變合併位置附近的相鄰對，遠處的相鄰對不受影響，因此不應每次重算所有相鄰和。
* **判斷是否已非遞減可用局部違反數量**：只要能追蹤「相鄰逆序（前一個大於後一個）」的數量，當逆序數量歸零就代表陣列已非遞減。
* **需要支援兩種效率操作**：

    1. 快速找出目前最小相鄰和且最左的那一對；
    2. 快速刪除被合併掉的元素並更新鄰接關係。

因此整體策略是：用能快速取得最小相鄰和的結構，搭配能快速維護相鄰關係的結構，並且只更新合併點附近的資訊；同時用一個可維護的指標來判定是否已達成非遞減，以避免反覆全陣列檢查。

## 解題步驟

### Step 1：處理長度過小的邊界情況

長度 0 或 1 的陣列一定已經是非遞減，因此直接回傳 0。

```typescript
const length = nums.length;
if (length <= 1) {
  return 0;
}
```

### Step 2：將輸入複製到 TypedArray

把資料放入連續記憶體的數值陣列中，便於後續大量數值運算與更新。

```typescript
// 將數值存入 TypedArray 以加速數值存取
const values = new Float64Array(length);
for (let index = 0; index < length; index++) {
  values[index] = nums[index];
}
```

### Step 3：建立雙向鏈結結構與版本控制

用索引模擬雙向鏈結，支援 O(1) 移除；並用版本號讓舊的候選相鄰對失效。

```typescript
// 以索引建立雙向鏈結串列，支援 O(1) 刪除
const previousIndex = new Int32Array(length);
const nextIndex = new Int32Array(length);
const alive = new Uint8Array(length);

// 每個節點的版本號，用來讓過期的 heap 項目失效
const nodeVersion = new Uint32Array(length);

for (let index = 0; index < length; index++) {
  previousIndex[index] = index - 1;
  nextIndex[index] = index + 1;
  alive[index] = 1;
}
nextIndex[length - 1] = -1;
```

### Step 4：計算初始逆序數並做零操作提前返回

先統計相鄰逆序的數量，若一開始就是非遞減則直接回傳 0。

```typescript
// 初始相鄰逆序數量
let inversionCount = 0;
for (let index = 0; index < length - 1; index++) {
  if (values[index] > values[index + 1]) {
    inversionCount++;
  }
}
if (inversionCount === 0) {
  return 0;
}
```

### Step 5：建立最小堆所需的儲存結構

用多個 TypedArray 平行存放堆節點資訊（左右端點、相鄰和、版本），並初始化 heapSize。

```typescript
// 最小堆儲存相鄰對
const capacity = length * 3 + 8;
const heapLeft = new Int32Array(capacity);
const heapRight = new Int32Array(capacity);
const heapSum = new Float64Array(capacity);
const heapLeftVersion = new Uint32Array(capacity);
const heapRightVersion = new Uint32Array(capacity);
let heapSize = 0;
```

### Step 6：輔助函式 `isLess` — 定義堆的比較規則

排序規則為：相鄰和較小優先；若相同則 left 較小者（更左）優先。

```typescript
/**
 * 堆排序規則：先比 sum 較小者優先；若同 sum，則 left 較小者優先
 * @param leftA 第一組相鄰對的左端點
 * @param sumA 第一組相鄰對的和
 * @param leftB 第二組相鄰對的左端點
 * @param sumB 第二組相鄰對的和
 * @returns 若第一組比第二組更小則回傳 true
 */
function isLess(leftA: number, sumA: number, leftB: number, sumB: number): boolean {
  if (sumA < sumB) {
    return true;
  }
  if (sumA > sumB) {
    return false;
  }
  return leftA < leftB;
}
```

### Step 7：輔助函式 `siftUp` — 堆插入後向上調整

插入新節點後，將其往上移動直到符合最小堆順序。

```typescript
/**
 * 將 startIndex 的元素向上移動直到堆序恢復
 * @param startIndex 起始索引
 */
function siftUp(startIndex: number): void {
  let holeIndex = startIndex;

  const movingLeft = heapLeft[holeIndex];
  const movingRight = heapRight[holeIndex];
  const movingSum = heapSum[holeIndex];
  const movingLeftVersion = heapLeftVersion[holeIndex];
  const movingRightVersion = heapRightVersion[holeIndex];

  // 不斷向上直到父節點更小或抵達根節點
  while (holeIndex > 0) {
    const parentIndex = (holeIndex - 1) >>> 1;

    if (!isLess(movingLeft, movingSum, heapLeft[parentIndex], heapSum[parentIndex])) {
      break;
    }

    // 將父節點下移填補洞
    heapLeft[holeIndex] = heapLeft[parentIndex];
    heapRight[holeIndex] = heapRight[parentIndex];
    heapSum[holeIndex] = heapSum[parentIndex];
    heapLeftVersion[holeIndex] = heapLeftVersion[parentIndex];
    heapRightVersion[holeIndex] = heapRightVersion[parentIndex];

    holeIndex = parentIndex;
  }

  // 將移動元素放到最終位置
  heapLeft[holeIndex] = movingLeft;
  heapRight[holeIndex] = movingRight;
  heapSum[holeIndex] = movingSum;
  heapLeftVersion[holeIndex] = movingLeftVersion;
  heapRightVersion[holeIndex] = movingRightVersion;
}
```

### Step 8：輔助函式 `siftDownFrom` — 堆刪除根後向下調整

將根節點用最後一個元素覆蓋後，向下調整回復最小堆順序。

```typescript
/**
 * 將 startIndex 的元素向下移動直到堆序恢復
 * @param startIndex 起始索引
 */
function siftDownFrom(startIndex: number): void {
  let holeIndex = startIndex;

  const movingLeft = heapLeft[holeIndex];
  const movingRight = heapRight[holeIndex];
  const movingSum = heapSum[holeIndex];
  const movingLeftVersion = heapLeftVersion[holeIndex];
  const movingRightVersion = heapRightVersion[holeIndex];

  while (true) {
    // 計算二元堆左子節點索引
    const leftChildIndex = holeIndex * 2 + 1;

    // 無子節點表示堆序已滿足
    if (leftChildIndex >= heapSize) {
      break;
    }

    // 在子節點中選出較小者
    let bestChildIndex = leftChildIndex;
    const rightChildIndex = leftChildIndex + 1;

    if (rightChildIndex < heapSize) {
      if (
        isLess(
          heapLeft[rightChildIndex],
          heapSum[rightChildIndex],
          heapLeft[leftChildIndex],
          heapSum[leftChildIndex]
        )
      ) {
        bestChildIndex = rightChildIndex;
      }
    }

    // 若移動元素已比子節點更小，停止
    if (
      !isLess(
        heapLeft[bestChildIndex],
        heapSum[bestChildIndex],
        movingLeft,
        movingSum
      )
    ) {
      break;
    }

    // 將較小子節點上移填補洞
    heapLeft[holeIndex] = heapLeft[bestChildIndex];
    heapRight[holeIndex] = heapRight[bestChildIndex];
    heapSum[holeIndex] = heapSum[bestChildIndex];
    heapLeftVersion[holeIndex] = heapLeftVersion[bestChildIndex];
    heapRightVersion[holeIndex] = heapRightVersion[bestChildIndex];

    holeIndex = bestChildIndex;
  }

  // 將移動元素放到最終位置
  heapLeft[holeIndex] = movingLeft;
  heapRight[holeIndex] = movingRight;
  heapSum[holeIndex] = movingSum;
  heapLeftVersion[holeIndex] = movingLeftVersion;
  heapRightVersion[holeIndex] = movingRightVersion;
}
```

### Step 9：輔助函式 `pushPair` — 將相鄰對加入堆

插入相鄰對並記錄左右端點版本號，避免未來的過期候選被誤用。

```typescript
/**
 * 將新的相鄰對插入堆
 * @param left 相鄰對左端點索引
 * @param right 相鄰對右端點索引
 */
function pushPair(left: number, right: number): void {
  const insertIndex = heapSize++;
  heapLeft[insertIndex] = left;
  heapRight[insertIndex] = right;
  heapSum[insertIndex] = values[left] + values[right];
  heapLeftVersion[insertIndex] = nodeVersion[left];
  heapRightVersion[insertIndex] = nodeVersion[right];
  siftUp(insertIndex);
}
```

### Step 10：輔助函式 `popRootDiscard` — 丟棄堆頂

將堆頂移除，並將最後元素移到根後向下調整。

```typescript
/**
 * 移除堆頂元素
 */
function popRootDiscard(): void {
  heapSize--;
  if (heapSize <= 0) {
    return;
  }
  heapLeft[0] = heapLeft[heapSize];
  heapRight[0] = heapRight[heapSize];
  heapSum[0] = heapSum[heapSize];
  heapLeftVersion[0] = heapLeftVersion[heapSize];
  heapRightVersion[0] = heapRightVersion[heapSize];
  siftDownFrom(0);
}
```

### Step 11：將所有初始相鄰對加入堆

一開始把每個 `(i, i+1)` 的相鄰對都放入堆中。

```typescript
// 初始將所有相鄰對加入堆
for (let index = 0; index < length - 1; index++) {
  pushPair(index, index + 1);
}
```

### Step 12：初始化操作計數與存活節點數

```typescript
let operations = 0;
let aliveCount = length;
```

### Step 13：主迴圈 — 持續合併直到沒有逆序或只剩一個元素

只要仍有逆序且仍可合併，就持續進行「取最小相鄰和且最左」的合併操作。

```typescript
while (inversionCount > 0 && aliveCount > 1) {
  let left = -1;
  let right = -1;

  // ...
}
```

### Step 14：在主迴圈中丟棄過期堆節點，直到取到有效的相鄰對

必須確保堆頂候選確實仍為當前相鄰、兩端都存活、且版本號一致。

```typescript
while (inversionCount > 0 && aliveCount > 1) {
  // Step 13：主迴圈骨架

  // 丟棄堆頂直到找到符合當前相鄰與版本的有效候選
  while (true) {
    const candidateLeft = heapLeft[0];
    const candidateRight = heapRight[0];

    const valid =
      alive[candidateLeft] === 1 &&
      alive[candidateRight] === 1 &&
      nextIndex[candidateLeft] === candidateRight &&
      nodeVersion[candidateLeft] === heapLeftVersion[0] &&
      nodeVersion[candidateRight] === heapRightVersion[0];

    if (valid) {
      left = candidateLeft;
      right = candidateRight;
      popRootDiscard();
      break;
    }

    popRootDiscard();
  }

  // ...
}
```

### Step 15：在主迴圈中更新合併前會消失的逆序貢獻

合併會移除三條可能的相鄰邊（左邊界、合併對本身、右邊界），因此先把它們對逆序的貢獻移除。

```typescript
while (inversionCount > 0 && aliveCount > 1) {
  // Step 13：主迴圈骨架

  // Step 14：取得有效相鄰對 (left, right)

  const leftPrev = previousIndex[left];
  const rightNext = nextIndex[right];

  // 移除即將消失的逆序貢獻
  if (leftPrev !== -1 && values[leftPrev] > values[left]) {
    inversionCount--;
  }
  if (values[left] > values[right]) {
    inversionCount--;
  }
  if (rightNext !== -1 && values[right] > values[rightNext]) {
    inversionCount--;
  }

  // ...
}
```

### Step 16：在主迴圈中執行合併並更新鏈結與版本

把 `right` 合併進 `left`，將 `right` 標記為死亡並從鏈結中移除，並更新 `left` 的版本以使舊 heap 項目失效。

```typescript
while (inversionCount > 0 && aliveCount > 1) {
  // Step 13：主迴圈骨架

  // Step 14：取得有效相鄰對 (left, right)

  // Step 15：移除舊邊的逆序貢獻

  // 合併：把 right 合併到 left，並將 right 從鏈結中移除
  values[left] += values[right];
  nodeVersion[left]++;
  alive[right] = 0;
  aliveCount--;

  nextIndex[left] = rightNext;
  if (rightNext !== -1) {
    previousIndex[rightNext] = left;
  }

  // ...
}
```

### Step 17：在主迴圈中加入新形成邊的逆序貢獻，並只更新受影響的相鄰對

合併後只會產生最多兩條新相鄰邊，因此只需更新這些邊，並把對應相鄰對推入堆中。

```typescript
while (inversionCount > 0 && aliveCount > 1) {
  // Step 13：主迴圈骨架

  // Step 14：取得有效相鄰對 (left, right)

  // Step 15：移除舊邊的逆序貢獻

  // Step 16：合併並更新鏈結與版本

  // 加入新形成邊的逆序貢獻
  if (leftPrev !== -1 && values[leftPrev] > values[left]) {
    inversionCount++;
  }
  if (rightNext !== -1 && values[left] > values[rightNext]) {
    inversionCount++;
  }

  // 合併後只有鄰近相鄰對可能改變，將其推入堆
  if (leftPrev !== -1) {
    pushPair(leftPrev, left);
  }
  if (rightNext !== -1) {
    pushPair(left, rightNext);
  }

  operations++;
}
```

### Step 18：回傳操作次數

當逆序數歸零或剩下不足以合併時，回傳累積操作次數。

```typescript
return operations;
```

## 時間複雜度

- 初始化資料與雙向鏈結、計算初始逆序數、建立初始相鄰對堆，皆為 $O(n)$；
- 每次合併會讓存活元素數量減少 1，因此合併次數最多為 $n - 1$；
- 初始入堆相鄰對為 $n - 1$，每次合併最多再入堆 2 個相鄰對，因此總入堆次數最多為 $(n - 1) + 2(n - 1) = 3n - 3$；
- 每個入堆 `pushPair` 會進行一次 `siftUp`，成本為 $O(\log n)$；
- 每個堆元素最多被彈出一次（有效或過期都會被 `popRootDiscard` 丟棄），因此總彈出次數不超過總入堆次數 $3n - 3$；
- 每次彈出 `popRootDiscard` 會進行一次 `siftDownFrom`，成本為 $O(\log n)$。
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- `values / previousIndex / nextIndex / alive / nodeVersion` 皆為長度 $n$ 的陣列，合計 $O(n)$；
- 最小堆以容量 `length * 3 + 8` 配置，為 $O(n)$；
- 其餘變數為常數級。
- 總空間複雜度為 $O(n)$。

> $O(n)$
