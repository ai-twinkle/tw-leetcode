# 3691. Maximum Total Subarray Value II

You are given an integer array `nums` of length `n` and an integer `k`.

You must select exactly `k` distinct subarrays `nums[l..r]` of `nums`. 
Subarrays may overlap, but the exact same subarray (same `l` and `r`) cannot be chosen more than once.

The value of a subarray `nums[l..r]` is defined as: `max(nums[l..r]) - min(nums[l..r])`.

The total value is the sum of the values of all chosen subarrays.

Return the maximum possible total value you can achieve.

**Constraints:**

- `1 <= n == nums.length <= 5 * 10^4`
- `0 <= nums[i] <= 10^9`
- `1 <= k <= min(10^5, n * (n + 1) / 2)`

## 基礎思路

本題要求從整數陣列 `nums` 中選出恰好 `k` 個不同的子陣列，並讓所有被選子陣列「最大值與最小值差」的總和最大化。

在思考解法時，可掌握以下核心觀察：

- **整個陣列必為價值最大的子陣列**：
  整個陣列同時包含全域最大值與最小值，其差值不可能被任何子集超越，因此最優解中必然包含 `nums[0..n-1]`。

- **價值具有單調性**：
  若一個子陣列被另一個子陣列完全包含，前者的價值不會大於後者；因為向內縮減時最大值只會不變或減小、最小值只會不變或增大。

- **子陣列可組織為一棵生成樹**：
  從整個陣列出發，每次將左端點右移或右端點左移即可獲得鄰近子陣列；只要規定唯一展開規則，所有子陣列便能以樹狀結構被無重複地枚舉。

- **頻繁的區間 max/min 查詢需要 O(1) 加速**：
  若每次查詢都重新掃描區間，整體成本將難以接受，因此需預先建立 Sparse Table。

依據以上特性，可以採用以下策略：

- **以最大堆 (Max-Heap) 維護當前所有候選子陣列**，每次取出價值最大者並累加進答案。
- **從 `[0, n-1]` 作為堆的初始 root**，每次取出後生成最多兩個子節點推入堆中：
    - **一律生成 `[l+1, r]`**（左端點右移）；
    - **僅當 `l == 0` 時才生成 `[l, r-1]`**（右端點左移），藉此確保每個子陣列僅以唯一路徑被生成。
- **以 Sparse Table 支援 O(1) 區間 max - min 查詢**，使候選擴展的成本維持在常數內。

此策略能在最多 `k` 次迭代後完成正確且高效的累加。

## 解題步驟

### Step 1：初始化 Sparse Tables 並寫入 Level 0

為了支援 O(1) 的區間 max/min 查詢，預先建立 Sparse Tables。第 0 層代表長度為 1 的區間，直接將原始陣列的數值鏡射進兩張表中，作為後續層級合併的基底。

```typescript
/**
 * 預先建立支援區間最大值與最小值查詢的 Sparse Tables。
 * 建構成本為 O(n log n)；建立後每次查詢為 O(1)。
 *
 * @param nums - 原始整數陣列。
 * @param numberOfLevels - 需要建立的層級數（以 2 的次方為基底）。
 * @returns 最大值與最小值 Sparse Tables。
 */
function buildRangeTables(
  nums: number[],
  numberOfLevels: number,
): { maximumTable: Int32Array[]; minimumTable: Int32Array[] } {
  const length = nums.length;
  const maximumTable: Int32Array[] = new Array(numberOfLevels);
  const minimumTable: Int32Array[] = new Array(numberOfLevels);

  // 第 0 層直接鏡射原始陣列數值
  const baseMaximum = new Int32Array(length);
  const baseMinimum = new Int32Array(length);
  for (let index = 0; index < length; index++) {
    baseMaximum[index] = nums[index];
    baseMinimum[index] = nums[index];
  }
  maximumTable[0] = baseMaximum;
  minimumTable[0] = baseMinimum;

  // ...
}
```

### Step 2：自下而上合併建立其餘層級

