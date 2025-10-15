function maxIncreasingSubarrays(nums: number[]): number {
  const length = nums.length;

  // Trivial early exit: need at least two elements to form any strictly increasing relation
  if (length < 2) {
    return 0;
  }

  let currentRunLength = 1;     // Length of the current strictly increasing run ending at i
  let previousRunLength = 0;    // Length of the strictly increasing run immediately preceding the current run
  let bestK = 0;                // Best answer found so far
  let previousValue = nums[0];  // Cache previous element for fewer property reads

  // Scan once; update run lengths and candidate answers at each step
  for (let index = 1; index < length; index += 1) {
    const value = nums[index];

    // Extend or reset the current run
    if (value > previousValue) {
      currentRunLength += 1;
    } else {
      // Boundary between two runs: shift current to previous, reset current
      previousRunLength = currentRunLength;
      currentRunLength = 1;
    }

    // Candidate 1: two adjacent runs across a boundary
    // k is bounded by the shorter of the two run lengths
    const candidateAcrossBoundary =
      previousRunLength < currentRunLength ? previousRunLength : currentRunLength;

    if (candidateAcrossBoundary > bestK) {
      bestK = candidateAcrossBoundary;
    }

    // Candidate 2: two adjacent subarrays both inside one long run (split the run in half)
    // floor(currentRunLength / 2) using unsigned shift for speed
    const candidateWithinRun = (currentRunLength >>> 1);

    if (candidateWithinRun > bestK) {
      bestK = candidateWithinRun;
    }

    // Move window forward
    previousValue = value;
  }

  return bestK;
}
