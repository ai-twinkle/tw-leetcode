class MinHeapNumbers {
  private readonly heap: number[];

  constructor() {
    this.heap = [];
  }

  // Insert a new value and adjust the heap.
  public insert(val: number): void {
    this.heap.push(val);
    this.bubbleUp(this.heap.length - 1);
  }

  // Return the smallest element without removing it.
  public peek(): number | undefined {
    return this.heap[0];
  }

  // Remove and return the smallest element.
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

  // Get the number of elements in the heap.
  public size(): number {
    return this.heap.length;
  }

  // Move the element at index upward to restore heap property.
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

  // Move the element at index downward to restore heap property.
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

class NumberContainers {
  // Map: number -> min-heap of indexes where the number appears.
  private numberHeaps: Map<number, MinHeapNumbers>;
  // Map: index -> current number at that index.
  private indexMap: Map<number, number>;

  constructor() {
    this.numberHeaps = new Map();
    this.indexMap = new Map();
  }

  change(index: number, number: number): void {
    // Update the mapping for the index.
    // Note: if this index was previously assigned a different number,
    // we do not remove it from its old heap. Instead, we'll handle it lazily.
    this.indexMap.set(index, number);

    // Get or create the min-heap for the given number.
    if (!this.numberHeaps.has(number)) {
      this.numberHeaps.set(number, new MinHeapNumbers());
    }
    // Insert the index into the corresponding heap.
    this.numberHeaps.get(number)!.insert(index);
  }

  find(number: number): number {
    if (!this.numberHeaps.has(number)) return -1;
    const heap = this.numberHeaps.get(number)!;

    // Remove stale indexes.
    while (heap.size() > 0) {
      const topIndex = heap.peek()!;
      // Check if the index's current assigned number is still the target number.
      if (this.indexMap.get(topIndex) !== number) {
        // This index is stale; remove it from the heap.
        heap.pop();
      } else {
        // The top of the heap is valid.
        return topIndex;
      }
    }
    return -1;
  }
}