每個更高層級的單格代表長度為 `2^level` 的區間，可由下一層相鄰兩個長度減半的子區間合併得到。對 max 取較大者、對 min 取較小者，即可逐層累積完整的 Sparse Tables。

```typescript
function buildRangeTables(
  nums: number[],
  numberOfLevels: number,
): { maximumTable: Int32Array[]; minimumTable: Int32Array[] } {
  // Step 1：初始化 Sparse Tables 並寫入 Level 0

  // 每個更高層級由下一層的兩個相鄰半區間合併而成
  for (let level = 1; level < numberOfLevels; level++) {
    const span = 1 << level;
    const halfSpan = 1 << (level - 1);
    const previousMaximum = maximumTable[level - 1];
    const previousMinimum = minimumTable[level - 1];
    const currentMaximum = new Int32Array(length);
    const currentMinimum = new Int32Array(length);
    const lastStart = length - span;
    for (let start = 0; start <= lastStart; start++) {
      const rightStart = start + halfSpan;
      const leftMaximum = previousMaximum[start];
      const rightMaximum = previousMaximum[rightStart];
      currentMaximum[start] = leftMaximum >= rightMaximum ? leftMaximum : rightMaximum;
      const leftMinimum = previousMinimum[start];
      const rightMinimum = previousMinimum[rightStart];
      currentMinimum[start] = leftMinimum <= rightMinimum ? leftMinimum : rightMinimum;
    }
    maximumTable[level] = currentMaximum;
    minimumTable[level] = currentMinimum;
  }

  return { maximumTable, minimumTable };
}
```

### Step 3：利用 Sparse Tables 進行 O(1) 區間 max - min 查詢

對任意區間 `[left, right]`，取其長度的 floor-log2 作為層級，並利用「左起一段」與「右起一段」兩個長度為 `2^level` 的重疊子區間覆蓋整個區間，再分別合併 max 與 min，即可得到該區間的最大值與最小值之差。

```typescript
/**
 * 利用預先建立的 Sparse Tables，在 O(1) 時間內計算 nums[left..right] 的 max - min。
 *
 * @param maximumTable - 區間最大值 Sparse Table。
 * @param minimumTable - 區間最小值 Sparse Table。
 * @param logTable - 用於決定查詢層級的 floor-log2 查表。
 * @param left - 子陣列左端點（包含）。
 * @param right - 子陣列右端點（包含）。
 * @returns 該區間最大值與最小值之差。
 */
function subarrayValue(
  maximumTable: Int32Array[],
  minimumTable: Int32Array[],
  logTable: Int32Array,
  left: number,
  right: number,
): number {
  const level = logTable[right - left + 1];
  const secondStart = right - (1 << level) + 1;
  const maximumLeft = maximumTable[level][left];
  const maximumRight = maximumTable[level][secondStart];
  const rangeMaximum = maximumLeft >= maximumRight ? maximumLeft : maximumRight;
  const minimumLeft = minimumTable[level][left];
  const minimumRight = minimumTable[level][secondStart];
  const rangeMinimum = minimumLeft <= minimumRight ? minimumLeft : minimumRight;
  return rangeMaximum - rangeMinimum;
}
```

### Step 4：主函數中預先建立 floor-log2 查表

進入主函數後，先為長度 `1..n` 預先計算 floor-log2，使後續 Sparse Table 查詢能以查表方式取得層級而非每次重新計算。同時根據最大可能長度推算所需層級數。

```typescript
/**
 * 從 nums 中選出 k 個不同子陣列，最大化 (max - min) 的總和。
 *
 * @param nums - 輸入整數陣列。
 * @param k - 必須選出的不同子陣列數量。
 * @returns 可達到的最大總和。
 */
function maxTotalValue(nums: number[], k: number): number {
  const arrayLength = nums.length;

  // 預先計算 floor-log2 以支援 O(1) 層級選擇
  const logTable = new Int32Array(arrayLength + 1);
  for (let value = 2; value <= arrayLength; value++) {
    logTable[value] = logTable[value >> 1] + 1;
  }
  const numberOfLevels = logTable[arrayLength] + 1;

  // ...
}
```

