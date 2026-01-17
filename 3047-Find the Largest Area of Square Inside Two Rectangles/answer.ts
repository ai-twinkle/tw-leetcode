function largestSquareArea(bottomLeft: number[][], topRight: number[][]): number {
  const rectangleCount = bottomLeft.length;

  // Pack all coordinates into one typed array to reduce per-array overhead and improve cache locality.
  const packed = new Int32Array(rectangleCount << 2);

  for (let index = 0; index < rectangleCount; index++) {
    const bottomLeftPoint = bottomLeft[index];
    const topRightPoint = topRight[index];
    const base = index << 2;
    packed[base] = bottomLeftPoint[0]; // leftX
    packed[base + 1] = bottomLeftPoint[1]; // bottomY
    packed[base + 2] = topRightPoint[0]; // rightX
    packed[base + 3] = topRightPoint[1]; // topY
  }

  let bestSideLength = 0;

  for (let first = 0; first < rectangleCount; first++) {
    const firstBase = first << 2;
    const firstLeftX = packed[firstBase];
    const firstBottomY = packed[firstBase + 1];
    const firstRightX = packed[firstBase + 2];
    const firstTopY = packed[firstBase + 3];

    for (let second = first + 1; second < rectangleCount; second++) {
      const secondBase = second << 2;

      const secondLeftX = packed[secondBase];
      const secondRightX = packed[secondBase + 2];

      // Compute overlap width first; if it cannot exceed bestSideLength, skip height work.
      const overlapWidth =
        (firstRightX <= secondRightX ? firstRightX : secondRightX) -
        (firstLeftX >= secondLeftX ? firstLeftX : secondLeftX);

      if (overlapWidth <= bestSideLength) {
        continue;
      }

      const secondBottomY = packed[secondBase + 1];
      const secondTopY = packed[secondBase + 3];

      const overlapHeight =
        (firstTopY <= secondTopY ? firstTopY : secondTopY) -
        (firstBottomY >= secondBottomY ? firstBottomY : secondBottomY);

      if (overlapHeight <= bestSideLength) {
        continue;
      }

      // Candidate side is bounded by the smaller overlap dimension.
      const candidateSideLength = overlapWidth <= overlapHeight ? overlapWidth : overlapHeight;
      if (candidateSideLength > bestSideLength) {
        bestSideLength = candidateSideLength;
      }
    }
  }

  return bestSideLength * bestSideLength;
}
