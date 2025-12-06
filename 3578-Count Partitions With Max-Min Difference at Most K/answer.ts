const MODULO_VALUE: number = 1_000_000_007;

/**
 * Count the number of valid partitions where each segment's max - min <= k.
 *
 * Uses a sliding window with monotonic deques to maintain segment min/max
 * and a DP with prefix sums to count partitions efficiently.
 *
 * @param nums - Input array of numbers to partition
 * @param k - Maximum allowed difference between max and min in each segment
 * @returns Total number of valid partitions modulo 1e9 + 7
 */
function countPartitions(nums: number[], k: number): number {
  const length = nums.length;

  // dp[i] = number of ways to partition nums[0..i-1]
  const dp = new Int32Array(length + 1);

  // prefix[i] = (dp[0] + dp[1] + ... + dp[i]) mod MODULO_VALUE
  const prefix = new Int32Array(length + 1);

  // Base case: empty prefix has exactly one way (no segments yet)
  dp[0] = 1;
  prefix[0] = 1;

  // Monotonic deques store indices; we avoid shift() by keeping a head pointer
  const maxDequeIndices: number[] = [];
  const minDequeIndices: number[] = [];
  let maxDequeHeadIndex = 0;
  let minDequeHeadIndex = 0;

  // Left boundary of the current valid window
  let leftIndex = 0;

  for (let rightIndex = 0; rightIndex < length; rightIndex++) {
    const currentValue = nums[rightIndex];

    // Maintain decreasing deque for maximum values
    while (
      maxDequeIndices.length > maxDequeHeadIndex &&
      nums[maxDequeIndices[maxDequeIndices.length - 1]] <= currentValue
      ) {
      maxDequeIndices.pop();
    }
    maxDequeIndices.push(rightIndex);

    // Maintain increasing deque for minimum values
    while (
      minDequeIndices.length > minDequeHeadIndex &&
      nums[minDequeIndices[minDequeIndices.length - 1]] >= currentValue
      ) {
      minDequeIndices.pop();
    }
    minDequeIndices.push(rightIndex);

    // Shrink leftIndex until window [leftIndex, rightIndex] satisfies max - min <= k
    while (leftIndex <= rightIndex) {
      const currentMaximum = nums[maxDequeIndices[maxDequeHeadIndex]];
      const currentMinimum = nums[minDequeIndices[minDequeHeadIndex]];

      if (currentMaximum - currentMinimum <= k) {
        // Window is valid, we can stop shrinking
        break;
      }

      // Move left boundary to keep the window valid
      leftIndex++;

      // Remove outdated indices from the fronts of the deques
      if (maxDequeIndices[maxDequeHeadIndex] < leftIndex) {
        maxDequeHeadIndex++;
      }
      if (minDequeIndices[minDequeHeadIndex] < leftIndex) {
        minDequeHeadIndex++;
      }
    }

    // Compute dp[rightIndex + 1] as sum of dp[leftIndex..rightIndex] using prefix sums
    let currentWays = prefix[rightIndex];
    if (leftIndex > 0) {
      currentWays -= prefix[leftIndex - 1];
    }

    // Normalize with modulo and ensure non-negative
    currentWays %= MODULO_VALUE;
    if (currentWays < 0) {
      currentWays += MODULO_VALUE;
    }

    dp[rightIndex + 1] = currentWays;

    // Update prefix sum: prefix[i] = prefix[i - 1] + dp[i] (mod)
    let newPrefix = prefix[rightIndex] + currentWays;
    if (newPrefix >= MODULO_VALUE) {
      newPrefix -= MODULO_VALUE;
    }
    prefix[rightIndex + 1] = newPrefix;
  }

  // Answer is number of ways to partition the entire array
  return dp[length];
}
