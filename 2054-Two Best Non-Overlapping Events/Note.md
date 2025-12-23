# 2054. Two Best Non-Overlapping Events

You are given a 0-indexed 2D integer array of `events` where `events[i] = [startTime_i, endTime_i, value_i]`. 
The $i^{th}$ event starts at `startTime_i` and ends at `endTime_i`, and if you attend this event, you will receive a value of `value_i`. 
You can choose at most two non-overlapping events to attend such that the sum of their values is maximized.

Return this maximum sum.

Note that the start time and end time is inclusive: 
that is, you cannot attend two events where one of them starts and the other ends at the same time. 
More specifically, if you attend an event with end time `t`, the next event must start at or after `t + 1`.

**Constraints:**

- `2 <= events.length <= 10^5`
- `events[i].length == 3`
- `1 <= startTime_i <= endTime_i <= 10^9`
- `1 <= value_i <= 10^6`

## 基礎思路

本題要從多個活動 `events[i] = [start, end, value]` 中，挑選**最多兩個**且**不重疊**（第二個活動開始時間必須 ≥ 第一個結束時間 + 1）的活動，使總價值最大。

在思考解法時，有幾個關鍵點：

* **最多選兩個**：我們可以把答案視為「選一個活動」或「選兩個活動（第一個 + 其後可接的最佳第二個）」兩種情況取最大。
* **不重疊限制是時間順序條件**：若把活動依開始時間排序，對於某個第一活動，其可接的第二活動一定出現在排序後的某個位置之後；這使得我們能用**二分搜尋**快速找到第一個可接的活動索引。
* **需要快速取得「某索引之後的最佳單一活動價值」**：當我們找到第二活動的起點索引後，若能立刻知道「從該索引到結尾的最大 value」，就能在 O(1) 內算出「第一活動 + 最佳第二活動」。
* 因此策略是：

    * 先排序（依開始時間），建立時間陣列便於二分；
    * 再做一個後綴最大值結構，讓我們能快速查到「未來最佳單一活動」；
    * 最後逐一枚舉第一活動，二分找可接位置，合併價值更新答案。

## 解題步驟

### Step 1：排序並建立 TypedArray 儲存欄位

先依開始時間排序，讓後續能對「第二個活動」做下界二分搜尋；接著配置 `startTime/endTime/value` 三個 TypedArray 以加速存取。

```typescript
const eventCount = events.length;

// 依開始時間排序，便於二分搜尋找到最早可接的第二個活動
events.sort((leftEvent, rightEvent) => leftEvent[0] - rightEvent[0]);

const startTime = new Int32Array(eventCount);
const endTime = new Int32Array(eventCount);
const value = new Int32Array(eventCount);
```

### Step 2：填入 start/end/value 三個欄位陣列

將排序後的 `events` 拆成三個一維陣列，便於後續用索引快速存取，且避免每次都解構二維陣列。

```typescript
// Step 2：填入 start/end/value 三個欄位陣列
for (let eventIndex = 0; eventIndex < eventCount; eventIndex++) {
  const eventRow = events[eventIndex];
  startTime[eventIndex] = eventRow[0] | 0;
  endTime[eventIndex] = eventRow[1] | 0;
  value[eventIndex] = eventRow[2] | 0;
}
```

### Step 3：建立 suffixMaxValue（後綴最大單一活動價值）

`suffixMaxValue[i]` 表示「從 i 到結尾能選到的最佳單一活動價值」。
這樣在之後找到第二活動起點索引 `leftIndex` 時，可以 O(1) 取得最佳第二活動價值。

```typescript
// suffixMaxValue[i] 表示從 i 到結尾可取得的最佳單一活動價值
const suffixMaxValue = new Int32Array(eventCount + 1);
for (let eventIndex = eventCount - 1; eventIndex >= 0; eventIndex--) {
  const currentValue = value[eventIndex];
  const futureBestValue = suffixMaxValue[eventIndex + 1];
  suffixMaxValue[eventIndex] =
    currentValue > futureBestValue ? currentValue : futureBestValue;
}
```

### Step 4：初始化答案並開始枚舉第一個活動（主迴圈骨架）

