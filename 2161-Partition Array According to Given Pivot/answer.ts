function pivotArray(nums: number[], pivot: number): number[] {
  const n = nums.length;

  // The result array and its pointer
  let resultIndex = 0;
  const resultArray: number[] = new Array(n);

  // Counting the number of pivots
  let pivotCount = 0;

  // Iterating the array, counting the number of pivot and processing the nums less than pivot
  for (let i = 0; i < n; i++) {
    const currentNumber = nums[i];
    if (currentNumber === pivot) {
      pivotCount++;
    } else if (currentNumber < pivot) {
      resultArray[resultIndex] = currentNumber;
      resultIndex++;
    }
  }

  // Filling all pivot values into the result array
  while (pivotCount > 0) {
    resultArray[resultIndex] = pivot;
    resultIndex++;
    pivotCount--;
  }

  // Iterating the array, processing the nums greater than pivot
  for (let i = 0; i < n; i++) {
    const currentNumber = nums[i];
    if (currentNumber > pivot) {
      resultArray[resultIndex] = currentNumber;
      resultIndex++;
    }
  }

  return resultArray;
}
