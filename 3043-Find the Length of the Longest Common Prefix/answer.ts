function longestCommonPrefix(arr1: number[], arr2: number[]): number {
  const arr1Length = arr1.length;
  const arr2Length = arr2.length;

  // Store every possible numeric prefix from arr1 in a Set for O(1) lookup
  const prefixSet = new Set<number>();
  // Track the maximum digit length in arr1 to cap prefix generation for arr2
  let maxPrefixLengthInArr1 = 0;

  for (let index = 0; index < arr1Length; index++) {
    let currentValue = arr1[index];
    let digitCount = 0;
    // Generate prefixes by repeatedly dropping the last digit via integer division
    while (currentValue > 0) {
      prefixSet.add(currentValue);
      currentValue = (currentValue / 10) | 0;
      digitCount++;
    }
    if (digitCount > maxPrefixLengthInArr1) {
      maxPrefixLengthInArr1 = digitCount;
    }
  }

  let longestMatchLength = 0;

  for (let index = 0; index < arr2Length; index++) {
    const value = arr2[index];
    // Compute digit count of the current value using math instead of string conversion
    let digitCount = 0;
    let temporary = value;
    while (temporary > 0) {
      digitCount++;
      temporary = (temporary / 10) | 0;
    }

    // No prefix of arr2[index] longer than maxPrefixLengthInArr1 can match anything in arr1
    let effectiveLength = digitCount;
    if (effectiveLength > maxPrefixLengthInArr1) {
      // Drop the excess trailing digits to align the prefix length with arr1's maximum
      const excess = effectiveLength - maxPrefixLengthInArr1;
      let divisor = 1;
      for (let step = 0; step < excess; step++) {
        divisor *= 10;
      }
      temporary = (value / divisor) | 0;
      effectiveLength = maxPrefixLengthInArr1;
    } else {
      temporary = value;
    }

    // Walk prefixes from longest to shortest, stopping at the current best length
    while (effectiveLength > longestMatchLength) {
      if (prefixSet.has(temporary)) {
        longestMatchLength = effectiveLength;
        // Found the longest possible match for this number; no need to check shorter ones
        break;
      }
      temporary = (temporary / 10) | 0;
      effectiveLength--;
    }

    // Early termination if we've reached the theoretical maximum
    if (longestMatchLength === maxPrefixLengthInArr1) {
      break;
    }
  }

  return longestMatchLength;
}
