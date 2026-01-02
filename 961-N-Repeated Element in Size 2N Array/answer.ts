function repeatedNTimes(nums: number[]): number {
  const seenFlags = new Uint8Array(10001);

  for (let index = 0; index < nums.length; index++) {
    const value = nums[index];

    // If the value has been seen before, return it as the repeated element.
    if (seenFlags[value] !== 0) {
      return value;
    }

    // Mark the value as seen once.
    seenFlags[value] = 1;
  }

  return -1;
}
