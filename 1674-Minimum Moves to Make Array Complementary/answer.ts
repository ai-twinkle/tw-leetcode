function minMoves(nums: number[], limit: number): number {
  const arrayLength = nums.length;
  const halfLength = arrayLength >> 1;
  const maxTarget = limit << 1;

  // Difference array sized maxTarget + 2 to safely handle right-boundary increments
  const differenceArray = new Int32Array(maxTarget + 2);

  // Build difference array: each pair adds +2 baseline, -1 in single-move range, -1 extra at exact sum
  for (let pairIndex = 0; pairIndex < halfLength; pairIndex++) {
    const leftValue = nums[pairIndex];
    const rightValue = nums[arrayLength - 1 - pairIndex];

    // Inline min/max to avoid Math function call overhead
    const smaller = leftValue < rightValue ? leftValue : rightValue;
    const larger = leftValue < rightValue ? rightValue : leftValue;

    const pairSum = leftValue + rightValue;
    const singleMoveLow = smaller + 1;
    const singleMoveHigh = larger + limit;

    // Subtract 1 across the single-move range (baseline of 2 added globally after the loop)
    differenceArray[singleMoveLow] -= 1;
    differenceArray[singleMoveHigh + 1] += 1;

    // Subtract 1 more at exact pairSum (zero moves needed there)
    differenceArray[pairSum] -= 1;
    differenceArray[pairSum + 1] += 1;
  }

  // Prefix sum while tracking the minimum cost across valid target range [2, maxTarget]
  // Baseline cost equals 2 * halfLength (worst case: change both elements of every pair)
  let runningCost = halfLength << 1;
  let minimumMoves = runningCost;
  for (let targetSum = 2; targetSum <= maxTarget; targetSum++) {
    runningCost += differenceArray[targetSum];
    if (runningCost < minimumMoves) {
      minimumMoves = runningCost;
    }
  }

  return minimumMoves;
}
