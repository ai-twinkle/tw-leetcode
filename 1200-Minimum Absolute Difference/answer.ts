function minimumAbsDifference(arr: number[]): number[][] {
  const length = arr.length;

  // Copy input values so sorting does not mutate the original array.
  const sortedValues = new Int32Array(length);
  for (let index = 0; index < length; index++) {
    sortedValues[index] = arr[index];
  }

  // Sorting allows the minimum absolute difference to be found by comparing only adjacent elements.
  sortedValues.sort();

  // Initialize with the largest possible positive difference.
  let minimumDifference = 2147483647;

  // Store result pairs incrementally during the scan.
  const pairs: number[][] = [];
  let pairsLength = 0;

  // Start comparison from the first element.
  let previousValue = sortedValues[0];

  // One pass is sufficient because only adjacent values can produce the minimum difference after sorting.
  for (let index = 1; index < length; index++) {
    const currentValue = sortedValues[index];

    // The difference is non-negative because the array is sorted.
    const difference = currentValue - previousValue;

    if (difference < minimumDifference) {
      // A smaller difference invalidates all previously found pairs.
      minimumDifference = difference;
      pairsLength = 0;
      pairs[pairsLength] = [previousValue, currentValue];
      pairsLength++;
    } else if (difference === minimumDifference) {
      // This pair matches the current minimum difference.
      pairs[pairsLength] = [previousValue, currentValue];
      pairsLength++;
    }

    // Move forward to compare the next adjacent pair.
    previousValue = currentValue;
  }

  // Shrink the result array to the number of valid pairs collected.
  pairs.length = pairsLength;
  return pairs;
}