### Step 5：透過輔助函數建立 Sparse Tables

呼叫先前實作的 `buildRangeTables`，獲得後續主迴圈所需的兩張 Sparse Tables，使每次計算子陣列價值都僅需常數時間。

```typescript
function maxTotalValue(nums: number[], k: number): number {
  // Step 4：預先建立 floor-log2 查表

  // 建立支援 O(1) 子陣列價值查詢的區間表
  const { maximumTable, minimumTable } = buildRangeTables(nums, numberOfLevels);

  // ...
}
```

### Step 6：配置最大堆所需的扁平儲存空間

由於每次 pop 最多會 push 兩個子節點，加上初始 root 共需要至多 `2k + 1` 筆資料。為節省記憶體與避免物件開銷，使用三條扁平 `Int32Array` 分別儲存堆中的價值、左端點與右端點。

```typescript
function maxTotalValue(nums: number[], k: number): number {
  // Step 4：預先建立 floor-log2 查表

  // Step 5：透過輔助函數建立 Sparse Tables

  // 以子陣列價值為鍵的最大堆；容量上限涵蓋所有可能的 push
  const capacity = 2 * k + 2;
  const heapValue = new Int32Array(capacity);
  const heapLeft = new Int32Array(capacity);
  const heapRight = new Int32Array(capacity);
  let heapSize = 0;

  // ...
}
```

### Step 7：定義 pushSubarray：將子陣列推入最大堆並恢復堆性質

將新節點放到堆陣列末端後，沿著父節點路徑進行 sift-up：只要新節點的價值大於目前位置的父節點，就把父節點往下挪一格；最終再把新節點填入定位點。

```typescript
function maxTotalValue(nums: number[], k: number): number {
  // Step 4：預先建立 floor-log2 查表

  // Step 5：透過輔助函數建立 Sparse Tables

  // Step 6：配置最大堆所需的扁平儲存空間

  /**
   * 將子陣列推入最大堆，並維持堆性質。
   * @param value - 子陣列價值，做為堆鍵值。
   * @param left - 子陣列左端點（包含）。
   * @param right - 子陣列右端點（包含）。
   */
  const pushSubarray = (value: number, left: number, right: number): void => {
    let position = heapSize;
    heapSize++;
    // 當新節點比父節點優先級高時持續向上交換
    while (position > 0) {
      const parent = (position - 1) >> 1;
      if (heapValue[parent] >= value) {
        break;
      }
      heapValue[position] = heapValue[parent];
      heapLeft[position] = heapLeft[parent];
      heapRight[position] = heapRight[parent];
      position = parent;
    }
    heapValue[position] = value;
    heapLeft[position] = left;
    heapRight[position] = right;
  };

  // ...
}
```

### Step 8：定義 removeRoot：移除堆頂並恢復堆性質

把堆中最後一個節點搬到堆頂後執行 sift-down：在每一層中選擇較大的子節點，與當前位置比較；若子節點較大則上提，否則停止下沉並把暫存節點寫入定位點。

```typescript
function maxTotalValue(nums: number[], k: number): number {
  // Step 4：預先建立 floor-log2 查表

  // Step 5：透過輔助函數建立 Sparse Tables

  // Step 6：配置最大堆所需的扁平儲存空間

  // Step 7：定義 pushSubarray

  /**
   * 移除堆頂（最大值）並維持堆性質。
   */
  const removeRoot = (): void => {
    heapSize--;
    if (heapSize === 0) {
      return;
    }
    const value = heapValue[heapSize];
    const left = heapLeft[heapSize];
    const right = heapRight[heapSize];
    let position = 0;
    // 將被提升到堆頂的尾節點向下沉至較大的子節點
    while (true) {
      const leftChild = position * 2 + 1;
      if (leftChild >= heapSize) {
        break;
      }
      let candidate = leftChild;
      const rightChild = leftChild + 1;
      if (rightChild < heapSize && heapValue[rightChild] > heapValue[leftChild]) {
        candidate = rightChild;
      }
      if (heapValue[candidate] <= value) {
        break;
      }
      heapValue[position] = heapValue[candidate];
      heapLeft[position] = heapLeft[candidate];
      heapRight[position] = heapRight[candidate];
      position = candidate;
    }
    heapValue[position] = value;
    heapLeft[position] = left;
    heapRight[position] = right;
  };

  // ...
}
```

