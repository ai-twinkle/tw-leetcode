function minRemoval(nums: number[], k: number): number {
  const length = nums.length;
  if (length <= 1) {
    return 0;
  }

  // Use a typed array for better memory locality and faster engine-level numeric sort.
  const sortedValues = new Int32Array(length);
  for (let index = 0; index < length; index++) {
    sortedValues[index] = nums[index];
  }
  sortedValues.sort();

  // Fast path: when k === 1, we need all remaining elements equal (max <= min).
  if (k === 1) {
    let bestFrequency = 1;
    let currentFrequency = 1;

    for (let index = 1; index < length; index++) {
      if (sortedValues[index] === sortedValues[index - 1]) {
        currentFrequency++;
      } else {
        if (currentFrequency > bestFrequency) {
          bestFrequency = currentFrequency;
        }
        currentFrequency = 1;
      }
    }

    if (currentFrequency > bestFrequency) {
      bestFrequency = currentFrequency;
    }

    return length - bestFrequency;
  }

  // Two pointers to find the longest window where max <= k * min.
  let leftIndex = 0;
  let bestWindowLength = 1;

  for (let rightIndex = 0; rightIndex < length; rightIndex++) {
    const rightValue = sortedValues[rightIndex];

    // Advance leftIndex until the window satisfies the balance constraint again.
    while (leftIndex <= rightIndex && rightValue > sortedValues[leftIndex] * k) {
      leftIndex++;
    }

    const windowLength = rightIndex - leftIndex + 1;
    if (windowLength > bestWindowLength) {
      bestWindowLength = windowLength;
    }
  }

  return length - bestWindowLength;
}
