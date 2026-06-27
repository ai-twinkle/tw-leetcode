function maximumLength(nums: number[]): number {
  // Count occurrences of each value using a Map (values up to 1e9, sparse).
  const frequency = new Map<number, number>();
  for (let index = 0; index < nums.length; index++) {
    const value = nums[index];
    frequency.set(value, (frequency.get(value) ?? 0) + 1);
  }

  let bestLength = 0;

  // The value 1 is a special case: chain is constant, only its parity matters.
  const onesCount = frequency.get(1) ?? 0;
  if (onesCount > 0) {
    // Keep an odd count so the palindrome has a valid single center.
    bestLength = onesCount % 2 === 1 ? onesCount : onesCount - 1;
  }

  // For each base x > 1, walk the chain x, x^2, x^4, ... while pairs exist.
  for (const [base, count] of frequency) {
    // Skip 1 (already handled) and any value that is itself a higher power
    // whose square root with count >= 2 exists, to avoid recomputation.
    if (base === 1) {
      continue;
    }
    if (count < 2) {
      // A length-1 chain (single element as center) is always achievable.
      if (bestLength < 1) {
        bestLength = 1;
      }
      continue;
    }

    // Start only from true chain roots: skip if sqrt(base) is a perfect
    // square present with count >= 2, since that longer chain covers this.
    const squareRoot = Math.round(Math.sqrt(base));
    if (squareRoot * squareRoot === base && (frequency.get(squareRoot) ?? 0) >= 2) {
      continue;
    }

    let chainLength = 0;
    let current = base;

    // Each value with count >= 2 contributes a symmetric pair (adds 2).
    while (true) {
      const currentCount = frequency.get(current) ?? 0;
      if (currentCount >= 2) {
        chainLength += 2;
        // Guard against overflow beyond the value range before squaring.
        const next = current * current;
        if (next > 1_000_000_000) {
          // The squared value can never appear, this pair is the apex.
          chainLength -= 1;
          break;
        }
        current = next;
      } else if (currentCount === 1) {
        // The single element acts as the palindrome center, then stop.
        chainLength += 1;
        break;
      } else {
        // No center available, drop the last unmatched pair slot.
        chainLength -= 1;
        break;
      }
    }

    if (chainLength > bestLength) {
      bestLength = chainLength;
    }
  }

  return bestLength;
}
