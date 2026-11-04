function minOperations(nums: number[], x: number, k: number): number {
  const length = nums.length;
  const windowCount = length - x + 1;

  // Pack (value, index) into one float so a single typed sort yields unique ranks
  const packedKeys = new Float64Array(length);
  for (let index = 0; index < length; index++) {
    packedKeys[index] = (nums[index] + 1000000) * 131072 + index;
  }
  packedKeys.sort();

  const rankOfIndex = new Int32Array(length);
  const sortedValues = new Float64Array(length);
  for (let rank = 0; rank < length; rank++) {
    const originalIndex = packedKeys[rank] % 131072;
    rankOfIndex[originalIndex] = rank + 1;
    sortedValues[rank] = nums[originalIndex];
  }

  // Fenwick trees over ranks storing counts and value sums
  const countTree = new Int32Array(length + 1);
  const sumTree = new Float64Array(length + 1);
  let highestStep = 1;
  while (highestStep * 2 <= length) {
    highestStep *= 2;
  }

  const medianOrder = (x + 1) >> 1;
  const rightCount = x - medianOrder;
  const windowCost = new Float64Array(windowCount);
  let windowSum = 0;

  for (let index = 0; index < length; index++) {
    // Insert the incoming element
    const incomingValue = nums[index];
    windowSum += incomingValue;
    for (let position = rankOfIndex[index]; position <= length; position += position & -position) {
      countTree[position]++;
      sumTree[position] += incomingValue;
    }

    // Remove the element that slid out of the window
    if (index >= x) {
      const outgoingValue = nums[index - x];
      windowSum -= outgoingValue;
      for (let position = rankOfIndex[index - x]; position <= length; position += position & -position) {
        countTree[position]--;
        sumTree[position] -= outgoingValue;
      }
    }

    if (index >= x - 1) {
      // Binary lifting to locate the median rank and the sum of elements below it
      let position = 0;
      let accumulatedCount = 0;
      let accumulatedSum = 0;
      for (let step = highestStep; step > 0; step >>= 1) {
        const next = position + step;
        if (next <= length && accumulatedCount + countTree[next] < medianOrder) {
          position = next;
          accumulatedCount += countTree[next];
          accumulatedSum += sumTree[next];
        }
      }
      const median = sortedValues[position];
      const leftSum = accumulatedSum + median;
      windowCost[index - x + 1] = median * medianOrder - leftSum + (windowSum - leftSum) - median * rightCount;
    }
  }

  // Rolling DP: previous[i] = best cost using (used - 1) subarrays within the first i elements
  let previous = new Float64Array(length + 1);
  let current = new Float64Array(length + 1);
  for (let used = 1; used <= k; used++) {
    const firstEnd = used * x;
    for (let end = 0; end < firstEnd; end++) {
      current[end] = Infinity;
    }
    for (let end = firstEnd; end <= length; end++) {
      const takeCost = previous[end - x] + windowCost[end - x];
      const skipCost = current[end - 1];
      current[end] = takeCost < skipCost ? takeCost : skipCost;
    }
    const swap = previous;
    previous = current;
    current = swap;
  }
  return previous[length];
}
