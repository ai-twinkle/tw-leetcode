function minPairSum(nums: number[]): number {
  const length = nums.length;

  // Frequency table for all possible values to replace sorting
  const frequency = new Uint32Array(100001);

  let minimumValue = 100000;
  let maximumValue = 1;

  // Count occurrences and determine the value range
  for (let index = 0; index < length; index++) {
    const value = nums[index];
    frequency[value]++;

    if (value < minimumValue) {
      minimumValue = value;
    }
    if (value > maximumValue) {
      maximumValue = value;
    }
  }

  // If all elements are equal, every pair has the same sum
  if (minimumValue === maximumValue) {
    return minimumValue + maximumValue;
  }

  // Pointers over the value range instead of indices
  let lowValue = minimumValue;
  let highValue = maximumValue;

  // Cache counts locally to avoid repeated typed-array access
  let lowCount = frequency[lowValue];
  let highCount = frequency[highValue];

  // Total number of pairs to be formed
  let pairsRemaining = length >> 1;

  // Tracks the largest sum seen among all formed pairs
  let maximumPairSum = 0;

  // Greedily pair smallest available with largest available
  while (pairsRemaining > 0) {
    // Move the low pointer to the next value that still has remaining elements
    while (lowCount === 0) {
      lowValue++;
      lowCount = frequency[lowValue];
    }

    // Move high pointer to the previous value that still has remaining elements
    while (highCount === 0) {
      highValue--;
      highCount = frequency[highValue];
    }

    // Pairing the current smallest and largest gives the worst case for this step
    const pairSum = lowValue + highValue;
    if (pairSum > maximumPairSum) {
      maximumPairSum = pairSum;
    }

    // When both pointers meet, the remaining elements can only pair with themselves
    if (lowValue === highValue) {
      break;
    }

    // Consume as many pairs as possible between current low and high values
    const usedPairs = lowCount < highCount ? lowCount : highCount;
    pairsRemaining -= usedPairs;

    lowCount -= usedPairs;
    highCount -= usedPairs;
  }

  return maximumPairSum;
}
