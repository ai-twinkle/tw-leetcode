# 3439. Reschedule Meetings for Maximum Free Time I

You are given an integer `eventTime` denoting the duration of an event, where the event occurs from time `t = 0` to time `t = eventTime`.

You are also given two integer arrays `startTime` and `endTime`, each of length `n`. 
These represent the start and end time of `n` non-overlapping meetings, where the ith meeting occurs during the time [startTime[i], endTime[i]].

You can reschedule at most `k` meetings by moving their start time while maintaining the same duration, to maximize the longest continuous period of free time during the event.

The relative order of all the meetings should stay the same and they should remain non-overlapping.

Return the maximum amount of free time possible after rearranging the meetings.

Note that the meetings can not be rescheduled to a time outside the event.

**Constraints:**

- `1 <= eventTime <= 10^9`
- `n == startTime.length == endTime.length`
- `2 <= n <= 10^5`
- `1 <= k <= n`
- `0 <= startTime[i] < endTime[i] <= eventTime`
- `endTime[i] <= startTime[i + 1]` where `i` lies in the range `[0, n - 2]`.

## 基礎思路

本題核心策略在於透過調整最多 $k$ 個連續會議的開始時間，來達到最大化連續空閒時間的目的。

由於題目限制必須保持原有會議的相對順序且不可重疊，因此解題時應考量：

- 在所有會議當中，選擇連續的 $k$ 個會議作為一個滑動視窗，計算此視窗內會議的總佔用時長。
- 接著計算此視窗的前後邊界之間可用的總時間，再扣除視窗內會議的佔用時長，即為可達成的空閒時間。
- 透過滑動視窗逐步檢查所有可能的位置，最後得到能產生最長連續空閒時間的方案。

## 解題步驟

### Step 1：初始化輔助變數

先取得會議的總數量，並定義一個變數 `windowDurationSum` 用以記錄當前滑動視窗內會議的總時長。

```typescript
const meetingCount = startTime.length;
let windowDurationSum = 0;
```

### Step 2：計算最初視窗內 (前 $k$ 場會議) 的總時長

計算初始視窗的佔用總時間（從第 0 場會議至第 $k-1$ 場會議），作為後續視窗滑動時的初始值。

```typescript
// 計算前 k 場會議的持續時間總和
for (let i = 0; i < k; ++i) {
  windowDurationSum += endTime[i] - startTime[i];
}
```

### Step 3：計算第一個視窗的空閒時間並初始化最大值

對於第一個視窗：

- 若 $k$ 等於會議總數，則右邊界為活動結束時間 `eventTime`。
- 否則，右邊界為下一場會議的開始時間 `startTime[k]`。
- 左邊界固定為 0。
- 空閒時間為邊界區間的總長度扣掉視窗內會議的總持續時間。

```typescript
// 計算第一個視窗的空閒時間並初始化最大空閒時間
let maximumFreeTime = (k === meetingCount ? eventTime : startTime[k]) - windowDurationSum;
```

### Step 4：滑動視窗遍歷所有可能位置並更新最大值

從第 1 個視窗開始，依序將視窗逐步往右滑動，每次執行以下動作：

- 更新視窗內總持續時間（扣除離開視窗的會議，加上新進入視窗的會議）。
- 計算視窗的左右邊界（左邊界為上一場會議結束時間；右邊界為視窗外下一場會議的開始時間，若無則為 `eventTime`）。
- 更新空閒時間，並與現有的最大值比較，取更大的值。

```typescript
// 滑動窗口遍歷所有可能的位置
for (let i = 1; i <= meetingCount - k; ++i) {
  // 更新視窗總時長：減去離開的會議，加上進入的會議
  windowDurationSum +=
    (endTime[i + k - 1] - startTime[i + k - 1]) -
    (endTime[i - 1] - startTime[i - 1]);

  // 計算視窗左右邊界
  const leftBoundary = endTime[i - 1];
  const rightBoundary = (i + k === meetingCount) ? eventTime : startTime[i + k];

  // 計算當前視窗的空閒時間
  const freeTime = rightBoundary - leftBoundary - windowDurationSum;

  // 若有更大空閒時間，更新結果
  if (freeTime > maximumFreeTime) {
    maximumFreeTime = freeTime;
  }
}
```

### Step 5：返回最終計算結果

完成所有視窗檢查後，回傳計算所得的最大空閒時間：

```typescript
return maximumFreeTime;
```

## 時間複雜度

- 本解法僅透過一次滑動視窗遍歷整個會議清單，每次操作均為常數時間 $O(1)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用有限個固定輔助變數進行計算，無額外的空間配置。
- 總空間複雜度為 $O(1)$。

> $O(1)$
