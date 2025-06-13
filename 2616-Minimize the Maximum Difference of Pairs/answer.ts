function minimizeMax(nums: number[], p: number): number {
  const length = nums.length;
  if (p === 0 || length < 2) {
    return 0;
  }

  // 1. Typed-array copy + native numeric sort
  const sortedNums = Uint32Array.from(nums);
  sortedNums.sort();

  // 2. Precompute adjacent differences once
  const nMinusOne = length - 1;
  const diffs = new Uint32Array(nMinusOne);
  for (let i = 0; i < nMinusOne; i++) {
    diffs[i] = sortedNums[i + 1] - sortedNums[i];
  }

  // 3. Binary search on [0 .. max−min]
  let lowerBound = 0;
  // use full span, not just the last diff
  let upperBound = sortedNums[length - 1] - sortedNums[0];

  while (lowerBound < upperBound) {
    const middle = (lowerBound + upperBound) >>> 1;

    // 3.1 Greedily count pairs with diff ≤ middle
    let count = 0;
    for (let i = 0; i < nMinusOne && count < p; ) {
      if (diffs[i] <= middle) {
        count++;
        i += 2;
      } else {
        i += 1;
      }
    }

    // 3.2 Narrow down
    if (count >= p) {
      upperBound = middle;
    } else {
      lowerBound = middle + 1;
    }
  }

  // 4. Return the lower bound as the result
  return lowerBound;
}
