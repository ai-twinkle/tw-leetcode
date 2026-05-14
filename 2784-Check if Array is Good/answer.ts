function isGood(nums: number[]): boolean {
  const arrayLength = nums.length;
  const countBuffer = new Uint8Array(arrayLength);

  for (let scanIndex = 0; scanIndex < arrayLength; scanIndex++) {
    const currentValue = nums[scanIndex];

    // Values must lie in 1..arrayLength-1
    if (currentValue >= arrayLength) {
      return false;
    }
    // The max value (arrayLength - 1) may appear twice; all others at most once
    if (currentValue < arrayLength - 1 && countBuffer[currentValue] > 0) {
      return false;
    }
    if (currentValue === arrayLength - 1 && countBuffer[currentValue] > 1) {
      return false;
    }

    countBuffer[currentValue]++;
  }

  return true;
}
