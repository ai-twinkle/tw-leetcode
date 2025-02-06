function tupleSameProduct(nums: number[]): number {
  const n = nums.length;
  const productMap = new Map<number, number>();

  let count = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      // Calculate the product of the pair
      const product = nums[i] * nums[j];

      // When the product is found, increment the count by 8 times the number of times the product has been found
      // Because there are 8 ways to form a tuple of 4 elements with the same product
      count += 8 * (productMap.get(product) || 0);

      // Increment the number of times the product has been found
      productMap.set(product, (productMap.get(product) || 0) + 1);
    }
  }

  return count;
}
