function uniqueXorTriplets(nums: number[]): number {
  const length = nums.length;
  const LIMIT = 2048;

  // Mathematical shortcut: with n >= LIMIT distinct-capable values the triplet
  // space provably saturates the whole 11-bit range.
  if (length >= LIMIT) {
    return LIMIT;
  }

  // Bitset over [0, 2048) marking which single values are present.
  const singlePresent = new Uint8Array(LIMIT);
  for (let index = 0; index < length; index++) {
    singlePresent[nums[index]] = 1;
  }

  // Compact the distinct single values for tight inner loops.
  const singleValues = new Uint16Array(LIMIT);
  let singleCount = 0;
  for (let value = 0; value < LIMIT; value++) {
    if (singlePresent[value] === 1) {
      singleValues[singleCount++] = value;
    }
  }

  // All pair XORs, including the i == j case which yields 0.
  const pairPresent = new Uint8Array(LIMIT);
  pairPresent[0] = 1;
  for (let firstIndex = 0; firstIndex < singleCount; firstIndex++) {
    const firstValue = singleValues[firstIndex];
    for (let secondIndex = firstIndex + 1; secondIndex < singleCount; secondIndex++) {
      pairPresent[firstValue ^ singleValues[secondIndex]] = 1;
    }
  }

  // Compact distinct pair XOR values.
  const pairValues = new Uint16Array(LIMIT);
  let pairCount = 0;
  for (let value = 0; value < LIMIT; value++) {
    if (pairPresent[value] === 1) {
      pairValues[pairCount++] = value;
    }
  }

  // Combine every distinct pair XOR with every distinct single value.
  const tripletPresent = new Uint8Array(LIMIT);
  let tripletCount = 0;
  for (let pairIndex = 0; pairIndex < pairCount; pairIndex++) {
    const pairValue = pairValues[pairIndex];
    for (let singleIndex = 0; singleIndex < singleCount; singleIndex++) {
      const result = pairValue ^ singleValues[singleIndex];
      if (tripletPresent[result] === 0) {
        tripletPresent[result] = 1;
        tripletCount++;

        // Early exit once the full 11-bit space is covered.
        if (tripletCount === LIMIT) {
          return LIMIT;
        }
      }
    }
  }

  return tripletCount;
}
