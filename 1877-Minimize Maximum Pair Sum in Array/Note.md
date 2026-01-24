# 1877. Minimize Maximum Pair Sum in Array

The pair sum of a pair `(a,b)` is equal to `a + b`. 
The maximum pair sum is the largest pair sum in a list of pairs.

- For example, if we have pairs `(1,5)`, `(2,3)`, and `(4,4)`, the maximum pair sum 
  would be `max(1+5, 2+3, 4+4) = max(6, 5, 8) = 8`.

Given an array `nums` of even length `n`, pair up the elements of `nums` into `n / 2` pairs such that:

- Each element of `nums` is in exactly one pair, and
- The maximum pair sum is minimized.

Return the minimized maximum pair sum after optimally pairing up the elements.

**Constraints:**

- `n == nums.length`
- `2 <= n <= 10^5`
- `n` is even.
- `1 <= nums[i] <= 10^5`

## 基礎思路

本題要把長度為偶數的陣列分成 `n/2` 對，使「每對兩數相加的最大值」盡量小。
關鍵在於：若想讓最大對和最小，就不能讓大的數彼此配對，否則會把最大值拉得更高。

在思考解法時，可掌握以下核心觀察：

* **最佳配對型態**：把「最小的」與「最大的」配成一對、次小配次大……，能把每一對的和壓到較平均，並使最大對和最小化。
* **等價於排序後雙指針**：若把數列排序，從兩端往中間配對，最大對和會被最小化。
* **避免排序成本**：由於數值範圍固定（`1..10^5`），可用「計數」方式取得由小到大與由大到小的取值順序，達到與排序等價的效果，但省去一般排序的比較成本。
* **逐步形成配對並追蹤最大值**：每形成一批「最小值 + 最大值」配對，就更新目前見到的最大對和；最後的答案就是整個過程中的最大值。

## 解題步驟

### Step 1：初始化長度、計數表與最小/最大值

準備用固定範圍的計數表記錄每個值出現次數，並同時追蹤整體最小值與最大值，縮小之後掃描範圍。

```typescript
const length = nums.length;

// 針對所有可能值建立次數表，用以取代排序
const frequency = new Uint32Array(100001);

let minimumValue = 100000;
let maximumValue = 1;
```

### Step 2：遍歷陣列，統計次數並更新值域範圍

一次掃描把每個數的出現次數加到計數表，同時更新最小值與最大值。

```typescript
for (let index = 0; index < length; index++) {
  const value = nums[index];
  frequency[value]++;

  if (value < minimumValue) {
    minimumValue = value;
  }
  if (value > maximumValue) {
    maximumValue = value;
  }
}
```

### Step 3：特判所有元素相同

若最小值等於最大值，代表所有元素都一樣，任何配對的對和都相同，直接回傳即可。

```typescript
// 若所有元素相同，則每對的和都一樣
if (minimumValue === maximumValue) {
  return minimumValue + maximumValue;
}
```

### Step 4：初始化值域指針、快取計數、剩餘配對數與答案

以值域的兩端作為低/高指針，並把當前值的剩餘數量快取到變數中，降低重複存取成本；同時計算要形成的配對總數與答案追蹤變數。

```typescript
// 以值域指針取代索引指針
let lowValue = minimumValue;
let highValue = maximumValue;

// 將計數快取在區域變數中，避免重複存取 TypedArray
let lowCount = frequency[lowValue];
let highCount = frequency[highValue];

// 尚需形成的配對數量
let pairsRemaining = length >> 1;

// 追蹤所有配對中的最大對和
let maximumPairSum = 0;
```

### Step 5：主迴圈 — 不斷取出當前可用的最小值與最大值

每次迭代都要把低指針移到下一個仍有剩餘的值，把高指針移到上一個仍有剩餘的值，確保當前兩端可用來配對。

```typescript
while (pairsRemaining > 0) {
  // 將低指針移到仍有剩餘元素的下一個值
  while (lowCount === 0) {
    lowValue++;
    lowCount = frequency[lowValue];
  }

  // 將高指針移到仍有剩餘元素的上一個值
  while (highCount === 0) {
    highValue--;
    highCount = frequency[highValue];
  }

  // ...
}
```

### Step 6：計算當前配對的對和並更新最大值

以「當前最小值 + 當前最大值」形成配對，這一步的對和代表此時的最壞情況候選，需更新全域最大對和。

```typescript
while (pairsRemaining > 0) {
  // Step 5：主迴圈 — 取得當前可用最小值與最大值

  // 目前最小與最大配對，對和會是此步的最壞候選
  const pairSum = lowValue + highValue;
  if (pairSum > maximumPairSum) {
    maximumPairSum = pairSum;
  }

  // ...
}
```

### Step 7：處理指針相遇情況

當低值與高值相同時，剩下的元素只能彼此配對，最大對和在此後不會再被更大的值影響，因此可結束迴圈。

```typescript
while (pairsRemaining > 0) {
  // Step 5：主迴圈 — 取得當前可用最小值與最大值

  // Step 6：更新最大對和

  // 當兩端指針相遇時，剩餘元素只能自配
  if (lowValue === highValue) {
    break;
  }

  // ...
}
```

### Step 8：批次消耗可形成的配對數量並更新剩餘數

在固定的 `lowValue` 與 `highValue` 下，可一次形成 `min(lowCount, highCount)` 對，並同步扣除兩端的剩餘數量與待配對數量。

```typescript
while (pairsRemaining > 0) {
  // Step 5：主迴圈 — 取得當前可用最小值與最大值

  // Step 6：更新最大對和

  // Step 7：處理指針相遇情況

  // 盡可能在當前 lowValue 與 highValue 間形成更多配對
  const usedPairs = lowCount < highCount ? lowCount : highCount;
  pairsRemaining -= usedPairs;

  lowCount -= usedPairs;
  highCount -= usedPairs;
}
```

### Step 9：回傳最終的最小化最大對和

主迴圈結束後，`maximumPairSum` 即為最小化後的最大對和。

```typescript
return maximumPairSum;
```

## 時間複雜度

- 第一次掃描 `nums` 統計次數並找值域：執行 `n` 次，為 $O(n)$。
- 主迴圈配對：
  - 每個元素至多被配對一次（以批次消耗計數），總處理量為 $O(n)$；
  - 指針在固定值域上界內單調移動，屬於常數成本 $O(1)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用固定大小（由題目數值上界決定）的次數表，額外空間為 $O(1)$。
- 其餘變數皆為常數額外空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
