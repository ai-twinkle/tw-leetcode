function applyOperations(nums: number[]): number[] {
  const n = nums.length;
  // First pass: perform the specified operations.
  for (let i = 0; i < n - 1; i++) {
    if (nums[i] === nums[i + 1]) {
      nums[i] *= 2;
      nums[i + 1] = 0;
    }
  }

  // Move non-zero elements forward and shift zeros in place.
  let j = 0;
  for (let i = 0; i < n; i++) {
    if (nums[i] !== 0) {
      // If there is a gap, place the non-zero element at position j and set current index to 0.
      if (i !== j) {
        nums[j] = nums[i];
        nums[i] = 0;
      }
      j++;
    }
  }

  return nums;
}