### Step 9：將整個陣列作為初始候選推入堆中

整個陣列 `[0, n-1]` 必為價值最大者，因此先計算其價值並推入堆作為枚舉起點。

```typescript
function maxTotalValue(nums: number[], k: number): number {
  // Step 4：預先建立 floor-log2 查表

  // Step 5：透過輔助函數建立 Sparse Tables

  // Step 6：配置最大堆所需的扁平儲存空間

  // Step 7：定義 pushSubarray

  // Step 8：定義 removeRoot

  // 以整個陣列作為初始候選，因其必為價值最大者
  const rootValue = subarrayValue(maximumTable, minimumTable, logTable, 0, arrayLength - 1);
  pushSubarray(rootValue, 0, arrayLength - 1);

  // ...
}
```

### Step 10：主迴圈逐次取出最大價值並擴展鄰近子陣列

每次從堆頂取出價值最大的子陣列累加進答案，並依照生成樹規則推入兩個子節點：左端點右移的子陣列一律推入；右端點左移的子陣列僅在左端點為 0 時推入，藉此確保每個子陣列僅被唯一路徑生成、避免重複入堆。

```typescript
function maxTotalValue(nums: number[], k: number): number {
  // Step 4：預先建立 floor-log2 查表

  // Step 5：透過輔助函數建立 Sparse Tables

  // Step 6：配置最大堆所需的扁平儲存空間

  // Step 7：定義 pushSubarray

  // Step 8：定義 removeRoot

  // Step 9：將整個陣列作為初始候選推入堆中

  let totalValue = 0;
  let chosenCount = 0;

  while (chosenCount < k && heapSize > 0) {
    // 取出目前剩餘候選中價值最大的子陣列
    const currentValue = heapValue[0];
    const currentLeft = heapLeft[0];
    const currentRight = heapRight[0];
    totalValue += currentValue;
    chosenCount++;
    removeRoot();

    // 子節點 A：將左端點右移（生成樹中每個節點都會由此邊產生）
    if (currentLeft < currentRight) {
      const childLeft = currentLeft + 1;
      const childValue = subarrayValue(maximumTable, minimumTable, logTable, childLeft, currentRight);
      pushSubarray(childValue, childLeft, currentRight);
    }

    // 子節點 B：僅當左端點為 0 時才將右端點左移，避免重複入堆
    if (currentLeft === 0 && currentRight > 0) {
      const childRight = currentRight - 1;
      const childValue = subarrayValue(maximumTable, minimumTable, logTable, 0, childRight);
      pushSubarray(childValue, 0, childRight);
    }
  }

  return totalValue;
}
```

## 時間複雜度

- 建立 Sparse Tables 需 $O(n \log n)$（$\log n$ 個層級，每層 $O(n)$）；
- 建立 floor-log2 查表為 $O(n)$；
- 每次區間 max - min 查詢為 $O(1)$；
- 主迴圈執行 $k$ 次，每次 push/pop 為 $O(\log k)$，共 $O(k \log k)$；
- 總時間複雜度為 $O(n \log n + k \log k)$。

> $O(n \log n + k \log k)$

## 空間複雜度

- Sparse Tables 需 $O(n \log n)$ 空間；
- floor-log2 查表需 $O(n)$ 空間；
- 最大堆儲存空間為 $O(k)$；
- 總空間複雜度為 $O(n \log n + k)$。

> $O(n \log n + k)$
