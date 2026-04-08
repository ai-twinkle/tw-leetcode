# 3653. XOR After Range Multiplication Queries I

You are given an integer array `nums` of length `n` and a 2D integer array queries of size `q`, 
where `queries[i] = [l_i, r_i, k_i, v_i]`.

For each query, you must apply the following operations in order:

- Set `idx = l_i`.
- While `idx <= r_i`:
  - Update: `nums[idx] = (nums[idx] * v_i) % (10^9 + 7)`
  - Set `idx += k_i`.

Return the bitwise XOR of all elements in `nums` after processing all queries.

**Constraints:**

- `1 <= n == nums.length <= 10^3`
- `1 <= nums[i] <= 10^9`
- `1 <= q == queries.length <= 10^3`
- `queries[i] = [l_i, r_i, k_i, v_i]`
- `0 <= l_i <= r_i < n`
- `1 <= k_i <= n`
- `1 <= v_i <= 10^5`

## 基礎思路

本題要求對一個整數陣列套用一系列「區間步進乘法」查詢，每筆查詢在指定範圍內以固定步長選取元素並乘以給定倍數，最終求所有元素的 XOR 總和。

在思考解法時，可掌握以下核心觀察：

- **查詢操作本質為逐步跳躍更新**：
  每筆查詢只修改區間內等距位置的元素，並不是對整個區間的連續更新，因此不適合直接使用前綴和等範圍技術，必須逐一套用。

- **模數運算防止數值溢位**：
  每次乘法後需對 $10^9 + 7$ 取餘，確保中間值始終處於安全範圍內，避免浮點精度問題。

- **記憶體存取模式決定實際效能**：
  在約束規模下（$n, q \le 10^3$），演算法複雜度的常數因子尤為重要；將二維陣列攤平為連續一維緩衝區，能有效提升快取命中率並降低間接存取開銷。

- **XOR 累積與查詢處理相互獨立**：
  所有查詢必須全數套用完畢後，才能對最終陣列做一次線性掃描計算 XOR，兩個階段的順序不可交換。

依據以上特性，可以採用以下策略：

- **將原始陣列與查詢陣列分別攤平至型別陣列中**，藉由連續記憶體布局加速隨機存取。
- **依序套用每筆查詢**，在 $[l, r]$ 區間內以步長 $k$ 逐一更新元素。
- **所有查詢處理完畢後，一次線性掃描累積 XOR 結果並回傳**。

## 解題步驟

### Step 1：宣告模數常數

將 $10^9 + 7$ 以具名常數宣告於模組層級，避免在熱迴圈中重複建立字面值，同時提高可讀性。

```typescript
const MOD = 1_000_000_007;
```

### Step 2：初始化長度與查詢數量

讀取陣列長度與查詢筆數，作為後續迴圈的邊界依據。

```typescript
const length = nums.length;
const queryCount = queries.length;
```

### Step 3：將輸入陣列複製至型別陣列

將原始 JavaScript 陣列複製至 `Int32Array`，以獲得更快的索引讀寫速度。

```typescript
// 複製至型別陣列以加速索引讀寫
const workingNums = new Int32Array(nums);
```

### Step 4：將二維查詢陣列攤平至步距為 4 的一維型別陣列

將每筆查詢的四個欄位依序寫入一維緩衝區，使每筆查詢在記憶體中連續排列，降低後續存取的快取失誤率。

```typescript
// 將二維查詢陣列攤平為步距 4 的型別陣列以提升快取友善性
const flatQueries = new Int32Array(queryCount * 4);
for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  const sourceQuery = queries[queryIndex];
  const baseOffset = queryIndex * 4;
  flatQueries[baseOffset]     = sourceQuery[0];
  flatQueries[baseOffset + 1] = sourceQuery[1];
  flatQueries[baseOffset + 2] = sourceQuery[2];
  flatQueries[baseOffset + 3] = sourceQuery[3];
}
```

### Step 5：依序套用每筆查詢，讀取邊界與步長參數並更新元素

對每筆查詢，先從攤平後的緩衝區讀出左右邊界、步長及乘數，再對區間內的等距位置執行乘法並對 `MOD` 取餘，確保數值不會超出安全整數範圍。

```typescript
// 套用每筆查詢：將 [l, r] 內每隔 k 個位置的元素乘以 v，並對 MOD 取餘
for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  const baseOffset = queryIndex * 4;
  const leftBound  = flatQueries[baseOffset];
  const rightBound = flatQueries[baseOffset + 1];
  const stepSize   = flatQueries[baseOffset + 2];
  const multiplier = flatQueries[baseOffset + 3];

  for (let idx = leftBound; idx <= rightBound; idx += stepSize) {
    workingNums[idx] = (workingNums[idx] * multiplier) % MOD;
  }
}
```

### Step 6：對所有元素進行一次線性掃描，累積 XOR 並回傳結果

所有查詢套用完畢後，從頭到尾掃描一次陣列，將每個元素依序 XOR 累積至結果變數，最終回傳。

```typescript
// 對所有元素累積 XOR 結果
let xorResult = 0;
for (let i = 0; i < length; i++) {
  xorResult ^= workingNums[i];
}

return xorResult;
```

## 時間複雜度

- 攤平查詢陣列需 $O(q)$；
- 套用所有查詢：每筆查詢最多掃描 $O(n / k)$ 個元素，最壞情況下 $k = 1$，共 $O(q \cdot n)$；
- 最終 XOR 掃描需 $O(n)$。
- 總時間複雜度為 $O(q \cdot n)$。

> $O(q \cdot n)$

## 空間複雜度

- 使用一個大小為 $n$ 的型別陣列儲存工作副本；
- 使用一個大小為 $4q$ 的型別陣列儲存攤平後的查詢；
- 其餘均為常數個純量變數。
- 總空間複雜度為 $O(n + q)$。

> $O(n + q)$
