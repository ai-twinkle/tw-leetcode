/**
 * A basic MinHeap implementation for the problem
 */
class MinHeapCells<T> {
  /**
   * The heap array where elements are stored
   * @private
   */
  private readonly heap: T[];
  /**
   * The comparator function used to order the elements in the heap
   * @private
   */
  private readonly comparator: (a: T, b: T) => number;

  /**
   * Creates a new MinHeap
   * @param comparator The comparator function used to order the elements in the heap
   */
  constructor(comparator: (a: T, b: T) => number) {
    this.heap = [];
    this.comparator = comparator;
  }

  /**
   * Pushes a new value into the heap
   * @param value The value to push
   */
  push(value: T): void {
    this.heap.push(value);
    this.heapifyUp(this.heap.length - 1);
  }

  /**
   * Pops the smallest value from the heap
   * @returns The smallest value in the heap
   */
  pop(): T | undefined {
    if (this.size() === 0) return undefined;
    if (this.size() === 1) return this.heap.pop();
    const root = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.heapifyDown(0);
    return root;
  }

  /**
   * Returns the smallest value in the heap
   * @returns The smallest value in
    */
  peek(): T | undefined {
    return this.heap[0];
  }

  /**
   * Returns the size of the heap
   * @returns The size of the heap
   */
  size(): number {
    return this.heap.length;
  }

  /**
   * Restores the heap property by moving the element up
   * @param index The index of the element to move up
   * @private
   */
  private heapifyUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.comparator(this.heap[index], this.heap[parentIndex]) >= 0) break;
      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
      index = parentIndex;
    }
  }

  /**
   * Restores the heap property by moving the element down
   * @param index The index of the element to move down
   * @private
   */
  private heapifyDown(index: number): void {
    const size = this.size();
    while (index < size) {
      let smallest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (leftChild < size && this.comparator(this.heap[leftChild], this.heap[smallest]) < 0) {
        smallest = leftChild;
      }
      if (rightChild < size && this.comparator(this.heap[rightChild], this.heap[smallest]) < 0) {
        smallest = rightChild;
      }
      if (smallest === index) break;

      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

const MOVE_DIRECTIONS = [
  { dx: 0, dy: 1 },
  { dx: 1, dy: 0 },
  { dx: 0, dy: -1 },
  { dx: -1, dy: 0 },
];

function trapRainWater(heightMap: number[][]): number {
  // Get the dimensions of the matrix
  const m = heightMap.length;    // number of rows
  const n = heightMap[0].length; // number of columns

  // Edge case: If the matrix is too small, it can't trap water
  // Because the water requires at least 3 x 3 cells to be trapped
  if (m < 3 || n < 3) return 0;

  // Initialize the visited array and the min heap
  const visited = Array.from({ length: m }, () => Array(n).fill(false));
  const minHeap = new MinHeapCells<{ height: number; row: number; col: number }>(
    (a, b) => a.height - b.height
  );

  // Add all boundary cells to the heap
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      //  If the cell is not a boundary cell, skip it
      if (i !== 0 && i !== m - 1 && j !== 0 && j !== n - 1) {
        continue;
      }

      // Push the boundary cell into the heap
      minHeap.push({ height: heightMap[i][j], row: i, col: j });

      // Mark the cell as visited
      visited[i][j] = true;
    }
  }
  let trappedWater = 0;

  // Process cells in the heap
  while (minHeap.size() > 0) {
    const { height, row, col } = minHeap.pop()!;

    // Check the neighbors of the current cell
    for (const { dx, dy } of MOVE_DIRECTIONS) {
      const newRow = row + dx;
      const newCol = col + dy;

      // Check if the neighbor is within bounds and not visited
      if (
        newRow < 0 ||
        newRow >= m ||
        newCol < 0 ||
        newCol >= n ||
        visited[newRow][newCol]
      ) {
        continue;
      }

      // Mark the neighbor as visited
      visited[newRow][newCol] = true;

      // Calculate the trapped water
      // The trapped water is the difference between the height of the current cell and the height of the neighbor cell
      trappedWater += Math.max(0, height - heightMap[newRow][newCol]);

      // Push the neighbor cell into the heap
      minHeap.push({
        height: Math.max(height, heightMap[newRow][newCol]),
        row: newRow,
        col: newCol,
      });
    }
  }

  return trappedWater;
}
