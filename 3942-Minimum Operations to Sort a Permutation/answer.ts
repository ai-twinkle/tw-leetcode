function minOperations(nums: number[]): number {
  const length = nums.length;

  // A single element is sorted by definition.
  if (length === 1) {
    return 0;
  }

  // Count descents in one pass; every adjacent pair is either a descent or an
  // ascent, so this single count characterises both candidate layouts.
  let descents = 0;
  let previous = nums[0];

  for (let index = 1; index < length; index++) {
    const current = nums[index];

    if (current < previous) {
      descents++;
    }

    previous = current;
  }

  const first = nums[0];

  // A permutation is a rotation of 0..n-1 exactly when it has one cyclic descent.
  const cyclicDescents = descents + (first < previous ? 1 : 0);

  if (cyclicDescents === 1) {
    if (first === 0) {
      return 0;
    }

    // Rotate left, or reverse, rotate the short way, and reverse back.
    const forward = length - first;
    const backward = first + 2;

    return forward < backward ? forward : backward;
  }

  // One cyclic ascent means it is a rotation of the reversed sorted order.
  const cyclicAscents = length - 1 - descents + (first > previous ? 1 : 0);

  if (cyclicAscents === 1) {
    // One reverse is mandatory; rotate on whichever side of it is shorter.
    const rotations = length - 1 - first;
    const mirrored = rotations === 0 ? 0 : length - rotations;

    return 1 + (rotations < mirrored ? rotations : mirrored);
  }

  return -1;
}
