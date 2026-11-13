function countNonDecreasingSubarrays(nums: number[], k: number): number {
  const length = nums.length;

  // Copy into a typed array for fast, monomorphic element access (values fit in int32)
  const values = new Int32Array(nums);

  // Stack of leader indices: the back is the newest left, the front is the rightmost leader
  const leaderStack = new Int32Array(length);
  let frontIndex = 0;
  let backIndex = 0;

  let rightBound = length - 1;
  let operationCost = 0;
  let validSubarrayCount = 0;

  for (let left = length - 1; left >= 0; left--) {
    const currentValue = values[left];

    // The new left value takes over every leader block whose max is not above it
    while (backIndex > frontIndex && values[leaderStack[backIndex - 1]] <= currentValue) {
      backIndex--;
      const absorbedLeader = leaderStack[backIndex];
      const segmentEnd = backIndex > frontIndex ? leaderStack[backIndex - 1] : rightBound + 1;

      // Every element in the absorbed block must now be raised to currentValue instead
      operationCost += (currentValue - values[absorbedLeader]) * (segmentEnd - absorbedLeader);
    }

    leaderStack[backIndex] = left;
    backIndex++;

    // Shrink the window from the right until the total cost fits within k
    while (operationCost > k) {
      const rightmostLeader = leaderStack[frontIndex];

      // Remove the cost contributed by the element at rightBound
      operationCost -= values[rightmostLeader] - values[rightBound];

      if (rightmostLeader === rightBound) {
        frontIndex++;
      }
      rightBound--;
    }

    // Every right end from left to rightBound gives a valid subarray
    validSubarrayCount += rightBound - left + 1;
  }

  return validSubarrayCount;
}
