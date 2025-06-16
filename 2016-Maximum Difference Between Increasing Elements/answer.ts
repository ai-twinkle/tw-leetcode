function maximumDifference(nums: number[]): number {
  const lengthOfNums = nums.length;
  if (lengthOfNums < 2) {
    return -1;
  }

  let minimumSoFar = nums[0];
  let maximumDifferenceFound = -1;

  for (let currentIndex = 1; currentIndex < lengthOfNums; currentIndex++) {
    const currentValue = nums[currentIndex];

    if (currentValue > minimumSoFar) {
      // Only consider strictly larger values
      const potentialDifference = currentValue - minimumSoFar;
      if (potentialDifference > maximumDifferenceFound) {
        maximumDifferenceFound = potentialDifference;
      }
    } else if (currentValue < minimumSoFar) {
      // Only update the running minimum when it truly is smaller
      minimumSoFar = currentValue;
    }
  }

  return maximumDifferenceFound;
}
