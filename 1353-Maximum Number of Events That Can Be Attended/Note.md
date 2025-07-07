# 1353. Maximum Number of Events That Can Be Attended

You are given an array of `events` where `events[i] = [startDay_i, endDay_i]`. 
Every event `i` starts at `startDay_i` and ends at `endDay_i`.

You can attend an event `i` at any day `d` where `startTime_i <= d <= endTime_i`. 
You can only attend one event at any time `d`.

Return the maximum number of events you can attend.

**Constraints:**

- `1 <= events.length <= 10^5`
- `events[i].length == 2`
- `1 <= startDay_i <= endDay_i <= 10^5`

## 基礎思路

本題的核心在於如何有效率地參與最多數量的活動。
因為每一天只能參與一個活動，為達成最大化，直觀上應優先選擇結束日最早的活動，這樣後續有更多天可用來參與其他活動。
因此，我們可以採用貪心策略：

- 先依照每個活動的結束日由早到晚排序。
- 在每個活動可參加的日期範圍內，盡可能選擇最早的未使用的日期來參與活動。
- 使用聯集-查找（Union-Find）資料結構紀錄每一天的可用情況，以快速確認並標記已參與的日期。

透過這個策略，我們能有效地選取最多的活動數量。

## 解題步驟

### Step 1：找出需要處理的最大日期範圍

首先，遍歷所有事件，找出事件中最晚的結束日期，以確定需要處理的最大日期範圍。

```typescript
// 1. 找出所有事件中的最大結束日期，以確認所需處理的日期範圍
let maximumEndDay = 0;
for (let eventIndex = 0; eventIndex < totalEventCount; eventIndex++) {
  const eventEndDay = events[eventIndex][1];
  if (eventEndDay > maximumEndDay) {
    maximumEndDay = eventEndDay;
  }
}
```

### Step 2：將事件依照結束日進行排序（貪心策略）

將所有事件按照結束日期從早到晚排序，使得較早結束的事件能優先被參與，以達成最多事件數。

```typescript
// 2. 將所有事件依照結束日由早至晚排序，實踐貪心策略
events.sort(
  (firstEvent, secondEvent) => firstEvent[1] - secondEvent[1]
);
```

### Step 3：建立聯集–查找結構以追蹤日期狀態

建立一個聯集–查找（Union-Find）資料結構，追蹤日期的使用情形：

- `dayParent[d]`：代表從日期 `d` 開始，往後第一個未被占用的可用日期。

```typescript
// 3. 建立一個聯集-查找結構 (dayParent) 以紀錄日期是否被使用
//    dayParent[d] 表示從第 d 天開始往後的第一個可用日期
const dayParent = new Int32Array(maximumEndDay + 2);
for (let dayIndex = 0; dayIndex < dayParent.length; dayIndex++) {
  dayParent[dayIndex] = dayIndex;
}
```

### Step 4：實現聯集–查找函數（附路徑壓縮）

為了加速日期查詢效率，實現附帶路徑壓縮的聯集–查找函數：

- 每次查詢時，將路徑上遇到的日期直接指向找到的第一個可用日期，避免未來重複查詢同一路徑。

```typescript
// 4. 實現帶路徑壓縮的聯集–查找函數，用來快速找到最早可用日期
function findNextAvailableDay(queriedDay: number): number {
  let rootDay = queriedDay;
  // 向上追溯，直到找到根節點 (即未被使用的日期)
  while (dayParent[rootDay] !== rootDay) {
    rootDay = dayParent[rootDay];
  }
  // 將路徑上的節點直接指向根節點，實現路徑壓縮
  let compressIndex = queriedDay;
  while (dayParent[compressIndex] !== rootDay) {
    const nextIndex = dayParent[compressIndex];
    dayParent[compressIndex] = rootDay;
    compressIndex = nextIndex;
  }
  return rootDay;
}
```

### Step 5：依照貪心策略參與事件，統計最終結果

最後，依照排序後的事件列表，逐一選取最早可參加日期，若有合適的日期就參與，並更新聯集–查找結構。

```typescript
// 5. 根據貪心策略依序參與每個事件
let attendedCount = 0;
for (let eventIndex = 0; eventIndex < totalEventCount; eventIndex++) {
  const eventStartDay = events[eventIndex][0];
  const eventEndDay = events[eventIndex][1];

  // 找到可用日期中最早的一天
  const chosenDay = findNextAvailableDay(eventStartDay);

  // 如果該日期落在事件可參與的範圍內，則參與此事件
  if (chosenDay <= eventEndDay) {
    attendedCount++;
    // 將當前使用的日期標記為已用，並更新為下一個可用日期
    dayParent[chosenDay] = findNextAvailableDay(chosenDay + 1);
  }
}

return attendedCount;
```

## 時間複雜度

- 計算最大結束日需遍歷所有活動，時間為 $O(n)$。
- 將所有活動排序，需 $O(n \log n)$ 時間。
- 透過 Union-Find 處理每個活動，總計約為 $O(n \cdot \alpha(D))$，其中 $D$ 為最大日期，$\alpha$ 為反阿克曼函數。
- 總時間複雜度為 $O(n\log n + D + n \cdot \alpha(D))$，簡化為 $O(n\log n + D)$。

> $O(n\log n + D)$

## 空間複雜度

- 使用了一個長度為最大日期數量的 Union-Find 陣列。
- 總空間複雜度為 $O(D)$。

> $O(D)$
