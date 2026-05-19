function getCommon(nums1: number[], nums2: number[]): number {
  // Cache lengths in local variables to avoid repeated property lookups in the loop
  const length1 = nums1.length;
  const length2 = nums2.length;

  // Early termination: if ranges do not overlap, no common element can exist
  if (nums1[0] > nums2[length2 - 1] || nums2[0] > nums1[length1 - 1]) {
    return -1;
  }

  // Two pointers advancing through both arrays simultaneously
  let pointer1 = 0;
  let pointer2 = 0;

  while (pointer1 < length1 && pointer2 < length2) {
    const value1 = nums1[pointer1];
    const value2 = nums2[pointer2];

    // Found a match: since both arrays are sorted ascending, this is the minimum common value
    if (value1 === value2) {
      return value1;
    }

    // Advance the pointer pointing to the smaller value to catch up
    if (value1 < value2) {
      pointer1++;
    } else {
      pointer2++;
    }
  }

  // No common integer found after exhausting one of the arrays
  return -1;
}
