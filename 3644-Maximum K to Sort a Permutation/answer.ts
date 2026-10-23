function sortPermutation(nums: number[]): number {
  const length = nums.length;

  // -1 is the all-ones identity for the running bitwise AND
  let misplacedAnd = -1;

  for (let index = 0; index < length; index++) {
    const value = nums[index];

    // Values already at their sorted position never need to be swapped
    if (value === index) {
      continue;
    }

    misplacedAnd &= value;

    // 0 is the floor of the answer, so no remaining value can change it
    if (misplacedAnd === 0) {
      return 0;
    }
  }

  // The identity survived untouched, meaning nothing was misplaced
  if (misplacedAnd === -1) {
    return 0;
  }

  return misplacedAnd;
}
