function specialTriplets(nums: number[]): number {
  const MODULO = 1_000_000_007;
  const length = nums.length;

  // Based on the constraint: 0 <= nums[i] <= 1e5
  const MAXIMUM_VALUE = 100_000;

  // Typed arrays for efficient counting by value
  const leftCountArray = new Uint32Array(MAXIMUM_VALUE + 1);
  const rightCountArray = new Uint32Array(MAXIMUM_VALUE + 1);

  // Precompute suffix frequency for each value
  for (let index = 0; index < length; index++) {
    const currentValue = nums[index];
    rightCountArray[currentValue]++;
  }

  let tripletCount = 0;

  // Sweep each position as the middle index j
  for (let middleIndex = 0; middleIndex < length; middleIndex++) {
    const middleValue = nums[middleIndex];

    // Current element leaves the suffix; it can no longer be used as k
    rightCountArray[middleValue]--;

    // Values at i and k must both be doubledValue
    const doubledValue = middleValue << 1;

    if (doubledValue <= MAXIMUM_VALUE) {
      const leftOccurrences = leftCountArray[doubledValue];
      const rightOccurrences = rightCountArray[doubledValue];

      // Only accumulate when both sides have candidates
      if (leftOccurrences !== 0 && rightOccurrences !== 0) {
        // Use pure arithmetic here and postpone modulo to the end
        tripletCount += leftOccurrences * rightOccurrences;
      }
    }

    // Now this value can serve as a left-side candidate for future j
    leftCountArray[middleValue]++;
  }

  // One final modulo at the end is enough (no overflow under given constraints)
  return tripletCount % MODULO;
}
