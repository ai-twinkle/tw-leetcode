function minOperations(s: string): number {
  const length: number = s.length;

  // Count mismatches if we expect pattern "0101..." (even index -> '0', odd index -> '1')
  let mismatchCountPatternZeroFirst = 0;

  for (let index = 0; index < length; index++) {
    // Compute expected bit via index parity (avoids extra allocations)
    const expectedCharCode = ((index & 1) === 0) ? 48 : 49; // '0' : '1'
    if (s.charCodeAt(index) !== expectedCharCode) {
      mismatchCountPatternZeroFirst++;
    }
  }

  // For a fixed length, the opposite pattern "1010..." mismatches exactly where "0101..." matches, so its mismatch count is `length - mismatchCountPatternZeroFirst`.
  const mismatchCountPatternOneFirst = length - mismatchCountPatternZeroFirst;
  return mismatchCountPatternZeroFirst < mismatchCountPatternOneFirst
    ? mismatchCountPatternZeroFirst
    : mismatchCountPatternOneFirst;
}
