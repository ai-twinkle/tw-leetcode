# 3408. Design Task Manager

There is a task management system that allows users to manage their tasks, each associated with a priority. 
The system should efficiently handle adding, modifying, executing, and removing tasks.

Implement the `TaskManager` class:

- `TaskManager(vector<vector<int>>& tasks)` initializes the task manager with a list of user-task-priority triples. 
   Each element in the input list is of the form `[userId, taskId, priority]`, which adds a task to the specified user with the given priority.

- `void add(int userId, int taskId, int priority)` adds a task with the specified `taskId` and `priority` to the user with `userId`. 
  It is guaranteed that `taskId` does not exist in the system.

- `void edit(int taskId, int newPriority)` updates the priority of the existing `taskId` to `newPriority`. 
  It is guaranteed that taskId exists in the system.

- `void rmv(int taskId)` removes the task identified by `taskId` from the system. 
  It is guaranteed that `taskId` exists in the system.

- `int execTop()` executes the task with the highest priority across all users. 
  If there are multiple tasks with the same highest priority, execute the one with the highest `taskId`. 
  After executing, the `taskId` is removed from the system. 
  Return the `userId` associated with the executed task. 
  If no tasks are available, return -1.

Note that a user may be assigned multiple tasks.

**Constraints:**

- `1 <= tasks.length <= 10^5`
- `0 <= userId <= 10^5`
- `0 <= taskId <= 10^5`
- `0 <= priority <= 10^9`
- `0 <= newPriority <= 10^9`
- At most `2 * 10^5` calls will be made in total to `add`, `edit`, `rmv`, and `execTop` methods.
- The input is generated such that `taskId` will be valid.

## 基礎思路

本題要求設計一個系統，能夠：

1. 針對指定的使用者與任務，**新增任務並設定優先度**。
2. 針對指定 `taskId`，**更新該任務的優先度**。
3. 針對指定 `taskId`，**自系統中移除該任務**。
4. **跨所有使用者執行當前「最高優先度」的任務**；若有多筆同優先度，則執行 **`taskId` 較大** 的那一筆，並在執行後將該任務自系統移除，同時回傳該任務的 `userId`（若無任務則回傳 `-1`）。

從這些需求可整理出核心條件與限制：

- 操作總次數最高可達 $2 \times 10^5$，需要避免任何線性級別的全表掃描。
- 必須能夠「全域視角」地即時找到**優先度最高**（再以 `taskId` 作次序）的任務。
- 任務的新增、修改、移除會使「全域最高」隨時變動，因此需要**快速更新**與**快速查詢**兼顧的資料結構。

基於以上觀察，制定如下策略：

1. **全域最大堆（Max-Heap）**
   以 `(priority, taskId)` 作為鍵建立**單一全域最大堆**。排序規則：先依 `priority` 由大到小；若相同則以 `taskId` 由大到小。如此 `execTop()` 只需取堆頂即可在對數時間取得答案。

2. **任務現況表（O(1) 驗證）**
   維護兩張以 `taskId` 為索引的表：

    * `taskId -> userId`：任務屬主；不存在時標記為 `-1`。
    * `taskId -> priority`：任務當前優先度；不存在時標記為 `-1`。
      使得在查詢或清理堆頂時，可以 O(1) 驗證該紀錄是否仍然有效。

3. **惰性刪除（Lazy Deletion）**
   `edit` 時不在堆中尋找並刪除舊紀錄，而是將新 `(priority, taskId)` **再度推入**；`rmv` 時只在現況表中將該任務標記為不存在。
   `execTop()` 取堆頂時，若堆頂紀錄與現況表不一致（例如任務已被移除或優先度已變），便將該堆頂彈出丟棄，直到找到**與現況表一致**的有效任務為止。

4. **緊湊結構與動態擴充**
   使用 `Int32Array` 等緊湊陣列儲存現況表，並以自實作的陣列型堆配合動態擴充，降低常數成本與記憶體碎片，提升整體效率與可擴充性。

## 解題步驟

### Step 1：實作 `(priority, taskId)` 全域最大堆 `TaskPairMaxHeap`

