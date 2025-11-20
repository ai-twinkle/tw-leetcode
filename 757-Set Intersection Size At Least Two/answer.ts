function intersectionSizeTwo(intervals: number[][]): number {
  const intervalsLength = intervals.length;

  // Sort by end ascending; if end is the same, sort by start descending
  intervals.sort((firstInterval, secondInterval) => {
    const firstEnd = firstInterval[1];
    const secondEnd = secondInterval[1];

    if (firstEnd === secondEnd) {
      // For same end, place the interval with larger start first
      return secondInterval[0] - firstInterval[0];
    }

    return firstEnd - secondEnd;
  });

  let minimumContainingSetSize = 0;

  // lastPoint: largest selected point so far
  // secondLastPoint: second largest selected point so far
  let lastPoint = -1;
  let secondLastPoint = -1;

  for (let index = 0; index < intervalsLength; index += 1) {
    const currentInterval = intervals[index];
    const intervalStart = currentInterval[0];
    const intervalEnd = currentInterval[1];

    if (intervalStart > lastPoint) {
      // No selected point falls inside this interval; need two new points.
      // Choose them as far to the right as possible (end - 1 and end)
      // to maximize coverage of upcoming intervals.
      secondLastPoint = intervalEnd - 1;
      lastPoint = intervalEnd;
      minimumContainingSetSize += 2;
    } else if (intervalStart > secondLastPoint) {
      // Exactly one selected point is inside this interval (lastPoint).
      // Add one more point at the rightmost position (end).
      secondLastPoint = lastPoint;
      lastPoint = intervalEnd;
      minimumContainingSetSize += 1;
    }
    // Else: interval already contains both secondLastPoint and lastPoint,
    // so it is already satisfied; no action required.
  }

  return minimumContainingSetSize;
}
