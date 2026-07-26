function maximumProduct(nums: number[]): number {
  // Track three largest and two smallest values in a single pass to avoid O(n log n) sorting
  let max1 = -Infinity;
  let max2 = -Infinity;
  let max3 = -Infinity;
  let min1 = Infinity;
  let min2 = Infinity;

  const length = nums.length;

  for (let index = 0; index < length; index++) {
    const value = nums[index];

    // Update the three largest values, cascading displaced values downward
    if (value > max1) {
      max3 = max2;
      max2 = max1;
      max1 = value;
    } else if (value > max2) {
      max3 = max2;
      max2 = value;
    } else if (value > max3) {
      max3 = value;
    }

    // Update the two smallest values, cascading displaced values upward
    if (value < min1) {
      min2 = min1;
      min1 = value;
    } else if (value < min2) {
      min2 = value;
    }
  }

  // Maximum is either the three largest, or two smallest negatives times the largest
  const productOfLargest = max1 * max2 * max3;
  const productOfSmallestPair = min1 * min2 * max1;

  return productOfLargest > productOfSmallestPair ? productOfLargest : productOfSmallestPair;
}
