function countMaxOrSubsets(nums: number[]): number {
  const length = nums.length;
  const totalSubsets = 1 << length;

  // Use typed arrays for faster indexing and lower GC overhead
  const values = new Uint32Array(nums);
  const dp = new Uint32Array(totalSubsets);

  let maximumOr = 0;
  let subsetCount = 0;

  for (let bitmask = 1; bitmask < totalSubsets; bitmask++) {
    // Isolate lowest set bit of bitmask
    const leastSignificantBit = bitmask & -bitmask;
    const previousBitmask = bitmask ^ leastSignificantBit;

    // Find index of that bit (0 ≤ bitIndex < length)
    const bitIndex = 31 - Math.clz32(leastSignificantBit);

    // Build OR from the smaller subset + the newly added element
    const currentOrValue = dp[previousBitmask] | values[bitIndex];
    dp[bitmask] = currentOrValue;

    // Update global max and count
    if (currentOrValue > maximumOr) {
      maximumOr = currentOrValue;
      subsetCount = 1;
    } else if (currentOrValue === maximumOr) {
      subsetCount++;
    }
  }

  return subsetCount;
}
