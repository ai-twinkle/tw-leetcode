# 3349. Adjacent Increasing Subarrays Detection I

Given an array nums of `n` integers and an integer `k`, 
determine whether there exist two adjacent subarrays of length `k` such that both subarrays are strictly increasing. 
Specifically, check if there are two subarrays starting at indices `a` and `b` `(a < b)`, where:

- Both subarrays `nums[a..a + k - 1]` and `nums[b..b + k - 1]` are strictly increasing.
- The subarrays must be adjacent, meaning `b = a + k`.

Return `true` if it is possible to find two such subarrays, and `false` otherwise.

**Constraints:**

- `2 <= nums.length <= 100`
- `1 < 2 * k <= nums.length`
- `-1000 <= nums[i] <= 1000`

## 基礎思路

本題要求在整數陣列 `nums` 中，判斷是否存在兩段**長度為 `k` 且相鄰**的子陣列，並且兩段都必須是**嚴格遞增序列**。

具體而言，我們需檢查是否存在起始索引 `a` 與 `b = a + k`，使得：

* 子陣列 `nums[a..a + k - 1]` 與 `nums[b..b + k - 1]` 都為嚴格遞增；
* 且這兩個子陣列緊鄰、不重疊。

在思考解法時，我們需要注意幾個重點：

* **嚴格遞增的定義**：對於一段連續序列 `[x₁, x₂, …, xₖ]`，必須滿足 `x₁ < x₂ < … < xₖ`。
* **相鄰條件**：第二段的起始位置必須恰好接在第一段結束之後，不能有重疊或間隔。
* **連續遞增段（run）**：若一段遞增序列足夠長，可能同時包含兩個長度為 `k` 的子段。

為了高效檢查整個陣列，可以採用以下策略：

* **線性掃描法（one-pass）**：以指標從頭掃描，找出每一段最長的嚴格遞增區間（稱為一個 run）。
* **檢查每個 run 的長度**：

    * 若某一個 run 的長度 ≥ `2k`，代表該 run 內即可形成兩個相鄰遞增子陣列。
    * 否則若有兩個相鄰 run，各自長度 ≥ `k`，也能構成符合條件的兩段。
* **狀態紀錄**：以布林變數記錄「上一個 run 是否符合長度 ≥ k」，當前 run 也符合時，即可返回 `true`。

這樣即可在一次線性掃描中完成判斷，時間複雜度為 $O(n)$，且無需額外空間。

## 解題步驟

### Step 1：處理邊界條件

若 `k = 1`，任何兩個相鄰元素即可構成兩段長度為 1 的遞增子陣列；若陣列長度不足 `2k`，則無法形成兩段。

```typescript
// 取得陣列長度
const length = nums.length;

// 若 k = 1，只需確認是否至少有兩個元素
if (k === 1) {
  return length >= 2;
}

// 若總長度不足 2k，無法形成兩段相鄰子陣列
const needed = k + k;
if (length < needed) {
  return false;
}
```

### Step 2：初始化狀態變數

用布林變數 `previousRunQualifies` 紀錄「上一個遞增區間」是否已達長度 `k`。

```typescript
// 紀錄前一段遞增區間是否長度達 k
let previousRunQualifies = false;
```

### Step 3：主迴圈 — 掃描整個陣列並切分遞增區段

以 `startIndex` 作為遞增區段開頭，往右延伸直到遇到非遞增元素為止。

```typescript
// 以區間起點進行線性掃描
for (let startIndex = 0; startIndex < length; ) {
  let endIndex = startIndex + 1;

  // 向右延伸遞增區段，直到不再嚴格遞增為止
  while (endIndex < length && nums[endIndex] > nums[endIndex - 1]) {
    endIndex += 1;
  }

  // 計算當前遞增區段長度
  const runLength = endIndex - startIndex;

  // ...
}
```

### Step 4：檢查單段是否足以包含兩段遞增子陣列

若當前遞增區段長度 ≥ `2k`，即可在區段內構成兩段相鄰遞增子陣列。

```typescript
for (let startIndex = 0; startIndex < length; ) {
  // Step 3：主迴圈 — 掃描整個陣列並切分遞增區段

  // 若單段遞增區間已足以包含兩段長度為 k 的子陣列，直接回傳 true
  if (runLength >= needed) {
    return true;
  }

  // ...
}
```

### Step 5：檢查兩段相鄰的遞增區段

若當前區段長度 ≥ `k`，且上一段也符合長度 ≥ `k`，即為兩段相鄰遞增子陣列。

```typescript
for (let startIndex = 0; startIndex < length; ) {
  // Step 3：主迴圈 — 掃描整個陣列並切分遞增區段
  
  // Step 4：檢查單段是否足以包含兩段遞增子陣列
  
  // 若當前區段長度達 k，檢查是否與上一段相鄰且符合條件
  if (runLength >= k) {
    if (previousRunQualifies) {
      return true;
    }
    previousRunQualifies = true;
  } else {
    // 若區段太短，重設狀態（不再相鄰）
    previousRunQualifies = false;
  }
  
  // ...
}
```

### Step 6：更新下一段起點

將 `startIndex` 移至當前 run 結束位置，繼續掃描。

```typescript
for (let startIndex = 0; startIndex < length; ) {
  // Step 3：主迴圈 — 掃描整個陣列並切分遞增區段

  // Step 4：檢查單段是否足以包含兩段遞增子陣列
  
  // Step 5：檢查兩段相鄰的遞增區段
  
  // 下一個遞增區段從非遞增元素開始
  startIndex = endIndex;
}
```

### Step 7：若未找到符合條件的區段，回傳 false

若整個陣列掃描完未觸發條件，返回 `false`。

```typescript
// 若整個陣列無法找到符合條件的兩段遞增子陣列
return false;
```

## 時間複雜度

- 單次線性掃描整個陣列，每個元素僅被訪問一次。
- 所有比較與狀態更新均為常數操作。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用數個整數與布林變數儲存狀態，不依賴額外資料結構。
- 無額外陣列或集合空間需求。
- 總空間複雜度為 $O(1)$。

> $O(1)$
