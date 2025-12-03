/**
 * Compute nC2 = n * (n - 1) / 2 for non-negative integers.
 *
 * @param value - Non-negative integer
 * @return Number of unordered pairs from value elements
 */
function combinationTwo(value: number): number {
  if (value < 2) {
    return 0;
  }
  return (value * (value - 1)) / 2;
}

/**
 * Compute the greatest common divisor of two non-negative integers.
 *
 * @param a - First non-negative integer
 * @param b - Second non-negative integer
 * @return Greatest common divisor of a and b
 */
function greatestCommonDivisor(a: number, b: number): number {
  while (b !== 0) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }
  return a;
}

/**
 * Count the number of unique trapezoids that can be formed from the given points.
 *
 * A trapezoid is a convex quadrilateral with at least one pair of parallel sides.
 *
 * @param points - List of 2D points, each as [x, y]
 * @return Number of trapezoids
 */
function countTrapezoids(points: number[][]): number {
  const pointCount = points.length;

  if (pointCount < 4) {
    return 0;
  }

  // Use typed arrays for faster coordinate access
  const xCoordinates = new Int16Array(pointCount);
  const yCoordinates = new Int16Array(pointCount);

  // Copy points into typed arrays
  for (let indexPoint = 0; indexPoint < pointCount; indexPoint++) {
    const point = points[indexPoint];
    xCoordinates[indexPoint] = point[0];
    yCoordinates[indexPoint] = point[1];
  }

  // Total number of segments in O(n²)
  const segmentCount = (pointCount * (pointCount - 1)) / 2;

  // Typed arrays for storing packed slope, line, and midpoint keys
  const slopeKeys = new Int32Array(segmentCount);
  const lineKeys = new Int32Array(segmentCount);
  const midKeys = new Int32Array(segmentCount);

  // Constants for packing keys into a single 32-bit integer
  const slopeShift = 2048;
  const midpointShift = 2048;
  const midpointBase = 4096;
  const lineConstantBase = 11000000;
  const lineOffsetShift = 5000000;

  let segmentIndex = 0;

  // Generate all segments and compute packed keys
  for (let indexFirst = 0; indexFirst < pointCount; indexFirst++) {
    const xFirst = xCoordinates[indexFirst];
    const yFirst = yCoordinates[indexFirst];

    for (let indexSecond = indexFirst + 1; indexSecond < pointCount; indexSecond++) {
      const xSecond = xCoordinates[indexSecond];
      const ySecond = yCoordinates[indexSecond];

      const deltaX = xSecond - xFirst;
      const deltaY = ySecond - yFirst;

      let dxNormalized;
      let dyNormalized;

      // Normalize directions to guarantee identical representation for equal slopes
      if (deltaX === 0) {
        dxNormalized = 0;
        dyNormalized = 1; // vertical line canonical direction
      } else if (deltaY === 0) {
        dxNormalized = 1;
        dyNormalized = 0; // horizontal line canonical direction
      } else {
        // Normalize (dx, dy) so dx > 0 for uniqueness
        let sign = 1;
        if (deltaX < 0) {
          sign = -1;
        }

        const dxAbsolute = deltaX * sign;
        const dySigned = deltaY * sign;
        const gcdValue = greatestCommonDivisor(dxAbsolute, Math.abs(dySigned));

        dxNormalized = dxAbsolute / gcdValue;
        dyNormalized = dySigned / gcdValue;
      }

      // Pack normalized slope into an integer key
      const packedSlopeKey =
        ((dyNormalized + slopeShift) << 12) | (dxNormalized + slopeShift);

      // Compute invariant line constant for line grouping
      const lineConstant = dxNormalized * yFirst - dyNormalized * xFirst;

      // Pack slope + line constant into a unique line key
      const packedLineKey =
        packedSlopeKey * lineConstantBase + (lineConstant + lineOffsetShift);

      // Pack midpoint (x1 + x2, y1 + y2)
      const sumX = xFirst + xSecond;
      const sumY = yFirst + ySecond;

      const packedMidKey =
        (sumX + midpointShift) * midpointBase + (sumY + midpointShift);

      // Store segment keys
      slopeKeys[segmentIndex] = packedSlopeKey;
      lineKeys[segmentIndex] = packedLineKey;
      midKeys[segmentIndex] = packedMidKey;

      segmentIndex++;
    }
  }

  // Arrays of indices for sorting without moving typed data
  const indicesBySlope = new Array(segmentIndex);
  const indicesByMid = new Array(segmentIndex);

  for (let index = 0; index < segmentIndex; index++) {
    indicesBySlope[index] = index;
    indicesByMid[index] = index;
  }

  // Sort by (slopeKey → lineKey): groups segments by slope then line
  indicesBySlope.sort((firstIndex, secondIndex) => {
    const slopeDifference = slopeKeys[firstIndex] - slopeKeys[secondIndex];
    if (slopeDifference !== 0) {
      return slopeDifference;
    }
    return lineKeys[firstIndex] - lineKeys[secondIndex];
  });

  // Sort by (midKey → slopeKey): groups segments by midpoint then slope
  indicesByMid.sort((firstIndex, secondIndex) => {
    const midDifference = midKeys[firstIndex] - midKeys[secondIndex];
    if (midDifference !== 0) {
      return midDifference;
    }
    return slopeKeys[firstIndex] - slopeKeys[secondIndex];
  });

  let trapezoidCount = 0;
  /**
   * Step 1: Count parallel-segment pairs forming trapezoid bases
   *
   * For each slope group:
   *   - Total pairs: C(S, 2)
   *   - Subtract same-line pairs: sum(C(ci, 2))
   *   - Add the difference
   */
  let position = 0;

  while (position < segmentIndex) {
    const currentSlopeKey = slopeKeys[indicesBySlope[position]];

    let segmentTotalForSlope = 0;
    let sameLinePairsForSlope = 0;

    let positionWithinSlope = position;

    // Iterate through all segments with the same slope
    while (
      positionWithinSlope < segmentIndex &&
      slopeKeys[indicesBySlope[positionWithinSlope]] === currentSlopeKey
      ) {
      const currentLineKey = lineKeys[indicesBySlope[positionWithinSlope]];
      let segmentCountForLine = 0;

      // Count segments on the same line
      do {
        segmentCountForLine++;
        positionWithinSlope++;
      } while (
        positionWithinSlope < segmentIndex &&
        slopeKeys[indicesBySlope[positionWithinSlope]] === currentSlopeKey &&
        lineKeys[indicesBySlope[positionWithinSlope]] === currentLineKey
        );

      // Add C(ci, 2) for same-line pairs
      sameLinePairsForSlope += combinationTwo(segmentCountForLine);
      segmentTotalForSlope += segmentCountForLine;
    }

    // Add valid trapezoid base pairs for this slope
    if (segmentTotalForSlope >= 2) {
      const totalPairsAll = combinationTwo(segmentTotalForSlope);
      trapezoidCount += totalPairsAll - sameLinePairsForSlope;
    }

    position = positionWithinSlope;
  }

  /**
   * Step 2: Subtract parallelograms (overcounted cases)
   *
   * Parallelograms appear as pairs of segments with:
   *  - Same midpoint
   *  - Different slopes
   *  They were counted twice above, so subtract them once.
   */
  position = 0;

  while (position < segmentIndex) {
    const currentMidKey = midKeys[indicesByMid[position]];

    let segmentTotalForMid = 0;
    let sameSlopePairsForMid = 0;

    let positionWithinMid = position;

    // Iterate through all segments sharing the same midpoint
    while (
      positionWithinMid < segmentIndex &&
      midKeys[indicesByMid[positionWithinMid]] === currentMidKey
      ) {
      const currentSlopeKey = slopeKeys[indicesByMid[positionWithinMid]];
      let segmentCountForSlope = 0;

      // Count segments having same slope at this midpoint
      do {
        segmentCountForSlope++;
        positionWithinMid++;
      } while (
        positionWithinMid < segmentIndex &&
        midKeys[indicesByMid[positionWithinMid]] === currentMidKey &&
        slopeKeys[indicesByMid[positionWithinMid]] === currentSlopeKey
        );

      // Add C(di, 2) for same-slope pairs
      sameSlopePairsForMid += combinationTwo(segmentCountForSlope);
      segmentTotalForMid += segmentCountForSlope;
    }

    // Subtract parallelogram contributions
    if (segmentTotalForMid >= 2) {
      const totalPairsAll = combinationTwo(segmentTotalForMid);
      trapezoidCount -= totalPairsAll - sameSlopePairsForMid;
    }

    position = positionWithinMid;
  }

  return trapezoidCount;
}
