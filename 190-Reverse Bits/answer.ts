function reverseBits(n: number): number {
  let unsignedValue = n >>> 0;
  let result = 0;

  // Tight fixed-iteration loop with unsigned shifts.
  for (let remaining = 32; remaining > 0; remaining--) {
    result = (result << 1) | (unsignedValue & 1);
    unsignedValue >>>= 1;
  }

  return result >>> 0;
}
