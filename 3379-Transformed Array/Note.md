# 3379. Transformed Array

You are given an integer array `nums` that represents a circular array. 
Your task is to create a new array `result` of the same size, following these rules:

For each index `i` (where `0 <= i < nums.length`), perform the following independent actions:
 
- If `nums[i] > 0`: Start at index `i` and move `nums[i]` steps to the right in the circular array. 
  Set `result[i]` to the value of the index where you land.
- If `nums[i] < 0`: Start at index `i` and move `abs(nums[i])` steps to the left in the circular array. 
  Set `result[i]` to the value of the index where you land.
- If `nums[i] == 0`: Set `result[i]` to `nums[i]`.

Return the new array result.

Note: Since nums is circular, moving past the last element wraps around to the beginning, and moving before the first element wraps back to the end.

**Constraints:**

- `1 <= nums.length <= 100`
- `-100 <= nums[i] <= 100`

## 基礎思路

本題要把一個「環狀陣列」依照每個位置的位移量，轉換成一個新陣列 `result`。
每個索引 `i` 的動作彼此獨立：

* 若 `nums[i] > 0`，就從 `i` 往右走 `nums[i]` 步；
* 若 `nums[i] < 0`，就從 `i` 往左走 `abs(nums[i])` 步；
* 若 `nums[i] == 0`，結果就是原值。

關鍵在於「環狀」：走超過尾端要回到開頭，走到開頭前要回到尾端。
因此核心策略是：

* **把位移後的落點索引用模數運算折回合法範圍**，確保落在 `[0, n-1]`。
* **一次掃描**，每個位置計算落點並寫入結果。
* **負數模數的修正**：在某些語言中，負數 `% n` 可能仍為負，因此需做一次修正使索引回到非負範圍。

這樣就能用線性時間完成整體轉換。

## 解題步驟

### Step 1：初始化長度與輸出容器

先取得陣列長度 `length`，並建立同長度的 `Int32Array` 作為輸出容器，方便後續以索引寫入。

```typescript
const length = nums.length;

// 使用 TypedArray 以加速索引寫入並節省記憶體
const transformed = new Int32Array(length);
```

### Step 2：建立最外層迴圈並取得當前位移量

逐一處理每個索引 `index`，讀出 `nums[index]` 作為位移量 `shift`。

```typescript
for (let index = 0; index < length; index++) {
  const shift = nums[index];

  // ...
}
```

### Step 3：計算落點索引（含負數模數修正）

用 `(index + shift) % length` 把位移折回環狀範圍；若結果為負，補上 `length` 使其回到 `[0, length - 1]`。

```typescript
for (let index = 0; index < length; index++) {
  // Step 2：建立最外層迴圈並取得當前位移量

  const shift = nums[index];

  // 用一次取模加一次修正計算落點索引（比雙重正規化更快）
  let landingIndex = (index + shift) % length;
  if (landingIndex < 0) {
    landingIndex += length;
  }

  // ...
}
```

### Step 4：依落點索引寫入對應值

落點索引計算完後，直接取 `nums[landingIndex]` 放入 `transformed[index]`。此邏輯也自然涵蓋 `shift == 0` 的情況。

```typescript
for (let index = 0; index < length; index++) {
  // Step 2：建立最外層迴圈並取得當前位移量

  // Step 3：計算落點索引（含負數模數修正）

  const shift = nums[index];

  let landingIndex = (index + shift) % length;
  if (landingIndex < 0) {
    landingIndex += length;
  }

  // 直接從 nums 取值；此落點邏輯也能正確處理 shift == 0
  transformed[index] = nums[landingIndex];
}
```

### Step 5：轉換輸出型別並回傳

題目要求回傳 `number[]`，因此將 `Int32Array` 轉回一般陣列後回傳。

```typescript
// 將 TypedArray 轉為 number[] 以符合函數回傳型別
return Array.from(transformed);
```

## 時間複雜度

- 設 `n = nums.length`。
- 主迴圈執行 `n` 次；每次迭代包含：常數次的加法、取模、比較、可能一次加法、一次讀取與一次寫入，皆為 $O(1)$。
- `Array.from(transformed)` 需要走訪 `n` 個元素並複製到新陣列，為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- `transformed` 為長度 `n` 的 `Int32Array`，佔用 $O(n)$ 額外空間。
- `Array.from(transformed)` 產生一個新的 `number[]`，同樣為 $O(n)$ 額外空間。
- 其餘變數皆為常數空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
