# 2402. Meeting Rooms III

You are given an integer `n`. 
There are n rooms numbered from `0` to `n - 1`.

You are given a 2D integer array `meetings` where `meetings[i] = [start_i, end_i]` means 
that a meeting will be held during the half-closed time interval `[start_i, end_i)`. 
All the values of `start_i` are unique.

Meetings are allocated to rooms in the following manner:

1. Each meeting will take place in the unused room with the lowest number.
2. If there are no available rooms, the meeting will be delayed until a room becomes free. 
   The delayed meeting should have the same duration as the original meeting.
3. When a room becomes unused, meetings that have an earlier original start time should be given the room.

Return the number of the room that held the most meetings. 
If there are multiple rooms, return the room with the lowest number.

A half-closed interval `[a, b)` is the interval between `a` and `b` including `a` and not including `b`.

**Constraints:**

- `1 <= n <= 100`
- `1 <= meetings.length <= 10^5`
- `meetings[i].length == 2`
- `0 <= start_i < end_i <= 5 * 10^5`
- All the values of `start_i` are unique.

## 基礎思路

一個比較直觀的方式是比對兩兩元素的 `AND` 運算結果，但是這會需要 $O(n^2)$ 的時間複雜度。

我們觀察發現如果發現 conflict 的情況，可以直接跳過剩餘的元素，因為題目要求的是最長的 subarray。

最後，我們逐步更新最長的 subarray 長度，就可以得到答案。

## 基礎思路

本題的核心在於模擬會議安排的實際流程，並追蹤各房間的使用狀態與次數，以決定最終哪個房間使用次數最多。
為達成此目的，我們可以採用以下策略：

1. **排序預處理**：將所有會議根據起始時間由早到晚排序，確保依照時間順序逐一安排。
2. **房間狀態追蹤**：使用陣列分別紀錄每個房間「下次可使用的時間」及「已經舉行的會議次數」。
3. **模擬房間指派**：
   - 若有房間於會議開始時閒置，優先使用編號最低的房間。
   - 若所有房間皆忙碌，則將會議延後至最早可用的房間，並保留原本的會議持續時間。
4. **結果統計**：在所有會議完成安排後，統計各房間的使用次數，選取使用次數最多的房間；若有多間房間相同，選取編號最小的。

透過以上步驟，可以確保每次選取的房間皆符合題目規則，並正確統計房間使用次數。

## 解題步驟

### Step 1：對會議依照起始時間排序並初始化房間狀態追蹤變數

首先，我們必須依照會議起始時間做排序，這樣才能保證每次分配都以「最早」出現的會議優先處理。
接著，初始化兩個陣列，分別追蹤每間房間的下次可用時間與目前承辦會議的次數。

```typescript
// 1. 將 meetings 依照開始時間由早到晚排序
meetings.sort((a, b) => a[0] - b[0]);

// 2. 初始化每個房間的下次可用時間與會議舉辦次數
const roomNextAvailableTime = new Uint32Array(n);
const roomMeetingCount = new Uint32Array(n);

const totalMeetings = meetings.length;
```

### Step 2：逐一安排會議並更新房間使用狀態

我們逐一處理每場會議。對於每場會議，需遍歷所有房間來判斷是否有可立即分配的房間（即下次可用時間早於或等於會議開始）。如果有，直接分配該房間（且選擇編號最小者）。
若全部房間皆忙碌，則找出最早可用的房間，並將會議延後至該時刻再開（保留原本會議長度）。

```typescript
// 3. 開始模擬每個會議的房間分配
for (let i = 0; i < totalMeetings; i++) {
  const meetingStart = meetings[i][0];
  const meetingEnd = meetings[i][1];

  // 初始化變數追蹤目前最早可用房間
  let earliestAvailableRoom = 0;
  let earliestAvailableTime = roomNextAvailableTime[0];

  // 嘗試找到當前立即可用的房間
  let assignedRoom = -1;
  for (let roomIndex = 0; roomIndex < n; roomIndex++) {
    const availableTime = roomNextAvailableTime[roomIndex];

    // 若房間可用時間早於或等於會議起始時間，則立即分配
    if (availableTime <= meetingStart) {
      assignedRoom = roomIndex;
      break;
    }

    // 若此房間可用時間更早，則更新最早可用的房間與時間
    if (availableTime < earliestAvailableTime) {
      earliestAvailableTime = availableTime;
      earliestAvailableRoom = roomIndex;
    }
  }

  if (assignedRoom >= 0) {
    // 房間立即可用，直接安排會議並更新狀態
    roomNextAvailableTime[assignedRoom] = meetingEnd;
    roomMeetingCount[assignedRoom] += 1;
  } else {
    // 所有房間皆忙碌，延後安排至最早可用房間
    roomNextAvailableTime[earliestAvailableRoom] = earliestAvailableTime + (meetingEnd - meetingStart);
    roomMeetingCount[earliestAvailableRoom] += 1;
  }
}
```

### Step 3：統計並取得使用次數最多的房間

所有會議分配結束後，只要遍歷一次 `roomMeetingCount`，選出最大值，若有並列則選擇編號最小的房間即可。

```typescript
// 4. 找出使用次數最多的房間（若多個房間使用次數相同，則取編號最小者）
let mostUsedRoom = 0;
let highestMeetingCount = roomMeetingCount[0];

for (let roomIndex = 1; roomIndex < n; roomIndex++) {
  const currentMeetingCount = roomMeetingCount[roomIndex];
  if (currentMeetingCount > highestMeetingCount) {
    highestMeetingCount = currentMeetingCount;
    mostUsedRoom = roomIndex;
  }
}
```

### Step 4：返回結果

```typescript
return mostUsedRoom;
```

## 時間複雜度

- 排序會議需花費 $O(m \log m)$，其中 $m$ 為會議數量。
- 對每場會議最多需檢查所有房間，花費 $O(m \times n)$。
- 總時間複雜度為 $O(m \log m + m n)$。

> $O(m \log m + m n)$

## 空間複雜度

- 使用固定長度為 $n$ 的陣列追蹤房間使用狀態。
- 未使用其他動態資料結構。
- 總空間複雜度為 $O(n)$。

> $O(n)$
