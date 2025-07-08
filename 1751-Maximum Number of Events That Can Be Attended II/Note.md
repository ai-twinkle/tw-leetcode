# 1751. Maximum Number of Events That Can Be Attended II

You are given an array of events where `events[i] = [startDay_i, endDay_i, value_i]`. 
The $i^{th}$ event starts at `startDay_i` and ends at `endDay_i`, and if you attend this event, you will receive a value of `value_i`. 
You are also given an integer `k` which represents the maximum number of events you can attend.

You can only attend one event at a time. 
If you choose to attend an event, you must attend the entire event. 
Note that the end day is inclusive: that is, you cannot attend two events where one of them starts and the other ends on the same day.

Return the maximum sum of values that you can receive by attending events.

**Constraints:**

- `1 <= k <= events.length`
- `1 <= k * events.length <= 10^6`
- `1 <= startDay_i <= endDay_i <= 10^9`
- `1 <= value_i <= 10^6`

## 基礎思路

本題的核心在於，如何在最多只能參加 $k$ 場活動且活動時間不得重疊的情況下，最大化參加活動的總價值。
為解決這個問題，可以採用以下步驟：

1. **排序與預處理**：
   首先根據活動的開始時間對所有活動進行排序，以利於後續有效判斷活動之間的可參與性。

2. **二分搜尋尋找下一可參加活動**：
   對每個活動透過二分搜尋預先計算「下一個可參加活動」的索引，以便快速跳轉到下一個不衝突的活動，避免重複檢查。

3. **動態規劃（DP）進行最優解選擇**：
   利用動態規劃建立狀態轉移方程，考量每個活動「參加」或「不參加」兩種情況，透過逐步疊代，求得最多參與 $k$ 場活動情況下的價值總和最大化。

透過以上步驟，可以有效解決活動安排的價值最佳化問題。

## 解題步驟

### Step 1：處理特殊情況並排序

首先處理特殊情況（如無活動或 $k$ 為 0 或 1 時）並將活動依開始時間排序：

```typescript
const numberOfEvents = events.length;
if (numberOfEvents === 0 || k === 0) {
  return 0;
}

// 如果只能參加一場活動，只需找出價值最高的活動。
if (k === 1) {
  let maximumSingleValue = 0;
  for (let eventIndex = 0; eventIndex < numberOfEvents; ++eventIndex) {
    const valueOfEvent = events[eventIndex][2];
    if (valueOfEvent > maximumSingleValue) {
      maximumSingleValue = valueOfEvent;
    }
  }
  return maximumSingleValue;
}

// 根據活動的開始時間排序。
events.sort((a, b) => a[0] - b[0]);
```

### Step 2：將活動資訊分別儲存

將排序後的活動資訊拆解為三個 TypedArray，以提高後續資料存取效率：

```typescript
const startDays = new Int32Array(numberOfEvents);
const endDays = new Int32Array(numberOfEvents);
const valuesOfEvents = new Int32Array(numberOfEvents);

for (let eventIndex = 0; eventIndex < numberOfEvents; ++eventIndex) {
  const [start, end, value] = events[eventIndex];
  startDays[eventIndex] = start;
  endDays[eventIndex] = end;
  valuesOfEvents[eventIndex] = value;
}
```

### Step 3：使用二分搜尋計算下一個可參加活動索引

透過二分搜尋，對每個活動找出下一個可參加活動的索引：

```typescript
const nextEventIndex = new Int32Array(numberOfEvents);

for (let eventIndex = 0; eventIndex < numberOfEvents; ++eventIndex) {
  const nextPossibleStart = endDays[eventIndex] + 1;
  let low = eventIndex + 1;
  let high = numberOfEvents;

  while (low < high) {
    const mid = (low + high) >>> 1;
    if (startDays[mid] < nextPossibleStart) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  nextEventIndex[eventIndex] = low;
}
```

### Step 4：動態規劃計算最大價值總和

使用動態規劃求出最多參加 $k$ 場活動的最大價值總和，透過兩個 DP 陣列交替使用，降低記憶體使用量：

```typescript
let previousDPRow = new Int32Array(numberOfEvents + 1);
let currentDPRow = new Int32Array(numberOfEvents + 1);
let maximumTotalValue = 0;

for (let attendCount = 1; attendCount <= k; ++attendCount) {
  for (let eventIndex = numberOfEvents - 1; eventIndex >= 0; --eventIndex) {
    // 跳過當前活動的情況
    const skipValue = currentDPRow[eventIndex + 1];
    // 參加當前活動的情況
    const takeValue = valuesOfEvents[eventIndex] + previousDPRow[nextEventIndex[eventIndex]];
    // 兩者中選擇最大值
    currentDPRow[eventIndex] = skipValue > takeValue ? skipValue : takeValue;
  }
  
  maximumTotalValue = currentDPRow[0];
  
  // 更新 DP 陣列，準備下一輪迭代
  const tempRow = previousDPRow;
  previousDPRow = currentDPRow;
  currentDPRow = tempRow;
}

return maximumTotalValue;
```

## 時間複雜度

- 排序活動的時間複雜度為 $O(n \log n)$。
- 預計算下一個活動索引的二分搜尋時間複雜度為 $O(n \log n)$。
- 動態規劃過程總共需要 $k$ 次迭代，每次 $O(n)$，總計 $O(kn)$。
- 總時間複雜度為 $O(n\log n + kn)$。

> $O(n\log n + kn)$

## 空間複雜度

- 使用 TypedArray 儲存開始日、結束日、價值與下一個活動索引，共需 $O(n)$ 空間。
- 使用兩個 DP 陣列（輪流交替使用）各需要 $O(n)$，總計仍為 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
