function longestBalanced(nums: number[]): number {
  const length = nums.length;
  if (length === 0) {
    return 0;
  }

  // Coordinate compression (avoid Map/Set work in the inner loop).
  const sorted = nums.slice();
  sorted.sort((a, b) => a - b);

  const unique: number[] = [];
  for (let index = 0; index < length; index++) {
    const value = sorted[index];
    if (index === 0 || value !== sorted[index - 1]) {
      unique.push(value);
    }
  }

  const uniqueCount = unique.length;

  const valueToId = new Map<number, number>();
  for (let id = 0; id < uniqueCount; id++) {
    valueToId.set(unique[id], id);
  }

  const ids = new Int16Array(length);
  for (let index = 0; index < length; index++) {
    // Non-null assertion is safe because every nums[index] is in `unique`.
    ids[index] = valueToId.get(nums[index])!;
  }

  // Store parity per compressed id: 0 = even, 1 = odd.
  const parityById = new Uint8Array(uniqueCount);
  for (let id = 0; id < uniqueCount; id++) {
    parityById[id] = (unique[id] & 1) as 0 | 1;
  }

  // Frequency of each value id in the current window [left..right].
  const frequencyById = new Int16Array(uniqueCount);

  let bestLength = 0;

  for (let left = 0; left < length; left++) {
    // Important step: reset counts for the new left boundary.
    frequencyById.fill(0);

    let distinctEven = 0;
    let distinctOdd = 0;

    for (let right = left; right < length; right++) {
      const id = ids[right];

      if (frequencyById[id] === 0) {
        if (parityById[id] === 0) {
          distinctEven++;
        } else {
          distinctOdd++;
        }
      }

      frequencyById[id]++;

      if (distinctEven === distinctOdd) {
        const windowLength = right - left + 1;
        if (windowLength > bestLength) {
          bestLength = windowLength;
        }
      }
    }
  }

  return bestLength;
}
