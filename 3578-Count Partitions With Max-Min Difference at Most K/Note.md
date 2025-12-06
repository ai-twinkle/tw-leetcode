# 3578. Count Partitions With Max-Min Difference at Most K

You are given an integer array `nums` and an integer `k`. 
Your task is to partition `nums` into one or more non-empty contiguous segments such that in each segment, 
the difference between its maximum and minimum elements is at most `k`.

Return the total number of ways to partition `nums` under this condition.

Since the answer may be too large, return it modulo `10^9 + 7`.

**Constraints:**

- `2 <= nums.length <= 5 * 10^4`
- `1 <= nums[i] <= 10^9`
- `0 <= k <= 10^9`

## 基礎思路

本題要求將陣列劃分為一段或多段**相鄰且非空**的區間，使得每一段中「最大值與最小值的差」都不超過給定的門檻。
最終要計算所有滿足條件的劃分方式數量，並對一個固定模數取模。

可以從兩個角度來理解這個問題：

* **區間是否合法（max−min 限制）**
  對於任意一個結尾位置，要知道有哪些起點可以形成「最大值與最小值差不超過門檻」的區間。這是一個典型的滑動視窗問題：

    * 當右端往右擴張時，可以用兩個單調結構維護當前視窗中的最大值與最小值。
    * 一旦區間不合法，就從左端開始收縮，直到再次滿足限制為止。

* **合法區間如何轉化為劃分數量（動態規劃）**
  若某一位置可以與多個不同的起點形成合法區間，則每一種起點對應的前一段劃分方式，都可以延伸成新的合法劃分：

    * 對每個結尾位置，統計所有合法起點對應的「前一位置的劃分方式總和」，即為此結尾位置對應的新增劃分數量。
    * 為避免重複加總，會使用前綴和技巧，在常數時間內取得一段連續範圍的動態規劃狀態總和。

整體策略可以概括為：

* 使用兩個單調雙端佇列，隨著右端指標前進，維護當前視窗的最大值與最小值，並適時移動左端指標，以確保視窗始終合法。
* 建立一個動態規劃狀態，代表「前綴被完全切分」的劃分方式數量，再透過前綴和資料結構，加速「某一區間內所有狀態的總和」查詢。
* 每當視窗更新後，對應的合法起點區間即可轉化為一段連續的索引範圍，從中快速取得總和並更新當前位置的劃分數量。
* 將所有結果統一在固定模數下運算，避免數值溢位。

此設計同時結合滑動視窗、單調雙端佇列與前綴和加速的動態規劃，在時間與空間上都能符合題目規模需求。

## 解題步驟

### Step 1：定義統一使用的模數常數

先定義一個全域常數作為取模基準，後續所有計數相關運算都會在此模數下進行，避免數值溢位並確保結果統一。

```typescript
const MODULO_VALUE: number = 1_000_000_007;
```

### Step 2：初始化動態規劃與前綴和結構

接著處理主要邏輯：
先取得陣列長度，並建立兩個長度為「元素個數加一」的陣列：

* 一個用來記錄「每個前綴可以被完全劃分的方式數量」。
* 另一個用來記錄這些方式數量的前綴和，方便之後快速查詢一段連續範圍的總和。

一開始空前綴有「剛好一種」合法狀態（尚未切出任何區間），兩個結構皆需對應此基底情況。

```typescript
const length = nums.length;

// dp[i] = 將 nums[0..i-1] 分割的方式數量
const dp = new Int32Array(length + 1);

// prefix[i] = (dp[0] + dp[1] + ... + dp[i]) 對 MODULO_VALUE 取模後的結果
const prefix = new Int32Array(length + 1);

// 基底情況：空前綴只有一種方式（尚未切出任何區段）
dp[0] = 1;
prefix[0] = 1;
```

### Step 3：準備單調雙端佇列與滑動視窗邊界

為了在滑動視窗中快速取得當前區間的最大值與最小值，使用兩個雙端佇列來存索引：

* 一個保持對應值遞減，用來查詢最大值。
* 一個保持對應值遞增，用來查詢最小值。

同時，以額外的頭指標模擬「從前端彈出」的行為，避免使用成本較高的 `shift()`。
另外，使用一個左端指標來代表目前視窗的起點位置。

```typescript
// 遞增與遞減雙端佇列儲存索引；透過維護頭指標避免使用 shift()
const maxDequeIndices: number[] = [];
const minDequeIndices: number[] = [];
let maxDequeHeadIndex = 0;
let minDequeHeadIndex = 0;

// 目前合法視窗的左邊界索引
let leftIndex = 0;
```

