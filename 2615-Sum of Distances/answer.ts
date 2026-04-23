function distance(nums: number[]): number[] {
  const length = nums.length;

  // Use typed arrays for better performance on large inputs
  const sortedIndices = new Int32Array(length);
  for (let i = 0; i < length; i++) {
    sortedIndices[i] = i;
  }

  // Sort indices by their corresponding value in nums for contiguous grouping
  sortedIndices.sort((a, b) => nums[a] - nums[b]);

  const result = new Float64Array(length);

  let groupStart = 0;
  while (groupStart < length) {
    // Find the end of the current group of equal values
    const groupValue = nums[sortedIndices[groupStart]];
    let groupEnd = groupStart + 1;
    while (groupEnd < length && nums[sortedIndices[groupEnd]] === groupValue) {
      groupEnd++;
    }

    const groupSize = groupEnd - groupStart;

    if (groupSize > 1) {
      // Compute total sum of indices in this group
      let totalSum = 0;
      for (let i = groupStart; i < groupEnd; i++) {
        totalSum += sortedIndices[i];
      }

      // Use prefix sum approach to compute each element's distance sum in O(1)
      let prefixSum = 0;
      for (let i = groupStart; i < groupEnd; i++) {
        const currentIndex = sortedIndices[i];
        const positionInGroup = i - groupStart;
        // Elements before contribute: positionInGroup * currentIndex - prefixSum
        // Elements after contribute: (totalSum - prefixSum) - (groupSize - positionInGroup) * currentIndex
        result[currentIndex] = totalSum - prefixSum * 2 + currentIndex * (2 * positionInGroup - groupSize);
        prefixSum += currentIndex;
      }
    }

    groupStart = groupEnd;
  }

  // Convert Float64Array back to number array
  return Array.from(result);
}