接下來以每個活動當作「第一個活動」，逐一更新最佳答案。

```typescript
let bestTotalValue = 0;

// 將每個活動視為第一個活動，嘗試與後續最佳可接活動合併
for (let firstEventIndex = 0; firstEventIndex < eventCount; firstEventIndex++) {
  const firstEventValue = value[firstEventIndex];

  // ...
}
```

### Step 5：更新「只選一個活動」的情況

答案可能只由單一活動構成，因此每次枚舉第一活動時，先用其價值更新答案上限。

```typescript
for (let firstEventIndex = 0; firstEventIndex < eventCount; firstEventIndex++) {
  // Step 4：枚舉第一個活動（主迴圈骨架）

  const firstEventValue = value[firstEventIndex];

  // 最佳答案可能只包含單一活動
  if (firstEventValue > bestTotalValue) {
    bestTotalValue = firstEventValue;
  }

  // ...
}
```

### Step 6：計算第二活動的最早合法開始時間，並準備二分搜尋區間

由於結束時間是 inclusive，第二活動必須滿足 `start >= end + 1`，因此先算出 `requiredStartTime`，並設定二分的左右界。

```typescript
for (let firstEventIndex = 0; firstEventIndex < eventCount; firstEventIndex++) {
  // Step 4：枚舉第一個活動（主迴圈骨架）

  // Step 5：更新只選一個活動的情況

  // 結束時間為 inclusive，第二活動開始時間需至少為 end + 1
  const requiredStartTime = endTime[firstEventIndex] + 1;

  // 下界二分：找第一個 startTime >= requiredStartTime 的索引
  let leftIndex = firstEventIndex + 1;
  let rightIndex = eventCount;

  // ...
}
```

### Step 7：在主迴圈中執行下界二分搜尋，找到最早可接的第二活動索引

保持最外層 `for`，並在其中使用 `while` 二分，找出第一個 `startTime >= requiredStartTime` 的位置。

```typescript
for (let firstEventIndex = 0; firstEventIndex < eventCount; firstEventIndex++) {
  // Step 4：枚舉第一個活動（主迴圈骨架）

  // Step 5：更新只選一個活動的情況

  // Step 6：計算 requiredStartTime 並初始化二分區間

  while (leftIndex < rightIndex) {
    const middleIndex = (leftIndex + rightIndex) >>> 1;
    const middleStartTime = startTime[middleIndex];

    if (middleStartTime >= requiredStartTime) {
      rightIndex = middleIndex;
    } else {
      leftIndex = middleIndex + 1;
    }
  }

  // ...
}
```

### Step 8：合併第一活動與「未來最佳單一活動」，更新答案

二分得到 `leftIndex` 後，最佳第二活動價值就是 `suffixMaxValue[leftIndex]`，合併後更新全域最大值。

```typescript
for (let firstEventIndex = 0; firstEventIndex < eventCount; firstEventIndex++) {
  // Step 4：枚舉第一個活動（主迴圈骨架）

  // Step 5：更新只選一個活動的情況

  // Step 6：計算 requiredStartTime 並初始化二分區間

  // Step 7：下界二分搜尋找到 leftIndex

  // 將當前活動與 leftIndex 起的最佳未來活動合併
  const combinedValue = firstEventValue + suffixMaxValue[leftIndex];
  if (combinedValue > bestTotalValue) {
    bestTotalValue = combinedValue;
  }
}
```

### Step 9：回傳最終答案

遍歷完成後，`bestTotalValue` 即為最多選兩個不重疊活動的最大總價值。

```typescript
return bestTotalValue;
```

## 時間複雜度

- 排序 `events` 需要 $O(n \log n)$。
- 建立 `startTime/endTime/value` 的迴圈為 $O(n)$。
- 建立 `suffixMaxValue` 的迴圈為 $O(n)$。
- 枚舉第一活動共有 $n$ 次，每次做一次下界二分搜尋 $O(\log n)$，因此該段為 $O(n \log n)$。
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- `startTime/endTime/value` 各為長度 $n$ 的 TypedArray：$O(n)$。
- `suffixMaxValue` 長度 $n+1$：$O(n)$。
- 其餘變數為常數空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