### Step 4：滑動視窗遍歷陣列並更新動態規劃狀態

使用右端指標從左到右掃描整個陣列。
對於每個新加入的元素，需要依序完成以下幾件事：

1. **更新維護最大值的雙端佇列**：
   從尾端移除所有不再可能成為最大值的索引，使佇列維持遞減，再將當前索引加入尾端。

2. **更新維護最小值的雙端佇列**：
   同樣從尾端移除所有不再可能成為最小值的索引，使佇列維持遞增，再將當前索引加入尾端。

3. **調整左端邊界以維持區間合法**：
   根據雙端佇列頭部取得當前視窗的最大值與最小值，
   若差值超過允許門檻，就向右移動左端，並同步清除已經滑出視窗的索引。

4. **根據合法起點區間更新動態規劃狀態**：
   一旦區間 `[leftIndex, rightIndex]` 合法，代表所有起點在這個範圍內的前綴都可以作為上一段的結尾，
   透過前綴和結構，可以在常數時間內取得對應範圍的總和，作為新的狀態值。
   接著對該值進行取模與非負化處理，並更新前綴和。

```typescript
for (let rightIndex = 0; rightIndex < length; rightIndex++) {
  const currentValue = nums[rightIndex];

  // 維護遞減雙端佇列以追蹤區間內的最大值
  while (
    maxDequeIndices.length > maxDequeHeadIndex &&
    nums[maxDequeIndices[maxDequeIndices.length - 1]] <= currentValue
    ) {
    maxDequeIndices.pop();
  }
  maxDequeIndices.push(rightIndex);

  // 維護遞增雙端佇列以追蹤區間內的最小值
  while (
    minDequeIndices.length > minDequeHeadIndex &&
    nums[minDequeIndices[minDequeIndices.length - 1]] >= currentValue
    ) {
    minDequeIndices.pop();
  }
  minDequeIndices.push(rightIndex);

  // 持續縮小 leftIndex，直到視窗 [leftIndex, rightIndex] 滿足 max - min <= k
  while (leftIndex <= rightIndex) {
    const currentMaximum = nums[maxDequeIndices[maxDequeHeadIndex]];
    const currentMinimum = nums[minDequeIndices[minDequeHeadIndex]];

    if (currentMaximum - currentMinimum <= k) {
      // 視窗已合法，可以停止縮小
      break;
    }

    // 右移左邊界以嘗試恢復視窗為合法狀態
    leftIndex++;

    // 從雙端佇列頭部移除已經滑出視窗範圍的索引
    if (maxDequeIndices[maxDequeHeadIndex] < leftIndex) {
      maxDequeHeadIndex++;
    }
    if (minDequeIndices[minDequeHeadIndex] < leftIndex) {
      minDequeHeadIndex++;
    }
  }

  // 使用前綴和計算 dp[rightIndex + 1]，等於區間 dp[leftIndex..rightIndex] 的總和
  let currentWays = prefix[rightIndex];
  if (leftIndex > 0) {
    currentWays -= prefix[leftIndex - 1];
  }

  // 對結果取模並確保為非負值
  currentWays %= MODULO_VALUE;
  if (currentWays < 0) {
    currentWays += MODULO_VALUE;
  }

  dp[rightIndex + 1] = currentWays;

  // 更新前綴和：prefix[i] = prefix[i - 1] + dp[i]（取模後）
  let newPrefix = prefix[rightIndex] + currentWays;
  if (newPrefix >= MODULO_VALUE) {
    newPrefix -= MODULO_VALUE;
  }
  prefix[rightIndex + 1] = newPrefix;
}
```

### Step 5：回傳整個陣列被完全劃分的方式數量

當右端指標完成整個陣列的掃描後，最後一個動態規劃狀態即代表「整個陣列被切分成若干合法區段」的總方式數量，直接回傳即可。

```typescript
// 最終答案為將整個陣列切分的方式數量
return dp[length];
```

## 時間複雜度

- 每個元素在遞增與遞減雙端佇列中至多被加入與移除各一次。
- 每個位置的狀態更新與前綴和操作皆為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 需要長度為 $n + 1$ 的動態規劃陣列與前綴和陣列。
- 兩個雙端佇列在最壞情況下總共可能同時儲存 $O(n)$ 個索引。
- 其他只使用常數額外變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
