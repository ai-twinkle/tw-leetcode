# 3525. Find X Value of Array II

You are given an array of positive integers `nums` and a positive integer `k`. 
You are also given a 2D array `queries`, where `queries[i] = [index_i, value_i, start_i, x_i]`.

You are allowed to perform an operation once on `nums`, 
where you can remove any suffix from `nums` such that `nums` remains non-empty.

The x-value of `nums` for a given x is defined as the number of ways to perform this operation so that the product of the remaining elements leaves a remainder of x modulo k.

For each query in queries you need to determine the x-value of `nums` for `x_i` after performing the following actions:

- Update `nums[index_i]` to `value_i`. Only this step persists for the rest of the queries.
- Remove the prefix `nums[0..(start_i - 1)]` (where `nums[0..(-1)]` will be used to represent the empty prefix).

Return an array `result` of size `queries.length` where `result[i]` is the answer for the ith query.

A prefix of an array is a subarray that starts from the beginning of the array and extends to any point within it.

A suffix of an array is a subarray that starts at any point within the array and extends to the end of the array.

Note that the prefix and suffix to be chosen for the operation can be empty.

Note that x-value has a different definition in this version.

**Constraints:**

- `1 <= nums[i] <= 10^9`
- `1 <= nums.length <= 10^5`
- `1 <= k <= 5`
- `1 <= queries.length <= 2 * 10^4`
- `queries[i] == [index_i, value_i, start_i, x_i]`
- `0 <= index_i <= nums.length - 1`
- `1 <= value_i <= 10^9`
- `0 <= start_i <= nums.length - 1`
- `0 <= x_i <= k - 1`

## 基礎思路

本題要求在每次單點修改後，針對「從某個起點開始到陣列結尾」的後綴子陣列，計算有多少個非空前綴的元素乘積在模數下等於指定餘數。由於陣列長度可達 $10^5$、查詢次數可達 $2 \times 10^4$，且修改會持續保留，若每次查詢都重新線性掃描，將無法在時限內完成。

在思考解法時，可掌握以下核心觀察：

- **模數極小，乘積可用餘數完整表示**：
  模數至多為 5，因此任何區間的乘積只需記錄其餘數；而「前綴乘積的分布」也只需記錄每種餘數各出現幾次，資訊量為常數。

- **前綴分布具備可合併的結構**：
  將一段區間切成左右兩半時，整段的所有前綴可分為兩類：
  - 完全落在左半段的前綴，其分布與左半段相同；
  - 延伸進右半段的前綴，其乘積等於「左半段總乘積」乘上「右半段某個前綴乘積」。

  因此只要知道左右兩段各自的總乘積與前綴分布，即可在常數時間內合成整段的資訊，且此合併具結合律。

- **修改持續生效，需支援動態維護**：
  每次修改都會影響之後的查詢，必須使用能在對數時間內完成單點更新與區間查詢的資料結構。

- **後綴查詢必須依序合併**：
  前綴的定義與方向相關，合併時必須嚴格由左至右累積，不能任意交換區段順序。

依據以上特性，可以採用以下策略：

- **預先建立模數下的乘法表**，將所有餘數相乘轉為查表操作。
- **以線段樹維護每個區間的「總乘積餘數」與「各餘數的前綴數量」**，並透過上述合併規則自底向上建構。
- **單點修改時重設對應葉節點，並沿路重建所有祖先節點**。
- **查詢時由左至右折疊後綴區間所涵蓋的節點**，以累積乘積平移每個節點的前綴分布後相加，最後讀出目標餘數對應的數量。

此策略讓每次修改與查詢皆在對數時間內完成，能有效應對大量查詢。

## 解題步驟

### Step 1：計算線段樹的葉節點容量

先取得陣列長度，並求出不小於該長度的最小 2 的冪次，作為線段樹葉節點的數量，便於以陣列形式表示完整二元樹。

```typescript
const length = nums.length;
let size = 1;
while (size < length) {
  size <<= 1;
}
```

### Step 2：預先建立模數下的乘法表

由於模數極小，可將所有餘數兩兩相乘的結果預先算好並攤平存放，之後的乘法運算皆可直接查表完成。

```typescript
// 預先計算模 k 的乘法表
const multiply = new Uint8Array(k * k);
for (let first = 0; first < k; first++) {
  for (let second = 0; second < k; second++) {
    multiply[first * k + second] = (first * second) % k;
  }
}
```

### Step 3：配置節點乘積與前綴計數的儲存空間

為每個節點配置兩種資訊：

- `product` 儲存該節點區間的總乘積餘數。填充用的葉節點預設為乘法單位元 `1 % k`，確保不影響合併結果。
- `count` 以 `node * k + residue` 攤平的方式，記錄該區間各餘數的前綴數量。

```typescript
// 每個節點區間的乘積模 k；填充用的葉節點存放單位元 1 % k
const product = new Uint8Array(2 * size).fill(1 % k);
// 每個節點的前綴餘數計數，以 node * k + residue 的方式攤平儲存
const count = new Int32Array(2 * size * k);
```

### Step 4：初始化葉節點

每個葉節點只對應單一元素，其總乘積即為該元素的餘數，且恰好只有一個前綴（元素本身），因此對應餘數的計數為 1。

```typescript
// 初始化葉節點：單一元素恰好只有一個前綴
for (let index = 0; index < length; index++) {
  const residue = nums[index] % k;
  const leaf = size + index;
  product[leaf] = residue;
  count[leaf * k + residue] = 1;
}
```

### Step 5：定義節點合併函數，並先複製左子節點的前綴計數

合併函數負責由兩個子節點重建父節點的資訊。

