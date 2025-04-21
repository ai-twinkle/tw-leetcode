function numberOfArrays(
  differences: number[],
  lower: number,
  upper: number
): number {
  const arr = differences;
  const length = arr.length;

  // Track the running prefix sum and its minimum/maximum values
  let prefixSum = 0;
  let minimumPrefixSum = 0;
  let maximumPrefixSum = 0;

  // Precompute the maximum allowed range for early exit checks
  const maxAllowedRange = upper - lower;

  // Single pass: update prefix sums and check for early termination
  for (let i = 0; i < length; ++i) {
    prefixSum += arr[i];
    if (prefixSum < minimumPrefixSum) {
      minimumPrefixSum = prefixSum;
    } else if (prefixSum > maximumPrefixSum) {
      maximumPrefixSum = prefixSum;
    }

    // Early return if the span of prefix sums already exceeds allowed range
    if (maximumPrefixSum - minimumPrefixSum > maxAllowedRange) {
      return 0;
    }
  }

  // Calculate final span: how many valid starting values remain
  const span = maxAllowedRange - (maximumPrefixSum - minimumPrefixSum) + 1;
  return span > 0 ? span : 0;
}
