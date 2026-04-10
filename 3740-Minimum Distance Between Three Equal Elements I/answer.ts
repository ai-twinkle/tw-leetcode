function minimumDistance(nums: number[]): number {
  const length = nums.length;

  // Group indices by value; values are in [1, n] so use a flat array of arrays
  const indexGroups: number[][] = new Array(length + 1);

  // Single pass: append each position to its value's index list
  for (let position = 0; position < length; position++) {
    const value = nums[position];

    if (indexGroups[value] === undefined) {
      indexGroups[value] = [];
    }

    indexGroups[value].push(position);
  }

  let minimumDist = -1;

  // For each value with at least 3 occurrences, slide a 3-element window
  for (let value = 1; value <= length; value++) {
    const indices = indexGroups[value];

    if (indices === undefined || indices.length < 3) {
      continue;
    }

    const groupSize = indices.length;

    // Each consecutive triple (t, t+1, t+2) yields distance 2*(indices[t+2] - indices[t])
    for (let windowStart = 0; windowStart + 2 < groupSize; windowStart++) {
      const distance = 2 * (indices[windowStart + 2] - indices[windowStart]);

      if (minimumDist === -1 || distance < minimumDist) {
        minimumDist = distance;
      }
    }
  }

  return minimumDist;
}
