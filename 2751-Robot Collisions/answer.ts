function survivedRobotsHealths(positions: number[], healths: number[], directions: string): number[] {
  const robotCount = positions.length;

  // Use Int32Array for cache-friendly index sorting
  const sortedIndices = new Int32Array(robotCount);
  for (let i = 0; i < robotCount; i++) {
    sortedIndices[i] = i;
  }

  // Sort indices by position to process collisions in spatial order
  sortedIndices.sort((indexA, indexB) => positions[indexA] - positions[indexB]);

  // Int32Array stack for right-moving robots pending collision resolution
  const collisionStack = new Int32Array(robotCount);
  let stackTop = -1;

  // Uint8Array for O(1) elimination marking with minimal memory footprint
  const isEliminated = new Uint8Array(robotCount);

  for (let sortedPosition = 0; sortedPosition < robotCount; sortedPosition++) {
    const currentIndex = sortedIndices[sortedPosition];

    if (directions[currentIndex] === 'R') {
      // Park right-movers on stack; they may collide with future left-movers
      collisionStack[++stackTop] = currentIndex;
    } else {
      // Resolve all collisions between this left-mover and stacked right-movers
      while (stackTop >= 0) {
        const rightIndex = collisionStack[stackTop];

        if (healths[currentIndex] > healths[rightIndex]) {
          // Left-mover wins; eliminate right-mover and continue checking
          isEliminated[rightIndex] = 1;
          stackTop--;
          healths[currentIndex]--;
        } else if (healths[currentIndex] < healths[rightIndex]) {
          // Right-mover wins; eliminate left-mover and weaken right-mover
          isEliminated[currentIndex] = 1;
          healths[rightIndex]--;
          break;
        } else {
          // Equal health: both robots destroy each other simultaneously
          isEliminated[currentIndex] = 1;
          isEliminated[rightIndex] = 1;
          stackTop--;
          break;
        }
      }
    }
  }

  // Gather surviving robot healths in original input order
  const survivors: number[] = [];
  for (let i = 0; i < robotCount; i++) {
    if (!isEliminated[i]) {
      survivors.push(healths[i]);
    }
  }

  return survivors;
}