先建立支援動態擴充、插入、檢視堆頂、彈出堆頂、以及內部上濾/下濾與比較的最大堆；排序規則為：**優先度高者在前；同優先度時 `taskId` 較大者在前**。

```typescript
/**
 * 針對 (priority, taskId) 的最大堆，使用 TypedArray 與動態擴充。
 * 比較順序：先比 priority（越大越前），同 priority 則比 taskId（越大越前）。
 */
class TaskPairMaxHeap {
  private priorityBuffer: Int32Array;
  private taskIdBuffer: Int32Array;
  private heapSize: number;

  /**
   * 建構一個 TaskPairMaxHeap。
   *
   * @param initialCapacity - 初始容量
   */
  constructor(initialCapacity: number = 1024) {
    const initialArrayCapacity = initialCapacity < 2 ? 2 : initialCapacity;
    this.priorityBuffer = new Int32Array(initialArrayCapacity);
    this.taskIdBuffer = new Int32Array(initialArrayCapacity);
    this.heapSize = 0;
  }

  /**
   * 取得目前堆內元素數量。
   *
   * @returns 目前堆的大小
   */
  get size(): number {
    return this.heapSize;
  }

  /**
   * 確保內部陣列容量至少達到 requiredCapacity。
   *
   * @param requiredCapacity - 需要的最小槽位數
   */
  private ensureCapacity(requiredCapacity: number): void {
    if (requiredCapacity <= this.priorityBuffer.length) {
      return;
    }

    let newCapacity = this.priorityBuffer.length << 1;
    while (newCapacity < requiredCapacity) {
      newCapacity <<= 1;
    }

    // 配置新緩衝並複製既有元素
    const newPriorityBuffer = new Int32Array(newCapacity);
    const newTaskIdBuffer = new Int32Array(newCapacity);
    newPriorityBuffer.set(this.priorityBuffer.subarray(0, this.heapSize));
    newTaskIdBuffer.set(this.taskIdBuffer.subarray(0, this.heapSize));
    this.priorityBuffer = newPriorityBuffer;
    this.taskIdBuffer = newTaskIdBuffer;
  }

  /**
   * 檢查 firstIndex 的元素是否大於 secondIndex 的元素。
   * 先比 priority，若相同則比 taskId。
   *
   * @param firstIndex - 第一個索引
   * @param secondIndex - 第二個索引
   * @returns 若第一個元素更大則為 true
   */
  private isGreater(firstIndex: number, secondIndex: number): boolean {
    const priorityFirst = this.priorityBuffer[firstIndex];
    const prioritySecond = this.priorityBuffer[secondIndex];
    if (priorityFirst !== prioritySecond) {
      return priorityFirst > prioritySecond;
    }
    return this.taskIdBuffer[firstIndex] > this.taskIdBuffer[secondIndex];
  }

  /**
   * 交換緩衝區中的兩個元素。
   *
   * @param firstIndex - 第一個索引
   * @param secondIndex - 第二個索引
   */
  private swap(firstIndex: number, secondIndex: number): void {
    const tempPriority = this.priorityBuffer[firstIndex];
    const tempTaskId = this.taskIdBuffer[firstIndex];
    this.priorityBuffer[firstIndex] = this.priorityBuffer[secondIndex];
    this.taskIdBuffer[firstIndex] = this.taskIdBuffer[secondIndex];
    this.priorityBuffer[secondIndex] = tempPriority;
    this.taskIdBuffer[secondIndex] = tempTaskId;
  }

  /**
   * 向上調整元素以恢復堆性質。
   *
   * @param index - 要上濾的元素索引
   */
  private siftUp(index: number): void {
    let currentIndex = index;
    while (currentIndex > 0) {
      const parentIndex = (currentIndex - 1) >> 1;
      if (!this.isGreater(currentIndex, parentIndex)) {
        break;
      }
      this.swap(currentIndex, parentIndex);
      currentIndex = parentIndex;
    }
  }

  /**
   * 向下調整元素以恢復堆性質。
   *
   * @param index - 要下濾的元素索引
   */
  private siftDown(index: number): void {
    let currentIndex = index;
    const heapLength = this.heapSize;

    while (true) {
      const leftChildIndex = (currentIndex << 1) + 1;
      if (leftChildIndex >= heapLength) {
        break;
      }

      const rightChildIndex = leftChildIndex + 1;
      let largerChildIndex = leftChildIndex;

      if (rightChildIndex < heapLength && this.isGreater(rightChildIndex, leftChildIndex)) {
        largerChildIndex = rightChildIndex;
      }

      if (!this.isGreater(largerChildIndex, currentIndex)) {
        break;
      }

      this.swap(currentIndex, largerChildIndex);
      currentIndex = largerChildIndex;
    }
  }

  /**
   * 插入一個新的 (priority, taskId)。
   *
   * @param priority - 任務優先度
   * @param taskId - 任務識別碼
   */
  push(priority: number, taskId: number): void {
    const insertIndex = this.heapSize;
    this.ensureCapacity(insertIndex + 1);
    this.priorityBuffer[insertIndex] = priority | 0;
    this.taskIdBuffer[insertIndex] = taskId | 0;
    this.heapSize = insertIndex + 1;
    this.siftUp(insertIndex);
  }

  /**
   * 查看（不移除）堆頂元素的優先度。
   *
   * @returns 最大元素的優先度；若堆為空則回傳 -1
   */
  peekPriority(): number {
    if (this.heapSize > 0) {
      return this.priorityBuffer[0];
    }
    return -1;
  }

  /**
   * 查看（不移除）堆頂元素的 taskId。
   *
   * @returns 最大元素的 taskId；若堆為空則回傳 -1
   */
  peekTaskId(): number {
    if (this.heapSize > 0) {
      return this.taskIdBuffer[0];
    }
    return -1;
  }

  /**
   * 移除堆頂元素。
   */
  pop(): void {
    const heapLength = this.heapSize;
    if (heapLength === 0) {
      return;
    }

    const lastIndex = heapLength - 1;
    this.priorityBuffer[0] = this.priorityBuffer[lastIndex];
    this.taskIdBuffer[0] = this.taskIdBuffer[lastIndex];
    this.heapSize = lastIndex;

    if (lastIndex > 0) {
      this.siftDown(0);
    }
  }
}
```

