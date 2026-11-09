# 1606. Find Servers That Handled Most Number of Requests

You have `k` servers numbered from `0` to `k-1` that are being used to handle multiple requests simultaneously. 
Each server has infinite computational capacity but cannot handle more than one request at a time. 
The requests are assigned to servers according to a specific algorithm:

- The `i_{th}` (0-indexed) request arrives.
- If all servers are busy, the request is dropped (not handled at all).
- If the `(i % k)_{th}` server is available, assign the request to that server.
- Otherwise, assign the request to the next available server 
  (wrapping around the list of servers and starting from 0 if necessary). 
  For example, if the `i_{th}` server is busy, try to assign the request to the `(i+1)_{th}` server, 
  then the `(i+2)_{th}` server, and so on.

You are given a strictly increasing array arrival of positive integers, 
where `arrival[i]` represents the arrival time of the `i_{th}` request, and another array load, 
where `load[i]` represents the load of the `i_{th}` request (the time it takes to complete). 
Your goal is to find the busiest server(s). 
A server is considered busiest if it handled the most number of requests successfully among all the servers.

Return a list containing the IDs (0-indexed) of the busiest server(s). You may return the IDs in any order.

**Constraints:**

- `1 <= k <= 10^5`
- `1 <= arrival.length, load.length <= 10^5`
- `arrival.length == load.length`
- `1 <= arrival[i], load[i] <= 10^9`
- `arrival` is strictly increasing.

## 基礎思路

本題要模擬 `k` 台伺服器依序接收請求的過程。每個請求抵達時，必須從編號 `i % k` 開始，循環往後找第一台空閒的伺服器；若全部忙碌就捨棄該請求。
最後回傳處理請求數最多的伺服器。由於伺服器數量與請求數量都可達 `10^5`，逐台線性尋找空閒伺服器會退化成 $O(nk)$，因此需要更有效率的資料結構。

在思考解法時，可掌握以下核心觀察：

- **請求依時間遞增抵達**：
  抵達時間嚴格遞增，所以每次處理新請求前，只需釋放「完成時間不晚於當前時刻」的伺服器。依完成時間排序的最小堆能高效完成這件事。

- **循環尋找可拆成兩段線性查詢**：
  「從某位置開始往後找，找不到再從頭找」等價於兩次「找出大於等於某位置的最小空閒編號」的查詢。

- **空閒狀態適合以位元表示**：
  每台伺服器只有空閒與忙碌兩種狀態，可用位元集合表示。再往上疊加摘要層，讓上層每個位元代表下層一整個字組是否仍有空閒位元，就能以近乎常數的層數快速跳過整段忙碌區間。

- **更新只需沿路徑局部傳遞**：
  標記空閒或忙碌時，只有在某字組從「全空」變「非空」或反向變化時，才需要更新上一層，其餘情況可提早停止。

依據以上特性，可以採用以下策略：

- **建立階層式位元集合**記錄空閒伺服器，支援快速的「下一個空閒位置」查詢與狀態更新。
- **以型別化陣列實作最小堆**，依完成時間管理忙碌中的伺服器，在每個請求抵達時批次釋放已完成者。
- **逐一處理請求並累計各伺服器的處理次數**，最後掃描找出最大值並收集所有達到最大值的伺服器。

此策略將每次分配與釋放的成本壓低到對數等級，能在大規模輸入下高效完成模擬。

## 解題步驟

### Step 1：取得請求數量並建立階層式位元集合

先取得請求總數，再由最底層開始建立位元集合：每一層以 32 位元為一個字組，初始時將所有有效位元設為 1，表示全部伺服器空閒。接著以該層的字組數作為上一層的位元數，持續往上建構，直到某層只剩單一字組為止。

```typescript
const requestCount = arrival.length;

// 建立階層式位元集合，直到最上層只剩單一字組為止
const levels: Int32Array[] = [];
let bitCount = k;
while (true) {
  const wordCount = (bitCount + 31) >>> 5;
  const words = new Int32Array(wordCount);
  for (let wordIndex = 0; wordIndex < wordCount; wordIndex++) {
    const remaining = bitCount - (wordIndex << 5);
    words[wordIndex] = remaining >= 32 ? -1 : (1 << remaining) - 1;
  }
  levels.push(words);
  if (wordCount === 1) {
    break;
  }
  bitCount = wordCount;
}
```

### Step 2：記錄層數與最上層字組

保存總層數供後續查詢與更新使用，並取出最上層。最上層只有一個字組，可用來快速判斷是否還有任何空閒伺服器。

```typescript
const levelCount = levels.length;
const topLevel = levels[levelCount - 1];
```

### Step 3：查詢下一個空閒伺服器——由下往上尋找含空閒位元的字組

`findNextFree` 負責找出編號大於等於 `position` 的最小空閒伺服器。
從最底層開始，先遮罩掉 `position` 以前的位元：

