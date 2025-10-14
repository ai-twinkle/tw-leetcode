function hasIncreasingSubarrays(nums: number[], k: number): boolean {
  const length = nums.length;

  // k = 1 needs any two elements to form two adjacent length-1 windows
  if (k === 1) {
    return length >= 2;
  }

  // Not enough elements for two adjacent windows
  const needed = k + k;
  if (length < needed) {
    return false;
  }

  // Whether the immediately previous run had length >= k
  let previousRunQualifies = false;

  // Jump run-by-run
  for (let startIndex = 0; startIndex < length; ) {
    let endIndex = startIndex + 1;

    // Consume the maximal strictly increasing run [startIndex ... endIndex-1]
    while (endIndex < length && nums[endIndex] > nums[endIndex - 1]) {
      endIndex += 1;
    }

    const runLength = endIndex - startIndex;

    // One run can host both windows
    if (runLength >= needed) {
      return true;
    }

    // Two consecutive qualifying runs (only check if the current run qualifies)
    if (runLength >= k) {
      if (previousRunQualifies) {
        return true;
      }
      previousRunQualifies = true;
    } else {
      // A short run breaks adjacency potential
      previousRunQualifies = false;
    }

    // The next run starts at the first non-increasing position
    startIndex = endIndex;
  }

  return false;
}
