# 2349. Design a Number Container System

Design a number container system that can do the following:

Insert or Replace a number at the given index in the system.
Return the smallest index for the given number in the system.
Implement the `NumberContainers` class:

- `NumberContainers()` Initializes the number container system.
- `void change(int index, int number)` Fills the container at `index` with the `number`. If there is already a number at that `index`, replace it.
- `int find(int number)` Returns the smallest index for the given `number`, or `-1` if there is no index that is filled by `number` in the system.

## 基礎思路

根據題目要求，我們需要設計一個數字容器系統，支援兩種操作：
1. **change(index, number)**：在指定的 index 處插入或替換數字。
2. **find(number)**：返回所有存放該數字的 index 中最小的那一個；如果沒有則返回 -1。

這意味著我們需要同時記錄每個 index 當前存放的數字，以及每個數字對應的所有 index。
為了能夠快速獲取最小的 index，我們為每個數字維護一個最小堆，堆中存放所有出現過該數字的 index，其中堆頂元素即為最小的 index。
透過這個資料結構，我們可以在 $O(\log n)$ 的時間內完成插入和查詢操作。

> **Tips**  
> 為了提高效率，由於同一個 index 在更新後可能仍然存在於舊數字的記錄中，因此我們在更新時不主動移除舊數據，而是採用「懶惰刪除」策略：
> - **懶惰刪除**：在查詢時先檢查堆頂元素是否為最新資料，若不是則從堆中彈出過期的數據，直到找到有效的 index。


## 解題步驟

### Step 1: 定義資料結構

- **numberHeaps**：一個 Map，鍵為數字，值為對應數字的最小堆（MinHeap）。
- **indexMap**：一個 Map，用來記錄每個 index 目前最新存放的數字，方便在查詢時驗證堆中數據是否為最新資料。

```typescript
class NumberContainers {
  private numberHeaps: Map<number, MinHeap>;
  private indexMap: Map<number, number>;
}
```

### Step 2: 實作 Min-Heap

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

### Step 3: 實作 `change(index, number)` 操作

- **更新 indexMap**：將 index 的最新數字記錄下來。
- **將 index 插入對應數字的最小堆**：
    - 如果該數字對應的堆尚未建立，則先新建一個。
    - 直接將 index 插入到該數字的堆中。
- **注意**：若該 index 之前出現在其他數字的堆中，不需立即刪除，待查詢時進行懶惰刪除。

```typescript
class NumberContainers {
  // ...
  
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
}
```

### Step 4: 實作 `find(number)` 操作

- 從 **numberHeaps** 中取得對應數字的最小堆。
- 檢查堆頂的 index 是否有效（利用 **indexMap** 判斷）：
    - 如果堆頂 index 在 **indexMap** 中對應的數字已經不是當前查詢的數字，則從堆中彈出，直到找到有效值或堆空。
- 返回有效的最小 index；如果堆空則返回 -1。

```typescript
class NumberContainers {
  // ...
  
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

---

## 時間複雜度

- **change 操作**：每次更新時主要成本在於向堆中插入元素，平均時間複雜度為 $O(\log n)$。
- **find 操作**：查詢時可能需要彈出一些過期數據，但每個 index 最多只被彈出一次，因此平均查詢時間複雜度也是 $O(\log n)$。

> $O(\log n)$

## 空間複雜度

- 我們使用兩個 Map 來記錄所有 index 與數字的對應關係，以及每個數字對應的最小堆。隨著操作數量增加，空間複雜度為 $O(n)$。

> $O(n)$
