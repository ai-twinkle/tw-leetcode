// Pre-allocated reusable typed-array buffers to avoid per-call heap allocation
const nextPointIndex = new Uint16Array(15000);
const visitedFlag = new Uint8Array(15000);

/**
 * Checks how many points can be greedily selected with at least `minDistance`
 * perimeter distance apart, treating the boundary as a circular path.
 * Builds a next-pointer graph via two-pointer, then counts the cycle length.
 * @param sortedPositions - sorted linearized perimeter coordinates
 * @param fullPerimeter - total perimeter length (side * 4)
 * @param minDistance - minimum distance required between consecutive selected points
 * @returns number of points in the greedy selection cycle
 */
function solve(sortedPositions: Int32Array, fullPerimeter: number, minDistance: number): number {
  const pointCount = sortedPositions.length;

  // Build next-pointer using two-pointer (amortized O(n) total)
  let scanIndex = 0;
  let scanValue = sortedPositions[0];
  let wrapCount = 0;

  for (let originIndex = 0; originIndex < pointCount; originIndex++) {
    const target = sortedPositions[originIndex] + minDistance;
    // Advance scan pointer until we find a point at least minDistance away
    while (scanValue < target) {
      scanIndex++;
      if (scanIndex === pointCount) {
        scanIndex = 0;
        wrapCount++;
      }
      scanValue = sortedPositions[scanIndex] + wrapCount * fullPerimeter;
      if (wrapCount > 1) {
        break;
      }
    }
    nextPointIndex[originIndex] = scanIndex;
  }

  // Find any node on the functional graph's cycle via visited marking
  visitedFlag.fill(0, 0, pointCount);
  let cycleEntryNode = 0;
  while (visitedFlag[cycleEntryNode] === 0) {
    visitedFlag[cycleEntryNode] = 1;
    cycleEntryNode = nextPointIndex[cycleEntryNode];
  }

  // Count the number of nodes in the cycle
  let wrapDetector = 0;
  let cycleNodeCount = -1;
  for (let currentNode = cycleEntryNode; wrapDetector === 0 || currentNode <= cycleEntryNode; currentNode = nextPointIndex[currentNode]) {
    cycleNodeCount++;
    // A backward or self-referencing pointer signals a perimeter wrap
    if (nextPointIndex[currentNode] <= currentNode) {
      wrapDetector++;
    }
    if (wrapDetector > 1) {
      break;
    }
  }

  return cycleNodeCount;
}

/**
 * Finds the maximum possible minimum Manhattan distance when selecting k points
 * from boundary points of a square.
 * Binary searches on the answer, using greedy cycle counting for feasibility.
 * @param side - edge length of the square
 * @param points - 2D array of boundary point coordinates
 * @param k - number of points to select
 * @returns maximum possible minimum Manhattan distance
 */
function maxDistance(side: number, points: number[][], k: number): number {
  const pointCount = points.length;

  // Linearize boundary points to 1D perimeter coordinates
  const sortedPositions = new Int32Array(pointCount);
  for (let pointIndex = 0; pointIndex < pointCount; pointIndex++) {
    const x = points[pointIndex][0];
    const y = points[pointIndex][1];
    // Right or bottom edge maps to x+y; left or top edge maps to -(x+y)
    sortedPositions[pointIndex] = (x === side || y === 0) ? x + y : -x - y;
  }
  sortedPositions.sort();

  const fullPerimeter = side * 4;

  // Binary search on the minimum distance answer
  let lowDistance = 1;
  let highDistance = (fullPerimeter / k) | 0;
  let maxFeasibleDistance = 0;

  while (lowDistance <= highDistance) {
    const candidateDistance = (lowDistance + highDistance) >>> 1;
    if (solve(sortedPositions, fullPerimeter, candidateDistance) >= k) {
      lowDistance = candidateDistance + 1;
      maxFeasibleDistance = candidateDistance;
    } else {
      highDistance = candidateDistance - 1;
    }
  }

  return maxFeasibleDistance;
}
