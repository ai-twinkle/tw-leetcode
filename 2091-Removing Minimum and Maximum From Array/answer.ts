function minimumDeletions(nums: number[]): number {
  const length = nums.length;

  // With one element, that element is both the minimum and the maximum.
  if (length === 1) {
    return 1;
  }

  let minimumValue = nums[0];
  let maximumValue = nums[0];
  let minimumIndex = 0;
  let maximumIndex = 0;

  // Single pass: read each element once into a local, then compare at most twice.
  for (let index = 1; index < length; index++) {
    const currentValue = nums[index];

    // A new minimum can never be a new maximum, so skip the second compare.
    if (currentValue < minimumValue) {
      minimumValue = currentValue;
      minimumIndex = index;
      continue;
    }

    if (currentValue > maximumValue) {
      maximumValue = currentValue;
      maximumIndex = index;
    }
  }

  let leftIndex = minimumIndex;
  let rightIndex = maximumIndex;

  // Normalize so leftIndex is the earlier target and rightIndex the later one.
  if (leftIndex > rightIndex) {
    const temporaryIndex = leftIndex;
    leftIndex = rightIndex;
    rightIndex = temporaryIndex;
  }

  // Case 1: delete from the front through the later target.
  let bestDeletionCount = rightIndex + 1;

  // Case 2: delete from the back through the earlier target.
  const deleteBothFromBack = length - leftIndex;

  if (deleteBothFromBack < bestDeletionCount) {
    bestDeletionCount = deleteBothFromBack;
  }

  // Case 3: take the earlier target off the front and the later one off the back.
  const deleteFromBothEnds = leftIndex + 1 + (length - rightIndex);

  if (deleteFromBothEnds < bestDeletionCount) {
    bestDeletionCount = deleteFromBothEnds;
  }

  return bestDeletionCount;
}
