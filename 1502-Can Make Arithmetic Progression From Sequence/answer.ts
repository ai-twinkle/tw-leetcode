function canMakeArithmeticProgression(arr: number[]): boolean {
  const arrayLength = arr.length;

  // Length 2 always forms an arithmetic progression
  if (arrayLength <= 2) {
    return true;
  }

  // Sort the array in-place
  arr.sort((first, second) => {
    return first - second;
  });

  // Compute the common difference
  const commonDifference = arr[1] - arr[0];

  // Validate each consecutive difference
  for (let index = 2; index < arrayLength; index++) {
    if (arr[index] - arr[index - 1] !== commonDifference) {
      return false;
    }
  }

  return true;
}
