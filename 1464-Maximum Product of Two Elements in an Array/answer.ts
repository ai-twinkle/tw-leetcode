function maxProduct(nums: number[]): number {
  // Track the largest and second largest values seen so far
  let largest = 0;
  let secondLargest = 0;

  const length = nums.length;

  // Single pass keeps only the top two values, avoiding any sort overhead
  for (let index = 0; index < length; index++) {
    const current = nums[index];

    if (current > largest) {
      secondLargest = largest;
      largest = current;
    } else if (current > secondLargest) {
      secondLargest = current;
    }
  }

  return (largest - 1) * (secondLargest - 1);
}
