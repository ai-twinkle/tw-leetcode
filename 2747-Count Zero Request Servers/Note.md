# 2747. Count Zero Request Servers

You are given an integer `n` denoting the total number of servers and a 2D 0-indexed integer array `logs`, 
where `logs[i] = [server_id, time]` denotes that the server with id `server_id` received a request at time `time`.

You are also given an integer `x` and a 0-indexed integer array `queries`.

Return a 0-indexed integer array `arr` of length `queries.length` 
where `arr[i]` represents the number of servers 
that did not receive any requests during the time interval `[queries[i] - x, queries[i]]`.

Note that the time intervals are inclusive.

**Constraints:**

- `1 <= n <= 10^5`
- `1 <= logs.length <= 10^5`
- `1 <= queries.length <= 10^5`
- `logs[i].length == 2`
- `1 <= logs[i][0] <= n`
- `1 <= logs[i][1] <= 10^6`
- `1 <= x <= 10^5`
- `x < queries[i] <= 10^6`

## 基礎思路

本題要求針對每個查詢時間點，計算在區間 `[queries[i] - x, queries[i]]` 內「完全沒有收到任何請求」的伺服器數量。
由於伺服器數量、日誌數量與查詢數量皆可達 `10^5`，若每個查詢都重新掃描所有日誌，計算量將過於龐大，因此需要更有效率的策略。

在思考解法時，可掌握以下核心觀察：

- **答案可由補集求得**：
  「沒有收到請求的伺服器數」等於「伺服器總數」減去「區間內至少收到一次請求的伺服器數」，因此只需維護區間內的活躍伺服器數量即可。

- **所有查詢的區間長度固定**：
  每個查詢的區間長度皆為 `x`，僅位置不同。若將查詢依時間排序，區間的左右端點都只會單調向右移動，非常適合使用滑動視窗。

- **查詢可離線處理**：
  查詢之間互不影響，因此可以打亂順序、依時間排序後統一處理，只要記住每個查詢的原始位置，最後依原位置填回答案。

- **以計數判斷伺服器是否活躍**：
  同一伺服器可能在區間內收到多次請求，需記錄每台伺服器在視窗內的請求次數；次數由零變為正時活躍數加一，由正歸零時活躍數減一。

依據以上特性，可以採用以下策略：

- **將日誌依時間排序**，並將查詢依時間排序且保留原始索引。
- **以雙指標維護一個時間滑動視窗**：右端納入所有不晚於查詢時間的日誌，左端移除所有早於區間起點的日誌。
- **在視窗移動時同步更新每台伺服器的請求計數與活躍伺服器總數**，並以伺服器總數扣除活躍數作為該查詢的答案。

此策略讓每筆日誌最多進出視窗各一次，整體只需排序加上線性掃描即可完成。

## 解題步驟

### Step 1：取得資料規模並定義打包用的位移常數

先取得日誌與查詢的數量，並定義位移常數 `SHIFT`。由於 `2^17` 大於伺服器編號與查詢數量的上限，將主鍵乘上 `SHIFT` 後再加上副鍵，即可把兩個整數精確合併為一個數值，且排序時會以主鍵為優先。

```typescript
const logCount = logs.length;
const queryCount = queries.length;

// 2^17 > 10^5，因此 (time * SHIFT + id) 能精確存於雙精度浮點數中，且排序時會以時間為優先
const SHIFT = 131072;
```

### Step 2：將日誌打包並依時間排序

把每筆日誌打包成 `time * SHIFT + serverId` 存入 `Float64Array`，透過一次原生數值排序，即可讓所有日誌依時間由小到大排列。

```typescript
// 將每筆日誌打包為 time * SHIFT + serverId，使一次型別化陣列的數值排序即可依時間排序
const packedLogs = new Float64Array(logCount);
for (let logIndex = 0; logIndex < logCount; logIndex++) {
  const log = logs[logIndex];
  packedLogs[logIndex] = log[1] * SHIFT + log[0];
}
packedLogs.sort();
```

### Step 3：將排序後的日誌解包為時間與伺服器兩個陣列

依序把打包值拆回時間與伺服器編號，分別存入兩個扁平的 `Int32Array`，讓後續掃描能以連續記憶體存取，提升快取效率。

```typescript
// 解包至扁平的型別化陣列，以利快取友善的掃描
const logTimes = new Int32Array(logCount);
const logServers = new Int32Array(logCount);
for (let logIndex = 0; logIndex < logCount; logIndex++) {
  const packedValue = packedLogs[logIndex];
  const time = Math.floor(packedValue / SHIFT);
  logTimes[logIndex] = time;
  logServers[logIndex] = packedValue - time * SHIFT;
}
```

