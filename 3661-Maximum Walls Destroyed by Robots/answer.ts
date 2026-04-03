function maxWalls(robots: number[], distance: number[], walls: number[]): number {
  const robotCount = robots.length;
  const wallCount = walls.length;

  // Build a sorted index of robots by position, carrying their distances along
  const robotOrder = new Int32Array(robotCount);
  for (let index = 0; index < robotCount; index++) {
    robotOrder[index] = index;
  }
  robotOrder.sort((indexA, indexB) => robots[indexA] - robots[indexB]);

  const sortedPositions = new Int32Array(robotCount);
  const sortedDistances = new Int32Array(robotCount);
  for (let index = 0; index < robotCount; index++) {
    const originalIndex = robotOrder[index];
    sortedPositions[index] = robots[originalIndex];
    sortedDistances[index] = distance[originalIndex];
  }

  // Sort walls for binary search
  const sortedWalls = new Int32Array(walls).sort();

  /**
   * Returns the index of the first wall position >= target (lower bound).
   *
   * @param target - The position threshold
   * @return The smallest index such that sortedWalls[index] >= target
   */
  const lowerBound = (target: number): number => {
    let low = 0;
    let high = wallCount;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (sortedWalls[middle] < target) {
        low = middle + 1;
      } else {
        high = middle;
      }
    }
    return low;
  };

  /**
   * Returns the index one past the last wall position <= target (upper bound).
   *
   * @param target - The position threshold
   * @return The smallest index such that sortedWalls[index] > target
   */
  const upperBound = (target: number): number => {
    let low = 0;
    let high = wallCount;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (sortedWalls[middle] <= target) {
        low = middle + 1;
      } else {
        high = middle;
      }
    }
    return low;
  };

  /**
   * Counts walls with positions in the closed interval [lowerPosition, upperPosition].
   *
   * @param lowerPosition - Inclusive lower bound of the query range
   * @param upperPosition - Inclusive upper bound of the query range
   * @return Number of walls whose position falls within [lowerPosition, upperPosition]
   */
  const countInRange = (lowerPosition: number, upperPosition: number): number => {
    if (lowerPosition > upperPosition) {
      return 0;
    }
    return upperBound(upperPosition) - lowerBound(lowerPosition);
  };

  // Initialise DP for the first robot
  const firstPosition = sortedPositions[0];
  const firstDistance = sortedDistances[0];

  // Firing left: covers [firstPosition - firstDistance, firstPosition] inclusive
  let dpLeft = countInRange(firstPosition - firstDistance, firstPosition);

  // Firing right: wall at own position is always within range [pos, pos+dist];
  // walls further right in the gap are counted when that gap is processed
  let dpRight = countInRange(firstPosition, firstPosition);

  for (let robotIndex = 1; robotIndex < robotCount; robotIndex++) {
    const previousPosition = sortedPositions[robotIndex - 1];
    const previousDistance = sortedDistances[robotIndex - 1];
    const currentPosition  = sortedPositions[robotIndex];
    const currentDistance  = sortedDistances[robotIndex];

    // --- Walls strictly inside the gap (previousPosition, currentPosition) ---

    // Walls reachable by the previous robot firing right into this gap
    const rightReachEnd = previousPosition + previousDistance < currentPosition - 1
      ? previousPosition + previousDistance
      : currentPosition - 1;
    const rightCover = countInRange(previousPosition + 1, rightReachEnd);

    // Walls reachable by the current robot firing left into this gap
    const leftReachStart = currentPosition - currentDistance > previousPosition + 1
      ? currentPosition - currentDistance
      : previousPosition + 1;
    const leftCover = countInRange(leftReachStart, currentPosition - 1);

    // Overlap: walls reachable by both robots (needed for inclusion-exclusion)
    const overlapStart = leftReachStart > previousPosition + 1 ? leftReachStart : previousPosition + 1;
    const overlapEnd   = rightReachEnd  < currentPosition  - 1 ? rightReachEnd  : currentPosition  - 1;
    const overlap = countInRange(overlapStart, overlapEnd);

    // Wall at the current robot's own position is covered by either firing direction
    const wallAtCurrentPosition = countInRange(currentPosition, currentPosition);

    // dpLeft transition: current robot fires LEFT into this gap
    //   previous fired left  → gap contributes only leftCover (previous doesn't reach gap)
    //   previous fired right → gap contributes rightCover + leftCover - overlap (union)
    const newDpLeft =
      Math.max(dpLeft  + leftCover, dpRight + rightCover + leftCover - overlap) + wallAtCurrentPosition;

    // dpRight transition: current robot fires RIGHT (gap walls from its side = 0 here)
    //   previous fired left  → gap gets 0 contribution from current robot's left
    //   previous fired right → gap gets rightCover from previous robot
    const newDpRight = Math.max(dpLeft, dpRight + rightCover) + wallAtCurrentPosition;

    dpLeft  = newDpLeft;
    dpRight = newDpRight;
  }

  // Add walls to the right of the last robot when it fires right (no right neighbour to block)
  const lastPosition = sortedPositions[robotCount - 1];
  const lastDistance = sortedDistances[robotCount - 1];
  const rightEdgeWalls = countInRange(lastPosition + 1, lastPosition + lastDistance);

  return Math.max(dpLeft, dpRight + rightEdgeWalls);
}
