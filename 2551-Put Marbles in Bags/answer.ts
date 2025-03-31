/**
 * Quickselect algorithm to partition the array so that the k-th smallest
 * element is at position k.
 *
 * @param {number[]} arr - The array to be processed.
 * @param {number} left - Left index of the range.
 * @param {number} right - Right index of the range.
 * @param {number} k - The index of the desired element.
 */
function quickSelect(arr: number[], left: number, right: number, k: number): void {
  // Partition until the pivot is at the k-th index.
  while (left < right) {
    // Choose a random pivot index between left and right.
    const pivotIndex = left + Math.floor(Math.random() * (right - left + 1));
    const newPivotIndex = partition(arr, left, right, pivotIndex);
    if (newPivotIndex === k) {
      return;
    } else if (k < newPivotIndex) {
      right = newPivotIndex - 1;
    } else {
      left = newPivotIndex + 1;
    }
  }
}

/**
 * Partitions the array around the pivot.
 *
 * @param {number[]} arr - The array to partition.
 * @param {number} left - Left index.
 * @param {number} right - Right index.
 * @param {number} pivotIndex - Index of pivot element.
 * @returns {number} - The final index of the pivot element.
 */
function partition(arr: number[], left: number, right: number, pivotIndex: number): number {
  const pivotValue = arr[pivotIndex];
  swap(arr, pivotIndex, right);

  let storeIndex = left;
  for (let i = left; i < right; i++) {
    if (arr[i] < pivotValue) {
      swap(arr, storeIndex, i);
      storeIndex++;
    }
  }

  swap(arr, storeIndex, right);
  return storeIndex;
}

/**
 * Swaps two elements in an array.
 *
 * @param {number[]} arr - The array with elements to swap.
 * @param {number} i - Index of the first element.
 * @param {number} j - Index of the second element.
 */
function swap(arr: number[], i: number, j: number): void {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

/**
 * Computes the difference between the maximum and minimum total cost
 * of splitting weights into k groups based on adjacent pair costs.
 *
 * @param {number[]} weights - An array of weights.
 * @param {number} k - Number of groups to split into.
 * @returns {number} - The difference between the max and min cost.
 */
function putMarbles(weights: number[], k: number): number {
  const n = weights.length;
  if (n === 1) {
    return 0;
  }

  const m = n - 1;
  const diffs: number[] = new Array(m);

  // Compute each adjacent pair cost.
  for (let i = 0; i < m; i++) {
    diffs[i] = weights[i] + weights[i + 1];
  }

  const num = k - 1;
  if (num <= 0) {
    return 0;
  }

  let minSum = 0, maxSum = 0;

  // If we need more than half the elements, sorting might be more efficient.
  if (num > m / 2) {
    diffs.sort((a, b) => a - b);
    for (let i = 0; i < num; i++) {
      minSum += diffs[i];
      maxSum += diffs[m - 1 - i];
    }
  } else {
    // Use Quickselect to partition and sum the k-1 smallest values.
    const diffSmall = diffs.slice(); // make a copy
    quickSelect(diffSmall, 0, diffSmall.length - 1, num - 1);
    for (let i = 0; i < num; i++) {
      minSum += diffSmall[i];
    }

    // Use Quickselect to partition and sum the k-1 largest values.
    const diffLarge = diffs.slice();
    quickSelect(diffLarge, 0, diffLarge.length - 1, diffLarge.length - num);
    for (let i = diffLarge.length - num; i < diffLarge.length; i++) {
      maxSum += diffLarge[i];
    }
  }

  return maxSum - minSum;
}
