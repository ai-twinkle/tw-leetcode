function divideArray(nums: number[], k: number): number[][] {
  const totalElements = nums.length;
  if (totalElements % 3 !== 0) {
    return [];
  }

  // 1. Find min and max in one pass
  let minimumValue = nums[0];
  let maximumValue = nums[0];
  for (let i = 1; i < totalElements; i++) {
    const value = nums[i];
    if (value < minimumValue) {
      minimumValue = value;
    } else if (value > maximumValue) {
      maximumValue = value;
    }
  }

  // 2. Build a typed count array
  const rangeSize = maximumValue - minimumValue + 1;
  const countArray = new Uint32Array(rangeSize);
  for (let i = 0; i < totalElements; i++) {
    countArray[nums[i] - minimumValue]++;
  }

  // 3. Prepare result container
  const numberOfGroups = totalElements / 3;
  const resultGroups: number[][] = new Array(numberOfGroups);

  // 4. Inline "take next" logic and build each triplet
  let cursorOffset = 0;  // Index into countArray
  for (let groupIndex = 0; groupIndex < numberOfGroups; groupIndex++) {
    // First element
    while (cursorOffset < rangeSize && countArray[cursorOffset] === 0) {
      cursorOffset++;
    }
    if (cursorOffset === rangeSize) {
      return []; // Ran out
    }
    const firstValue = cursorOffset + minimumValue;
    countArray[cursorOffset]--;

    // Second element
    while (cursorOffset < rangeSize && countArray[cursorOffset] === 0) {
      cursorOffset++;
    }
    if (cursorOffset === rangeSize) {
      return [];
    }
    const secondValue = cursorOffset + minimumValue;
    countArray[cursorOffset]--;

    // Third element
    while (cursorOffset < rangeSize && countArray[cursorOffset] === 0) {
      cursorOffset++;
    }
    if (cursorOffset === rangeSize) {
      return [];
    }
    const thirdValue = cursorOffset + minimumValue;
    countArray[cursorOffset]--;

    // Check the k-difference constraint
    if (thirdValue - firstValue > k) {
      return [];
    }

    resultGroups[groupIndex] = [firstValue, secondValue, thirdValue];
  }

  return resultGroups;
}
