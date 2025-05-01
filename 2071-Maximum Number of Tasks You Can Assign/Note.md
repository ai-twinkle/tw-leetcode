# 2071. Maximum Number of Tasks You Can Assign

You have `n` tasks and `m` workers. 
Each task has a strength requirement stored in a 0-indexed integer array `tasks`, 
with the $i^{th}$ task requiring `tasks[i]` strength to complete. 
The strength of each worker is stored in a 0-indexed integer array `workers`, 
with the $j^{th}$ worker having `workers[j]` strength. 
Each worker can only be assigned to a single task and must have a strength greater than or equal to the task's strength requirement 
(i.e., `workers[j] >= tasks[i]`).

Additionally, you have `pills` magical pills that will increase a worker's strength by `strength`. 
You can decide which workers receive the magical pills, 
however, you may only give each worker at most one magical pill.

Given the 0-indexed integer arrays `tasks` and `workers` and 
the integers `pills` and `strength`, return the maximum number of tasks that can be completed.

## 基礎思路

本題要求從給定的任務 (`tasks`) 與工人 (`workers`) 中，分配工人完成盡可能多的任務。每個任務都有最低的力量需求，每個工人亦有自身的力量值。此外，我們還可以使用最多 `pills` 顆魔法藥水，每顆藥水可增加單一工人 `strength` 的力量，每位工人至多可服用一顆藥水。

解此問題需透過排序搭配二分搜尋的方式，具體步驟如下：

1. **排序任務與工人力量**，方便後續操作。
2. **處理特例**：
    - 若無藥水或藥水無效，直接透過雙指針貪婪求解。
    - 若藥水足夠給所有工人服用，也直接透過貪婪求解。
3. **預計算每位工人服用藥水後的力量**。
4. **透過二分搜尋**，確認能夠完成的最大任務數量：
    - 對每個可能的任務數量，透過貪婪策略驗證是否可行。
    - 貪婪驗證時優先選擇最強、不需服用藥水的工人，若無法滿足則才考慮服藥最弱的工人。

透過上述步驟，即可高效求得最終答案。

## 解題步驟

### Step 1：排序與初始化

將任務 (`tasks`) 與工人 (`workers`) 分別進行排序（由小至大），以利後續操作：

```typescript
const taskCount = tasks.length;
const workerCount = workers.length;

// 使用 Uint32Array 提高效能
const sortedTasks = new Uint32Array(tasks).sort();
const sortedWorkers = new Uint32Array(workers).sort();
```

### Step 2：處理特殊情況

若沒有可用藥水 (`pills === 0`) 或藥水無效果 (`strength === 0`)，可透過雙指針法直接貪婪求解：

```typescript
if (pills === 0 || pillStrength === 0) {
  let taskPtr = taskCount - 1;
  let workerPtr = workerCount - 1;
  let completed = 0;

  while (taskPtr >= 0 && workerPtr >= 0) {
    if (sortedWorkers[workerPtr] >= sortedTasks[taskPtr]) {
      completed++;
      workerPtr--;
      taskPtr--;
    } else {
      taskPtr--;
    }
  }
  return completed;
}
```

同樣地，若藥水足夠每位工人服用，則僅使用加藥後力量配對：

```typescript
const boostedWorkers = new Uint32Array(workerCount);
for (let i = 0; i < workerCount; i++) {
  boostedWorkers[i] = sortedWorkers[i] + pillStrength;
}

if (pills >= workerCount) {
  let taskPtr = taskCount - 1;
  let boostPtr = workerCount - 1;
  let completed = 0;

  while (taskPtr >= 0 && boostPtr >= 0) {
    if (boostedWorkers[boostPtr] >= sortedTasks[taskPtr]) {
      completed++;
      boostPtr--;
      taskPtr--;
    } else {
      taskPtr--;
    }
  }
  return completed;
}
```

### Step 3：二分搜尋 + 貪婪檢驗

設定二分搜尋的初始範圍，透過此方式確定最大可完成任務數：

```typescript
const candidateBuffer = new Uint32Array(workerCount);
let low = 0;
let high = Math.min(taskCount, workerCount);
let best = 0;

while (low <= high) {
  const trialCount = (low + high) >>> 1;
  
  if (trialCount === 0) {
    best = 0;
    low = 1;
    continue;
  }

  const windowStart = workerCount - trialCount;
  let workerPtr = workerCount - 1;
  let head = 0, tail = 0;
  let remainingPills = pills;
  let feasible = true;

  // 貪婪檢驗從最難任務開始分配
  for (let taskIdx = trialCount - 1; taskIdx >= 0; taskIdx--) {
    const need = sortedTasks[taskIdx];

    while (workerPtr >= windowStart && boostedWorkers[workerPtr] >= need) {
      candidateBuffer[tail++] = sortedWorkers[workerPtr--];
    }

    if (head === tail) {
      feasible = false;
      break;
    }

    if (candidateBuffer[head] >= need) {
      head++;
    } else {
      tail--;
      if (--remainingPills < 0) {
        feasible = false;
        break;
      }
    }
  }

  if (feasible) {
    best = trialCount;
    low = trialCount + 1;
  } else {
    high = trialCount - 1;
  }
}

return best;
```

## 時間複雜度

- **排序**：將任務及工人力量排序，所需時間為 $O(n\log n + m\log m)$。
- **二分搜尋與貪婪檢驗**：二分搜尋 $O(\log \min(n,m))$ 次，每次貪婪檢驗最多需遍歷 $O(m)$ 名工人。
- 總時間複雜度為：$O\bigl(n\log n + m\log m + m\log \min(n,m)\bigr) \approx O\bigl((n+m)\log(n+m)\bigr)$。

> $O\bigl((n+m)\log(n+m)\bigr)$

## 空間複雜度

- **儲存排序陣列**：  
  使用額外陣列儲存排序後的任務 (`sortedTasks`) 與工人力量 (`sortedWorkers`, `boostedWorkers`)，總空間複雜度為 $O(n+m)$。
- **貪婪檢驗暫存陣列** (`candidateBuffer`) 空間亦為 $O(m)$。
- 其他變數僅佔用常數空間。

- 總空間複雜度為：$O(n+m)$。

> $O(n+m)$
