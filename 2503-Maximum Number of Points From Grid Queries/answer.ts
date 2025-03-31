/**
 * Computes the maximum number of points (visited cells) reachable from the top-left
 * cell for each query threshold. A cell is reachable if its value is strictly less than
 * the query threshold, and expansion is cumulative (each larger query reuses the previous region).
 *
 * @param grid A 2D grid of non-negative integers.
 * @param queries An array of query thresholds.
 * @returns An array of the number of reachable cells for each query in the original order.
 */
function maxPoints(grid: number[][], queries: number[]): number[] {
  const numRows = grid.length;
  const numCols = grid[0].length;
  const totalCells = numRows * numCols;

  // Get unique queries in ascending order.
  const uniqueSortedQueries = Array.from(new Set(queries)).sort((a, b) => a - b);

  // Total visited cells counter.
  let totalVisitedCells = 0;

  // Create our custom min-heap (with preallocated capacity) for border cells.
  const border = new CustomMinHeap(totalCells);
  const lastRow = numRows - 1, lastCol = numCols - 1;

  /**
   * Attempts to add the cell at (row, col) to the border.
   * If the cell is unvisited (its value is not 0), it is added to the min-heap,
   * and then marked as visited (set to 0).
   *
   * @param row The row index.
   * @param col The column index.
   */
  function expandCell(row: number, col: number): void {
    if (grid[row][col] === 0) return;
    border.add(grid[row][col], row, col);
    grid[row][col] = 0;
  }

  // Start from the top-left cell.
  expandCell(0, 0);

  // Map to store the result for each unique query threshold.
  const queryResults = new Map<number, number>();

  // Process each query in ascending order.
  for (const queryThreshold of uniqueSortedQueries) {
    // Expand the territory while the smallest cell in the border has a value lower than the query threshold.
    while (border.top() !== undefined && queryThreshold > border.top()!) {
      const [row, col] = border.pop();
      totalVisitedCells++;
      // Explore neighbors: up, left, down, right.
      if (row > 0) {
        expandCell(row - 1, col);
      }
      if (col > 0) {
        expandCell(row, col - 1);
      }
      if (row < lastRow) {
        expandCell(row + 1, col);
      }
      if (col < lastCol) {
        expandCell(row, col + 1);
      }
    }
    queryResults.set(queryThreshold, totalVisitedCells);
  }

  // Map back the results to the original query order.
  const output: number[] = new Array(queries.length);
  for (let i = 0; i < queries.length; i++) {
    output[i] = queryResults.get(queries[i])!;
  }
  return output;
}

/**
 * CustomMinHeap is a specialized min‑heap implementation optimized for grid expansion.
 * It uses pre‑allocated typed arrays (Uint32Array) for storing cell values and their coordinates.
 */
class CustomMinHeap {
  private last: number;
  private readonly values: Uint32Array;
  private readonly rows: Uint32Array;
  private readonly cols: Uint32Array;

  /**
   * Creates an instance of CustomMinHeap with the given capacity.
   *
   * @param capacity Maximum number of elements that can be stored (typically m*n).
   */
  constructor(capacity: number) {
    this.last = -1;
    this.values = new Uint32Array(capacity);
    this.rows = new Uint32Array(capacity);
    this.cols = new Uint32Array(capacity);
  }

  /**
   * Returns the smallest cell value in the heap or undefined if the heap is empty.
   *
   * @returns The smallest cell value, or undefined.
   */
  public top(): number | undefined {
    return this.last < 0 ? undefined : this.values[0];
  }

  /**
   * Adds a new cell to the heap.
   *
   * @param cellValue The value of the cell.
   * @param row The row coordinate.
   * @param col The column coordinate.
   */
  public add(cellValue: number, row: number, col: number): void {
    this.last++;
    this.values[this.last] = cellValue;
    this.rows[this.last] = row;
    this.cols[this.last] = col;
    this.bubbleUp(this.last);
  }

  /**
   * Removes and returns the coordinates [row, col] of the cell with the smallest value.
   *
   * @returns A tuple [row, col] of the popped cell.
   */
  public pop(): [number, number] {
    const retRow = this.rows[0];
    const retCol = this.cols[0];
    this.swap(0, this.last);
    this.last--;
    this.bubbleDown(0);
    return [retRow, retCol];
  }

  /**
   * Swaps the elements at indices i and j in all arrays.
   *
   * @param i The first index.
   * @param j The second index.
   */
  private swap(i: number, j: number): void {
    let temp = this.values[i];
    this.values[i] = this.values[j];
    this.values[j] = temp;

    temp = this.rows[i];
    this.rows[i] = this.rows[j];
    this.rows[j] = temp;

    temp = this.cols[i];
    this.cols[i] = this.cols[j];
    this.cols[j] = temp;
  }

  /**
   * Bubbles up the element at index i to maintain the heap invariant.
   *
   * @param i The index of the element to bubble up.
   */
  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.values[i] >= this.values[parent]) break;
      this.swap(i, parent);
      i = parent;
    }
  }

  /**
   * Bubbles down the element at index i to maintain the heap invariant.
   *
   * @param i The index of the element to bubble down.
   */
  private bubbleDown(i: number): void {
    while ((i << 1) + 1 <= this.last) {
      let smallest = i;
      const left = (i << 1) + 1;
      const right = left + 1;
      if (left <= this.last && this.values[left] < this.values[smallest]) {
        smallest = left;
      }
      if (right <= this.last && this.values[right] < this.values[smallest]) {
        smallest = right;
      }
      if (smallest === i) break;
      this.swap(i, smallest);
      i = smallest;
    }
  }
}
