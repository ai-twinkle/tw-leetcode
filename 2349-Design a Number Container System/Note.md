# 2349. Design a Number Container System

Design a number container system that can do the following:

Insert or Replace a number at the given index in the system.
Return the smallest index for the given number in the system.
Implement the `NumberContainers` class:

- `NumberContainers()` Initializes the number container system.
- `void change(int index, int number)` Fills the container at `index` with the `number`. If there is already a number at that `index`, replace it.
- `int find(int number)` Returns the smallest index for the given `number`, or `-1` if there is no index that is filled by `number` in the system.

**Constraints:**

- `1 <= index, number <= 10^9`
- At most `10^5` calls will be made in total to `change` and `find`.

## 基礎思路

本題要求能夠隨時根據 index 更新數字，並快速查找某個數字的最小 index。
因此，我們需同時管理「每個 index 對應的數字」以及「每個數字出現過的所有 index」，且後者要能高效取得最小值。

實作關鍵：

- 為每個數字維護一個最小堆（Min-Heap），其中存放所有出現該數字的 index，堆頂即為當前最小 index。
- 用一個 Map（indexMap）記錄每個 index 當前對應的數字，方便驗證堆中的 index 是否為最新狀態。

懶惰刪除策略：

更新 index 對應的數字時，舊的 index 仍殘留於原本數字的堆中。
為了省略即時刪除的複雜度，我們採用「懶惰刪除」策略——只有在 find 操作查詢時，才檢查堆頂 index 是否仍為最新資料，若不是再從堆中彈出。

## 解題步驟

### Step 1: 實作 Min-Heap

由於 JavaScript/TypeScript 沒有內建的堆結構，
因此我們先實作一個簡單的 Min-Heap 類別，提供插入（insert）、查看堆頂（peek）、移除堆頂（pop）等基本操作。

```typescript
class MinHeap {
  private heap: number[];

  constructor() {
    this.heap = [];
  }

  // 插入一個新值，並維護堆結構
  public insert(val: number): void {
    this.heap.push(val);
    this.bubbleUp(this.heap.length - 1);
  }

  // 返回堆頂元素但不刪除
  public peek(): number | undefined {
    return this.heap[0];
  }

  // 移除並返回堆頂元素
  public pop(): number | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0 && end !== undefined) {
      this.heap[0] = end;
      this.bubbleDown(0);
    }
    return top;
  }

  // 返回堆中元素個數
  public size(): number {
    return this.heap.length;
  }

  // 調整元素位置，維持堆性質（向上調整）
  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index] < this.heap[parentIndex]) {
        [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  // 調整元素位置，維持堆性質（向下調整）
  private bubbleDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      let smallest = index;
      if (left < length && this.heap[left] < this.heap[smallest]) {
        smallest = left;
      }
      if (right < length && this.heap[right] < this.heap[smallest]) {
        smallest = right;
      }
      if (smallest !== index) {
        [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
        index = smallest;
      } else {
        break;
      }
    }
  }
}
```

### Step 2: 定義資料結構

為了實現 `NumberContainers` 類別，我們需要以下的存儲結構：

- **numberHeaps**：一個 Map，鍵為數字，值為對應數字的最小堆（MinHeap）。
- **indexMap**：一個 Map，用來記錄每個 index 目前最新存放的數字，方便在查詢時驗證堆中數據是否為最新資料。

```typescript
class NumberContainers {
  private numberHeaps: Map<number, MinHeap>;
  private indexMap: Map<number, number>;
  
  // ...
}
```

### Step 3: 實作 `change(index, number)` 操作

- 將 index 對應的最新數字寫入 indexMap。
- 若 number 還未建立堆，先建立一個新的 MinHeap。
- 將 index 插入 number 的堆中。

（在這邊，我們不需主動從舊數字堆中移除 index，使用懶惰刪除即可）

```typescript
class NumberContainers {
  // Step 2: 定義資料結構
  
  change(index: number, number: number): void {
    // 更新 index 對應的最新數字
    this.indexMap.set(index, number);
    // 若對應數字的最小堆不存在，則先建立一個
    if (!this.numberHeaps.has(number)) {
      this.numberHeaps.set(number, new MinHeap());
    }
    // 將 index 插入到最小堆中
    this.numberHeaps.get(number)!.insert(index);
  }
  
  // ...
}
```

### Step 4: 實作 `find(number)` 操作

- 從 **numberHeaps** 中取得對應數字的最小堆。
  - 若堆不存在，直接回傳 -1。
- 反覆檢查堆頂 index 是否仍屬於當前 number，若不是則彈出（懶惰刪除），直到堆空或找到有效 index。
- 回傳找到的最小 index，若無則回傳 -1。

```typescript
class NumberContainers {
  // Step 2: 定義資料結構
  
  // Step 3: 實作 `change(index, number)` 操作
  
  find(number: number): number {
    if (!this.numberHeaps.has(number)) return -1;
    const heap = this.numberHeaps.get(number)!;
    
    // 懶惰刪除：移除堆中所有過期的 index
    while (heap.size() > 0) {
      const topIndex = heap.peek()!;
      if (this.indexMap.get(topIndex) !== number) {
        heap.pop();
      } else {
        return topIndex;
      }
    }
    return -1;
  }
}
```

## 時間複雜度

- **change 操作**：每次更新時主要成本在於向堆中插入元素，平均時間複雜度為 $O(\log n)$。
- **find 操作**：查詢時可能需要彈出一些過期數據，但每個 index 最多只被彈出一次，因此平均查詢時間複雜度也是 $O(\log n)$。
- 總時間複雜度為 $O(\log n)$。

> $O(\log n)$

## 空間複雜度

- 兩個 Map 分別存放所有 index 與數字的對應關係，以及每個數字的最小堆，空間複雜度為 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