- 若當前字組仍有空閒位元，就取其最低位並停止上升。
- 否則將位置推進到下一個字組，並往上一層繼續找。

若已超出該層範圍或爬過最上層仍找不到，代表不存在符合條件的空閒伺服器。

```typescript
/**
 * 尋找索引大於等於 position 的最小空閒伺服器。
 * @param position - 起始伺服器索引
 * @returns 空閒伺服器索引，若不存在則回傳 -1
 */
const findNextFree = (position: number): number => {
  let level = 0;
  while (level < levelCount) {
    const words = levels[level];
    const wordIndex = position >>> 5;
    if (wordIndex >= words.length) {
      return -1;
    }
    const bits = words[wordIndex] & (-1 << (position & 31));
    if (bits !== 0) {
      position = (wordIndex << 5) + (31 - Math.clz32(bits & -bits));
      break;
    }
    position = wordIndex + 1;
    level++;
  }
  if (level === levelCount) {
    return -1;
  }

  // ...
};
```

### Step 4：查詢下一個空閒伺服器——由上往下定位到實際伺服器

在某一層找到含空閒位元的位置後，該位置代表下一層中某個非空的字組。
因此逐層往下，每層都取該字組的最低位已設定位元，直到回到最底層，即可得到實際的伺服器編號。

```typescript
/**
 * 尋找索引大於等於 position 的最小空閒伺服器。
 * @param position - 起始伺服器索引
 * @returns 空閒伺服器索引，若不存在則回傳 -1
 */
const findNextFree = (position: number): number => {
  // Step 3：由下往上尋找含空閒位元的字組

  // 逐層往下，每層取最低位的已設定位元
  while (level > 0) {
    level--;
    const bits = levels[level][position];
    position = (position << 5) + (31 - Math.clz32(bits & -bits));
  }
  return position;
};
```

### Step 5：將伺服器標記為空閒

從最底層開始，將對應位元設為 1。
若該字組原本就非空，上層的摘要位元早已是 1，可以提早停止；只有原本全空時，才需要繼續往上一層設定摘要位元。

```typescript
/**
 * 將伺服器標記為空閒。
 * @param server - 伺服器索引
 */
const markFree = (server: number): void => {
  let position = server;
  for (let level = 0; level < levelCount; level++) {
    const words = levels[level];
    const wordIndex = position >>> 5;
    const previous = words[wordIndex];
    words[wordIndex] = previous | (1 << (position & 31));
    if (previous !== 0) {
      break;
    }
    position = wordIndex;
  }
};
```

### Step 6：將伺服器標記為忙碌

從最底層開始，將對應位元清為 0。
若清除後字組仍非空，上層摘要不受影響，可以提早停止；若字組變為全空，則需往上一層清除對應的摘要位元。

```typescript
/**
 * 將伺服器標記為忙碌。
 * @param server - 伺服器索引
 */
const markBusy = (server: number): void => {
  let position = server;
  for (let level = 0; level < levelCount; level++) {
    const words = levels[level];
    const wordIndex = position >>> 5;
    const updated = words[wordIndex] & ~(1 << (position & 31));
    words[wordIndex] = updated;
    if (updated !== 0) {
      break;
    }
    position = wordIndex;
  }
};
```

### Step 7：初始化忙碌伺服器的最小堆與處理次數表

同時忙碌的伺服器數量不會超過伺服器數，也不會超過請求數，因此堆容量取兩者較小值。
以兩個平行的型別化陣列分別記錄完成時間與伺服器編號，並準備每台伺服器的處理次數計數表。

```typescript
// 以完成時間為鍵的忙碌伺服器最小堆（最大值 2e9 可放入 Uint32）
const heapCapacity = Math.min(k, requestCount) + 1;
const heapEnd = new Uint32Array(heapCapacity);
const heapServer = new Int32Array(heapCapacity);
let heapSize = 0;

const handledCount = new Int32Array(k);
```

### Step 8：逐一處理請求並釋放已完成的堆頂伺服器

依序處理每個請求並取得其抵達時間。
只要堆頂伺服器的完成時間不晚於當前時刻，就將其標記為空閒並移出堆；若移出後堆已清空，則直接結束釋放流程。

```typescript
for (let requestIndex = 0; requestIndex < requestCount; requestIndex++) {
  const currentTime = arrival[requestIndex];

  // 釋放所有在此時刻前已完成工作的伺服器
  while (heapSize > 0 && heapEnd[0] <= currentTime) {
    markFree(heapServer[0]);
    heapSize--;
    if (heapSize === 0) {
      break;
    }

    // ...
  }

  // ...
}
```

### Step 9：以下沉操作重新維護最小堆

