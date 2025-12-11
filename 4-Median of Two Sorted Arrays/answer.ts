function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
  // Ensure firstArray is always the shorter array for fewer binary search steps
  let firstArray = nums1;
  let secondArray = nums2;

  let lengthFirstArray = firstArray.length;
  let lengthSecondArray = secondArray.length;

  if (lengthFirstArray > lengthSecondArray) {
    const temporaryArray = firstArray;
    firstArray = secondArray;
    secondArray = temporaryArray;

    const temporaryLength = lengthFirstArray;
    lengthFirstArray = lengthSecondArray;
    lengthSecondArray = temporaryLength;
  }

  const totalLength = lengthFirstArray + lengthSecondArray;
  const halfLength = (totalLength + 1) >> 1; // Number of elements on the left side

  // Sentinel values: avoid Infinity for slightly faster comparisons
  const minimumSentinel = -1_000_001;
  const maximumSentinel = 1_000_001;

  let lowIndex = 0;
  let highIndex = lengthFirstArray;

  // Binary search to find the correct partition
  while (lowIndex <= highIndex) {
    const partitionFirstArray = (lowIndex + highIndex) >> 1;
    const partitionSecondArray = halfLength - partitionFirstArray;

    // Compute boundary values for both arrays
    const leftMaxFirstArray = partitionFirstArray > 0
      ? firstArray[partitionFirstArray - 1]
      : minimumSentinel;

    const rightMinFirstArray = partitionFirstArray < lengthFirstArray
      ? firstArray[partitionFirstArray]
      : maximumSentinel;

    const leftMaxSecondArray = partitionSecondArray > 0
      ? secondArray[partitionSecondArray - 1]
      : minimumSentinel;

    const rightMinSecondArray = partitionSecondArray < lengthSecondArray
      ? secondArray[partitionSecondArray]
      : maximumSentinel;

    // Check if we've found a valid partition
    if (leftMaxFirstArray <= rightMinSecondArray && leftMaxSecondArray <= rightMinFirstArray) {
      // Even total length → median is average of the two center values
      if ((totalLength & 1) === 0) {
        const leftMax = leftMaxFirstArray > leftMaxSecondArray ? leftMaxFirstArray : leftMaxSecondArray;
        const rightMin = rightMinFirstArray < rightMinSecondArray ? rightMinFirstArray : rightMinSecondArray;
        return (leftMax + rightMin) * 0.5;
      }

      // Odd total length → median is the max of left side
      return leftMaxFirstArray > leftMaxSecondArray ? leftMaxFirstArray : leftMaxSecondArray;
    }

    // Move search range left if first array's left side is too large
    if (leftMaxFirstArray > rightMinSecondArray) {
      highIndex = partitionFirstArray - 1;
    }
    // Otherwise move right
    else {
      lowIndex = partitionFirstArray + 1;
    }
  }

  // Should never reach here for valid inputs
  return 0;
}
