function missingMultiple(nums: number[], k: number): number {
  // Only values 1..100 can appear, so a fixed 101-slot table suffices.
  const presence = new Uint8Array(101);
  const length = nums.length;

  for (let index = 0; index < length; index++) {
    presence[nums[index]] = 1;
  }

  // Any multiple above 100 is out of the value range and therefore missing.
  for (let multiple = k; multiple <= 100; multiple += k) {
    if (presence[multiple] === 0) {
      return multiple;
    }
  }

  // Every in-range multiple was present, so return the first one past the range.
  return (Math.floor(100 / k) + 1) * k;
}
