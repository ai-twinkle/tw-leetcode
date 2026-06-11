/**
 * Pre-computes sparse tables for range-maximum and range-minimum queries.
 * Construction is O(n log n); subsequent range queries are O(1).
 *
 * @param nums - The source integer array.
 * @param numberOfLevels - The number of power-of-two levels to build.
 * @returns The maximum and minimum sparse tables.
 */
function buildRangeTables(
  nums: number[],
  numberOfLevels: number,
): { maximumTable: Int32Array[]; minimumTable: Int32Array[] } {
  const length = nums.length;
  const maximumTable: Int32Array[] = new Array(numberOfLevels);
  const minimumTable: Int32Array[] = new Array(numberOfLevels);

  // Level zero mirrors the original values.
  const baseMaximum = new Int32Array(length);
  const baseMinimum = new Int32Array(length);
  for (let index = 0; index < length; index++) {
    baseMaximum[index] = nums[index];
    baseMinimum[index] = nums[index];
  }
  maximumTable[0] = baseMaximum;
  minimumTable[0] = baseMinimum;

  // Each higher level merges two adjacent half-ranges from the level below.
  for (let level = 1; level < numberOfLevels; level++) {
    const span = 1 << level;
    const halfSpan = 1 << (level - 1);
    const previousMaximum = maximumTable[level - 1];
    const previousMinimum = minimumTable[level - 1];
    const currentMaximum = new Int32Array(length);
    const currentMinimum = new Int32Array(length);
    const lastStart = length - span;
    for (let start = 0; start <= lastStart; start++) {
      const rightStart = start + halfSpan;
      const leftMaximum = previousMaximum[start];
      const rightMaximum = previousMaximum[rightStart];
      currentMaximum[start] = leftMaximum >= rightMaximum ? leftMaximum : rightMaximum;
      const leftMinimum = previousMinimum[start];
      const rightMinimum = previousMinimum[rightStart];
      currentMinimum[start] = leftMinimum <= rightMinimum ? leftMinimum : rightMinimum;
    }
    maximumTable[level] = currentMaximum;
    minimumTable[level] = currentMinimum;
  }

  return { maximumTable, minimumTable };
}

/**
 * Computes the value (range maximum minus range minimum) of nums[left..right]
 * in O(1) using the pre-computed sparse tables.
 *
 * @param maximumTable - Sparse table for range maximums.
 * @param minimumTable - Sparse table for range minimums.
 * @param logTable - Floor-log2 lookup used to size the query.
 * @param left - Inclusive left index of the subarray.
 * @param right - Inclusive right index of the subarray.
 * @returns The difference between the maximum and minimum in the range.
 */
function subarrayValue(
  maximumTable: Int32Array[],
  minimumTable: Int32Array[],
  logTable: Int32Array,
  left: number,
  right: number,
): number {
  const level = logTable[right - left + 1];
  const secondStart = right - (1 << level) + 1;
  const maximumLeft = maximumTable[level][left];
  const maximumRight = maximumTable[level][secondStart];
  const rangeMaximum = maximumLeft >= maximumRight ? maximumLeft : maximumRight;
  const minimumLeft = minimumTable[level][left];
  const minimumRight = minimumTable[level][secondStart];
  const rangeMinimum = minimumLeft <= minimumRight ? minimumLeft : minimumRight;
  return rangeMaximum - rangeMinimum;
}

/**
 * Selects k distinct subarrays maximizing the sum of (max - min) values.
 *
 * @param nums - The input integer array.
 * @param k - The exact number of distinct subarrays to select.
 * @returns The maximum achievable total value.
 */
function maxTotalValue(nums: number[], k: number): number {
  const arrayLength = nums.length;

  // Pre-compute floor-log2 values for O(1) sparse-table sizing.
  const logTable = new Int32Array(arrayLength + 1);
  for (let value = 2; value <= arrayLength; value++) {
    logTable[value] = logTable[value >> 1] + 1;
  }
  const numberOfLevels = logTable[arrayLength] + 1;

  // Build the range tables that back O(1) subarray-value queries.
  const { maximumTable, minimumTable } = buildRangeTables(nums, numberOfLevels);

  // Max-heap over subarrays keyed by value; capacity bounds all possible pushes.
  const capacity = 2 * k + 2;
  const heapValue = new Int32Array(capacity);
  const heapLeft = new Int32Array(capacity);
  const heapRight = new Int32Array(capacity);
  let heapSize = 0;

  /**
   * Inserts a subarray into the max-heap and restores the heap order.
   * @param value - The subarray value used as the heap key.
   * @param left - Inclusive left index of the subarray.
   * @param right - Inclusive right index of the subarray.
   */
  const pushSubarray = (value: number, left: number, right: number): void => {
    let position = heapSize;
    heapSize++;
    // Sift the new entry up while it outranks its parent.
    while (position > 0) {
      const parent = (position - 1) >> 1;
      if (heapValue[parent] >= value) {
        break;
      }
      heapValue[position] = heapValue[parent];
      heapLeft[position] = heapLeft[parent];
      heapRight[position] = heapRight[parent];
      position = parent;
    }
    heapValue[position] = value;
    heapLeft[position] = left;
    heapRight[position] = right;
  };

  /**
   * Removes the current maximum (root) from the heap and restores order.
   */
  const removeRoot = (): void => {
    heapSize--;
    if (heapSize === 0) {
      return;
    }
    const value = heapValue[heapSize];
    const left = heapLeft[heapSize];
    const right = heapRight[heapSize];
    let position = 0;
    // Sift the promoted last entry down toward its larger child.
    while (true) {
      const leftChild = position * 2 + 1;
      if (leftChild >= heapSize) {
        break;
      }
      let candidate = leftChild;
      const rightChild = leftChild + 1;
      if (rightChild < heapSize && heapValue[rightChild] > heapValue[leftChild]) {
        candidate = rightChild;
      }
      if (heapValue[candidate] <= value) {
        break;
      }
      heapValue[position] = heapValue[candidate];
      heapLeft[position] = heapLeft[candidate];
      heapRight[position] = heapRight[candidate];
      position = candidate;
    }
    heapValue[position] = value;
    heapLeft[position] = left;
    heapRight[position] = right;
  };

  // Seed with the whole array, which always holds the maximum value.
  const rootValue = subarrayValue(maximumTable, minimumTable, logTable, 0, arrayLength - 1);
  pushSubarray(rootValue, 0, arrayLength - 1);

  let totalValue = 0;
  let chosenCount = 0;

  while (chosenCount < k && heapSize > 0) {
    // Take the largest remaining subarray value.
    const currentValue = heapValue[0];
    const currentLeft = heapLeft[0];
    const currentRight = heapRight[0];
    totalValue += currentValue;
    chosenCount++;
    removeRoot();

    // Child A: advance the left bound (the spanning-tree edge for every node).
    if (currentLeft < currentRight) {
      const childLeft = currentLeft + 1;
      const childValue = subarrayValue(maximumTable, minimumTable, logTable, childLeft, currentRight);
      pushSubarray(childValue, childLeft, currentRight);
    }

    // Child B: retract the right bound only from the leftmost branch to avoid duplicates.
    if (currentLeft === 0 && currentRight > 0) {
      const childRight = currentRight - 1;
      const childValue = subarrayValue(maximumTable, minimumTable, logTable, 0, childRight);
      pushSubarray(childValue, 0, childRight);
    }
  }

  return totalValue;
}
