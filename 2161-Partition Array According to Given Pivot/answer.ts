function pivotArray(numbers: number[], pivot: number): number[] {
  const n = numbers.length;

  // The result array and its pointer
  let resultIndex = 0;
  const resultArray: number[] = new Array(n);

  // Counting the number of pivots
  let pivotCount = 0;

  // Iterating the array, counting the number of pivot and processing the numbers less than pivot
  for (let i = 0; i < n; i++) {
    const currentNumber = numbers[i];
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

  // Iterating the array, processing the numbers greater than pivot
  for (let i = 0; i < n; i++) {
    const currentNumber = numbers[i];
    if (currentNumber > pivot) {
      resultArray[resultIndex] = currentNumber;
      resultIndex++;
    }
  }

  return resultArray;
}
