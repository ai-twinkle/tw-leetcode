# 3719. Longest Balanced Subarray I

You are given an integer array `nums`.

A subarray is called balanced if the number of distinct even numbers in the subarray is equal to the number of distinct odd numbers.

Return the length of the longest balanced subarray.

**Constraints:**

- `1 <= nums.length <= 1500`
- `1 <= nums[i] <= 10^5`

## 基礎思路

本題要找最長的「平衡子陣列」，定義為：子陣列中**不同的偶數值個數**，等於**不同的奇數值個數**。我們要回傳滿足條件的最大長度。

在思考解法時，需要注意幾個重點：

* **比較的是「不同值」的數量，不是出現次數**：同一個偶數在子陣列中出現很多次，仍只算 1 個不同偶數。
* **子陣列是連續區間**：因此可以用「固定左界、擴展右界」的方式枚舉所有子陣列。
* **每個區間都要快速更新 distinct even/odd**：當右界向右擴展時，只在某個值第一次進入區間時才會影響 distinct 計數。
* **值域很大但長度不大**：`nums[i]` 可到 `1e5`，但 `n <= 1500`，因此可以接受 $O(n^2)$ 枚舉所有子陣列，只要每次更新是常數成本。
* **為了降低內層常數成本**：可以先把數值做「離散化（座標壓縮）」到 `0..(m-1)`，用陣列記錄頻率與奇偶性，避免在內層反覆做昂貴的集合操作。

透過「枚舉左界 + 逐步擴展右界 + 只在首次出現時更新 distinct」的策略，就能找出最長平衡子陣列。

## 解題步驟

### Step 1：初始化長度與空陣列特判

先取得陣列長度；若為空則直接回傳 0。

```typescript
const length = nums.length;
if (length === 0) {
  return 0;
}
```

### Step 2：準備排序副本並建立唯一值清單

建立 `nums` 的排序副本，並掃描排序結果，取出去重後的唯一值清單。

```typescript
// 座標壓縮（避免在內層迴圈使用 Map/Set 的成本）。
const sorted = nums.slice();
sorted.sort((a, b) => a - b);

const unique: number[] = [];
for (let index = 0; index < length; index++) {
  const value = sorted[index];
  if (index === 0 || value !== sorted[index - 1]) {
    unique.push(value);
  }
}
```

### Step 3：建立值到壓縮編號的映射

將每個唯一值對應到一個連續的 id，供後續用陣列索引存取。

```typescript
const uniqueCount = unique.length;

const valueToId = new Map<number, number>();
for (let id = 0; id < uniqueCount; id++) {
  valueToId.set(unique[id], id);
}
```

### Step 4：把原陣列轉成壓縮 id 陣列

將 `nums` 每個元素轉成對應的壓縮 id，方便後續頻率表用陣列操作。

```typescript
const ids = new Int16Array(length);
for (let index = 0; index < length; index++) {
  // 非空斷言是安全的，因為每個 nums[index] 一定存在於 `unique`。
  ids[index] = valueToId.get(nums[index])!;
}
```

### Step 5：預先計算每個壓縮 id 的奇偶性

建立 `parityById`，0 代表偶數、1 代表奇數，之後可用來更新 distinctEven / distinctOdd。

```typescript
// 記錄每個壓縮 id 的奇偶性：0 = 偶數，1 = 奇數。
const parityById = new Uint8Array(uniqueCount);
for (let id = 0; id < uniqueCount; id++) {
  parityById[id] = (unique[id] & 1) as 0 | 1;
}
```

### Step 6：準備區間頻率表與答案變數

`frequencyById` 用來記錄目前視窗 `[left..right]` 內，每個 id 出現次數；`bestLength` 記錄最長答案。

```typescript
// 目前視窗 [left..right] 中每個 value id 的出現次數。
const frequencyById = new Int16Array(uniqueCount);

let bestLength = 0;
```

### Step 7：枚舉左界 left，並在每次 left 改變時重置頻率表

每次固定一個新的 left，就把頻率表清空，並重置 distinctEven / distinctOdd，準備向右擴展。

```typescript
for (let left = 0; left < length; left++) {
  // 重要步驟：切換 left 後重置統計狀態。
  frequencyById.fill(0);

  let distinctEven = 0;
  let distinctOdd = 0;

  // ...
}
```

### Step 8：在固定 left 下擴展 right，並在首次出現時更新 distinct 計數

這裡需要拆解內層迴圈，並**保留最外層 for (right...)**，用省略標記延續前步驟。

```typescript
for (let left = 0; left < length; left++) {
  // Step 7：枚舉左界 left，並重置統計狀態

  for (let right = left; right < length; right++) {
    const id = ids[right];

    // 若此值第一次進入視窗，才會影響 distinct 計數
    if (frequencyById[id] === 0) {
      if (parityById[id] === 0) {
        distinctEven++;
      } else {
        distinctOdd++;
      }
    }

    frequencyById[id]++;

    // ...
  }
}
```

### Step 9：當 distinctEven === distinctOdd 時更新答案

同樣維持在同一個最外層 `for (right...)` 內，接續 Step 8 的省略標記格式。

```typescript
for (let left = 0; left < length; left++) {
  // Step 7：枚舉左界 left，並重置統計狀態

  for (let right = left; right < length; right++) {
    // Step 8：擴展 right 並更新 distinctEven / distinctOdd

    if (distinctEven === distinctOdd) {
      const windowLength = right - left + 1;
      if (windowLength > bestLength) {
        bestLength = windowLength;
      }
    }
  }
}
```

### Step 10：回傳最終答案

所有子陣列檢查完後，回傳 `bestLength`。

```typescript
return bestLength;
```

## 時間複雜度

- 令 `n = nums.length`，令 `m` 為不同值個數（`m <= n`）。
- 建立排序副本並排序：`sorted.sort` 為 $O(n \log n)$。
- 建立 `unique`、建立 `valueToId`、建立 `ids`、建立 `parityById`：皆為 $O(n)$ 或 $O(m)$，合併為 $O(n)$。
- 雙層枚舉區間：
  - 外層 `left` 迴圈執行 `n` 次；
  - 每次 `left` 先 `frequencyById.fill(0)`，成本為 $O(m)$；
  - 內層 `right` 總共執行 $\sum_{left=0}^{n-1} (n-left) = \frac{n(n+1)}{2}$ 次，每次僅做常數操作，成本為 $O(n^2)$。
  - 因此 fill 的總成本為 $O(n \times m)$，內層擴展總成本為 $O(n^2)$。
- 由於 $m \le n$，所以 $O(n \times m) \subseteq O(n^2)$，合併後為 $O(n^2)$。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- `sorted` 為長度 `n` 的副本：$O(n)$。
- `unique` 最多 `m` 個：$O(m)$。
- `valueToId` 儲存 `m` 筆映射：$O(m)$。
- `ids` 長度 `n`：$O(n)$。
- `parityById` 長度 `m`：$O(m)$。
- `frequencyById` 長度 `m`：$O(m)$。
- 合併後為 $O(n + m)$，且 $m \le n$，因此為 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
