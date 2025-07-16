function maximumLength(nums: number[]): number {
  const n = nums.length;

  // Count of each parity for the "same-parity" option
  let evenCount = 0;
  let oddCount = 0;

  // DP states for "alternating-parity":
  //  bestEndEven = length of longest alternating subsequence seen so far that ends in an even
  //  bestEndOdd  = length of longest alternating subsequence seen so far that ends in an odd
  let bestEndEven = 0;
  let bestEndOdd = 0;

  for (let i = 0; i < n; ++i) {
    // faster than % 2
    const isEven = (nums[i] & 1) === 0;

    if (isEven) {
      evenCount++;
      // If we put this even at the end, we can extend any odd-ending alt. subsequence
      const extendLength = bestEndOdd + 1;
      if (extendLength > bestEndEven) {
        bestEndEven = extendLength;
      }
    } else {
      oddCount++;
      // Similarly, extend an even-ending alt. subsequence
      const extendLength = bestEndEven + 1;
      if (extendLength > bestEndOdd) {
        bestEndOdd = extendLength;
      }
    }
  }

  // All-same-parity best: pick the larger count
  const bestSameParity = evenCount > oddCount ? evenCount : oddCount;
  // Best alternating: whichever DP state is larger
  const bestAlternating = bestEndEven > bestEndOdd ? bestEndEven : bestEndOdd;

  // Return whichever pattern yields the longer subsequence
  return bestSameParity > bestAlternating ? bestSameParity : bestAlternating;
}
