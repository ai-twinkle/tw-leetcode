# 3440. Reschedule Meetings for Maximum Free Time II

You are given an integer `eventTime` denoting the duration of an event. 
You are also given two integer arrays `startTime` and `endTime`, each of length `n`.

These represent the start and end times of `n` non-overlapping meetings that occur during the event between time `t = 0` and time `t = eventTime`, 
where the $i^{th}$ meeting occurs during the time `[startTime[i], endTime[i]]`.

You can reschedule at most one meeting by moving its start time while maintaining the same duration, 
such that the meetings remain non-overlapping, 
to maximize the longest continuous period of free time during the event.

Return the maximum amount of free time possible after rearranging the meetings.

Note that the meetings can not be rescheduled to a time outside the event and they should remain non-overlapping.

Note: In this version, it is valid for the relative ordering of the meetings to change after rescheduling one meeting.

**Constraints:**

- `1 <= eventTime <= 10^9`
- `n == startTime.length == endTime.length`
- `2 <= n <= 10^5`
- `0 <= startTime[i] < endTime[i] <= eventTime`
- `endTime[i] <= startTime[i + 1]` where `i` lies in the range `[0, n - 2]`.

## 基礎思路

本題的核心目標是透過調整至多一場會議的時間，以達成最大化整體活動期間內最長的連續空閒時間區段。
因此，在實作前，我們可以依照以下的策略進行規劃：

1. 首先，針對所有會議原有的空閒區間（即會議之間及活動開始前、結束後）進行分析，記錄各個空閒區間的長度，並找到當前最長的空閒時間。
2. 接著考量移動某一場會議可能帶來的效果：
    - 移動一場會議將使原本相鄰的兩個空閒區間合併成更長的一段空閒區間。
    - 我們再考量將此會議重新放入其他空閒區間，觀察是否會進一步延長最大空閒區間。
3. 因此，每一場會議都要被視作移動的候選對象，透過逐一嘗試並即時記錄最好的結果，從而找到最優的空閒時間。


簡言之，本題透過「分析原有空閒時間 + 枚舉每場會議調整後的潛在效果」以找出最優的調整策略。

## 解題步驟

### Step 1：初始化並轉換資料格式

首先我們將原有的 `startTime` 與 `endTime` 轉換為 `Uint32Array`，便於後續操作：

```typescript
const meetingCount = startTime.length;
const startTimes = new Uint32Array(startTime);
const endTimes = new Uint32Array(endTime);
```

* `meetingCount`：紀錄會議總數。
* `startTimes`、`endTimes`：將輸入的會議起訖時間以方便計算的型態儲存。

### Step 2：計算所有原始空閒區間

接下來，我們計算在活動時間內的所有空閒區間長度（包括開始前、會議間與結束後）：

```typescript
const totalGapCount = meetingCount + 1;
const freeTimeGaps = new Uint32Array(totalGapCount);

// 活動開始到第一場會議之前的空閒時間
freeTimeGaps[0] = startTimes[0];

// 每兩個會議之間的空閒時間
for (let meetingIndex = 1; meetingIndex < meetingCount; ++meetingIndex) {
  freeTimeGaps[meetingIndex] = startTimes[meetingIndex] - endTimes[meetingIndex - 1];
}

// 最後一場會議到活動結束的空閒時間
freeTimeGaps[meetingCount] = eventTime - endTimes[meetingCount - 1];
```

### Step 3：找出原始最大空閒區間及前三大的空閒區間

透過掃描，我們記錄原始狀態下的最長空閒區間，以及前三大空閒區間的資訊，方便後續快速查詢：

```typescript
let largestOriginalFreeTime = 0;
let largestGapValue1 = 0, largestGapIndex1 = -1;
let largestGapValue2 = 0, largestGapIndex2 = -1;
let largestGapValue3 = 0;

for (let gapIndex = 0; gapIndex < totalGapCount; ++gapIndex) {
  const currentGap = freeTimeGaps[gapIndex];

  // 更新原始最大空閒時間
  if (currentGap > largestOriginalFreeTime) {
    largestOriginalFreeTime = currentGap;
  }

  // 同時維護前三大的空閒區間
  if (currentGap > largestGapValue1) {
    largestGapValue3 = largestGapValue2;
    largestGapValue2 = largestGapValue1;
    largestGapIndex2 = largestGapIndex1;
    largestGapValue1 = currentGap;
    largestGapIndex1 = gapIndex;
  } else if (currentGap > largestGapValue2) {
    largestGapValue3 = largestGapValue2;
    largestGapValue2 = currentGap;
    largestGapIndex2 = gapIndex;
  } else if (currentGap > largestGapValue3) {
    largestGapValue3 = currentGap;
  }
}
```

### Step 4：預先計算每場會議的持續時間

為加快後續運算，我們先計算出每場會議的時間長度：

```typescript
const meetingDurations = new Uint32Array(meetingCount);
for (let meetingIndex = 0; meetingIndex < meetingCount; ++meetingIndex) {
  meetingDurations[meetingIndex] = endTimes[meetingIndex] - startTimes[meetingIndex];
}
```

### Step 5：枚舉每場會議移動後的情況，更新最長空閒時間

最後我們逐一枚舉每場會議，嘗試將之移動，計算新產生的空閒區間，並比較放置於其他空閒區間的可能性，以找出最佳解：

```typescript
let maximumPossibleFreeTime = largestOriginalFreeTime;

for (let meetingIndex = 0; meetingIndex < meetingCount; ++meetingIndex) {
  // 找出不鄰接該會議的原始最大空閒區間
  let largestFixedGap: number;
  if (largestGapIndex1 !== meetingIndex && largestGapIndex1 !== meetingIndex + 1) {
    largestFixedGap = largestGapValue1;
  } else if (largestGapIndex2 !== meetingIndex && largestGapIndex2 !== meetingIndex + 1) {
    largestFixedGap = largestGapValue2;
  } else {
    largestFixedGap = largestGapValue3;
  }

  // 試圖移動會議後產生的合併空閒區間
  const mergedFreeTimeGap = freeTimeGaps[meetingIndex] + meetingDurations[meetingIndex] + freeTimeGaps[meetingIndex + 1];
  const meetingDuration = meetingDurations[meetingIndex];

  let candidateFreeTime: number;
  if (largestFixedGap >= meetingDuration) {
    // 若可放入另一個較大的空閒區間，取較大者
    candidateFreeTime = Math.max(mergedFreeTimeGap, largestFixedGap);
  } else {
    // 否則從合併區間切割出會議時長後計算空閒
    candidateFreeTime = mergedFreeTimeGap - meetingDuration;
  }

  // 持續更新最長空閒時間
  if (candidateFreeTime > maximumPossibleFreeTime) {
    maximumPossibleFreeTime = candidateFreeTime;
  }
}

return maximumPossibleFreeTime;
```

## 時間複雜度

- 建立空閒區間與計算會議持續時間，均需掃描 $O(n)$ 次。
- 每場會議移動的評估操作亦需掃描 $O(n)$ 次。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 我們額外使用了幾個長度為 $O(n)$ 的陣列，例如 `freeTimeGaps`、`meetingDurations` 等。
- 其餘輔助變數為固定數量，忽略不計。
- 總空間複雜度為 $O(n)$。

> $O(n)$
