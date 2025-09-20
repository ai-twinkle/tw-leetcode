# 3508. Implement Router

Design a data structure that can efficiently manage data packets in a network router. 
Each data packet consists of the following attributes:

- `source`: A unique identifier for the machine that generated the packet.
- `destination`: A unique identifier for the target machine.
- `timestamp`: The time at which the packet arrived at the router.

Implement the `Router` class:

`Router(int memoryLimit)`: Initializes the Router object with a fixed memory limit.

- `memoryLimit` is the maximum number of packets the router can store at any given time.
- If adding a new packet would exceed this limit, the oldest packet must be removed to free up space.

`bool addPacket(int source, int destination, int timestamp)`: Adds a packet with the given attributes to the router.

- A packet is considered a duplicate if another packet with the same `source`, `destination`, and `timestamp` already exists in the router.
- Return `true` if the packet is successfully added (i.e., it is not a duplicate); otherwise return `false`.

`int[] forwardPacket()`: Forwards the next packet in FIFO (First In First Out) order.

- Remove the packet from storage.
- Return the packet as an array `[source, destination, timestamp]`.
- If there are no packets to forward, return an empty array.

`int getCount(int destination, int startTime, int endTime)`:

- Returns the number of packets currently stored in the router (i.e., not yet forwarded) 
  that have the specified destination and have timestamps in the inclusive range `[startTime, endTime]`.

Note that queries for `addPacket` will be made in increasing order of `timestamp`.

**Constraints:**

- `2 <= memoryLimit <= 10^5`
- `1 <= source, destination <= 2 * 10^5`
- `1 <= timestamp <= 10^9`
- `1 <= startTime <= endTime <= 10^9`
- At most `10^5` calls will be made to `addPacket`, `forwardPacket`, and `getCount` methods altogether.
- queries for `addPacket` will be made in increasing order of `timestamp`.

## 基礎思路

我們要設計一個路由器緩衝結構，需同時滿足：

1. **容量限制（固定記憶上限）**：儲存封包數量超過上限時，必須**自動淘汰最舊封包**（FIFO）。
2. **去重新增**：同 `(source, destination, timestamp)` 的封包不可重複加入。
3. **FIFO 轉送**：以**先進先出**的順序取出下一個待轉送封包。
4. **按目的地與時間區間查數量**：返回當前緩衝中、指定 `destination` 且 `timestamp ∈ [startTime, endTime]` 的封包數。

我們可以使用以下策略來達成：

- **環狀緩衝（Ring Buffer）作為主存**：以預先配置的三個 TypedArray（`sourceBuf`、`destinationBuf`、`timestampBuf`）存放封包欄位，配合 `head/tail/size` 指標，O(1) enqueue/dequeue，達成 **FIFO + 固定容量**。
- **三元組去重集合**：將 `(source, destination, timestamp)` 打包為 66-bit `BigInt` key，存入 `Set` 以 $O(1)$ 去重；超出容量時，先從環狀緩衝 dequeue，再同步從 `Set` 移除舊 key。
- **目的地 → 時戳遞增序列**：維護 `perDestination[destination] = { arr, head }`，`arr` 只會**尾端附加**（因題目保證 `addPacket` 的 `timestamp` 單調不減），刪除僅發生在**序列前端**（配合 FIFO）。如此即可用**二分**在有效視窗 `[head, arr.length)` 上做區間計數。
- **攤銷壓縮**：當某目的地的 `head` 前移太多時，適度做陣列切片壓縮，以控制記憶體。

透過上述設計，新增/移除皆為 $O(1)$（含去重、目的地序列同步），區間統計為 $O(log n)$（在單一目的地的已排序序列上做兩次二分），滿足上限 $10^5$ 次操作的效率需求。

## 解題步驟

### Step 1：主類別與欄位宣告

宣告容量、三個環狀緩衝欄位、指標與計數、去重集合，以及「目的地 → 時戳序列」索引。

