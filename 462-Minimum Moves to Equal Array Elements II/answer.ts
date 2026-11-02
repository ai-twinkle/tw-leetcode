function minMoves2(nums: number[]): number {
  const length = nums.length;

  // Copy into a typed array so the sort is native and numeric, with no comparator overhead
  const sortedValues = Int32Array.from(nums);
  sortedValues.sort();

  // Pair the smallest with the largest, moving inward; each pair adds (high - low)
  let totalMoves = 0;
  let leftIndex = 0;
  let rightIndex = length - 1;

  while (leftIndex < rightIndex) {
    totalMoves += sortedValues[rightIndex] - sortedValues[leftIndex];
    leftIndex++;
    rightIndex--;
  }

  return totalMoves;
}
