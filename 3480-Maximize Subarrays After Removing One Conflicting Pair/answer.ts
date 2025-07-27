function maxSubarrays(n: number, conflictingPairs: number[][]): number {
  // 1. Count how many pairs have each right-endpoint r
  const pairsPerEndpoint = new Uint32Array(n + 1);
  const totalPairs = conflictingPairs.length;
  for (let i = 0; i < totalPairs; ++i) {
    const [a, b] = conflictingPairs[i];
    const right = a > b ? a : b;
    pairsPerEndpoint[right]++;
  }

  // 2. Build prefix-sum offsets so that
  //    startIndices[r] .. startIndices[r+1]-1 is the slice for endpoint = r
  const startIndices = new Uint32Array(n + 2);
  for (let r = 1; r <= n + 1; ++r) {
    startIndices[r] = startIndices[r - 1] + pairsPerEndpoint[r - 1];
  }

  // 3. Fill a flat array of all the smaller endpoints
  const flatLefts = new Uint32Array(totalPairs);
  const writePos = startIndices.slice();  // copy of startIndices to track where to write
  for (let i = 0; i < totalPairs; ++i) {
    const [a, b] = conflictingPairs[i];
    const right = a > b ? a : b;
    flatLefts[writePos[right]++] = a > b ? b : a;
  }

  // 4. Now do the sweep over r = 1..n, exactly as before, but on flat arrays
  const prefixGains = new Uint32Array(n + 1);
  let baseCount = 0;
  let bestGain = 0;
  let highestConflictLeft = 0;
  let secondHighestConflictLeft = 0;

  for (let r = 1; r <= n; ++r) {
    // Process all pairs whose right endpoint is r
    const sliceStart = startIndices[r];
    const sliceEnd   = startIndices[r + 1];
    for (let idx = sliceStart; idx < sliceEnd; ++idx) {
      const left = flatLefts[idx];
      if (left > highestConflictLeft) {
        secondHighestConflictLeft = highestConflictLeft;
        highestConflictLeft       = left;
      } else if (left > secondHighestConflictLeft) {
        secondHighestConflictLeft = left;
      }
    }

    // Count all “good” subarrays ending at r
    baseCount += r - highestConflictLeft;

    // Account for the bonus if we remove the pair that set highestConflictLeft
    if (highestConflictLeft !== 0) {
      const gain = highestConflictLeft - secondHighestConflictLeft;
      const updated = prefixGains[highestConflictLeft] + gain;
      prefixGains[highestConflictLeft] = updated;
      if (updated > bestGain) {
        bestGain = updated;
      }
    }
  }

  return baseCount + bestGain;
}
