# 3737. Count Subarrays With Majority Element I

You are given an integer array `nums` and an integer `target`.

Return the number of subarrays of `nums` in which `target` is the majority element.

The majority element of a subarray is the element that appears strictly more than half of the times in that subarray.

**Constraints:**

- `1 <= nums.length <= 1000`
- `1 <= nums[i] <= 10^9`
- `1 <= target <= 10^9`

## 基礎思路

本題要求找出所有以 `target` 為多數元素的子陣列數量，即 `target` 出現次數嚴格超過子陣列長度一半的子陣列。

在思考解法時，可掌握以下核心觀察：

- **多數條件可轉換為前綴和問題**：
  將陣列中每個元素映射為 `+1`（等於 `target`）或 `-1`（不等於），則一個子陣列合法當且僅當其區間和大於 0。

- **區間和可用前綴和差值表示**：
  設前綴和陣列為 `prefix`，子陣列 `[l, r]` 的區間和等於 `prefix[r] - prefix[l-1]`，合法條件為 `prefix[r] > prefix[l-1]`，即需要計算每個位置之前有多少個較小的前綴和。

- **計算「有多少前綴和嚴格小於當前值」可藉由資料結構加速**：
  若使用暴力雙重迴圈，時間複雜度為 $O(n^2)$；引入 Fenwick Tree（樹狀陣列）可將每次查詢與更新壓縮至 $O(\log n)$，整體提升為 $O(n \log n)$。

- **前綴和範圍有限，可直接作為索引**：
  前綴和的值域為 `[-n, n]`，透過加上偏移量 `offset = n` 可將所有索引轉為非負整數，直接對應 Fenwick Tree 的位置。

依據以上特性，可以採用以下策略：

- **建立偏移後的 Fenwick Tree**，以記錄每個前綴和出現的次數。
- **從左到右遍歷陣列**，對每個位置查詢「已記錄的前綴和中有多少嚴格小於當前值」，加總即為以該位置結尾的合法子陣列數量。
- **每次查詢後，將當前前綴和更新入 Fenwick Tree**，供後續位置使用。

此策略能在一次線性掃描搭配對數查詢的架構下，完整計算所有合法子陣列數量。

## 解題步驟

### Step 1：定義 Fenwick Tree 的建構子

`FenwickTree` 接受一個大小參數，初始化內部陣列以及記錄大小的欄位，為後續的點更新與前綴查詢做準備。

```typescript
class FenwickTree {
  private readonly tree: Int32Array;
  private readonly size: number;

  constructor(size: number) {
    this.size = size;
    this.tree = new Int32Array(size + 1);
  }

  // ...
}
```

### Step 2：實作 `update`，在指定索引加 1

`update` 以 1-based 索引為起點，沿著 Fenwick Tree 的路徑向上更新每個節點，將對應位置的計數加 1。

```typescript
class FenwickTree {
  // Step 1：建構子

  /**
   * 在指定索引加 1。
   * @param index - 欲更新的 1-based 索引
   */
  update(index: number): void {
    for (let position = index; position <= this.size; position += position & (-position)) {
      this.tree[position]++;
    }
  }

  // ...
}
```

### Step 3：實作 `query`，查詢 `[1, index]` 的累計數量

`query` 從指定的 1-based 索引出發，沿著 Fenwick Tree 向下走訪，將沿途節點的值加總，回傳區間 `[1, index]` 的累計計數。

```typescript
class FenwickTree {
  // Step 1：建構子

  // Step 2：update 方法

  /**
   * 查詢從索引 1 到指定索引的累計計數。
   * @param index - 1-based 的上界索引（含）
   * @returns 區間 [1, index] 的計數總和
   */
  query(index: number): number {
    let total = 0;
    for (let position = index; position > 0; position -= position & (-position)) {
      total += this.tree[position];
    }
    return total;
  }

  // ...
}
```

### Step 4：實作 `queryLessThan`，查詢嚴格小於指定索引的計數

`queryLessThan` 查詢所有值落在 `[1, index - 1]` 的計數總和，若 `index <= 1` 則直接回傳 0，否則呼叫 `query(index - 1)`。

```typescript
class FenwickTree {
  // Step 1：建構子

  // Step 2：update 方法

  // Step 3：query 方法

  /**
   * 查詢嚴格小於指定 1-based 索引的值的計數。
   * @param index - 1-based 索引
   * @returns 區間 [1, index - 1] 的計數
   */
  queryLessThan(index: number): number {
    if (index <= 1) {
      return 0;
    }
    return this.query(index - 1);
  }
}
```

### Step 5：初始化前綴和偏移量與 Fenwick Tree，並植入起始前綴和

計算偏移量 `offset = length`，使前綴和的值域 `[-n, n]` 全部對應到正整數索引；以此建立大小為 `2n + 1` 的 Fenwick Tree，並將「空前綴和 0」預先記錄，代表陣列開始前的虛擬位置。

```typescript
const length = nums.length;

// 前綴和範圍為 -length 到 +length；加上 length 偏移後所有索引皆 >= 0
const offset = length;
const treeSize = 2 * length + 1;
const fenwickTree = new FenwickTree(treeSize);

// 植入前綴和 0（陣列開始前），映射至 1-based 索引 offset + 1
fenwickTree.update(offset + 1);
```

### Step 6：逐一掃描陣列，累積前綴和並查詢合法子陣列數量

對每個元素，根據是否等於 `target` 將 `prefixSum` 加 1 或減 1；
計算對應的 1-based Fenwick Tree 索引後，查詢目前已記錄的前綴和中嚴格小於當前值的數量，即為以此位置結尾的合法子陣列數；
最後將當前前綴和記入 Fenwick Tree，供後續查詢使用。

```typescript
let prefixSum = 0;
let count = 0;

for (let index = 0; index < length; index++) {
  // 等於 target 累加 +1，否則累加 -1
  prefixSum += nums[index] === target ? 1 : -1;

  // 當前前綴和對應的 1-based Fenwick Tree 索引
  const currentBitIndex = prefixSum + offset + 1;

  // 查詢有多少先前的前綴和嚴格小於當前值（代表以此結尾的合法子陣列數）
  count += fenwickTree.queryLessThan(currentBitIndex);

  // 將當前前綴和記錄至 Fenwick Tree，供後續查詢使用
  fenwickTree.update(currentBitIndex);
}
```

### Step 7：回傳合法子陣列總數

遍歷結束後，`count` 即為所有以 `target` 為多數元素的子陣列總數，直接回傳。

```typescript
return count;
```

## 時間複雜度

- 初始化 Fenwick Tree 需 $O(n)$ 時間；
- 遍歷陣列共 $n$ 次，每次進行一次 `queryLessThan` 與一次 `update`，各需 $O(\log n)$；
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- Fenwick Tree 的內部陣列大小為 $2n + 1$，需 $O(n)$ 空間；
- 其餘僅使用常數個輔助變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
