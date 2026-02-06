# 3634. Minimum Removals to Balance Array

You are given an integer array `nums` and an integer `k`.

An array is considered balanced if the value of its maximum element is at most `k` times the minimum element.

You may remove any number of elements from `nums` without making it empty.

Return the minimum number of elements to remove so that the remaining array is balanced.

Note: An array of size 1 is considered balanced as its maximum and minimum are equal, and the condition always holds true.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^9`
- `1 <= k <= 10^5`

## 基礎思路

本題允許刪除任意元素（但不能刪到空），要讓留下來的陣列滿足「最大值 ≤ k × 最小值」。我們要最小化刪除數量，等價於**最大化保留下來且符合條件的元素數量**，最後用 `n - 最大可保留數` 得到答案。

在思考解法時，有幾個關鍵觀察：

* **留下的集合只需關注最小值與最大值**：平衡條件只與 min/max 有關，因此若我們能找到一段候選集合，其最小與最大滿足約束，這段內的其他元素自然也滿足。
* **排序後可將問題轉成找最長合法區間**：排序後，任何連續區間的最小值是左端、最大值是右端。條件變成：區間右端值 ≤ k × 區間左端值。這使得問題可用雙指標線性掃描。
* **k = 1 是特殊情況**：此時條件等價於「最大值 ≤ 最小值」，只可能在所有元素相等時成立，因此最佳解是保留**最多重複次數的同值元素**。

因此策略如下：

* 先排序。
* 若 `k = 1`，找排序後最長的「相等值連續段」長度，保留該段即可。
* 否則用雙指標維持一個合法區間，嘗試最大化區間長度；最終刪除數是 `n - 最佳區間長度`。

## 解題步驟

### Step 1：處理極小輸入並準備排序容器

若陣列長度 ≤ 1，必定平衡，答案為 0。接著建立 TypedArray 並將輸入複製進去以便排序。

```typescript
const length = nums.length;
if (length <= 1) {
  return 0;
}

// 使用 TypedArray 以提升記憶體區域性與加速數值排序
const sortedValues = new Int32Array(length);
for (let index = 0; index < length; index++) {
  sortedValues[index] = nums[index];
}
sortedValues.sort();
```

### Step 2：處理 k === 1 的快速分支

當 `k === 1` 時，平衡條件只可能在「所有保留值相等」時成立，因此只要找出排序後最大連續相等段的長度，刪除其餘元素即可。

```typescript
// 快速路徑：當 k === 1 時，保留元素必須全部相等（max <= min）
if (k === 1) {
  let bestFrequency = 1;
  let currentFrequency = 1;

  for (let index = 1; index < length; index++) {
    if (sortedValues[index] === sortedValues[index - 1]) {
      currentFrequency++;
    } else {
      if (currentFrequency > bestFrequency) {
        bestFrequency = currentFrequency;
      }
      currentFrequency = 1;
    }
  }

  if (currentFrequency > bestFrequency) {
    bestFrequency = currentFrequency;
  }

  return length - bestFrequency;
}
```

### Step 3：初始化雙指標視窗以找最長合法區間

在一般情況（`k > 1`），排序後用雙指標維持一個區間，使其滿足「右端值 ≤ k × 左端值」，並追蹤最長區間長度。

```typescript
// 以雙指標找出最長區間，使其滿足 max <= k * min
let leftIndex = 0;
let bestWindowLength = 1;

for (let rightIndex = 0; rightIndex < length; rightIndex++) {
  const rightValue = sortedValues[rightIndex];

  // ...
}
```

### Step 4：視窗不合法時，推進 leftIndex 直到恢復合法

若當前右端值太大（`rightValue > sortedValues[leftIndex] * k`），代表以目前左端作為最小值無法滿足條件，必須不斷右移左端直到合法。

```typescript
for (let rightIndex = 0; rightIndex < length; rightIndex++) {
  // Step 3：初始化雙指標視窗以找最長合法區間

  const rightValue = sortedValues[rightIndex];

  // 推進 leftIndex，直到區間重新滿足平衡條件
  while (leftIndex <= rightIndex && rightValue > sortedValues[leftIndex] * k) {
    leftIndex++;
  }

  // ...
}
```

### Step 5：用合法視窗更新最佳答案，最後回傳最少刪除數

當視窗合法時，其長度為 `rightIndex - leftIndex + 1`，更新最大可保留數量；最後用 `length - bestWindowLength` 得到最少刪除數。

```typescript
for (let rightIndex = 0; rightIndex < length; rightIndex++) {
  // Step 3：初始化雙指標視窗以找最長合法區間

  // Step 4：視窗不合法時推進 leftIndex

  const windowLength = rightIndex - leftIndex + 1;
  if (windowLength > bestWindowLength) {
    bestWindowLength = windowLength;
  }
}

return length - bestWindowLength;
```

## 時間複雜度

- 建立 `sortedValues` 並複製資料：$O(n)$。
- 排序 `sortedValues.sort()`：$O(n \log n)$。
- 分支 `k === 1`：單次線性掃描計算最大連續相等段：$O(n)$（但仍包含前面的排序 $O(n \log n)$）。
- 分支 `k > 1`：雙指標掃描，`rightIndex` 走訪一次、`leftIndex` 最多前進到 `n` 次，總計 $O(n)$（同樣仍包含前面的排序 $O(n \log n)$）。
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- `sortedValues` 為長度 `n` 的 `Int32Array`：$O(n)$。
- 其餘變數皆為常數空間：$O(1)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
