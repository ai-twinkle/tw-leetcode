abstract class BaseBinaryHeap {
  protected readonly valueHeap: Int32Array;
  protected readonly indexHeap: Int32Array;
  protected heapSize = 0;

  public poppedValue = 0;
  public poppedIndex = 0;

  /**
   * @param capacity Maximum number of elements to store
   */
  constructor(capacity: number) {
    this.valueHeap = new Int32Array(capacity);
    this.indexHeap = new Int32Array(capacity);
  }

  /**
   * @returns True if the heap has no elements
   */
  public isEmpty(): boolean {
    return this.heapSize === 0;
  }

  /**
   * @returns The value at the top of the heap
   */
  public peekValue(): number {
    return this.valueHeap[0];
  }

  /**
   * @returns The index at the top of the heap
   */
  public peekIndex(): number {
    return this.indexHeap[0];
  }

  /**
   * Insert (value, index) into the heap.
   * @param value Element value
   * @param index Element index
   */
  public push(value: number, index: number): void {
    let currentPosition = this.heapSize;
    this.valueHeap[currentPosition] = value;
    this.indexHeap[currentPosition] = index;
    this.heapSize += 1;

    while (currentPosition > 0) {
      const parentPosition = (currentPosition - 1) >> 1;
      if (this.hasHigherPriority(parentPosition, currentPosition)) {
        break;
      }

      this.swap(parentPosition, currentPosition);
      currentPosition = parentPosition;
    }
  }

  /**
   * Pop the top element and store it into poppedValue/poppedIndex.
   */
  public popToFields(): void {
    const lastPosition = this.heapSize - 1;

    this.poppedValue = this.valueHeap[0];
    this.poppedIndex = this.indexHeap[0];

    this.heapSize = lastPosition;
    if (lastPosition === 0) {
      return;
    }

    this.valueHeap[0] = this.valueHeap[lastPosition];
    this.indexHeap[0] = this.indexHeap[lastPosition];

    this.siftDown(0);
  }

  /**
   * @param firstPosition First position to swap
   * @param secondPosition Second position to swap
   */
  protected swap(firstPosition: number, secondPosition: number): void {
    const firstValue = this.valueHeap[firstPosition];
    const firstIndex = this.indexHeap[firstPosition];

    this.valueHeap[firstPosition] = this.valueHeap[secondPosition];
    this.indexHeap[firstPosition] = this.indexHeap[secondPosition];

    this.valueHeap[secondPosition] = firstValue;
    this.indexHeap[secondPosition] = firstIndex;
  }

  /**
   * @param startPosition Start position for sift down
   */
  protected siftDown(startPosition: number): void {
    let currentPosition = startPosition;

    while (true) {
      const leftChildPosition = currentPosition * 2 + 1;
      if (leftChildPosition >= this.heapSize) {
        break;
      }

      const rightChildPosition = leftChildPosition + 1;
      let bestChildPosition = leftChildPosition;

      if (rightChildPosition < this.heapSize) {
        if (this.hasHigherPriority(rightChildPosition, leftChildPosition)) {
          bestChildPosition = rightChildPosition;
        }
      }

      if (this.hasHigherPriority(currentPosition, bestChildPosition)) {
        break;
      }

      this.swap(currentPosition, bestChildPosition);
      currentPosition = bestChildPosition;
    }
  }

  /**
   * Decide priority between two heap positions.
   * @param firstPosition First position
   * @param secondPosition Second position
   * @returns True if firstPosition has higher priority than secondPosition
   */
  protected abstract hasHigherPriority(firstPosition: number, secondPosition: number): boolean;
}

class MinBinaryHeap extends BaseBinaryHeap {
  /**
   * @param firstPosition First position
   * @param secondPosition Second position
   * @returns True if firstPosition has higher priority than secondPosition
   */
  protected hasHigherPriority(firstPosition: number, secondPosition: number): boolean {
    return this.valueHeap[firstPosition] <= this.valueHeap[secondPosition];
  }
}