```typescript
class Router {
  /**
   * 最大可儲存的封包數
   */
  private readonly memoryLimit: number;

  /**
   * 環狀緩衝（預先配置的 TypedArray，降低常數成本）
   */
  private readonly sourceBuf: Uint32Array;
  private readonly destinationBuf: Uint32Array;
  private readonly timestampBuf: Uint32Array;

  /**
   * 環狀緩衝指標與當前大小
   */
  private headIndex: number = 0;
  private tailIndex: number = 0;
  private currentSize: number = 0;

  /**
   * 重複偵測：將 (source, destination, timestamp) 打包成 BigInt。
   * 版位： [source:18][destination:18][timestamp:30]，共 66 bits。
   */
  private readonly tripletSet: Set<bigint> = new Set();

  /**
   * 目的地對應的時戳多重集合（遞增序），只在尾端新增、前端刪除。
   * 以 {arr, head} 儲存，避免 O(n) 的陣列 shift。
   */
  private readonly perDestination: Map<number, { arr: number[]; head: number }> = new Map();

  // ...
}
```

### Step 2：建構子 — 初始化環狀緩衝

配置固定大小的三個欄位緩衝（按容量），其餘狀態預設為 0。

```typescript
class Router {
  // Step 1：主類別與欄位宣告

  /**
   * @param memoryLimit 路由器可儲存的最大封包數
   */
  constructor(memoryLimit: number) {
    this.memoryLimit = memoryLimit;
    this.sourceBuf = new Uint32Array(memoryLimit);
    this.destinationBuf = new Uint32Array(memoryLimit);
    this.timestampBuf = new Uint32Array(memoryLimit);
  }

  // ...
}
```

### Step 3：靜態工具 `makeKey` — 三元組去重鍵

以位移打包 `(source, destination, timestamp)` 成 66-bit `BigInt`，供 `Set` 去重/刪除使用。

```typescript
class Router {
  // Step 1：主類別與欄位宣告
  
  // Step 2：建構子 — 初始化環狀緩衝

  /**
   * 將 (source, destination, timestamp) 建立為緊湊的 66-bit BigInt key。
   *
   * @param source 來源（<= 2e5）
   * @param destination 目的地（<= 2e5）
   * @param timestamp 時戳（<= 1e9）
   * @returns BigInt key
   */
  private static makeKey(source: number, destination: number, timestamp: number): bigint {
    const S = BigInt(source);
    const D = BigInt(destination);
    const T = BigInt(timestamp);
    // 版位：source << 48 | destination << 30 | timestamp
    return (S << 48n) | (D << 30n) | T;
  }

  // ...
}
```

### Step 4：私有 `enqueue` — 環狀緩衝入隊

寫入尾端、前進尾指標、更新大小。容量檢查由上層呼叫先行處理。

```typescript
class Router {
  // Step 1：主類別與欄位宣告

  // Step 2：建構子 — 初始化環狀緩衝
  
  // Step 3：靜態工具 `makeKey` — 三元組去重鍵

  /**
   * 入隊至環狀緩衝。假設已確認有容量。
   */
  private enqueue(source: number, destination: number, timestamp: number): void {
    this.sourceBuf[this.tailIndex] = source >>> 0;
    this.destinationBuf[this.tailIndex] = destination >>> 0;
    this.timestampBuf[this.tailIndex] = timestamp >>> 0;

    this.tailIndex += 1;
    if (this.tailIndex === this.memoryLimit) {
      this.tailIndex = 0;
    }
    this.currentSize += 1;
  }

  // ...
}
```

### Step 5：私有 `dequeue` — 環狀緩衝出隊

從頭端取出、前進頭指標、更新大小並回傳三欄位。

```typescript
class Router {
  // Step 1：主類別與欄位宣告

  // Step 2：建構子 — 初始化環狀緩衝

  // Step 3：靜態工具 `makeKey` — 三元組去重鍵
  
  // Step 4：私有 `enqueue` — 環狀緩衝入隊

  /**
   * 從環狀緩衝出隊。假設 size > 0。
   *
   * @returns 三元組 [source, destination, timestamp]
   */
  private dequeue(): [number, number, number] {
    const source = this.sourceBuf[this.headIndex] | 0;
    const destination = this.destinationBuf[this.headIndex] | 0;
    const timestamp = this.timestampBuf[this.headIndex] | 0;

    this.headIndex += 1;
    if (this.headIndex === this.memoryLimit) {
      this.headIndex = 0;
    }
    this.currentSize -= 1;

    return [source, destination, timestamp];
  }

  // ...
}
```

