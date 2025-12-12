# 3433. Count Mentions Per User

You are given an integer `numberOfUsers` representing the total number of users and an array `events` of size `n x 3`.

Each `events[i]` can be either of the following two types:

1. Message Event: `["MESSAGE", "timestamp_i", "mentions_string_i"]`
   - This event indicates that a set of users was mentioned in a message at `timestamp_i`.
   - The `mentions_string_i` string can contain one of the following tokens:
     - `id<number>`: where `<number>` is an integer in range `[0,numberOfUsers - 1]`. 
       There can be multiple ids separated by a single whitespace and may contain duplicates. This can mention even the offline users.
   - `ALL`: mentions all users.
   - `HERE`: mentions all online users.
2. Offline Event: `["OFFLINE", "timestamp_i", "id_i"]`
   - This event indicates that the user `id_i` had become offline at `timestamp_i` for 60 time units. 
     The user will automatically be online again at time `timestamp_i + 60`.

Return an array `mentions` where `mentions[i]` represents the number of mentions the user with id `i` has across all `MESSAGE` events.

All users are initially online, and if a user goes offline or comes back online, their status change is processed before handling any message event that occurs at the same timestamp.

Note that a user can be mentioned multiple times in a single message event, and each mention should be counted separately.

**Constraints:**

- `1 <= numberOfUsers <= 100`
- `1 <= events.length <= 100`
- `events[i].length == 3`
- `events[i][0]` will be one of `MESSAGE` or `OFFLINE`.
- `1 <= int(events[i][1]) <= 10^5`
- The number of `id<number>` mentions in any `"MESSAGE"` event is between `1` and `100`.
- `0 <= <number> <= numberOfUsers - 1`
- It is guaranteed that the user id referenced in the `OFFLINE` event is online at the time the event occurs.

## 基礎思路

本題要統計每位使用者在所有 `MESSAGE` 事件中被提及（mention）的次數，並且事件會伴隨「離線 60 時間單位」的狀態切換。思考時需要掌握幾個重點：

* **事件有時間順序**：所有事件必須依 `timestamp` 由小到大處理；若同一時間點同時有狀態切換與訊息，題意要求**狀態切換優先於訊息**。
* **離線是暫時的**：`OFFLINE` 事件會讓某位使用者從該時間點起離線 60 單位，並在 `timestamp + 60` 自動恢復上線，因此我們需要能快速判斷某時間點使用者是否上線。
* **訊息提及有三種形式**：

    * `ALL`：所有使用者都要 +1（不受離線影響）
    * `HERE`：只有當下上線的使用者 +1（受離線影響）
    * `id<number>`：直接點名某些 id（可重複、可提及離線者、同訊息中重複要重複計數）
* **效率策略**：

    * 先排序事件，確保同時間點 `OFFLINE` 先於 `MESSAGE`。
    * 用一個陣列記錄每個使用者「離線到何時」（`offlineUntil`），即可在任意時間點用 `timestamp >= offlineUntil[id]` 判斷是否上線。
    * `ALL` 的效果對每個人都一樣，可以累積成一個全域計數，最後再一次性加回去，避免每次掃描所有人。

## 解題步驟

### Step 1：初始化計數結構與字元碼常數

建立提及次數表 `mentions`、離線截止時間表 `offlineUntil`，並用常數保存字元碼以加速比較與解析。

```typescript
const mentions = new Uint32Array(numberOfUsers);
const offlineUntil = new Uint32Array(numberOfUsers);

const charCode_O = 79; // 'O'
const charCode_A = 65; // 'A'
const charCode_H = 72; // 'H'
const charCode_SPACE = 32; // ' '
const charCode_D = 100; // 'd'
const charCode_ZERO = 48; // '0'

let allMentionsCount = 0;
```

### Step 2：排序事件並確保同時間點 OFFLINE 先處理

依 `timestamp` 升序排序；若相同時間點，讓 `OFFLINE` 排在 `MESSAGE` 前，確保狀態先更新再處理訊息。

```typescript
// 依時間排序，且同時間點必須先處理 OFFLINE 再處理 MESSAGE
events.sort((leftEvent, rightEvent) => {
  const leftTime = +leftEvent[1];
  const rightTime = +rightEvent[1];

  if (leftTime !== rightTime) {
    return leftTime - rightTime;
  }

  const leftTypeFirstChar = leftEvent[0].charCodeAt(0);
  const rightTypeFirstChar = rightEvent[0].charCodeAt(0);

  if (leftTypeFirstChar === rightTypeFirstChar) {
    return 0;
  }

  if (leftTypeFirstChar === charCode_O) {
    return -1;
  }

  return 1;
});
```

### Step 3：遍歷事件主迴圈並取出事件類型與時間

逐筆處理排序後的事件，先取出事件類型首字元與時間戳，後續依事件類型分流。

```typescript
for (let eventIndex = 0; eventIndex < events.length; eventIndex += 1) {
  const event = events[eventIndex];
  const eventTypeFirstChar = event[0].charCodeAt(0);
  const timestamp = +event[1];

  // ...
}
```

