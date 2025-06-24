function findKDistantIndices(nums: number[], key: number, k: number): number[] {
  const n = nums.length;

  // 1. Collect all positions where nums[j] === key
  const keyPositions: number[] = [];
  for (let index = 0; index < n; ++index) {
    if (nums[index] === key) {
      keyPositions.push(index);
    }
  }

  // 2. Scan every i in range [0..n-1] exactly once,
  //    advancing a single pointer through keyPositions
  const result: number[] = [];
  let leftPointer = 0;

  for (let i = 0; i < n; ++i) {
    // Move leftPointer until keyPositions[leftPointer] ≥ i - k
    while (
      leftPointer < keyPositions.length &&
      keyPositions[leftPointer] < i - k
      ) {
      ++leftPointer;
    }
    // If the current keyPosition is within i + k, include i
    if (
      leftPointer < keyPositions.length &&
      keyPositions[leftPointer] <= i + k
    ) {
      result.push(i);
    }
  }

  return result;
}
