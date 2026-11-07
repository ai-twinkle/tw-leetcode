# 1882. Process Tasks Using Servers

You are given two 0-indexed integer arrays `servers` and `tasks` of lengths `n` and `m` respectively. 
`servers[i]` is the weight of the $i_{th}$ server, and `tasks[j]` is the time needed to process the $j_{th}$ task in seconds.

Tasks are assigned to the servers using a task queue. 
Initially, all servers are free, and the queue is empty.

At second `j`, the $j_{th}$ task is inserted into the queue (starting with the $0^{th}$ task being inserted at second 0). 
As long as there are free servers and the queue is not empty, 
the task in the front of the queue will be assigned to a free server with the smallest weight, 
and in case of a tie, it is assigned to a free server with the smallest index.

If there are no free servers and the queue is not empty, 
we wait until a server becomes free and immediately assign the next task. 
If multiple servers become free at the same time, 
then multiple tasks from the queue will be assigned in order of insertion following the weight and index priorities above.

A server that is assigned task `j` at second `t` will be free again at second `t + tasks[j]`.

Build an array `ans` of length `m`, where `ans[j]` is the index of the server the $j_{th}$ task will be assigned to.

Return the array `ans`.

**Constraints:**

- `servers.length == n`
- `tasks.length == m`
- `1 <= n, m <= 2 * 10^5`
- `1 <= servers[i], tasks[j] <= 2 * 10^5`

## 基礎思路

本題要模擬一個任務佇列的分派過程。每個任務在固定時刻抵達，必須分派給目前閒置、權重最小的伺服器，權重相同時取索引最小者。
伺服器處理完任務後會在對應時刻重新變為閒置。由於伺服器與任務數量皆可達 $2 \times 10^5$，若每次分派都線性掃描所有伺服器，總成本將過高，因此需要更有效率的資料結構。

在思考解法時，可掌握以下核心觀察：

- **閒置伺服器需依「權重、索引」雙重優先序取出**：
  每次分派都要取得最優先的閒置伺服器，適合以最小堆維護。若將權重與索引打包成單一數值鍵，比較時只需一次數值比較，且打包後的大小順序恰與「先比權重、再比索引」一致。

- **忙碌伺服器只需依完成時間排序**：
  只要知道哪些伺服器在目前時刻已完成工作即可。同時完成的伺服器之間的先後順序，會在放回閒置集合後由其優先序自然決定，因此忙碌集合只需以完成時間作為堆的鍵值。

- **時間只會向前推進，且可跳躍**：
  任務依序抵達，但若當下沒有閒置伺服器，就必須等待。此時不需逐秒模擬，可直接跳到最早完成的時刻，大幅省去空轉。

- **有序陣列本身就是合法的最小堆**：
  初始時所有伺服器皆閒置，將其鍵值排序後即滿足堆的性質，可省去建堆的步驟。

依據以上特性，可以採用以下策略：

- **以打包鍵值建立閒置伺服器的最小堆，並以排序取代建堆**。
- **以完成時間建立忙碌伺服器的最小堆**。
- **對每個任務**：
    - 先推進目前時間；若無閒置伺服器，則跳至最早完成時刻。
    - 將所有已完成的伺服器移回閒置堆。
    - 取出最優先的閒置伺服器分派任務，再將其以新的完成時間推入忙碌堆。

此策略讓每次分派與釋放都只需對數時間，能高效完成整個模擬。

## 解題步驟

### Step 1：計算數量並以打包鍵值初始化閒置堆

先取得伺服器與任務數量。接著將每台伺服器的權重與索引打包成單一數值鍵，使比較時能同時反映「權重優先、索引次之」的順序。

```typescript
const serverCount = servers.length;
const taskCount = tasks.length;

// 閒置堆儲存單一打包鍵值：weight * serverCount + index（最大約 4e10，在 float64 中可精確表示）
const freeHeap = new Float64Array(serverCount);
for (let serverIndex = 0; serverIndex < serverCount; serverIndex++) {
  freeHeap[serverIndex] = servers[serverIndex] * serverCount + serverIndex;
}
```

### Step 2：以排序取代建堆，並記錄閒置堆大小

遞增排序後的陣列天然滿足最小堆性質，因此直接使用原生數值排序完成建堆，並記錄目前的閒置伺服器數量。

```typescript
// 已排序的陣列本身就是合法的最小堆，因此以原生數值排序取代建堆
freeHeap.sort();
let freeSize = serverCount;
```

### Step 3：初始化忙碌堆、結果陣列與目前時間

忙碌堆以兩個平行陣列分別儲存完成時間與伺服器索引，只依完成時間排序。同時準備結果陣列與模擬用的時鐘。

```typescript
// 忙碌堆僅依完成時間排序；同時完成的情況稍後由閒置堆決定先後
const busyTime = new Float64Array(serverCount);
const busyServer = new Int32Array(serverCount);
let busySize = 0;

const result: number[] = new Array(taskCount);
let currentTime = 0;
```

### Step 4：逐一處理任務並推進目前時間

依序處理每個任務。任務在其索引對應的秒數抵達，但時鐘不可倒退，因此取兩者中較大者。若此時沒有閒置伺服器，且最早完成的伺服器尚未完成，就直接跳到該完成時刻。

