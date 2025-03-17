function divideArray(nums: number[]): boolean {
  // Fixed-size array for counts: indices 0..500.
  const freq = new Uint16Array(501);
  let oddCount = 0;

  for (const num of nums) {
    // Increment frequency for this number.
    freq[num]++;

    // Toggle the odd/even status:
    // If the new count is odd, increment oddCount;
    // if it's even, decrement oddCount.
    if (freq[num] & 1) {
      oddCount++;
    } else {
      oddCount--;
    }
  }

  // All numbers must appear an even number of times.
  return oddCount === 0;
}
