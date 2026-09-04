function firstStableIndex(nums: number[], k: number): number {
  const length = nums.length;
  let candidateIndex = 0;
  let prefixMaxOfCandidate = -1;
  let suffixMinFromCandidate = -1;
  let runningPrefixMax = -1;

  for (let scanIndex = 0; scanIndex < length; scanIndex++) {
    const value = nums[scanIndex];

    // Running maximum of nums[0..scanIndex]; it seeds a newly promoted candidate.
    if (value > runningPrefixMax) {
      runningPrefixMax = value;
    }

    if (scanIndex === candidateIndex) {
      // Reached the candidate itself: freeze its prefix max, open its suffix min.
      prefixMaxOfCandidate = runningPrefixMax;
      suffixMinFromCandidate = value;
    } else if (value < suffixMinFromCandidate) {
      // Tighten the minimum observed over nums[candidateIndex..scanIndex].
      suffixMinFromCandidate = value;
    }

    if (prefixMaxOfCandidate - suffixMinFromCandidate > k) {
      // A violating pair (a <= candidateIndex, b = scanIndex) makes every index
      // in [candidateIndex, scanIndex] unstable, so jump past the whole block.
      candidateIndex = scanIndex + 1;
    }
  }

  return candidateIndex < length ? candidateIndex : -1;
}
