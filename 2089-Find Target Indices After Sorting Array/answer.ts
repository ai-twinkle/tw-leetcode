function targetIndices(nums: number[], target: number): number[] {
  let countLess = 0;
  let countEqual = 0;

  // Single pass: branchless-friendly tally of strictly-smaller and equal elements
  for (let index = 0, length = nums.length; index < length; index++) {
    const value = nums[index];

    if (value < target) {
      countLess++;
    } else if (value === target) {
      countEqual++;
    }
  }

  // Target absent, so no sorted position can hold it
  if (countEqual === 0) {
    return [];
  }

  // Allocate the exact result length once, then fill the contiguous index block
  const targetIndexList: number[] = new Array(countEqual);

  for (let offset = 0; offset < countEqual; offset++) {
    targetIndexList[offset] = countLess + offset;
  }

  return targetIndexList;
}
