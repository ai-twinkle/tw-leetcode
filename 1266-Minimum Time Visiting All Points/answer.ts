function minTimeToVisitAllPoints(points: number[][]): number {
  const pointsLength = points.length;
  if (pointsLength <= 1) {
    return 0;
  }

  let totalTime = 0;

  // Track previous coordinates to avoid repeated nested array lookups.
  let previousPoint = points[0];
  let previousX = previousPoint[0];
  let previousY = previousPoint[1];

  for (let index = 1; index < pointsLength; index++) {
    const currentPoint = points[index];
    const currentX = currentPoint[0];
    const currentY = currentPoint[1];

    let deltaX = currentX - previousX;
    if (deltaX < 0) {
      deltaX = -deltaX;
    }

    let deltaY = currentY - previousY;
    if (deltaY < 0) {
      deltaY = -deltaY;
    }

    // Each second can cover 1 diagonal move (reducing both deltas), so time is max(deltaX, deltaY).
    if (deltaX >= deltaY) {
      totalTime += deltaX;
    } else {
      totalTime += deltaY;
    }

    previousX = currentX;
    previousY = currentY;
  }

  return totalTime;
}
