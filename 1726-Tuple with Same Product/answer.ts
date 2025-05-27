function tupleSameProduct(nums: number[]): number {
  const n = nums.length;

  // If there are fewer than 4 numbers, no pairs can be formed
  if (n < 4) {
    return 0;
  }

  // Sort once for the min/max-product shortcuts
  nums.sort((a, b) => a - b);

  const productCounts = new Map<number, number>();
  let result = 0;

  const maxProduct = nums[n - 1] * nums[n - 2];
  const minProduct = nums[0] * nums[1];

  for (let i = 0; i < n - 1; i++) {
    // cache nums[i]
    const firstNumber = nums[i];
    for (let j = i + 1; j < n; j++) {
      const product = firstNumber * nums[j];

      // Too small, skip
      if (product < minProduct) {
        continue;
      }

      // Too big, no further j will help
      if (product > maxProduct) {
        break;
      }

      const freq = productCounts.get(product) ?? 0;
      result += freq * 8; // Each prior pair gives 8 tuples
      productCounts.set(product, freq + 1);
    }
  }

  return result;
}
