function firstStableIndex(nums: number[], k: number): number {
  const length = nums.length;

  // A lone element scores zero, and k is guaranteed to be non-negative.
  if (length === 1) {
    return 0;
  }

  // Suffix minima are the only side that cannot be derived on the fly, so cache them.
  const suffixMinimum = new Int32Array(length);
  let runningMinimum = nums[length - 1];
  let globalMinimumLastIndex = length - 1;
  suffixMinimum[length - 1] = runningMinimum;

  for (let index = length - 2; index >= 0; index--) {
    const value = nums[index];
    if (value < runningMinimum) {
      runningMinimum = value;
      // A strict decrease is only possible before the global minimum is reached,
      // so the final update lands on its last occurrence.
      globalMinimumLastIndex = index;
    }
    suffixMinimum[index] = runningMinimum;
  }

  // Index 0 pairs the smallest possible prefix maximum with the global minimum.
  if (nums[0] - runningMinimum <= k) {
    return 0;
  }

  // Indices up to the last global minimum all score at least nums[0] - globalMinimum.
  if (globalMinimumLastIndex === length - 1) {
    return -1;
  }

  let runningMaximum = nums[0];

  // Carry the prefix maximum across the doomed region without testing any index.
  for (let index = 1; index <= globalMinimumLastIndex; index++) {
    const value = nums[index];
    if (value > runningMaximum) {
      runningMaximum = value;
    }
  }

  for (let index = globalMinimumLastIndex + 1; index < length; index++) {
    const value = nums[index];
    if (value > runningMaximum) {
      runningMaximum = value;
    }
    // Scanning left to right means the first match is already the smallest index.
    if (runningMaximum - suffixMinimum[index] <= k) {
      return index;
    }
  }

  return -1;
}