### Step 2：`TaskManager` 建構子（初始化任務現況表與全域堆）

建立 `TaskManager`：配置現況表（`taskId -> userId`、`taskId -> priority`），建立全域最大堆，並將初始任務逐一記錄與推入堆中。

```typescript
/**
 * 任務管理系統：支援新增、修改、移除與執行最高優先度任務。
 * 透過 TypedArray 與全域最大堆提升效率。
 */
class TaskManager {
  private static readonly MaxTaskId = 100_000;
  private static readonly NotPresent = -1;

  private readonly userByTaskId: Int32Array;
  private readonly priorityByTaskId: Int32Array;
  private readonly globalHeap: TaskPairMaxHeap;

  /**
   * 建構 TaskManager 並載入初始任務清單。
   *
   * @param tasks - 由 [userId, taskId, priority] 三元組所組成的陣列
   */
  constructor(tasks: number[][]) {
    const taskArraySize = TaskManager.MaxTaskId + 1;
    this.userByTaskId = new Int32Array(taskArraySize);
    this.priorityByTaskId = new Int32Array(taskArraySize);

    this.userByTaskId.fill(TaskManager.NotPresent);
    this.priorityByTaskId.fill(TaskManager.NotPresent);

    const initialHeapCapacity = Math.max(1024, (tasks?.length ?? 0) * 2);
    this.globalHeap = new TaskPairMaxHeap(initialHeapCapacity);

    for (let index = 0; index < tasks.length; index++) {
      const userId = tasks[index][0] | 0;
      const taskId = tasks[index][1] | 0;
      const priority = tasks[index][2] | 0;

      // 紀錄任務資訊
      this.userByTaskId[taskId] = userId;
      this.priorityByTaskId[taskId] = priority;

      // 插入堆中
      this.globalHeap.push(priority, taskId);
    }
  }

  // ...
}
```

### Step 3：`add` — 新增任務

在現況表中登錄任務屬主與優先度，並將 `(priority, taskId)` 推入全域堆。

