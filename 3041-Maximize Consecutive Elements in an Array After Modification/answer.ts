function maxSelectedElements(nums: number[]): number {
  const length = nums.length;

  // Find the value range so the sweep only covers values that occur
  let minimumValue = nums[0];
  let maximumValue = nums[0];
  for (let index = 1; index < length; index++) {
    const value = nums[index];
    if (value > maximumValue) {
      maximumValue = value;
    } else if (value < minimumValue) {
      minimumValue = value;
    }
  }

  // Counting sort: only "0, 1, or at least 2" matters, so cap counts at 2
  const occurrence = new Uint8Array(maximumValue + 1);
  for (let index = 0; index < length; index++) {
    const value = nums[index];
    if (occurrence[value] < 2) {
      occurrence[value]++;
    }
  }

  // endAtPrevious: longest chain ending exactly at value - 1 (all elements up to value - 1 considered)
  // pendingAtCurrent: longest chain ending at value that uses only elements < value
  let endAtPrevious = 0;
  let pendingAtCurrent = 0;
  let bestLength = 1;

  for (let value = minimumValue; value <= maximumValue; value++) {
    const count = occurrence[value];
    let finalAtCurrent: number;
    let pendingAtNext: number;

    if (count === 0) {
      // No element equals value: only chains built by incrementing value - 1 can end here
      finalAtCurrent = pendingAtCurrent;
      pendingAtNext = 0;
    } else {
      // Keep one element as value to extend the chain ending at value - 1
      finalAtCurrent = endAtPrevious + 1;
      if (pendingAtCurrent > finalAtCurrent) {
        finalAtCurrent = pendingAtCurrent;
      }

      // Increment one element to value + 1 on top of a chain ending at value
      pendingAtNext = pendingAtCurrent + 1;

      // With two copies, one stays as value and the other becomes value + 1
      if (count > 1 && endAtPrevious + 2 > pendingAtNext) {
        pendingAtNext = endAtPrevious + 2;
      }

      if (pendingAtNext > bestLength) {
        bestLength = pendingAtNext;
      }
    }

    if (finalAtCurrent > bestLength) {
      bestLength = finalAtCurrent;
    }

    // Shift the rolling window forward by one value
    endAtPrevious = finalAtCurrent;
    pendingAtCurrent = pendingAtNext;
  }

  return bestLength;
}
