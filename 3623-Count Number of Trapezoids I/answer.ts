function countTrapezoids(points: number[][]): number {
  // Using BigInt to ensure large-number arithmetic works safely
  const modulus = 1000000007n;
  const modularInverseTwo = 500000004n; // Precomputed inverse of 2 under modulo

  // Count how many points exist on each horizontal line (same y value)
  const coordinateYToCountMap = new Map<number, number>();
  const numberOfPoints = points.length;

  for (let index = 0; index < numberOfPoints; index += 1) {
    const coordinateY = points[index][1];
    const existingCount = coordinateYToCountMap.get(coordinateY) ?? 0;
    coordinateYToCountMap.set(coordinateY, existingCount + 1);
  }

  // These store:
  // 1. How many horizontal segments exist across all y-lines
  // 2. And also their squared counts (for efficient pairing later)
  let sumOfSegmentsModulo = 0n;
  let sumOfSegmentSquaresModulo = 0n;

  // For each horizontal line, compute how many pairs of points it has.
  // Each pair forms one horizontal segment.
  for (const countOfPointsOnLine of coordinateYToCountMap.values()) {
    if (countOfPointsOnLine >= 2) {
      const countBig = BigInt(countOfPointsOnLine);

      // Number of horizontal segments on this line
      const numberOfSegments = (countBig * (countBig - 1n)) / 2n;

      const numberOfSegmentsModulo = numberOfSegments % modulus;

      // Add segment count to the total list
      sumOfSegmentsModulo =
        (sumOfSegmentsModulo + numberOfSegmentsModulo) % modulus;

      // Add squared count (used later to avoid nested loops)
      sumOfSegmentSquaresModulo =
        (sumOfSegmentSquaresModulo +
          (numberOfSegmentsModulo * numberOfSegmentsModulo) % modulus) %
        modulus;
    }
  }

  // We want to find how many ways we can pick two different horizontal lines
  // and take one segment from each. Squaring the total then subtracting the
  // self-combinations handles this in constant time.
  const sumOfSegmentsSquaredModulo =
    (sumOfSegmentsModulo * sumOfSegmentsModulo) % modulus;

  // Remove "same line" combinations so only cross-line combinations remain
  let result =
    (sumOfSegmentsSquaredModulo -
      sumOfSegmentSquaresModulo +
      modulus) % modulus;

  // Divide by 2 using modular inverse (avoids floating point issues)
  result = (result * modularInverseTwo) % modulus;

  // Return final number as a normal JS number (safe since < 1e9+7)
  return Number(result);
}