```typescript
class TaskManager {
  // Step 2：TaskManager 建構子（初始化任務現況表與全域堆）

  /**
   * 新增一個任務。
   *
   * @param userId - 任務所屬使用者
   * @param taskId - 任務識別碼
   * @param priority - 任務優先度
   */
  add(userId: number, taskId: number, priority: number): void {
    this.userByTaskId[taskId] = userId | 0;
    this.priorityByTaskId[taskId] = priority | 0;
    this.globalHeap.push(priority | 0, taskId | 0);
  }

  // ...
}
```

### Step 4：`edit` — 調整任務優先度

更新現況表中的優先度，並將新的 `(priority, taskId)` 推入堆（採惰性刪除策略）。

```typescript
class TaskManager {
  // Step 2：TaskManager 建構子（初始化任務現況表與全域堆）
  
  // Step 3：add（新增任務）

  /**
   * 調整現有任務的優先度。
   *
   * @param taskId - 任務識別碼
   * @param newPriority - 新的優先度
   */
  edit(taskId: number, newPriority: number): void {
    this.priorityByTaskId[taskId] = newPriority | 0;

    // 將新值插入堆；舊值成為過期紀錄，待 execTop 時惰性清理
    this.globalHeap.push(newPriority | 0, taskId | 0);
  }

  // ...
}
```

### Step 5：`rmv` — 移除任務

於現況表中將該任務標記為不存在，供後續 `execTop()` 進行惰性清理。

```typescript
class TaskManager {
  // Step 2：TaskManager 建構子（初始化任務現況表與全域堆）
  
  // Step 3：add（新增任務）
  
  // Step 4：edit（調整任務優先度）

  /**
   * 自系統中移除任務（以不存在標記）。
   *
   * @param taskId - 任務識別碼
   */
  rmv(taskId: number): void {
    this.userByTaskId[taskId] = TaskManager.NotPresent;
    this.priorityByTaskId[taskId] = TaskManager.NotPresent;
  }

  // ...
}
```

### Step 6：`execTop` — 執行全域最高優先度任務

反覆檢視堆頂：
- 若堆頂與現況表不一致（已刪除或優先度過期）則彈出丟棄；
- 一旦找到有效任務，彈出並於現況表清除後回傳對應 `userId`。

```typescript
class TaskManager {
  // Step 2：TaskManager 建構子（初始化任務現況表與全域堆）

  // Step 3：add（新增任務）

  // Step 4：edit（調整任務優先度）
  
  // Step 5：rmv（移除任務）

  /**
   * 執行並移除當前全域最高優先度的任務。
   * 若同優先度，選擇 taskId 較大的任務。
   *
   * @returns 被執行任務的 userId；若無任務則回傳 -1
   */
  execTop(): number {
    while (this.globalHeap.size > 0) {
      const topPriority = this.globalHeap.peekPriority();
      const topTaskId = this.globalHeap.peekTaskId();
      const currentUser = this.userByTaskId[topTaskId];
      const currentPriority = this.priorityByTaskId[topTaskId];

      // 跳過過期或已移除的紀錄
      if (currentUser === TaskManager.NotPresent || currentPriority !== topPriority) {
        this.globalHeap.pop();
        continue;
      }

      // 有效任務：彈出並清除現況，再回傳 userId
      this.globalHeap.pop();
      this.userByTaskId[topTaskId] = TaskManager.NotPresent;
      this.priorityByTaskId[topTaskId] = TaskManager.NotPresent;
      return currentUser;
    }

    return -1;
  }
}
```

## 時間複雜度

- 建構子：將初始任務逐一推入堆，合計約 $O(n \log n)$。
- `add` / `edit`：各為一次堆插入，時間 $O(\log n)$。
- `rmv`：僅更新現況表，時間 $O(1)$。
- `execTop`：可能彈出若干過期紀錄，但每筆過期紀錄最多被彈出一次；攤銷後單次為 $O(\log n)$。
- 總時間複雜度：$O(n \log n + Q \log n)$（其中 $Q$ 為後續操作總數）。

> $O(n \log n + Q \log n)$

## 空間複雜度

- 現況表以 `taskId` 直索引（上限 $10^5$），為 $O(U)$；全域堆在最壞情況下包含初始任務與所有更新快照，約 $O(n + Q)$。
- 總空間複雜度：$O(n + Q)$。

> $O(n + Q)$
