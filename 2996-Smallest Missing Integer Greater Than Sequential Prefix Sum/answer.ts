function missingInteger(nums: number[]): number {
  const length = nums.length;
  let sequentialSum = nums[0];
  let previousValue = nums[0];

  // Accumulate the longest sequential prefix and stop at the first break in the run
  for (let index = 1; index < length; index++) {
    const currentValue = nums[index];

    if (currentValue !== previousValue + 1) {
      break;
    }

    sequentialSum += currentValue;
    previousValue = currentValue;
  }

  // Every element is bounded by 50, so any sum above that bound is guaranteed missing
  if (sequentialSum > 50) {
    return sequentialSum;
  }

  // Pack the presence of values 1..50 into two 32-bit masks instead of allocating a Set
  let lowPresenceMask = 0;
  let highPresenceMask = 0;

  for (let index = 0; index < length; index++) {
    const value = nums[index];

    if (value < 32) {
      lowPresenceMask |= 1 << value;
    } else {
      highPresenceMask |= 1 << (value - 32);
    }
  }

  // Walk upward from the prefix sum until a value is absent from the masks
  let candidate = sequentialSum;

  while (candidate <= 50) {
    const presenceBit = candidate < 32
      ? (lowPresenceMask >>> candidate) & 1
      : (highPresenceMask >>> (candidate - 32)) & 1;

    if (presenceBit === 0) {
      return candidate;
    }

    candidate++;
  }

  // Anything past 50 cannot appear in nums, so it is the answer
  return candidate;
}
