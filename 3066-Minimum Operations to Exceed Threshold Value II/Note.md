# 3066. Minimum Operations to Exceed Threshold Value II

You are given a 0-indexed integer array `nums`, and an integer `k`.

In one operation, you will:

Take the two smallest integers `x` and `y` in `nums`.
Remove `x` and `y` from nums.
Add `min(x, y) * 2 + max(x, y)` anywhere in the array.
Note that you can only apply the described operation if `nums` contains at least two elements.

Return the minimum number of operations needed so that all elements of the array are greater than or equal to `k`.

## 基礎思路
這題可以使用 Priority Queue (Min Heap) 來解決，每次取出最小的兩個數字，然後進行運算，再將運算後的結果放回 Priority Queue 中，直到 `front` 大於等於 `k` 為止。

> Tips:
> 由於每次操作都需要取出目前最小的兩個數字，所以使用 Min Heap（最小堆）非常合適。
> Min Heap 能讓我們在 $O(\log n)$ 的時間內快速取得和移除最小值。

## 解題步驟

### Step 1: 初始化 Priority Queue

```typescript
const priorityQueue = new PriorityQueue<number>({ compare: (a, b) => a - b });

// 將 nums 中的數字放入 Priority Queue
for (let num of nums) {
  priorityQueue.enqueue(num);
}
```

### Step 2: 進行運算

```typescript
let operations = 0;

while (priorityQueue.front()! < k) {
  // 若 Priority Queue 中的元素少於 2 個，則無法進行運算
  if (priorityQueue.size() < 2) return -1;

  // 取出最小的兩個數字
  const x = priorityQueue.dequeue()!;
  const y = priorityQueue.dequeue()!;
  
  // 將運算後的結果放回 Priority Queue
  // 在 `x < y`，則 `min(x, y) * 2 + max(x, y)` 等於 `x * 2 + y`
  priorityQueue.enqueue(x * 2 + y);
  operations++;
}
```

## 時間複雜度
- 每一次從優先佇列中 dequeue 或 enqueue 的操作都是 $O(\log n)$（n 為目前佇列中的元素個數）。
- 在每次迴圈中，我們會執行 2 次 dequeue 與 1 次 enqueue，也就是 $O(3 * \log n) ≈ O(\log n)$ 的操作。 
  由於每一次迴圈操作會使優先佇列中的元素個數減少 1（兩個取出，一個加入），所以最多會進行 `n - 1` 次操作。
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度
- 優先佇列需要存放所有元素，最壞情況下佇列大小約為 `n`（初始時為 `n`，之後每次操作數量減少，但不會超過 `n`）。
- 總空間複雜度為 $O(n)$。

> $O(n)$
