function possibleStringCount(word: string, k: number): number {
  const MOD = 1_000_000_007;
  const wordLength = word.length;

  // 1. Check if k is larger than the word's length
  if (k > wordLength) {
    return 0;
  }

  // 2. Build run-length encoding, segment count, and total ways in one pass
  const runLengths = new Uint16Array(wordLength);
  let segmentCount = 0;
  let totalWays = 1;
  let currentRun = 1;

  for (let i = 1; i < wordLength; i++) {
    if (word.charCodeAt(i) === word.charCodeAt(i - 1)) {
      currentRun++;
    } else {
      runLengths[segmentCount] = currentRun;
      totalWays = (totalWays * currentRun) % MOD;
      segmentCount++;
      currentRun = 1;
    }
  }

  // 3. Push the final segment
  runLengths[segmentCount] = currentRun;
  totalWays = (totalWays * currentRun) % MOD;
  segmentCount++;

  // 4. If segmentCount >= k, every split is valid
  if (segmentCount >= k) {
    return totalWays;
  }

  // 5. Use DP to count how many ways form string length < k
  //    Only care about up to (k-1 - segmentCount) extra repeats
  const maxOffset = k - 1 - segmentCount;

  // 6. Typed arrays for DP; size is always small (<= 2000)
  let dpPrev = new Uint32Array(maxOffset + 1);
  let dpCurr = new Uint32Array(maxOffset + 1);
  dpPrev[0] = 1; // One way to start

  // 7. DP Transition using sliding window prefix sum
  for (let seg = 0; seg < segmentCount; seg++) {
    const runLength = runLengths[seg];
    if (runLength === 1) {
      continue;
    }
    const windowSize = Math.min(runLength - 1, maxOffset);
    let windowSum = 0;
    for (let offset = 0; offset <= maxOffset; offset++) {
      windowSum = (windowSum + dpPrev[offset]) % MOD;
      if (offset > windowSize) {
        windowSum = (windowSum - dpPrev[offset - windowSize - 1] + MOD) % MOD;
      }
      dpCurr[offset] = windowSum;
    }
    // Swap DP buffers
    let temp = dpPrev;
    dpPrev = dpCurr;
    dpCurr = temp;
    // No need to reset dpCurr; it will be overwritten
  }

  // 8. Sum all ways with extra repeat <= maxOffset (original < k)
  let tooShortWays = 0;
  for (let offset = 0; offset <= maxOffset; offset++) {
    tooShortWays = (tooShortWays + dpPrev[offset]) % MOD;
  }

  // 9. The answer: totalWays minus those that are too short
  let answer = totalWays - tooShortWays;
  if (answer < 0) {
    answer += MOD;
  }
  return answer;
}
