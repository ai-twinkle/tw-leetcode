function numberOfPairs(points: number[][]): number {
  const totalPoints = points.length;

  // Sort by x ascending, then y descending (ties on x)
  points.sort((p, q) => (p[0] !== q[0] ? p[0] - q[0] : q[1] - p[1]));

  let pairCount = 0;

  for (let i = 0; i < totalPoints; i++) {
    const pointA = points[i];

    for (let j = i + 1; j < totalPoints; j++) {
      const pointB = points[j];

      // A must be upper-left of B
      if (pointA[0] > pointB[0] || pointA[1] < pointB[1]) {
        continue;
      }

      let rectangleIsEmpty = true;

      // No other point may lie inside/on the A..B rectangle (inclusive)
      for (let k = i + 1; k < j; k++) {
        const pointC = points[k];
        if (
          pointA[0] <= pointC[0] && pointC[0] <= pointB[0] &&
          pointA[1] >= pointC[1] && pointC[1] >= pointB[1]
        ) {
          rectangleIsEmpty = false;
          break;
        }
      }

      if (rectangleIsEmpty) {
        pairCount++;
      }
    }
  }

  return pairCount;
}
