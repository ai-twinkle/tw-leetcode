# 757. Set Intersection Size At Least Two

You are given a 2D integer array `intervals` where `intervals[i] = [start_i, end_i]` represents all the integers from `start_i` to `end_i` inclusively.

A containing set is an array `nums` where each interval from `intervals` has at least two integers in `nums`.

- For example, if `intervals = [[1,3], [3,7], [8,9]]`, then `[1,2,4,7,8,9]` and `[2,3,4,8,9]` are containing sets.

Return the minimum possible size of a containing set.

**Constraints:**

- `1 <= intervals.length <= 3000`
- `intervals[i].length == 2`
- `0 <= start_i < end_i <= 10^8`

## 基礎思路

本題要求構造一個整數集合，使得給定的每個區間都至少包含其中兩個數字，並希望集合的大小最小。

在觀察所有區間後，可以得到以下核心思維：

1. **每個區間都需要被至少兩個點覆蓋**
   因此若一個區間尚未被現有點覆蓋，必須新增足夠的點補上。

2. **儘可能將新增點放在越右側的位置**
   放置越靠右的點較容易同時落入未來區間，能減少之後的新增需求。

3. **適當排序能讓貪心決策具備全域最優性**
   若依照區間的右端點由小到大排序，則每次處理到的都是「最先到期」的區間，使得貪心選點策略能成立。
   若右端點相同，再依左端點由大到小處理，可避免提前選點造成後續覆蓋困難。

4. **每個區間根據已被覆蓋的點數分成三類情況**

    * 沒有覆蓋 → 必須新增兩個點
    * 覆蓋一個 → 必須新增一個點
    * 覆蓋兩個以上 → 不需新增
      此策略搭配排序可以確保最少新增次數。

5. **最終的策略為典型的右端點貪心方法**
   透過排序與依序處理區間，加上將新增點放置於區間最右側位置，能保證各區間以最小集合大小被覆蓋。

## 解題步驟

### Step 1：排序所有區間

依右端點由小到大排序；若右端相同，則依左端點由大到小排序。
此排序方式能讓貪心的覆蓋策略保持正確性。

```typescript
const intervalsLength = intervals.length;

// 依 end 由小到大排序；若 end 相同則依 start 由大到小排序
intervals.sort((firstInterval, secondInterval) => {
  const firstEnd = firstInterval[1];
  const secondEnd = secondInterval[1];

  if (firstEnd === secondEnd) {
    // 相同 end 時，start 較大的排前
    return secondInterval[0] - firstInterval[0];
  }

  return firstEnd - secondEnd;
});
```

### Step 2：初始化兩個追蹤點與計數器

準備追蹤目前已加入集合的最大值與第二大值，以辨識每個區間已被覆蓋多少點。

```typescript
let minimumContainingSetSize = 0;

// lastPoint：目前已選點中最大者
// secondLastPoint：目前已選點中第二大者
let lastPoint = -1;
let secondLastPoint = -1;
```

### Step 3：遍歷各區間並依覆蓋狀態補點

依序處理排序後的區間，並根據已覆蓋的點數（0、1、或≥2）決定是否需要補點。

```typescript
for (let index = 0; index < intervalsLength; index += 1) {
  const currentInterval = intervals[index];
  const intervalStart = currentInterval[0];
  const intervalEnd = currentInterval[1];

  if (intervalStart > lastPoint) {
    // 區間中沒有任何既有點 → 補兩點（end-1 與 end）
    // 將點放越右越有利於覆蓋後續區間
    secondLastPoint = intervalEnd - 1;
    lastPoint = intervalEnd;
    minimumContainingSetSize += 2;
  } else if (intervalStart > secondLastPoint) {
    // 區間中僅有一個既有點 → 補一點 end
    secondLastPoint = lastPoint;
    lastPoint = intervalEnd;
    minimumContainingSetSize += 1;
  }
  // 若已有兩點落在區間內，則不需補點
}
```

### Step 4：回傳最終所需的最小集合大小

```typescript
return minimumContainingSetSize;
```

## 時間複雜度

- 排序所有區間：最壞情況為 $O(n^2)$（JavaScript V8 在自訂比較函式下可能退化），平均情況約為 $O(n \log n)$
- 逐一處理區間：$O(n)$
- 總時間複雜度為 $O(n^2)$

> $O(n^2)$

## 空間複雜度

- 僅使用常數額外變數
- 總空間複雜度為 $O(1)$

> $O(1)$
