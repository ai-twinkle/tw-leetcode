function findGCD(nums: number[]): number {
  let minimum = nums[0];
  let maximum = nums[0];
  const length = nums.length;

  // Single pass to track both extremes, avoiding Math.min/max call overhead
  for (let index = 1; index < length; index++) {
    const value = nums[index];
    if (value < minimum) {
      minimum = value;
    } else if (value > maximum) {
      maximum = value;
    }
  }

  // Euclidean algorithm on the two extremes
  while (minimum !== 0) {
    const remainder = maximum % minimum;
    maximum = minimum;
    minimum = remainder;
  }

  return maximum;
}
