function longestSubsequence(nums: number[]): number {
  const length = nums.length;

  // runningXor decides case 1; combinedOr stays 0 only when every element is 0.
  let runningXor = 0;
  let combinedOr = 0;

  // Single pass: both accumulators are pure 32-bit integer ops, so the loop stays monomorphic.
  for (let index = 0; index < length; index++) {
    const value = nums[index];
    runningXor ^= value;
    combinedOr |= value;
  }

  // The full array already has a non-zero XOR, so nothing has to be dropped.
  if (runningXor !== 0) {
    return length;
  }

  // Total XOR is 0 and no non-zero element exists, so every subsequence XORs to 0.
  if (combinedOr === 0) {
    return 0;
  }

  // Total XOR is 0, so removing exactly one non-zero element makes the XOR non-zero.
  return length - 1;
}
