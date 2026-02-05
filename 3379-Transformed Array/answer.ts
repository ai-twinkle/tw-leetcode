function constructTransformedArray(nums: number[]): number[] {
  const length = nums.length;

  // Use a typed array for faster indexed writes and compact storage.
  const transformed = new Int32Array(length);

  for (let index = 0; index < length; index++) {
    const shift = nums[index];

    // Compute landing index with a single modulo + one fixup (faster than double-normalization).
    let landingIndex = (index + shift) % length;
    if (landingIndex < 0) {
      landingIndex += length;
    }

    // Read from nums directly; shifted index logic also correctly handles shift == 0.
    transformed[index] = nums[landingIndex];
  }

  // Convert typed array to number[] to match the required function signature.
  return Array.from(transformed);
}
