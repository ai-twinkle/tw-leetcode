function maximumCount(nums: number[]): number {
  const n = nums.length;

  // Binary search to find the first index where nums[i] is >= 0.
  let low = 0, high = n - 1;
  let firstNonNegative = n;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (nums[mid] >= 0) {
      firstNonNegative = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  // Binary search to find the first index where nums[i] is > 0.
  low = firstNonNegative;
  high = n - 1;
  let firstPositive = n;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (nums[mid] > 0) {
      firstPositive = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  const negativeCount = firstNonNegative;    // All elements before firstNonNegative are negative.
  const positiveCount = n - firstPositive;   // All elements from firstPositive to end are positive.

  return Math.max(negativeCount, positiveCount);
}
