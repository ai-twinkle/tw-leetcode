function uniqueXorTriplets(nums: number[]): number {
  const length = nums.length;

  // With fewer than three elements only the n original values are reachable.
  if (length < 3) {
    return length;
  }

  // Smallest power of two strictly greater than n, i.e. the full XOR span size.
  return 1 << (32 - Math.clz32(length));
}
