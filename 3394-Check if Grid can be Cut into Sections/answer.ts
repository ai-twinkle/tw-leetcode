/**
 * Check if the rectangles can be cut into three clusters along either the x-axis or y-axis.
 * @param n {number} - Unused parameter.
 * @param rectangles {number[][]} - The rectangles to check.
 * @returns {boolean} - Whether the rectangles can be cut into three clusters.
 */
function checkValidCuts(n: number, rectangles: number[][]): boolean {
  // Check vertical (x-axis) and horizontal (y-axis) cuts.
  return checkAxis(rectangles, 0, 2) || checkAxis(rectangles, 1, 3);
}

/**
 * Check if the rectangles can be divided into three clusters along the specified axis.
 * @param rectangles {number[][]} - The array of rectangles.
 * @param startIndex {number} - The index for the starting coordinate on the chosen axis.
 * @param endIndex {number} - The index for the ending coordinate on the chosen axis.
 * @returns {boolean} - True if the rectangles can be split into three clusters.
 */
function checkAxis(rectangles: number[][], startIndex: number, endIndex: number): boolean {
  // Make a shallow copy so as not to disturb the original array.
  const rects = rectangles.slice();
  // Sort rectangles based on the start coordinate on the chosen axis using counting sort.
  countingSortRectangles(rects, startIndex);

  let gaps = 0;
  let maxEnd = rects[0][endIndex];

  // Single-pass gap counting:
  for (let i = 1; i < rects.length; i++) {
    // If the current rectangle's start is at or after the running maxEnd,
    // we've found a gap between clusters.
    if (rects[i][startIndex] >= maxEnd) {
      gaps++;
      if (gaps >= 2) {
        return true; // Two gaps yield three clusters.
      }
    }
    maxEnd = Math.max(maxEnd, rects[i][endIndex]);
  }
  return false;
}

/**
 * Custom counting sort for rectangles.
 * This function sorts the array of rectangles in-place based on the value at the specified key index.
 * It uses a Map-based counting sort if the key range is huge to avoid iterating over a massive count array.
 * @param arr {number[][]} - The array of rectangles to sort.
 * @param keyIndex {number} - The index of the key to sort by.
 */
function countingSortRectangles(arr: number[][], keyIndex: number): void {
  // Find the maximum value for the given key to determine the range.
  let maxVal = 0;
  for (let i = 0; i < arr.length; i++) {
    const key = arr[i][keyIndex];
    if (key > maxVal) {
      maxVal = key;
    }
  }
  // Threshold to decide whether to use the standard array-based counting sort.
  const threshold = 100000;

  if (maxVal <= threshold) {
    // Use standard counting sort with an array for counts.
    const count = new Array(maxVal + 1).fill(0);
    for (let i = 0; i < arr.length; i++) {
      count[arr[i][keyIndex]]++;
    }
    for (let i = 1; i <= maxVal; i++) {
      count[i] += count[i - 1];
    }
    const output: number[][] = new Array(arr.length);

    // Place elements into their correct positions, iterating backwards for stability.
    for (let i = arr.length - 1; i >= 0; i--) {
      const key = arr[i][keyIndex];
      output[count[key] - 1] = arr[i];
      count[key]--;
    }

    // Copy the sorted output back into the original array.
    for (let i = 0; i < arr.length; i++) {
      arr[i] = output[i];
    }
  } else {
    // Use Map-based counting sort to avoid creating a huge array when maxVal is large.
    const frequency = new Map<number, number>();
    // Count the frequency of each key.
    for (let i = 0; i < arr.length; i++) {
      const key = arr[i][keyIndex];
      frequency.set(key, (frequency.get(key) || 0) + 1);
    }

    // Extract the keys and sort them.
    const keys = Array.from(frequency.keys()).sort((a, b) => a - b);

    // Build cumulative frequency using a Map.
    const cumulative = new Map<number, number>();
    let total = 0;
    for (const key of keys) {
      total += frequency.get(key)!;
      cumulative.set(key, total);
    }

    // Create an output array to store the sorted elements.
    const output: number[][] = new Array(arr.length);

    // Place each element into its correct position by iterating backwards for stability.
    for (let i = arr.length - 1; i >= 0; i--) {
      const key = arr[i][keyIndex];
      const pos = cumulative.get(key)! - 1;
      output[pos] = arr[i];
      cumulative.set(key, pos);
    }

    // Copy the sorted output back into the original array.
    for (let i = 0; i < arr.length; i++) {
      arr[i] = output[i];
    }
  }
}
