# 3524. Find X Value of Array I

You are given an array of positive integers `nums`, and a positive integer `k`.

You are allowed to perform an operation once on `nums`, 
where in each operation you can remove any non-overlapping prefix and suffix from `nums` 
such that `nums` remains non-empty.

You need to find the x-value of `nums`, which is the number of ways to perform this operation 
so that the product of the remaining elements leaves a remainder of `x` when divided by `k`.

Return an array `result` of size `k` where `result[x]` is the x-value of `nums` for `0 <= x <= k - 1`.

A prefix of an array is a subarray that starts from the beginning of the array and extends to any point within it.

A suffix of an array is a subarray that starts at any point within the array and extends to the end of the array.

Note that the prefix and suffix to be chosen for the operation can be empty.

**Constraints:**

- `1 <= nums[i] <= 10^9`
- `1 <= nums.length <= 10^5`
- `1 <= k <= 5`

## 基礎思路

本題允許移除任意不重疊的前綴與後綴，且剩餘部分必須非空。
這等價於選取陣列中的任一**非空連續子陣列**。因此題目實際要求的是：統計所有子陣列中，乘積除以 `k` 的餘數分別為 `0` 到 `k - 1` 的子陣列數量。

在思考解法時，可掌握以下核心觀察：

- **子陣列總數達平方級，無法逐一枚舉**：
  陣列長度可達 `10^5`，子陣列數量約為 `5 × 10^9`，逐一計算乘積不可行。因此必須以「分組計數」取代「逐一枚舉」。

- **乘積的餘數僅由各元素的餘數決定**：
  模運算對乘法封閉，每個元素只需保留其除以 `k` 的餘數。子陣列乘積的餘數也只有 `k` 種可能，且 `k` 至多為 5。

- **以「結尾位置」劃分子陣列可形成遞推關係**：
  以某位置結尾的所有子陣列有兩種來源：一是把前一位置結尾的子陣列各延伸一格，二是僅含當前元素的單一子陣列。因此只需記錄「以前一位置結尾、各餘數的子陣列數量」，即可推得當前位置的分布。

- **特殊情況可快速處理**：
  - 當模數為 1 時，所有乘積的餘數皆為 0，答案即為子陣列總數。
  - 當某元素為模數的倍數時，所有包含它且以它結尾的子陣列，餘數皆歸於 0。

- **計數值可能超出 32 位元整數範圍**：
  子陣列總數可達數十億，累計時需使用足以精確表示的數值型別。

依據以上特性，可以採用以下策略：

- **預先建立「餘數 × 餘數」的乘法查表**，將每次轉移的模運算化為查表操作。
- **由左至右掃描，對每個結尾位置維護 `k` 種餘數的子陣列數量分布**，並由前一位置的分布遞推而來。
- **每一步將當前分布累加進答案**，最終即得所有子陣列的餘數統計。
- **以兩組緩衝區交替使用**，避免在迴圈中重複配置記憶體。

此策略將平方級的子陣列枚舉降為線性掃描，每一步僅需常數級的狀態轉移。

## 解題步驟

### Step 1：處理模數為 1 的特殊情況

先取得陣列長度。若 `k` 為 1，任何子陣列乘積除以 1 的餘數皆為 0。因此答案只有一格，其值為子陣列總數 `n(n+1)/2`，可直接回傳。

```typescript
const length = nums.length;

// 每個子陣列的乘積 ≡ 0 (mod 1)，因此數量為 n(n+1)/2
if (k === 1) {
  return [(length * (length + 1)) / 2];
}
```

### Step 2：預先建立餘數乘法查表

為了在後續轉移中快速得知「某餘數乘上某值後的新餘數」，先建立一個 `k × k` 的平面查表。以 `value * k + remainder` 作為索引，儲存 `(value * remainder) % k`。

```typescript
// 預先計算 (remainder * value) % k，存為平面查表
const productTable = new Int32Array(k * k);
for (let value = 0; value < k; value++) {
  const rowOffset = value * k;
  for (let remainder = 0; remainder < k; remainder++) {
    productTable[rowOffset + remainder] = (value * remainder) % k;
  }
}
```

### Step 3：初始化答案與兩組計數緩衝區

