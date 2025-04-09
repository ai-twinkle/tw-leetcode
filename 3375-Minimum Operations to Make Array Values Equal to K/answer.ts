function minOperations(nums: number[], k: number): number {
  // The set to track distinct numbers greater than k.
  const seen = new Set();

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];

    // If any number is less than k, it's impossible to reach k.
    if (num < k) {
      return -1;
    }

    // Count distinct numbers greater than k.
    if (num > k && !seen.has(num)) {
      seen.add(num);
    }
  }

  return seen.size;
}
