// Reusable typed buffers to reduce garbage collection pressure between calls
const MAX_VALUE_TRIANGLE = 1000;
const frequencyBufferTriangle = new Int32Array(MAX_VALUE_TRIANGLE + 1);

/**
 * Counting-sort the input in-place (ascending) using a reusable frequency buffer.
 * Zeros are skipped because any triplet containing a zero cannot form a valid triangle.
 *
 * @param nums Source array (mutated)
 * @returns number New logical length after removing zeros and sorting (count of positive entries).
 */
function countingSortPositiveInPlace(nums: number[]): number {
  // Clear frequency buffer (U is small: 1001)
  frequencyBufferTriangle.fill(0);

  // Build frequency counts and track if all zeros or all <= 0 quickly
  const n = nums.length;
  for (let i = 0; i < n; i++) {
    const value = nums[i] | 0; // Force 32-bit
    // Clamp to constraints (defensive; cost is negligible and avoids surprises)
    if (value <= 0) {
      continue;
    }
    // Value in [1...1000] by constraints
    frequencyBufferTriangle[value]++;
  }

  // Write back positives in ascending order
  let writeIndex = 0;
  for (let value = 1; value <= MAX_VALUE_TRIANGLE; value++) {
    let count = frequencyBufferTriangle[value];
    while (count > 0) {
      nums[writeIndex] = value;
      writeIndex++;
      count--;
    }
  }

  // Return number of positive elements
  return writeIndex;
}

/**
 * Count valid triangle triplets using two-pointer over sorted positive lengths.
 *
 * @param nums Sorted array with only positive values in range [0...m-1]
 * @param m Logical length (number of positive entries)
 * @returns number of valid triplets
 */
function countTrianglesTwoPointer(nums: number[], m: number): number {
  let tripletCount = 0;

  // Fix the largest side at index k, then use i (left) / j (right) two-pointer
  for (let k = m - 1; k > 1; k--) {
    const thirdSide = nums[k] | 0;

    let left = 0;
    let right = k - 1;

    while (left < right) {
      // We intentionally read into locals for better JIT locality
      const firstSide = nums[left] | 0;
      const secondSide = nums[right] | 0;

      // Triangle inequality: a + b > c
      if ((firstSide + secondSide) > thirdSide) {
        // Since first + second > third, all elements from left to right - 1 with nums[right] also satisfy
        tripletCount += (right - left);
        right--;
      } else {
        left++;
      }
    }
  }

  return tripletCount;
}

/**
 * Count the number of triplets that can form a triangle.
 *
 * Uses counting sort (O(n + U), U=1000) and an O(m^2) two-pointer sweep on the positive tail.
 * Memory allocations are minimized and typed arrays are used for hot paths.
 *
 * @param nums Input integer side lengths (mutated by sorting)
 * @return number Count of valid triangle triplets
 */
function triangleNumber(nums: number[]): number {
  // Early return for tiny inputs
  if (nums.length < 3) {
    return 0;
  }

  // Counting-sort positives in-place and compact away zeros
  const positiveLength = countingSortPositiveInPlace(nums);

  // If fewer than 3 positive sides, no triangle can be formed
  if (positiveLength < 3) {
    return 0;
  }

  // Two-pointer count on the positive, sorted prefix [0...positiveLength-1]
  const total = countTrianglesTwoPointer(nums, positiveLength);

  return total | 0; // Keep to 32-bit int
}
