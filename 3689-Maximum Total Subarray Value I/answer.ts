function maxTotalValue(nums: number[], k: number): number {
  const length = nums.length;

  // Track the global minimum and maximum in a single pass.
  let minimumValue = nums[0];
  let maximumValue = nums[0];

  for (let index = 1; index < length; index++) {
    const current = nums[index];

    if (current < minimumValue) {
      minimumValue = current;
    }

    if (current > maximumValue) {
      maximumValue = current;
    }
  }

  // The best single subarray spans the whole array; pick it k times.
  return (maximumValue - minimumValue) * k;
}
