class SegmentTreeRangeAddMinMax {
  private readonly size: number;
  private readonly validLength: number;
  private readonly minTree: Int32Array;
  private readonly maxTree: Int32Array;
  private readonly lazy: Int32Array;

  // Reusable stacks to eliminate recursive overhead
  private readonly nodeStack: Int32Array;
  private readonly leftBoundaryStack: Int32Array;
  private readonly rightBoundaryStack: Int32Array;
  private readonly traversalStateStack: Int8Array;

  /**
   * Segment tree that supports:
   * 1. Range addition with lazy propagation
   * 2. Querying the leftmost index whose value equals zero
   *
   * @param n The valid index range is [0, n - 1]
   */
  constructor(n: number) {
    this.validLength = n;

    // Expand to next power of two to simplify child indexing
    let powerOfTwoSize = 1;
    while (powerOfTwoSize < n) {
      powerOfTwoSize <<= 1;
    }
    this.size = powerOfTwoSize;

    const treeArrayLength = powerOfTwoSize << 1;
    this.minTree = new Int32Array(treeArrayLength);
    this.maxTree = new Int32Array(treeArrayLength);
    this.lazy = new Int32Array(treeArrayLength);

    // Fixed stack size is sufficient since tree height <= log2(1e5) < 20
    const stackCapacity = 256;
    this.nodeStack = new Int32Array(stackCapacity);
    this.leftBoundaryStack = new Int32Array(stackCapacity);
    this.rightBoundaryStack = new Int32Array(stackCapacity);
    this.traversalStateStack = new Int8Array(stackCapacity);
  }

  /**
   * Adds `delta` to every element in [left, right] (inclusive).
   *
   * @param left Inclusive start index
   * @param right Inclusive end index
   * @param delta Value added to each position
   */
  public rangeAdd(left: number, right: number, delta: number): void {
    if (left > right) {
      return;
    }

    // Restrict updates to the original array range
    if (left < 0) {
      left = 0;
    }
    const lastValidIndex = this.validLength - 1;
    if (right > lastValidIndex) {
      right = lastValidIndex;
    }
    if (left > right) {
      return;
    }

    let stackTop = 0;

    // Start from the root node
    this.nodeStack[stackTop] = 1;
    this.leftBoundaryStack[stackTop] = 0;
    this.rightBoundaryStack[stackTop] = this.size - 1;
    this.traversalStateStack[stackTop] = 0;
    stackTop++;

    while (stackTop > 0) {
      stackTop--;
      const node = this.nodeStack[stackTop];
      const segmentLeft = this.leftBoundaryStack[stackTop];
      const segmentRight = this.rightBoundaryStack[stackTop];
      const state = this.traversalStateStack[stackTop];

      if (state === 0) {
        // No overlap with the update range
        if (segmentLeft > right || segmentRight < left) {
          continue;
        }

        // Current segment fully covered
        if (left <= segmentLeft && segmentRight <= right) {
          this.applyDelta(node, delta);
          continue;
        }

        // Push lazy value before exploring children
        this.pushDown(node);

        // Mark for recomputation after children updates
        this.nodeStack[stackTop] = node;
        this.leftBoundaryStack[stackTop] = segmentLeft;
        this.rightBoundaryStack[stackTop] = segmentRight;
        this.traversalStateStack[stackTop] = 1;
        stackTop++;

        const midpointIndex = (segmentLeft + segmentRight) >> 1;

        // Push right child first so left child is processed first
        this.nodeStack[stackTop] = (node << 1) | 1; // Right child node
        this.leftBoundaryStack[stackTop] = midpointIndex + 1;
        this.rightBoundaryStack[stackTop] = segmentRight;
        this.traversalStateStack[stackTop] = 0;
        stackTop++;

        this.nodeStack[stackTop] = node << 1; // Left child node
        this.leftBoundaryStack[stackTop] = segmentLeft;
        this.rightBoundaryStack[stackTop] = midpointIndex;
        this.traversalStateStack[stackTop] = 0;
        stackTop++;
      } else {
        // Recalculate min and max from children
        const leftChildNode = node << 1;
        const rightChildNode = leftChildNode | 1;

        const leftMin = this.minTree[leftChildNode];
        const rightMin = this.minTree[rightChildNode];
        this.minTree[node] = leftMin < rightMin ? leftMin : rightMin;

        const leftMax = this.maxTree[leftChildNode];
        const rightMax = this.maxTree[rightChildNode];
        this.maxTree[node] = leftMax > rightMax ? leftMax : rightMax;
      }
    }
  }