```typescript
for (let taskIndex = 0; taskIndex < taskCount; taskIndex++) {
  // 任務 j 於第 j 秒抵達，但時鐘永遠不會倒退
  if (currentTime < taskIndex) {
    currentTime = taskIndex;
  }

  // 若沒有閒置伺服器，直接跳到最早的完成時間
  if (freeSize === 0 && busyTime[0] > currentTime) {
    currentTime = busyTime[0];
  }

  // ...
}
```

### Step 5：釋放已完成的伺服器並從忙碌堆彈出

在目前時刻之前已完成的伺服器都要釋放。每次取出忙碌堆頂端的伺服器，將堆中最後一個元素移到頂端並向下調整，以維持最小堆性質。

```typescript
for (let taskIndex = 0; taskIndex < taskCount; taskIndex++) {
  // Step 4：推進目前時間

  // 釋放所有在目前時間前已完成的伺服器
  while (busySize > 0 && busyTime[0] <= currentTime) {
    const releasedServer = busyServer[0];

    // 彈出忙碌堆頂端，並將最後一個元素向下調整
    busySize--;
    const lastTime = busyTime[busySize];
    const lastServer = busyServer[busySize];
    let position = 0;
    while (true) {
      let child = 2 * position + 1;
      if (child >= busySize) {
        break;
      }
      if (child + 1 < busySize && busyTime[child + 1] < busyTime[child]) {
        child++;
      }
      if (busyTime[child] >= lastTime) {
        break;
      }
      busyTime[position] = busyTime[child];
      busyServer[position] = busyServer[child];
      position = child;
    }
    busyTime[position] = lastTime;
    busyServer[position] = lastServer;

    // ...
  }

  // ...
}
```

### Step 6：將釋放的伺服器推入閒置堆

重新計算被釋放伺服器的打包鍵值，放到閒置堆尾端後向上調整，讓同時釋放的多台伺服器也能依權重與索引正確排序。

```typescript
for (let taskIndex = 0; taskIndex < taskCount; taskIndex++) {
  // Step 4：推進目前時間

  while (busySize > 0 && busyTime[0] <= currentTime) {
    // Step 5：從忙碌堆彈出已完成的伺服器

    // 將釋放的伺服器推入閒置堆並向上調整
    const releasedKey = servers[releasedServer] * serverCount + releasedServer;
    position = freeSize++;
    while (position > 0) {
      const parent = (position - 1) >> 1;
      if (freeHeap[parent] <= releasedKey) {
        break;
      }
      freeHeap[position] = freeHeap[parent];
      position = parent;
    }
    freeHeap[position] = releasedKey;
  }

  // ...
}
```

### Step 7：取出最優先的閒置伺服器並記錄分派結果

閒置堆頂端即為權重最小、索引最小的伺服器，對打包鍵值取模即可還原其索引。取出後將最後一個元素移到頂端並向下調整，最後把分派結果寫入結果陣列。

```typescript
for (let taskIndex = 0; taskIndex < taskCount; taskIndex++) {
  // Step 4：推進目前時間

  // Step 5～6：釋放已完成的伺服器並移回閒置堆

  // 取出權重最小、其次索引最小的閒置伺服器
  const assignedServer = freeHeap[0] % serverCount;
  freeSize--;
  const lastKey = freeHeap[freeSize];
  let position = 0;
  while (true) {
    let child = 2 * position + 1;
    if (child >= freeSize) {
      break;
    }
    if (child + 1 < freeSize && freeHeap[child + 1] < freeHeap[child]) {
      child++;
    }
    if (freeHeap[child] >= lastKey) {
      break;
    }
    freeHeap[position] = freeHeap[child];
    position = child;
  }
  freeHeap[position] = lastKey;

  result[taskIndex] = assignedServer;

  // ...
}
```

### Step 8：將分派的伺服器依完成時間推入忙碌堆

以目前時間加上任務處理時間算出完成時刻，將伺服器放到忙碌堆尾端並向上調整，供後續任務判斷何時釋放。

```typescript
for (let taskIndex = 0; taskIndex < taskCount; taskIndex++) {
  // Step 4：推進目前時間

  // Step 5～6：釋放已完成的伺服器並移回閒置堆

  // Step 7：取出最優先的閒置伺服器並記錄結果

  // 將分派的伺服器連同完成時間推入忙碌堆
  const finishTime = currentTime + tasks[taskIndex];
  position = busySize++;
  while (position > 0) {
    const parent = (position - 1) >> 1;
    if (busyTime[parent] <= finishTime) {
      break;
    }
    busyTime[position] = busyTime[parent];
    busyServer[position] = busyServer[parent];
    position = parent;
  }
  busyTime[position] = finishTime;
  busyServer[position] = assignedServer;
}
```

### Step 9：回傳分派結果

所有任務處理完畢後，結果陣列已記錄每個任務對應的伺服器索引，直接回傳。

```typescript
return result;
```

## 時間複雜度

- 初始化打包鍵值需 $O(n)$，排序建堆需 $O(n \log n)$。
- 每個任務各進行一次閒置堆彈出與一次忙碌堆推入，各為 $O(\log n)$。
- 每次釋放對應先前的一次分派，因此釋放總次數不超過 $m$，每次各需 $O(\log n)$。
- 總時間複雜度為 $O((n + m) \log n)$。

> $O((n + m) \log n)$

## 空間複雜度

- 閒置堆與忙碌堆的平行陣列皆為 $O(n)$。
- 結果陣列需 $O(m)$。
- 總空間複雜度為 $O(n + m)$。

> $O(n + m)$
