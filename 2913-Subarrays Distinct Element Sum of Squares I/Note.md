# 2913. Subarrays Distinct Element Sum of Squares I

You are given a 0-indexed integer array `nums`.

The distinct count of a subarray of `nums` is defined as:

- Let `nums[i..j]` be a subarray of `nums` consisting of all the indices from `i` to `j` 
  such that `0 <= i <= j < nums.length`. 
  Then the number of distinct values in `nums[i..j]` is called the distinct count of `nums[i..j]`.

Return the sum of the squares of distinct counts of all subarrays of `nums`.

A subarray is a contiguous non-empty sequence of elements within an array.

**Constraints:**

- `1 <= nums.length <= 100`
- `1 <= nums[i] <= 100`

## 基礎思路

本題要求對陣列中所有子陣列，計算其「相異值數量」的平方，並將所有平方加總。
由於陣列長度最多僅 100，子陣列總數約為 5000 個，因此可以直接枚舉所有子陣列。關鍵在於如何在枚舉過程中有效率地維護相異值數量。

在思考解法時，可掌握以下核心觀察：

- **固定起點、逐步延伸終點時，相異數量只增不減**：
  以同一起點向右擴展子陣列時，新加入的元素若先前未出現過，相異數量加一，否則維持不變。因此每延伸一格，都能在常數時間內更新相異數量。

- **數值範圍極小，適合以直接索引表記錄出現狀態**：
  所有數值皆介於 1 到 100，可用固定大小的表格記錄每個值是否已在目前子陣列中出現，查詢與更新皆為常數時間。

- **以「時間戳」取代清空操作**：
  每換一個起點都需重置出現狀態。若改為記錄「最後一次標記該值時的起點」，只要比對該紀錄是否等於目前起點，即可判斷是否已出現，無需每輪清空整張表。

- **平方值可增量遞推**：
  相異數量由 $d$ 增為 $d + 1$ 時，平方增加 $2d + 1$，因此可在不做乘法的情況下同步維護平方值。

依據以上特性，可以採用以下策略：

- **枚舉每個起點，並由該起點向右逐一延伸終點**。
- **以時間戳表判斷新加入的值是否首次出現，若是則同步遞增相異數量及其平方**。
- **每延伸一次終點，就將目前的平方值累加至總和**。

此策略以雙層枚舉配合常數時間的狀態更新，在題目規模下簡潔且高效。

## 解題步驟

### Step 1：初始化長度、時間戳表與總和

先取得陣列長度，並建立一張以數值為索引的時間戳表，記錄每個值最後被哪一個起點標記；初始值設為 `-1`，表示尚未被任何起點標記。同時準備總和累加器。

```typescript
const length = nums.length;

// 以數值（1..100）為鍵的時間戳表：記錄最後一次標記該值的起點索引，
// 因此當起點前進時，成員關係會隱式地重置。
const lastSeenStart = new Int32Array(101).fill(-1);

let total = 0;
```

### Step 2：枚舉每個起點並初始化視窗統計

外層迴圈逐一枚舉子陣列的起點。每換一個起點，都需重新計算該起點下的相異數量與其平方，因此在此將兩者歸零。

```typescript
for (let start = 0; start < length; start++) {
  // 視窗 [start, end] 目前的相異數量及其平方。
  let distinct = 0;
  let distinctSquared = 0;

  // ...
}
```

### Step 3：延伸終點並以時間戳判斷新值是否首次出現

內層迴圈由起點向右逐一延伸終點。對於新加入的值，若其時間戳不等於目前起點，代表它在目前子陣列中首次出現。此時將其時間戳更新為目前起點，並依恆等式 $(d + 1)^2 = d^2 + 2d + 1$ 增量更新平方值，再將相異數量加一。

```typescript
for (let start = 0; start < length; start++) {
  // Step 2：枚舉起點並初始化視窗統計

  for (let end = start; end < length; end++) {
    const value = nums[end];

    if (lastSeenStart[value] !== start) {
      lastSeenStart[value] = start;

      // (d + 1)^2 = d^2 + 2d + 1，因此平方值無需乘法即可遞推。
      distinctSquared += distinct + distinct + 1;
      distinct++;
    }

    // ...
  }
}
```

### Step 4：將目前子陣列的相異數量平方累加至總和

每延伸一次終點，就形成一個新的子陣列 `[start, end]`，其相異數量的平方即為目前的 `distinctSquared`，將其加入總和。

```typescript
for (let start = 0; start < length; start++) {
  // Step 2：枚舉起點並初始化視窗統計

  for (let end = start; end < length; end++) {
    // Step 3：判斷新值是否首次出現並更新相異數量及其平方

    total += distinctSquared;
  }
}
```

### Step 5：回傳最終結果

所有子陣列皆已處理完畢，`total` 即為所有子陣列相異數量平方的總和，直接回傳。

```typescript
return total;
```

## 時間複雜度

- 外層枚舉 $n$ 個起點，內層對每個起點最多延伸 $n$ 個終點，共 $O(n^2)$ 個子陣列；
- 每個子陣列的時間戳查詢、平方遞推與累加皆為常數時間；
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 時間戳表大小固定為 101，與輸入長度無關；
- 其餘僅使用固定數量的變數；
- 總空間複雜度為 $O(1)$。

> $O(1)$
