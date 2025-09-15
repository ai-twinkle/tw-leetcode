# 1865. Finding Pairs With a Certain Sum

You are given two integer arrays `nums1` and `nums2`. 
You are tasked to implement a data structure that supports queries of two types:

1. Add a positive integer to an element of a given index in the array `nums2`.
2. Count the number of pairs `(i, j)` such that `nums1[i] + nums2[j]` equals a given value `(0 <= i < nums1.length and 0 <= j < nums2.length)`.

Implement the FindSumPairs class:

- `FindSumPairs(int[] nums1, int[] nums2)` Initializes the `FindSumPairs` object with two integer arrays `nums1` and `nums2`.
- `void add(int index, int val)` Adds `val` to `nums2[index]`, i.e., apply `nums2[index] += val`.
- `int count(int tot)` Returns the number of pairs `(i, j)` such that `nums1[i] + nums2[j] == tot`.

**Constraints:**

- `1 <= nums1.length <= 1000`
- `1 <= nums2.length <= 10^5`
- `1 <= nums1[i] <= 10^9`
- `1 <= nums2[i] <= 10^5`
- `0 <= index < nums2.length`
- `1 <= val <= 10^5`
- `1 <= tot <= 10^9`
- At most `1000` calls are made to `add` and `count` each.

## 基礎思路

本題的核心目標是設計一個高效能支援兩種不同操作的資料結構：

- **修改操作 (`add`)**：能快速地更新陣列 `nums2` 中某一個特定索引位置的數值。
- **查詢操作 (`count`)**：能快速地計算出來自兩個陣列 `nums1` 和 `nums2` 中元素配對相加後，恰好等於給定值的組合數量。

由於操作次數頻繁且陣列長度不小，因此若每次查詢皆暴力搜尋所有組合將會超時。
因此解決此題之前須考量以下幾點：

- 透過排序較短的陣列 (`nums1`) 來縮短查詢時的搜尋範圍。
- 透過建立較長陣列 (`nums2`) 的頻率表，使每次查詢操作可以 $O(1)$ 時間內得知對應配對元素是否存在及其出現次數。
- 針對修改操作，在維護原陣列更新的同時，同步調整頻率表，確保後續查詢操作維持高效率。

如此設計能有效兼顧修改與查詢操作的效率，滿足題目條件要求。

## 解題步驟

### Step 1：定義內部資料結構（成員變數用途）

- `sortedNumbers1`：將 `nums1` 排序後存放於此陣列，後續的查詢可以根據排序提前跳出搜尋。
- `numbers2Array`：直接儲存並維護原始 `nums2` 陣列，方便每次修改操作快速更新。
- `frequencyTableNumbers2`：使用雜湊表紀錄陣列 `nums2` 中各個數值的出現次數，快速處理查詢操作。


```typescript
class FindSumPairs {
  private readonly sortedNumbers1: number[];
  private readonly numbers2Array: number[];
  private readonly frequencyTableNumbers2: Record<number, number>;

  // ...
}
```
### Step 2：初始化建構子（constructor）

- 對 `nums1` 做排序後保存至 `sortedNumbers1`。
- 直接保留 `nums2` 的參考，以利即時修改。
- 建立數值出現頻率表，之後查詢時可快速取得數值對應的數量。

```typescript
class FindSumPairs {
  // Step 1：定義內部資料結構（成員變數用途）
  
  constructor(nums1: number[], nums2: number[]) {
    // 對 nums1 排序，提升查詢時效性
    this.sortedNumbers1 = nums1.slice().sort((a, b) => a - b);

    // 直接參考 nums2，便於快速修改
    this.numbers2Array = nums2;

    // 建立 nums2 的頻率表，統計每個值出現的次數
    this.frequencyTableNumbers2 = {};
    for (let i = 0, n = nums2.length; i < n; i++) {
      const value = nums2[i];
      this.frequencyTableNumbers2[value] = (this.frequencyTableNumbers2[value] || 0) + 1;
    }
  }

  // ...
}
```

### Step 3：修改操作 (`add` 方法)

- 快速地更新原始陣列中對應索引的值。
- 同時更新頻率表，確保與陣列同步。

```typescript
class FindSumPairs {
  // Step 1：定義內部資料結構（成員變數用途）
  
  // Step 2：初始化建構子（constructor）
  
  add(index: number, val: number): void {
    const previousValue = this.numbers2Array[index];
    const newValue = previousValue + val;
    this.numbers2Array[index] = newValue;

    // 更新頻率表，舊值數量減少
    const previousCount = this.frequencyTableNumbers2[previousValue];
    if (previousCount > 1) {
      this.frequencyTableNumbers2[previousValue] = previousCount - 1;
    } else {
      delete this.frequencyTableNumbers2[previousValue];
    }

    // 更新頻率表，新值數量增加
    this.frequencyTableNumbers2[newValue] = (this.frequencyTableNumbers2[newValue] || 0) + 1;
  }

  // ...
}
```

### Step 4：查詢操作 (`count` 方法)

- 透過排序後的 `nums1`，在超過目標總和時提前跳出，縮短搜尋範圍。
- 利用頻率表，快速得知 `tot - nums1[i]` 在 `nums2` 出現次數，計入結果。

```typescript
class FindSumPairs {
  // Step 1：定義內部資料結構（成員變數用途）

  // Step 2：初始化建構子（constructor）
  
  // Step 3：修改操作（add 方法）
  
  count(tot: number): number {
    let result = 0;
    const frequencyTable = this.frequencyTableNumbers2;
    const sortedNumbers1 = this.sortedNumbers1;

    // 遍歷排序後的 nums1，若當前值已超過目標則提前終止
    for (let i = 0, length = sortedNumbers1.length; i < length; i++) {
      const value1 = sortedNumbers1[i];
      if (value1 > tot) {
        break;
      }
      result += frequencyTable[tot - value1] || 0;
    }
    return result;
  }
}
```

## 時間複雜度

- **初始化階段**：
    - 排序陣列 `nums1` 的成本為 $O(n_1 \log n_1)$。
    - 建立頻率表的成本為 $O(n_2)$。
- **修改操作 (`add`)**：
    - 每次修改陣列和更新頻率表均為常數時間 $O(1)$。
- **查詢操作 (`count`)**：
    - 每次最多遍歷整個 `nums1` 陣列，花費 $O(n_1)$ 時間。
- 總時間複雜度為 $O(n_1 \log n_1 + n_2 + q \cdot n_1)$，其中 $q$ 為查詢次數。

> $O(n_1 \log n_1 + n_2 + q \cdot n_1)$

## 空間複雜度

- 排序後的 `nums1` 陣列需額外的空間，成本為 $O(n_1)$。
- 頻率表的空間成本與 `nums2` 的元素數量有關，最壞情況下為 $O(n_2)$。
- 總空間複雜度為 $O(n_1 + n_2)$。

> $O(n_1 + n_2)$