- `result` 累計所有子陣列的餘數分布。
- `currentCounts` 表示「以前一位置結尾」的各餘數子陣列數量。
- `nextCounts` 用於計算「以當前位置結尾」的分布。

由於總數可能超出 32 位元範圍，三者皆使用 `Float64Array`。

```typescript
// 使用 Float64Array，因為總數可能超出 32 位元整數範圍
const result = new Float64Array(k);
let currentCounts = new Float64Array(k);
let nextCounts = new Float64Array(k);
```

### Step 4：逐一掃描元素，取得餘數並清空下一輪緩衝區

對每個位置，先將當前元素化為除以 `k` 的餘數。接著將 `nextCounts` 手動歸零，準備計算以此位置結尾的分布。由於陣列極小，手動清空可省去 `fill()` 的呼叫開銷。

```typescript
for (let index = 0; index < length; index++) {
  const value = nums[index] % k;

  // 手動清空下一輪緩衝區，避免對極小陣列呼叫 fill() 的額外開銷
  for (let remainder = 0; remainder < k; remainder++) {
    nextCounts[remainder] = 0;
  }

  // ...
}
```

### Step 5：依當前餘數計算以此位置結尾的子陣列分布

分為兩種情況：

- **當前餘數為 0**：以此位置結尾的子陣列共有 `index + 1` 個，乘積皆為 `k` 的倍數，全部歸入餘數 0。
- **當前餘數非 0**：
  - 透過查表，將前一位置結尾的各餘數子陣列延伸一格，轉移到新的餘數。
  - 再補上僅含當前元素的單一子陣列。

```typescript
for (let index = 0; index < length; index++) {
  // Step 4：取得當前餘數並清空下一輪緩衝區

  if (value === 0) {
    // 乘上 k 的倍數會使所有以此處結尾的 index + 1 個子陣列歸入餘數 0
    nextCounts[0] = index + 1;
  } else {
    // 將每個以 index - 1 結尾的子陣列延伸至 nums[index]
    const rowOffset = value * k;
    for (let remainder = 0; remainder < k; remainder++) {
      nextCounts[productTable[rowOffset + remainder]] += currentCounts[remainder];
    }

    // 單一元素子陣列 [nums[index]]
    nextCounts[value] += 1;
  }

  // ...
}
```

### Step 6：將以此位置結尾的子陣列累加至答案

當前位置結尾的分布計算完成後，逐一累加進 `result`，使其涵蓋目前為止所有子陣列的統計。

```typescript
for (let index = 0; index < length; index++) {
  // Step 4：取得當前餘數並清空下一輪緩衝區

  // Step 5：計算以此位置結尾的子陣列分布

  // 將以此索引結尾的子陣列累加至答案
  for (let remainder = 0; remainder < k; remainder++) {
    result[remainder] += nextCounts[remainder];
  }

  // ...
}
```

### Step 7：交換兩組緩衝區

將剛算好的分布設為下一輪的「前一位置分布」，舊緩衝區則留作下一輪的計算空間。如此可避免在迴圈中重新配置記憶體。

```typescript
for (let index = 0; index < length; index++) {
  // Step 4：取得當前餘數並清空下一輪緩衝區

  // Step 5：計算以此位置結尾的子陣列分布

  // Step 6：累加至答案

  // 交換緩衝區，使迴圈內不發生任何記憶體配置
  const swapBuffer = currentCounts;
  currentCounts = nextCounts;
  nextCounts = swapBuffer;
}
```

### Step 8：轉換為一般陣列並回傳結果

掃描完成後，`result` 已記錄所有子陣列的餘數分布，將其轉為一般陣列後回傳。

```typescript
return Array.from(result);
```

## 時間複雜度

- 建立乘法查表需 $O(k^2)$；
- 主迴圈掃描 $n$ 個元素，每個元素的清空、轉移與累加皆為 $O(k)$，合計 $O(n \cdot k)$；
- 由於 $k \le 5$，查表成本可忽略。
- 總時間複雜度為 $O(n \cdot k)$。

> $O(n \cdot k)$

## 空間複雜度

- 乘法查表佔用 $O(k^2)$；
- 答案陣列與兩組計數緩衝區皆為 $O(k)$；
- 不隨輸入長度 $n$ 增長。
- 總空間複雜度為 $O(k^2)$。

> $O(k^2)$