  /**
   * Finds the smallest index whose value equals zero.
   *
   * @returns The leftmost index with value 0, or -1 if none exists
   */
  public findLeftmostZero(): number {
    let node = 1;
    let segmentLeft = 0;
    let segmentRight = this.size - 1;

    // If the segment never crosses zero, no solution exists
    if (this.minTree[node] > 0 || this.maxTree[node] < 0) {
      return -1;
    }

    while (segmentLeft !== segmentRight) {
      this.pushDown(node);

      const leftChildNode = node << 1;
      const rightChildNode = leftChildNode | 1;
      const midpointIndex = (segmentLeft + segmentRight) >> 1;

      // Prefer left subtree to guarantee leftmost position
      if (this.minTree[leftChildNode] <= 0 && this.maxTree[leftChildNode] >= 0) {
        node = leftChildNode;
        segmentRight = midpointIndex;
      } else {
        node = rightChildNode;
        segmentLeft = midpointIndex + 1;
      }
    }

    // Exclude padded indices beyond original length
    if (segmentLeft >= this.validLength) {
      return -1;
    }

    return this.minTree[node] === 0 ? segmentLeft : -1;
  }

  /**
   * Applies delta to a node and accumulates lazy value.
   *
   * @param node Tree node index
   * @param delta Value to add
   */
  private applyDelta(node: number, delta: number): void {
    this.minTree[node] += delta;
    this.maxTree[node] += delta;
    this.lazy[node] += delta;
  }

  /**
   * Propagates lazy value to child nodes.
   *
   * @param node Tree node index
   */
  private pushDown(node: number): void {
    const pendingDelta = this.lazy[node];
    if (pendingDelta === 0) {
      return;
    }

    const leftChildNode = node << 1;
    const rightChildNode = leftChildNode | 1;

    this.minTree[leftChildNode] += pendingDelta;
    this.maxTree[leftChildNode] += pendingDelta;
    this.lazy[leftChildNode] += pendingDelta;

    this.minTree[rightChildNode] += pendingDelta;
    this.maxTree[rightChildNode] += pendingDelta;
    this.lazy[rightChildNode] += pendingDelta;

    this.lazy[node] = 0;
  }
}

function longestBalanced(nums: number[]): number {
  const n = nums.length;

  // Track last position of each value for distinct handling
  const lastOccurrence = new Int32Array(100001);
  lastOccurrence.fill(-1);

  const segmentTree = new SegmentTreeRangeAddMinMax(n);

  let bestLength = 0;

  for (let right = 0; right < n; right++) {
    const value = nums[right];
    const delta = (value & 1) === 0 ? 1 : -1;

    const previousIndex = lastOccurrence[value];

    // Remove previous distinct contribution if the value appeared before
    if (previousIndex !== -1) {
      segmentTree.rangeAdd(0, previousIndex, -delta);
    }

    // Add current distinct contribution
    segmentTree.rangeAdd(0, right, delta);
    lastOccurrence[value] = right;

    const left = segmentTree.findLeftmostZero();
    if (left !== -1) {
      const currentLength = right - left + 1;
      if (currentLength > bestLength) {
        bestLength = currentLength;
      }
    }
  }

  return bestLength;
}
