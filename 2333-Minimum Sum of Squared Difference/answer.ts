function minSumSquareDiff(
  nums1: number[],
  nums2: number[],
  k1: number,
  k2: number
): number {
  const length = nums1.length;
  // Operations on either array only shift the difference, so the budgets merge.
  const budget = k1 + k2;

  const absoluteDifferences = new Int32Array(length);
  let maximumDifference = 0;
  let totalAbsoluteSum = 0;
  let totalSquareSum = 0;

  // Single pass collects the differences, their total, their squares and the range.
  for (let index = 0; index < length; index++) {
    let difference = nums1[index] - nums2[index];

    if (difference < 0) {
      difference = -difference;
    }

    absoluteDifferences[index] = difference;
    totalAbsoluteSum += difference;
    totalSquareSum += difference * difference;

    if (difference > maximumDifference) {
      maximumDifference = difference;
    }
  }

  // The budget can erase every difference, so the squared sum collapses to zero.
  if (totalAbsoluteSum <= budget) {
    return 0;
  }

  // Counting sort over the difference range replaces any comparison sort.
  const counts = new Int32Array(maximumDifference + 1);

  for (let index = 0; index < length; index++) {
    counts[absoluteDifferences[index]]++;
  }

  let runningCountAbove = 0;
  let runningSumAbove = 0;
  let runningSquareSumAbove = 0;

  let threshold = maximumDifference;
  let costAtThreshold = 0;
  let countAboveThreshold = 0;
  let squareSumAboveThreshold = 0;

  // Walking the threshold downwards keeps the flattening cost monotone increasing,
  // so the first value that overshoots the budget ends the scan immediately.
  for (let value = maximumDifference - 1; value >= 1; value--) {
    const bucket = counts[value + 1];

    if (bucket !== 0) {
      const higherValue = value + 1;

      runningCountAbove += bucket;
      runningSumAbove += higherValue * bucket;
      runningSquareSumAbove += higherValue * higherValue * bucket;
    }

    // Cost of pushing every difference greater than `value` down to `value`.
    const cost = runningSumAbove - value * runningCountAbove;

    if (cost > budget) {
      break;
    }

    threshold = value;
    costAtThreshold = cost;
    countAboveThreshold = runningCountAbove;
    squareSumAboveThreshold = runningSquareSumAbove;
  }

  // Leftover units each drop one more element from `threshold` to `threshold - 1`.
  const leftoverBudget = budget - costAtThreshold;
  const countAtThreshold = countAboveThreshold + counts[threshold];
  const squaresBelowThreshold =
    totalSquareSum -
    squareSumAboveThreshold -
    counts[threshold] * threshold * threshold;
  const loweredValue = threshold - 1;

  return (
    squaresBelowThreshold +
    (countAtThreshold - leftoverBudget) * threshold * threshold +
    leftoverBudget * loweredValue * loweredValue
  );
}
