interface PriorityQueueOptions<T> {
  compare: (a: T, b: T) => number;
}

class PriorityQueue<T> {
  private readonly heap: T[] = [];
  private readonly compare: (a: T, b: T) => number;

  constructor(options: PriorityQueueOptions<T>, items?: T[]) {
    this.compare = options.compare;
    if (items) {
      // Initialize heap with given items and heapify in O(n) time.
      this.heap = [...items];
      this.buildHeap();
    }
  }

  // Enqueue (insert) a new item.
  enqueue(item: T): void {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  // Dequeue (remove) the top element (smallest if min-heap).
  dequeue(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return top;
  }

  // Peek at the top element without removing it.
  front(): T | undefined {
    return this.heap[0];
  }

  // Return the number of elements in the queue.
  size(): number {
    return this.heap.length;
  }

  // Check if the queue is empty.
  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  // Build a heap from an unsorted array in O(n) time.
  private buildHeap(): void {
    for (let i = Math.floor(this.heap.length / 2); i >= 0; i--) {
      this.bubbleDown(i);
    }
  }

  // Bubble up the element at index to restore heap property.
  private bubbleUp(index: number): void {
    const element = this.heap[index];
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.heap[parentIndex];
      if (this.compare(element, parent) >= 0) break;
      // Swap element with its parent.
      this.heap[index] = parent;
      this.heap[parentIndex] = element;
      index = parentIndex;
    }
  }

  // Bubble down the element at index to restore heap property.
  private bubbleDown(index: number): void {
    const length = this.heap.length;
    const element = this.heap[index];

    while (true) {
      let leftIndex = 2 * index + 1;
      let rightIndex = 2 * index + 2;
      let swapIndex: number | null = null;

      if (leftIndex < length) {
        if (this.compare(this.heap[leftIndex], element) < 0) {
          swapIndex = leftIndex;
        }
      }

      if (rightIndex < length) {
        if (
          (swapIndex === null && this.compare(this.heap[rightIndex], element) < 0) ||
          (swapIndex !== null && this.compare(this.heap[rightIndex], this.heap[leftIndex]) < 0)
        ) {
          swapIndex = rightIndex;
        }
      }

      if (swapIndex === null) break;

      // Swap element with the smaller child.
      this.heap[index] = this.heap[swapIndex];
      this.heap[swapIndex] = element;
      index = swapIndex;
    }
  }
}

class TreeNode {
  val: number
  left: TreeNode | null
  right: TreeNode | null
  constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
    this.val = (val===undefined ? 0 : val)
    this.left = (left===undefined ? null : left)
    this.right = (right===undefined ? null : right)
  }
}
