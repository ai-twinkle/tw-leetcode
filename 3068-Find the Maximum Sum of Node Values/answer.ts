function maximumValueSum(nums: number[], k: number, _edges: number[][]): number {
  const nodeCount = nums.length;

  let totalSum = 0;
  let positiveDeltaSum = 0;
  let positiveDeltaCount = 0;

  // Track the smallest absolute delta seen
  let minimalAbsoluteDelta = Infinity;

  for (let idx = 0; idx < nodeCount; idx++) {
    // Read the original as a 32-bit unsigned
    // (bitwise ops on JS numbers use 32-bit ints)
    const originalValue = nums[idx] >>> 0;
    const toggledValue = originalValue ^ k;
    const delta = toggledValue - originalValue;

    totalSum += originalValue;

    // Calculate the absolute delta
    const absDelta = delta < 0 ? -delta : delta;
    if (absDelta < minimalAbsoluteDelta) {
      minimalAbsoluteDelta = absDelta;
    }

    if (delta > 0) {
      positiveDeltaSum += delta;
      positiveDeltaCount++;
    }
  }

  // If we toggle an odd number of positively-gaining nodes, we must skip
  // the single smallest-impact change
  const adjustment = (positiveDeltaCount & 1) === 1
    ? minimalAbsoluteDelta
    : 0;

  return totalSum + positiveDeltaSum - adjustment;
}
