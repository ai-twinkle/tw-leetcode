function isRectangleOverlap(rec1: number[], rec2: number[]): boolean {
  // Coordinates are bounded by 1e9, so every gap stays inside [-2e9, 2e9],
  // which is safely below the 2147483647 limit of signed 32-bit arithmetic.
  const leftGap = rec1[0] - rec2[2];
  const rightGap = rec2[0] - rec1[2];
  const bottomGap = rec1[1] - rec2[3];
  const topGap = rec2[1] - rec1[3];

  // An overlap exists only when all four gaps are strictly negative.
  // The bitwise AND preserves the sign bit exclusively in that case,
  // so four short-circuit branches collapse into one branchless comparison.
  return (leftGap & rightGap & bottomGap & topGap) < 0;
}