### Step 6：私有 `addToDestination` — 目的地序列追加

把時戳追加到該 `destination` 的遞增陣列尾端（題目保證 `addPacket` 按時戳遞增到來）。

```typescript
class Router {
  // Step 1：主類別與欄位宣告

  // Step 2：建構子 — 初始化環狀緩衝

  // Step 3：靜態工具 `makeKey` — 三元組去重鍵

  // Step 4：私有 `enqueue` — 環狀緩衝入隊
  
  // Step 5：私有 `dequeue` — 環狀緩衝出隊

  /**
   * 將時戳推入指定目的地的序列（單調不減，維持排序）。
   *
   * @param destination 目的地
   * @param timestamp 到達時間（依題意單調不減）
   */
  private addToDestination(destination: number, timestamp: number): void {
    let bucket = this.perDestination.get(destination);
    if (bucket === undefined) {
      bucket = { arr: [], head: 0 };
      this.perDestination.set(destination, bucket);
    }
    // 直接尾端附加；到達時戳單調不減，故陣列維持遞增。
    bucket.arr.push(timestamp);
  }

  // ...
}
```

### Step 7：私有 `removeFromDestination` — 目的地序列前端彈出（配合 FIFO）

當一個封包自 FIFO 移除時，同步將該目的地序列的前端對應時戳前移，以維持「尚在緩衝中的有效視窗」。

```typescript
class Router {
  // Step 1：主類別與欄位宣告

  // Step 2：建構子 — 初始化環狀緩衝

  // Step 3：靜態工具 `makeKey` — 三元組去重鍵

  // Step 4：私有 `enqueue` — 環狀緩衝入隊

  // Step 5：私有 `dequeue` — 環狀緩衝出隊
  
  // Step 6：私有 `addToDestination` — 目的地序列追加

  /**
   * 從目的地序列前端彈出一個時戳（當 FIFO 移除了該封包時）。
   *
   * @param destination 目的地
   * @param timestamp 預期彈出的時戳（一致性防呆）
   */
  private removeFromDestination(destination: number, timestamp: number): void {
    const bucket = this.perDestination.get(destination);
    if (bucket === undefined) {
      return;
    }
    // 依 FIFO，一定是前端；一致時 head 前進
    const { arr } = bucket;
    const h = bucket.head;
    if (h < arr.length && arr[h] === timestamp) {
      bucket.head = h + 1;

      // 偶爾壓縮，避免前綴垃圾造成記憶體膨脹
      if (bucket.head > 1024 && bucket.head * 2 > arr.length) {
        bucket.arr = arr.slice(bucket.head);
        bucket.head = 0;
      }
    } else {
      // 正常情境不會發生；為了效能不做線性回溯。
    }
    // 若已空，移除 bucket 節省空間
    if (bucket.head >= bucket.arr.length) {
      this.perDestination.delete(destination);
    }
  }

  // ...
}
```

### Step 8：私有 `lowerBound` — 二分找第一個 ≥ target 的索引

在有效視窗 `[start, arr.length)` 上做下界查找。

```typescript
class Router {
  // Step 1：主類別與欄位宣告

  // Step 2：建構子 — 初始化環狀緩衝

  // Step 3：靜態工具 `makeKey` — 三元組去重鍵

  // Step 4：私有 `enqueue` — 環狀緩衝入隊

  // Step 5：私有 `dequeue` — 環狀緩衝出隊

  // Step 6：私有 `addToDestination` — 目的地序列追加
  
  // Step 7：私有 `removeFromDestination` — 目的地序列前端彈出（配合 FIFO）

  /**
   * 二分：回傳在 [start, arr.length) 區間內，第一個 arr[i] >= target 的索引。
   */
  private static lowerBound(arr: number[], start: number, target: number): number {
    let left = start;
    let right = arr.length;
    while (left < right) {
      const mid = left + ((right - left) >> 1);
      if (arr[mid] < target) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    return left;
  }

  // ...
}
```

