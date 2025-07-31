function subarrayBitwiseORs(arr: number[]): number {
  // Store all unique bitwise OR results of subarrays
  const distinctBitwiseOrSet = new Set<number>();
  const length = arr.length;

  for (let startIndex = 0; startIndex < length; startIndex++) {
    distinctBitwiseOrSet.add(arr[startIndex]);
    for (
      let endIndex = startIndex - 1;
      endIndex >= 0 && (arr[startIndex] | arr[endIndex]) !== arr[endIndex];
      endIndex--
    ) {
      arr[endIndex] |= arr[startIndex];
      distinctBitwiseOrSet.add(arr[endIndex]);
    }
  }
  return distinctBitwiseOrSet.size;
}
