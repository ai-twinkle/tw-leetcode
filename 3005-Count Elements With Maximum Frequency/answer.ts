function maxFrequencyElements(nums: number[]): number {
  // Fixed-size histogram (index 0 unused). Zero-initialized by TypedArray spec.
  const frequencyTable = new Uint8Array(101);

  // Track the current maximum frequency and the sum of all frequencies at that maximum.
  let maximumFrequency = 0;
  let sumAtMaximum = 0;

  // Cache length locally to avoid repeated property lookups.
  const length = nums.length;

  // Single pass over input; tight loop with minimal branching and typed array ops.
  for (let index = 0; index < length; index += 1) {
    const value = nums[index]; // Per constraints, 1 <= value <= 100.

    // Increment the frequency for this value.
    const nextFrequency = frequencyTable[value] + 1;
    frequencyTable[value] = nextFrequency;

    // Update running maximum and the aggregated sum at maximum.
    if (nextFrequency > maximumFrequency) {
      // New higher maximum: this value is the only one at the new maximum.
      maximumFrequency = nextFrequency;
      sumAtMaximum = nextFrequency; // reset to the new maximum
    } else if (nextFrequency === maximumFrequency) {
      // Another value has tied the maximum; add that maximum to the sum.
      // This equals: sumAtMaximum += maximumFrequency.
      sumAtMaximum += maximumFrequency;
    }
    // If nextFrequency < maximumFrequency, nothing to do for sumAtMaximum.
  }

  // The running sum directly equals "max * numberOfValuesAtMax".
  return sumAtMaximum;
}
