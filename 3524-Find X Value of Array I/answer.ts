function resultArray(nums: number[], k: number): number[] {
  const length = nums.length;

  // Every subarray has product ≡ 0 (mod 1), so the count is n(n+1)/2
  if (k === 1) {
    return [(length * (length + 1)) / 2];
  }

  // Precompute (remainder * value) % k as a flat lookup table
  const productTable = new Int32Array(k * k);
  for (let value = 0; value < k; value++) {
    const rowOffset = value * k;
    for (let remainder = 0; remainder < k; remainder++) {
      productTable[rowOffset + remainder] = (value * remainder) % k;
    }
  }

  // Float64Array because totals can exceed the 32-bit integer range
  const result = new Float64Array(k);
  let currentCounts = new Float64Array(k);
  let nextCounts = new Float64Array(k);

  for (let index = 0; index < length; index++) {
    const value = nums[index] % k;

    // Clear the next buffer manually to avoid fill() call overhead on a tiny array
    for (let remainder = 0; remainder < k; remainder++) {
      nextCounts[remainder] = 0;
    }

    if (value === 0) {
      // Multiplying by a multiple of k sends all index + 1 subarrays ending here to remainder 0
      nextCounts[0] = index + 1;
    } else {
      // Extend every subarray ending at index - 1 by nums[index]
      const rowOffset = value * k;
      for (let remainder = 0; remainder < k; remainder++) {
        nextCounts[productTable[rowOffset + remainder]] += currentCounts[remainder];
      }

      // The single-element subarray [nums[index]]
      nextCounts[value] += 1;
    }

    // Accumulate the subarrays ending at this index into the answer
    for (let remainder = 0; remainder < k; remainder++) {
      result[remainder] += nextCounts[remainder];
    }

    // Swap buffers so no allocation happens inside the loop
    const swapBuffer = currentCounts;
    currentCounts = nextCounts;
    nextCounts = swapBuffer;
  }

  return Array.from(result);
}