將堆尾元素移到堆頂後執行下沉：每次選出完成時間較小的子節點，若其小於待放置元素就往上搬移，直到找到正確位置後放入。

```typescript
for (let requestIndex = 0; requestIndex < requestCount; requestIndex++) {
  // Step 8：取得當前時間並釋放堆頂伺服器

  while (heapSize > 0 && heapEnd[0] <= currentTime) {
    // Step 8：標記堆頂為空閒並移出堆

    const lastEnd = heapEnd[heapSize];
    const lastServer = heapServer[heapSize];
    let index = 0;
    while (true) {
      let child = (index << 1) + 1;
      if (child >= heapSize) {
        break;
      }
      if (child + 1 < heapSize && heapEnd[child + 1] < heapEnd[child]) {
        child++;
      }
      if (heapEnd[child] >= lastEnd) {
        break;
      }
      heapEnd[index] = heapEnd[child];
      heapServer[index] = heapServer[child];
      index = child;
    }
    heapEnd[index] = lastEnd;
    heapServer[index] = lastServer;
  }

  // ...
}
```

### Step 10：若所有伺服器皆忙碌則捨棄請求

最上層字組為 0 時，代表整個位元集合中沒有任何空閒伺服器，該請求直接捨棄。

```typescript
for (let requestIndex = 0; requestIndex < requestCount; requestIndex++) {
  // Step 8：取得當前時間並釋放堆頂伺服器

  // Step 9：以下沉操作重新維護最小堆

  // 所有伺服器皆忙碌：捨棄此請求
  if (topLevel[0] === 0) {
    continue;
  }

  // ...
}
```

### Step 11：循環尋找空閒伺服器並完成分配

先從 `requestIndex % k` 往後尋找空閒伺服器；若找不到，再從編號 0 重新尋找，完成循環式查詢。
找到後將其標記為忙碌，並累加該伺服器的處理次數。

```typescript
for (let requestIndex = 0; requestIndex < requestCount; requestIndex++) {
  // Step 8：取得當前時間並釋放堆頂伺服器

  // Step 9：以下沉操作重新維護最小堆

  // Step 10：所有伺服器皆忙碌時捨棄請求

  let server = findNextFree(requestIndex % k);
  if (server === -1) {
    server = findNextFree(0);
  }
  markBusy(server);
  handledCount[server]++;

  // ...
}
```

### Step 12：將新的完成時間推入最小堆

計算該請求的完成時間，並在堆尾執行上浮：只要父節點的完成時間大於新值，就將父節點往下搬移，直到找到正確位置後寫入完成時間與伺服器編號。

```typescript
for (let requestIndex = 0; requestIndex < requestCount; requestIndex++) {
  // Step 8：取得當前時間並釋放堆頂伺服器

  // Step 9：以下沉操作重新維護最小堆

  // Step 10：所有伺服器皆忙碌時捨棄請求

  // Step 11：循環尋找空閒伺服器並完成分配

  // 將新的完成時間推入堆中
  const finishTime = currentTime + load[requestIndex];
  let index = heapSize++;
  while (index > 0) {
    const parent = (index - 1) >>> 1;
    if (heapEnd[parent] <= finishTime) {
      break;
    }
    heapEnd[index] = heapEnd[parent];
    heapServer[index] = heapServer[parent];
    index = parent;
  }
  heapEnd[index] = finishTime;
  heapServer[index] = server;
}
```

### Step 13：找出最大的處理次數

所有請求處理完畢後，掃描每台伺服器的處理次數，求出最大值。

```typescript
// 收集處理次數最多的伺服器
let maximum = 0;
for (let server = 0; server < k; server++) {
  if (handledCount[server] > maximum) {
    maximum = handledCount[server];
  }
}
```

### Step 14：收集所有達到最大處理次數的伺服器並回傳

再次掃描，將處理次數等於最大值的伺服器編號加入結果後回傳。

```typescript
const result: number[] = [];
for (let server = 0; server < k; server++) {
  if (handledCount[server] === maximum) {
    result.push(server);
  }
}
return result;
```

## 時間複雜度

- 建立階層式位元集合時，各層字組數呈 32 倍遞減，總建構成本為 $O(k)$；
- 位元集合的層數為 $O(\log k)$，因此每次查詢、標記空閒或標記忙碌皆為 $O(\log k)$；
- 每個請求至多被推入與移出堆各一次，每次堆操作為 $O(\log k)$；
- 設請求數為 $n$，模擬過程總計 $O(n \log k)$，最後掃描處理次數需 $O(k)$。
- 總時間複雜度為 $O(n \log k + k)$。

> $O(n \log k + k)$

## 空間複雜度

- 階層式位元集合的總大小為 $O(k)$；
- 最小堆容量為 $O(\min(k, n))$；
- 處理次數表需 $O(k)$。
- 總空間複雜度為 $O(k)$。

> $O(k)$
