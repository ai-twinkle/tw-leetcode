function maxSumTrionic(nums: number[]): number {
  const n = nums.length;
  const negativeInfinity = Number.NEGATIVE_INFINITY;

  // increasingEnd: best sum of a strictly increasing subarray ending at current index (length >= 2)
  // decreasingMiddle: best sum of (increasing then decreasing) ending at current index (currently in decreasing)
  // trionicEnd: best sum of full (increasing then decreasing then increasing) ending at current index (currently in final increasing)
  let increasingEnd = negativeInfinity;
  let decreasingMiddle = negativeInfinity;
  let trionicEnd = negativeInfinity;

  // Track the best trionic sum seen so far.
  let result = negativeInfinity;

  // Cache the previous value to avoid repeated array reads.
  let previousValue = nums[0];

  for (let index = 1; index < n; index += 1) {
    const currentValue = nums[index];

    if (previousValue < currentValue) {
      // Strictly increasing boundary: update increasingEnd and trionicEnd states.
      const pairSum = previousValue + currentValue;

      // Extend an existing increasing run or start a new run of length 2.
      const extendIncreasing = increasingEnd + currentValue;
      increasingEnd = extendIncreasing > pairSum ? extendIncreasing : pairSum;

      // Start final increasing from a valid decreasingMiddle, or extend an existing final increasing.
      const startFinalFromDecreasing = decreasingMiddle + currentValue;
      const extendFinal = trionicEnd + currentValue;
      trionicEnd = extendFinal > startFinalFromDecreasing ? extendFinal : startFinalFromDecreasing;

      // A strict increase breaks the decreasing phase, so decreasingMiddle becomes invalid here.
      decreasingMiddle = negativeInfinity;

      // Update the global answer when we have a valid trionicEnd.
      if (trionicEnd > result) {
        result = trionicEnd;
      }
    } else if (previousValue > currentValue) {
      // Strictly decreasing boundary: update decreasingMiddle state.
      const startDecreasingFromIncreasing = increasingEnd + currentValue;
      const extendDecreasing = decreasingMiddle + currentValue;
      decreasingMiddle = extendDecreasing > startDecreasingFromIncreasing ? extendDecreasing : startDecreasingFromIncreasing;

      // A strict decrease breaks increasing and final increasing phases, so invalidate them.
      increasingEnd = negativeInfinity;
      trionicEnd = negativeInfinity;
    } else {
      // Equality breaks strictness: invalidate all states across this boundary.
      increasingEnd = negativeInfinity;
      decreasingMiddle = negativeInfinity;
      trionicEnd = negativeInfinity;
    }

    // Advance the rolling "previous" value for the next iteration.
    previousValue = currentValue;
  }

  return result;
}
