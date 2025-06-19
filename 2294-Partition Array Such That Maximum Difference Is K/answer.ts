function partitionArray(nums: number[], k: number): number {
  const length = nums.length;
  if (length <= 1) {
    // Zero or one element always fits in one subsequence (or none)
    return length;
  }

  // 1. Find min and max in one pass
  let minimumValue = nums[0];
  let maximumValue = nums[0];
  for (let i = 1; i < length; i++) {
    const value = nums[i];
    if (value < minimumValue) {
      minimumValue = value;
    } else if (value > maximumValue) {
      maximumValue = value;
    }
  }

  // 2. If all elements fit within k, only one subsequence is needed
  if (maximumValue - minimumValue <= k) {
    return 1;
  }

  // 3. Build a Uint8Array presence map (1 byte per possible value)
  const presenceArray = new Uint8Array(maximumValue + 1);
  for (let i = 0; i < length; i++) {
    presenceArray[nums[i]] = 1;
  }

  // 4. Greedily scan through the value‐range to count needed subsequences
  let subsequenceCount = 1;
  let currentSegmentStart = minimumValue;

  for (let value = minimumValue; value <= maximumValue; value++) {
    if (presenceArray[value]) {
      // Whenever the next value exceeds k from the start of current segment,
      // We must begin a new subsequence
      if (value - currentSegmentStart > k) {
        subsequenceCount++;
        currentSegmentStart = value;
      }
    }
  }

  return subsequenceCount;
}
