function minimumDistance(nums: number[]): number {
  const length = nums.length;

  // Track the two most recent indices seen for each value (values are 1..n)
  const mostRecentIndex = new Int32Array(length + 1).fill(-1);
  const secondMostRecentIndex = new Int32Array(length + 1).fill(-1);

  let minimumDist = -1;

  for (let currentIndex = 0; currentIndex < length; currentIndex++) {
    const value = nums[currentIndex];
    const previousIndex = mostRecentIndex[value];
    const olderIndex = secondMostRecentIndex[value];

    if (olderIndex !== -1) {
      // Consecutive triple found: olderIndex < previousIndex < currentIndex
      // Distance simplifies to 2 * (currentIndex - olderIndex)
      const distance = 2 * (currentIndex - olderIndex);

      if (minimumDist === -1 || distance < minimumDist) {
        minimumDist = distance;
      }
    }

    // Slide the two-slot window forward for this value
    secondMostRecentIndex[value] = previousIndex;
    mostRecentIndex[value] = currentIndex;
  }

  return minimumDist;
}