- 先計算左右子節點的索引與各自在計數陣列中的起始位置。
- 預先取出左子節點乘積在乘法表中對應的列偏移。
- 完全落在左半段的前綴分布不受影響，因此直接複製左子節點的計數。

```typescript
/**
 * 由兩個子節點重新計算某節點的乘積與前綴計數。
 * @param node - 欲重建的內部節點索引。
 */
const pull = (node: number): void => {
  const left = node << 1;
  const right = left | 1;
  const base = node * k;
  const leftBase = left * k;
  const rightBase = right * k;
  const rowOffset = product[left] * k;

  // 左子節點的前綴保持不變
  for (let residue = 0; residue < k; residue++) {
    count[base + residue] = count[leftBase + residue];
  }

  // ...
};
```

### Step 6：將右子節點的前綴以左乘積平移後併入，並更新節點乘積

延伸進右半段的前綴，其乘積等於左半段總乘積乘上右半段的前綴乘積。因此右子節點的每種餘數計數，需經乘法表平移到新餘數後再累加。最後以左右兩段乘積相乘，得到父節點的總乘積。

```typescript
/**
 * 由兩個子節點重新計算某節點的乘積與前綴計數。
 * @param node - 欲重建的內部節點索引。
 */
const pull = (node: number): void => {
  // Step 5：計算子節點位置並複製左子節點的前綴計數

  // 右子節點的前綴需以左子節點的乘積進行平移
  for (let residue = 0; residue < k; residue++) {
    count[base + multiply[rowOffset + residue]] += count[rightBase + residue];
  }
  product[node] = multiply[rowOffset + product[right]];
};
```

### Step 7：自底向上建構所有內部節點

由最後一個內部節點往根節點依序呼叫合併函數，確保每個節點在合併時，其子節點資訊皆已就緒。

```typescript
// 自底向上建構所有內部節點
for (let node = size - 1; node >= 1; node--) {
  pull(node);
}
```

### Step 8：初始化查詢所需的變數

準備結果陣列、用於累積後綴前綴分布的暫存陣列，以及乘法單位元，供每次查詢重複使用。

```typescript
const queryCount = queries.length;
const result: number[] = new Array(queryCount);
const accumulator = new Int32Array(k);
const identity = 1 % k;
```

### Step 9：逐一處理查詢並解析參數

走訪每筆查詢，取出修改位置、新值的餘數、後綴起點與目標餘數。新值在此直接轉為餘數，後續只需以餘數運算。

```typescript
for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  const query = queries[queryIndex];
  const updateIndex = query[0];
  const residue = query[1] % k;
  const start = query[2];
  const target = query[3];

  // ...
}
```

### Step 10：執行單點更新並重建祖先節點

找到欲修改的葉節點，先清空其所有餘數計數，再將新餘數的計數設為 1 並更新乘積。之後沿父節點路徑逐層往上重新合併，直到根節點。

```typescript
for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  // Step 9：解析查詢參數

  // 單點更新：先重設葉節點，再重建其所有祖先節點
  let node = size + updateIndex;
  const leafBase = node * k;
  for (let offset = 0; offset < k; offset++) {
    count[leafBase + offset] = 0;
  }
  count[leafBase + residue] = 1;
  product[node] = residue;
  node >>= 1;
  while (node >= 1) {
    pull(node);
    node >>= 1;
  }

  // ...
}
```

### Step 11：由左至右折疊後綴區間並記錄答案

以自底向上的方式走訪後綴區間所涵蓋的節點。由於右邊界固定為整棵樹的末端，只需處理左邊界：

- 當左邊界為右子節點時，該節點即為下一段需併入的區間。
- 併入時，將其前綴分布以目前的累積乘積平移後加入暫存陣列，並更新累積乘積。

由於左邊界上取出的節點天然依由左至右的順序出現，前綴的方向性得以保持。折疊完成後，目標餘數對應的數量即為本次答案。

```typescript
for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  // Step 9：解析查詢參數

  // Step 10：執行單點更新並重建祖先節點

  // 由左至右折疊後綴區間 [start, size)
  accumulator.fill(0);
  let accumulatedProduct = identity;
  let left = start + size;
  let right = size << 1;
  while (left < right) {
    if (left & 1) {
      const nodeBase = left * k;
      const rowOffset = accumulatedProduct * k;
      for (let offset = 0; offset < k; offset++) {
        accumulator[multiply[rowOffset + offset]] += count[nodeBase + offset];
      }
      accumulatedProduct = multiply[rowOffset + product[left]];
      left++;
    }
    left >>= 1;
    right >>= 1;
  }

  result[queryIndex] = accumulator[target];
}
```

### Step 12：回傳所有查詢的結果

所有查詢處理完畢後，`result` 已依序記錄每筆查詢的答案，直接回傳。

```typescript
return result;
```

## 時間複雜度

- 建立乘法表需 $O(k^2)$；
- 初始化葉節點需 $O(n)$，自底向上建構 $O(n)$ 個內部節點，每次合併為 $O(k)$，共 $O(nk)$；
- 每筆查詢的單點更新需重建 $O(\log n)$ 個祖先節點，每次 $O(k)$；
- 每筆查詢的後綴折疊最多處理 $O(\log n)$ 個節點，每個節點 $O(k)$；
- 設查詢數量為 $q$，總時間複雜度為 $O((n + q \log n) \cdot k)$。

> $O((n + q \log n) \cdot k)$

## 空間複雜度

- 線段樹共有 $O(n)$ 個節點，每個節點儲存一個乘積與 $k$ 個計數，共 $O(nk)$；
- 乘法表需 $O(k^2)$，累積暫存陣列需 $O(k)$；
- 結果陣列需 $O(q)$；
- 總空間複雜度為 $O(nk + q)$。

> $O(nk + q)$