### Step 4：將查詢打包並依時間排序

把每筆查詢打包成 `value * SHIFT + originalIndex`，排序後查詢會依時間遞增排列，同時保留其原始位置，以便最後將答案填回正確索引。

```typescript
// 將每筆查詢打包為 value * SHIFT + originalIndex，在排序的同時保留原始位置
const packedQueries = new Float64Array(queryCount);
for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  packedQueries[queryIndex] = queries[queryIndex] * SHIFT + queryIndex;
}
packedQueries.sort();
```

### Step 5：初始化滑動視窗所需的狀態

建立每台伺服器在視窗內的請求計數表、結果陣列、活躍伺服器數量，以及視窗的左右指標。

```typescript
const serverRequestCount = new Int32Array(n + 1);
const result: number[] = new Array(queryCount);
let activeServerCount = 0;
let leftPointer = 0;
let rightPointer = 0;
```

### Step 6：依序處理每個查詢並解析其時間與原始索引

依排序後的順序逐一處理查詢，先從打包值中拆出查詢時間與原始索引，並計算該查詢區間的起點 `windowStart`。

```typescript
for (let sortedIndex = 0; sortedIndex < queryCount; sortedIndex++) {
  const packedValue = packedQueries[sortedIndex];
  const queryTime = Math.floor(packedValue / SHIFT);
  const originalIndex = packedValue - queryTime * SHIFT;
  const windowStart = queryTime - x;

  // ...
}
```

### Step 7：擴展視窗右端，納入不晚於查詢時間的日誌

右指標不斷前進，把所有時間不超過 `queryTime` 的日誌納入視窗。若某伺服器的計數由 0 變為正數，代表它新進入活躍狀態，活躍數加一。

```typescript
for (let sortedIndex = 0; sortedIndex < queryCount; sortedIndex++) {
  // Step 6：解析查詢時間與原始索引

  // 擴展視窗，納入所有時間 <= queryTime 的日誌
  while (rightPointer < logCount && logTimes[rightPointer] <= queryTime) {
    const serverId = logServers[rightPointer];
    if (serverRequestCount[serverId] === 0) {
      activeServerCount++;
    }
    serverRequestCount[serverId]++;
    rightPointer++;
  }

  // ...
}
```

### Step 8：收縮視窗左端，移除早於區間起點的日誌

左指標不斷前進，把所有時間早於 `windowStart` 的日誌移出視窗。若某伺服器的計數因此歸零，代表它已不在區間內活躍，活躍數減一。

```typescript
for (let sortedIndex = 0; sortedIndex < queryCount; sortedIndex++) {
  // Step 6：解析查詢時間與原始索引

  // Step 7：擴展視窗右端

  // 收縮視窗，移除所有時間 < windowStart 的日誌
  while (leftPointer < rightPointer && logTimes[leftPointer] < windowStart) {
    const serverId = logServers[leftPointer];
    serverRequestCount[serverId]--;
    if (serverRequestCount[serverId] === 0) {
      activeServerCount--;
    }
    leftPointer++;
  }

  // ...
}
```

### Step 9：以伺服器總數扣除活躍數，寫回原始位置

此時視窗恰好涵蓋區間 `[queryTime - x, queryTime]`，未收到請求的伺服器數即為 `n - activeServerCount`，依原始索引寫入結果。

```typescript
for (let sortedIndex = 0; sortedIndex < queryCount; sortedIndex++) {
  // Step 6：解析查詢時間與原始索引

  // Step 7：擴展視窗右端

  // Step 8：收縮視窗左端

  result[originalIndex] = n - activeServerCount;
}
```

### Step 10：回傳最終結果

所有查詢處理完畢後，`result` 已依原始順序填好答案，直接回傳。

```typescript
return result;
```

## 時間複雜度

- 設 $m$ 為日誌數量、$q$ 為查詢數量；
- 日誌打包與排序需 $O(m \log m)$，解包需 $O(m)$；
- 查詢打包與排序需 $O(q \log q)$；
- 初始化伺服器計數表需 $O(n)$；
- 滑動視窗中每筆日誌最多進出視窗各一次，掃描總成本為 $O(m + q)$。
- 總時間複雜度為 $O(n + m \log m + q \log q)$。

> $O(n + m \log m + q \log q)$

## 空間複雜度

- 打包後的日誌陣列與解包後的時間、伺服器陣列皆為 $O(m)$；
- 打包後的查詢陣列與結果陣列為 $O(q)$；
- 伺服器請求計數表為 $O(n)$。
- 總空間複雜度為 $O(n + m + q)$。

> $O(n + m + q)$