class MaxBinaryHeap extends BaseBinaryHeap {
  /**
   * @param firstPosition First position
   * @param secondPosition Second position
   * @returns True if firstPosition has higher priority than secondPosition
   */
  protected hasHigherPriority(firstPosition: number, secondPosition: number): boolean {
    return this.valueHeap[firstPosition] >= this.valueHeap[secondPosition];
  }
}

function minimumCost(nums: number[], k: number, dist: number): number {
  const length = nums.length;

  // Typed array for faster access and reduced overhead
  const values = new Int32Array(length);
  for (let index = 0; index < length; index++) {
    values[index] = nums[index] | 0;
  }

  const requiredSelectedCount = k - 1;
  let currentSelectedSum = 0;
  let bestWindowSum = Number.POSITIVE_INFINITY;

  // 0/1 flags are faster than Set lookups
  const isSelected = new Uint8Array(length);

  // Heaps store (value, index) with lazy deletion by isSelected / window boundary
  const selectedMaxHeap = new MaxBinaryHeap(length);
  const unselectedMinHeap = new MinBinaryHeap(length);

  let selectedCount = 0;

  for (let rightIndex = 1; rightIndex < length; rightIndex++) {
    const leftIndex = rightIndex - dist - 1;

    if (leftIndex > 0) {
      if (isSelected[leftIndex] === 1) {
        // Remove a selected element that leaves the window
        isSelected[leftIndex] = 0;
        selectedCount -= 1;
        currentSelectedSum -= values[leftIndex];

        // Discard elements that are left of the current window start (lazy cleanup)
        while (!unselectedMinHeap.isEmpty()) {
          if (unselectedMinHeap.peekIndex() < leftIndex) {
            unselectedMinHeap.popToFields();
          } else {
            break;
          }
        }

        if (!unselectedMinHeap.isEmpty()) {
          // Promote the smallest unselected element into the selected set
          unselectedMinHeap.popToFields();
          const promotedValue = unselectedMinHeap.poppedValue;
          const promotedIndex = unselectedMinHeap.poppedIndex;

          selectedMaxHeap.push(promotedValue, promotedIndex);
          isSelected[promotedIndex] = 1;
          selectedCount += 1;
          currentSelectedSum += promotedValue;
        }
      }
    }

    const currentValue = values[rightIndex];

    if (selectedCount < requiredSelectedCount) {
      // Fill the selected set until it reaches size (k - 1)
      selectedMaxHeap.push(currentValue, rightIndex);
      isSelected[rightIndex] = 1;
      selectedCount += 1;
      currentSelectedSum += currentValue;
    } else {
      // Ensure the heap top is valid (lazy cleanup)
      while (!selectedMaxHeap.isEmpty()) {
        const topIndex = selectedMaxHeap.peekIndex();
        if (isSelected[topIndex] === 0) {
          selectedMaxHeap.popToFields();
        } else {
          break;
        }
      }

      if (!selectedMaxHeap.isEmpty() && currentValue < selectedMaxHeap.peekValue()) {
        // Swap out the largest selected value to keep (k - 1) smallest values
        selectedMaxHeap.popToFields();
        const removedValue = selectedMaxHeap.poppedValue;
        const removedIndex = selectedMaxHeap.poppedIndex;

        isSelected[removedIndex] = 0;
        selectedCount -= 1;

        unselectedMinHeap.push(removedValue, removedIndex);

        selectedMaxHeap.push(currentValue, rightIndex);
        isSelected[rightIndex] = 1;
        selectedCount += 1;

        // Update sum by delta to avoid recomputation
        currentSelectedSum += currentValue - removedValue;
      } else {
        unselectedMinHeap.push(currentValue, rightIndex);
      }
    }

    if (leftIndex >= 0) {
      if (currentSelectedSum < bestWindowSum) {
        bestWindowSum = currentSelectedSum;
      }
    }
  }

  return values[0] + bestWindowSum;
}
