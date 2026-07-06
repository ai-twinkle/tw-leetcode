function removeCoveredIntervals(intervals: number[][]): number {
  const intervalCount = intervals.length;
  const RIGHT_BOUND = 100001;

  // Pack each interval into one non-negative number: left ascending, right descending under numeric sort.
  const packedKeys = new Float64Array(intervalCount);

  for (let index = 0; index < intervalCount; index++) {
    const interval = intervals[index];
    packedKeys[index] = interval[0] * RIGHT_BOUND + (RIGHT_BOUND - interval[1]);
  }

  // Native typed-array numeric sort avoids per-comparison JS callbacks.
  packedKeys.sort();

  let remaining = 0;
  let maxRightSeen = 0;

  // A sorted interval survives only if its right end exceeds every previous right end.
  for (let index = 0; index < intervalCount; index++) {
    const currentRight = RIGHT_BOUND - (packedKeys[index] % RIGHT_BOUND);

    if (currentRight > maxRightSeen) {
      remaining++;
      maxRightSeen = currentRight;
    }
  }

  return remaining;
}
