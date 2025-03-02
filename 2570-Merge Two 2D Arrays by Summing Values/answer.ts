function mergeArrays(nums1: number[][], nums2: number[][]): number[][] {
  let i = 0;     // Pointer for nums1.
  let j = 0;     // Pointer for nums2.
  let index = 0; // Pointer for the result array.

  // Initialize the result array with the maximum possible length.
  const result = new Array(nums1.length + nums2.length);

  // Merge until one array is exhausted.
  while (i < nums1.length && j < nums2.length) {
    if (nums1[i][0] < nums2[j][0]) {
      // When the id of nums1 is smaller, add it to the result.
      result[index] = nums1[i];
      index++;
      i++;
      continue;
    }

    if (nums1[i][0] > nums2[j][0]) {
      // When the id of nums2 is smaller, add it to the result.
      result[index] = nums2[j];
      index++;
      j++;
      continue;
    }

    // When the ids are equal, add the sum of the values to the result.
    result[index] = [nums1[i][0], nums1[i][1] + nums2[j][1]];
    index++;
    i++;
    j++;
  }

  // Append any remaining elements.
  while (i < nums1.length) {
    result[index] = nums1[i];
    index++;
    i++;
  }
  while (j < nums2.length) {
    result[index] = nums2[j];
    index++;
    j++;
  }

  // Trim the array to the actual length.
  result.length = index;
  return result;
}