### Step 4：處理 OFFLINE 事件（更新離線截止時間）

若事件為 `OFFLINE`，直接更新該使用者的 `offlineUntil`，並 `continue` 跳過後續 MESSAGE 處理。

```typescript
for (let eventIndex = 0; eventIndex < events.length; eventIndex += 1) {
  // Step 3：遍歷事件主迴圈並取出事件類型與時間

  if (eventTypeFirstChar === charCode_O) {
    const userId = +event[2];

    // 記錄該使用者恢復上線的時間
    offlineUntil[userId] = timestamp + 60;
    continue;
  }

  // ...
}
```

### Step 5：取得 MESSAGE 的提及文字並分辨提及類型

對 `MESSAGE` 事件，先取出 `mentionText`，並以首字元判斷是 `ALL`、`HERE`，或是 `id<number>` 格式。

```typescript
for (let eventIndex = 0; eventIndex < events.length; eventIndex += 1) {
  // Step 3：遍歷事件主迴圈並取出事件類型與時間

  // Step 4：處理 OFFLINE 事件（更新離線截止時間）

  const mentionText = event[2];
  const mentionTypeFirstChar = mentionText.charCodeAt(0);

  // ...
}
```

### Step 6：處理 ALL 與 HERE 的提及邏輯

* `ALL`：只累加一次全域計數，最後統一加回每個人。
* `HERE`：掃描所有使用者，僅對當下上線者加一（`timestamp >= offlineUntil[userId]`）。

```typescript
for (let eventIndex = 0; eventIndex < events.length; eventIndex += 1) {
  // Step 3：遍歷事件主迴圈並取出事件類型與時間

  // Step 4：處理 OFFLINE 事件（更新離線截止時間）

  // Step 5：取得 MESSAGE 的提及文字並分辨提及類型

  if (mentionTypeFirstChar === charCode_A) {
    // 延後 ALL 的套用，最後再統一加回
    allMentionsCount += 1;
    continue;
  }

  if (mentionTypeFirstChar === charCode_H) {
    // 只掃描上線使用者；offlineUntil[userId] 若從未離線則為 0
    for (let userId = 0; userId < numberOfUsers; userId += 1) {
      if (timestamp >= offlineUntil[userId]) {
        mentions[userId] += 1;
      }
    }
    continue;
  }

  // ...
}
```

### Step 7：解析 `id<number>` 列表並累加提及次數

針對 `id<number>` token 串，依題目限制做快速解析（支援 0..99），同一訊息中重複 id 需重複計數，並另外補處理最後一個 token 的尾端情況。

```typescript
for (let eventIndex = 0; eventIndex < events.length; eventIndex += 1) {
  // Step 3：遍歷事件主迴圈並取出事件類型與時間

  // Step 4：處理 OFFLINE 事件（更新離線截止時間）

  // Step 5：取得 MESSAGE 的提及文字並分辨提及類型

  // Step 6：處理 ALL 與 HERE 的提及邏輯

  // 在限制下快速解析 "id<number>" token（0..99），重複 token 需重複計數
  const textLength = mentionText.length;

  for (let textIndex = 2; textIndex < textLength - 1; textIndex += 4) {
    let userId = mentionText.charCodeAt(textIndex) - charCode_ZERO;

    if (mentionText.charCodeAt(textIndex + 1) !== charCode_SPACE) {
      textIndex += 1;
      userId = userId * 10 + (mentionText.charCodeAt(textIndex) - charCode_ZERO);
    }

    mentions[userId] += 1;
  }

  // 處理最後一個 token 以 "... id<digit>" 結尾的情況
  if (mentionText.charCodeAt(textLength - 2) === charCode_D) {
    mentions[mentionText.charCodeAt(textLength - 1) - charCode_ZERO] += 1;
  }
}
```

### Step 8：建立輸出陣列並套用 ALL 的累積計數

最後建立一般 `number[]` 輸出，並把 `allMentionsCount` 一次性加到每個使用者上。

```typescript
const result = new Array<number>(numberOfUsers);

// 將 ALL 的提及次數一次性套用到每位使用者
for (let userId = 0; userId < numberOfUsers; userId += 1) {
  result[userId] = mentions[userId] + allMentionsCount;
}

return result;
```

## 時間複雜度

- 事件排序：$O(n \log n)$。
- 事件處理：每個事件為常數成本；但 `HERE` 需掃描所有使用者，最壞為 $O(n \cdot u)$。
- 解析 `id<number>`：每則訊息最多 100 個 token，總計為 $O(n)$ 等級常數上界。
- 總時間複雜度為 $O(n \log n + n \cdot u)$。

> $O(n \log n + n \cdot u)$

## 空間複雜度

- `mentions`、`offlineUntil`、`result` 皆為 $O(u)$。
- 其餘為常數額外空間。
- 總空間複雜度為 $O(u)$。

> $O(u)$