### Step 9：私有 `upperBound` — 二分找第一個 > target 的索引

在有效視窗 `[start, arr.length)` 上做上界查找。

```typescript
class Router {
  // Step 1：主類別與欄位宣告

  // Step 2：建構子 — 初始化環狀緩衝

  // Step 3：靜態工具 `makeKey` — 三元組去重鍵

  // Step 4：私有 `enqueue` — 環狀緩衝入隊

  // Step 5：私有 `dequeue` — 環狀緩衝出隊

  // Step 6：私有 `addToDestination` — 目的地序列追加

  // Step 7：私有 `removeFromDestination` — 目的地序列前端彈出（配合 FIFO）
  
  // Step 8：私有 `lowerBound` — 二分找第一個 ≥ target 的索引

  /**
   * 二分：回傳在 [start, arr.length) 區間內，第一個 arr[i] > target 的索引。
   */
  private static upperBound(arr: number[], start: number, target: number): number {
    let left = start;
    let right = arr.length;
    while (left < right) {
      const mid = left + ((right - left) >> 1);
      if (arr[mid] <= target) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    return left;
  }

  // ...
}
```

### Step 10：`addPacket` — 新增封包（去重 + 若滿則先淘汰最舊）

1. 先以 `Set` 去重；
2. 若容量已滿，從環狀緩衝 dequeue 最舊封包，並同步從 `Set` 與目的地序列移除；
3. 將新封包 enqueue，更新 `Set` 與目的地序列。

```typescript
class Router {
  // Step 1：主類別與欄位宣告

  // Step 2：建構子 — 初始化環狀緩衝

  // Step 3：靜態工具 `makeKey` — 三元組去重鍵

  // Step 4：私有 `enqueue` — 環狀緩衝入隊

  // Step 5：私有 `dequeue` — 環狀緩衝出隊

  // Step 6：私有 `addToDestination` — 目的地序列追加

  // Step 7：私有 `removeFromDestination` — 目的地序列前端彈出（配合 FIFO）

  // Step 8：私有 `lowerBound` — 二分找第一個 ≥ target 的索引
  
  // Step 9：私有 `upperBound` — 二分找第一個 > target 的索引

  /**
   * 若非重複則加入一筆封包；若到達容量則先淘汰最舊封包。
   *
   * @param source 來源
   * @param destination 目的地
   * @param timestamp 到達時間（題意保證呼叫序單調遞增）
   * @returns 插入成功回傳 true；重複則回傳 false
   */
  addPacket(source: number, destination: number, timestamp: number): boolean {
    const key = Router.makeKey(source, destination, timestamp);
    if (this.tripletSet.has(key)) {
      return false;
    }

    // 容量滿則先淘汰最舊封包；同步維護索引結構
    if (this.currentSize === this.memoryLimit) {
      const [oldSource, oldDestination, oldTimestamp] = this.dequeue();
      const oldKey = Router.makeKey(oldSource, oldDestination, oldTimestamp);
      this.tripletSet.delete(oldKey);
      this.removeFromDestination(oldDestination, oldTimestamp);
    }

    // 插入新封包
    this.enqueue(source, destination, timestamp);
    this.tripletSet.add(key);
    this.addToDestination(destination, timestamp);

    return true;
  }

  // ...
}
```

### Step 11：`forwardPacket` — 轉送下一個封包（FIFO）

若無封包則回傳空陣列；否則出隊並同步從 `Set` 與目的地序列去除，回傳 `[source, destination, timestamp]`。

