function shuffle(nums: number[], n: number): number[] {
  const result = new Array(nums.length);

  // Preallocate and assign by index to avoid push() resizing overhead.
  for (let index = 0; index < n; index++) {
    const resultIndex = index * 2;
    result[resultIndex] = nums[index];
    result[resultIndex + 1] = nums[index + n];
  }

  return result;
}
