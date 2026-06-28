function maximumElementAfterDecrementingAndRearranging(arr: number[]): number {
  const length = arr.length;

  // The answer is bounded by length. Clamp each value to length and bucket it.
  const counts = new Uint32Array(length + 1);

  for (let index = 0; index < length; index++) {
    const value = arr[index];

    // A value can always be decremented, so clamp it down to length.
    const clamped = value < length ? value : length;
    counts[clamped]++;
  }

  // Walk values ascending; each element lets the frontier climb by at most one.
  let result = 0;

  for (let value = 1; value <= length; value++) {
    // Consume every element bucketed at this level; each can lift the frontier by one.
    for (let occurrence = 0; occurrence < counts[value]; occurrence++) {
      if (result < value) {
        result = result + 1;
      }
    }
  }

  return result;
}