```typescript
class Router {
  // Step 1：主類別與欄位宣告

  // Step 2：建構子 — 初始化環狀緩衝

  // Step 3：靜態工具 `makeKey` — 三元組去重鍵

  // Step 4：私有 `enqueue` — 環狀緩衝入隊

  // Step 5：私有 `dequeue` — 環狀緩衝出隊

  // Step 6：私有 `addToDestination` — 目的地序列追加

  // Step 7：私有 `removeFromDestination` — 目的地序列前端彈出（配合 FIFO）

  // Step 8：私有 `lowerBound` — 二分找第一個 ≥ target 的索引

  // Step 9：私有 `upperBound` — 二分找第一個 > target 的索引
  
  // Step 10：`addPacket` — 新增封包（去重 + 若滿則先淘汰最舊）

  /**
   * 以 FIFO 次序轉送下一個封包。
   * 轉送同時自緩衝刪除，並回傳 [source, destination, timestamp]。
   *
   * @returns number[]；若無封包可轉送則回傳空陣列
   */
  forwardPacket(): number[] {
    if (this.currentSize === 0) {
      return [];
    }
    const [source, destination, timestamp] = this.dequeue();
    const key = Router.makeKey(source, destination, timestamp);
    this.tripletSet.delete(key);
    this.removeFromDestination(destination, timestamp);
    return [source, destination, timestamp];
  }

  // ...
}
```

### Step 12：`getCount` — 目的地 + 時間區間計數（雙二分）

在 `perDestination[destination]` 的有效視窗 `[head, arr.length)` 上，
以 `lowerBound(startTime)` 與 `upperBound(endTime)` 取得左右界，回傳其差值。

```typescript
class Router {
  // Step 1：主類別與欄位宣告

  // Step 2：建構子 — 初始化環狀緩衝

  // Step 3：靜態工具 `makeKey` — 三元組去重鍵

  // Step 4：私有 `enqueue` — 環狀緩衝入隊

  // Step 5：私有 `dequeue` — 環狀緩衝出隊

  // Step 6：私有 `addToDestination` — 目的地序列追加

  // Step 7：私有 `removeFromDestination` — 目的地序列前端彈出（配合 FIFO）

  // Step 8：私有 `lowerBound` — 二分找第一個 ≥ target 的索引

  // Step 9：私有 `upperBound` — 二分找第一個 > target 的索引

  // Step 10：`addPacket` — 新增封包（去重 + 若滿則先淘汰最舊）
  
  // Step 11：`forwardPacket` — 轉送下一個封包（FIFO）

  /**
   * 回傳當前尚未轉送、目的地為指定值且時戳 ∈ [startTime, endTime] 的封包數。
   * 以二分在有效視窗 [head .. arr.length) 上查找。
   *
   * @param destination 目的地
   * @param startTime 起始（含）
   * @param endTime 結束（含）
   * @returns 數量
   */
  getCount(destination: number, startTime: number, endTime: number): number {
    const bucket = this.perDestination.get(destination);
    if (bucket === undefined) {
      return 0;
    }
    if (startTime > endTime) {
      return 0;
    }
    const { arr, head } = bucket;
    if (head >= arr.length) {
      return 0;
    }

    // 找到第一個 ≥ startTime 的位置
    const left = Router.lowerBound(arr, head, startTime);
    if (left >= arr.length) {
      return 0;
    }

    // 找到第一個 > endTime 的位置
    const right = Router.upperBound(arr, head, endTime);
    if (right <= left) {
      return 0;
    }

    return right - left;
  }
}
```

## 時間複雜度

- `addPacket`：去重（Set 查詢/新增）與環狀入隊 O(1)；若淘汰最舊，環狀出隊與索引同步亦為 O(1)。
- `forwardPacket`：環狀出隊 + 去重移除 + 目的地序列前移，皆為 O(1)。
- `getCount`：在單一目的地的遞增序列有效視窗上做兩次二分，O(log n_dest)；整體以 $O(\log n)$ 表示。
- 總時間複雜度為 $O(Q + \sum \log n_{dest\_query})$，通常可簡化為 $O(Q \log n)$；其中 $n$ 為記憶上限（容量），$Q$ 為所有操作總次數。

> $O(Q \log n)$

## 空間複雜度

- 環狀緩衝三個欄位合計 $O(n)$；去重集合與目的地索引在最壞情況下與在緩衝中的封包數同階。
- 總空間複雜度為 $O(n)$。

> $O(n)$
