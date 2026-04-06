// Pre-computed direction deltas: North, East, South, West
const DIRECTION_DELTA_X = new Int8Array([0, 1, 0, -1]);
const DIRECTION_DELTA_Y = new Int8Array([1, 0, -1, 0]);

// Coordinate range is [-3*10^4, 3*10^4], so offset = 3*10^4, range = 6*10^4 + 1
const COORDINATE_OFFSET = 30000;
const COORDINATE_RANGE = 60001;

/**
 * Simulate a robot on an infinite XY-plane and return the maximum
 * squared Euclidean distance reached during the traversal.
 *
 * @param commands - Sequence of commands: -2 (turn left), -1 (turn right),
 *                   or 1–9 (move forward k steps).
 * @param obstacles - List of obstacle coordinates [x, y].
 * @return The maximum squared Euclidean distance from the origin.
 */
function robotSim(commands: number[], obstacles: number[][]): number {
  // Pack each obstacle into a single integer key for O(1) lookup
  const obstacleSet = new Set<number>();
  for (const obstacle of obstacles) {
    const packedKey = (obstacle[0] + COORDINATE_OFFSET) * COORDINATE_RANGE
      + (obstacle[1] + COORDINATE_OFFSET);
    obstacleSet.add(packedKey);
  }

  let currentX = 0;
  let currentY = 0;
  // 0 = North, 1 = East, 2 = South, 3 = West
  let directionIndex = 0;
  let maximumSquaredDistance = 0;

  for (const command of commands) {
    if (command === -2) {
      // Turn left: North→West→South→East→North
      directionIndex = (directionIndex + 3) & 3;
    } else if (command === -1) {
      // Turn right: North→East→South→West→North
      directionIndex = (directionIndex + 1) & 3;
    } else {
      const stepDeltaX = DIRECTION_DELTA_X[directionIndex];
      const stepDeltaY = DIRECTION_DELTA_Y[directionIndex];

      // Advance one step at a time, stopping at obstacles
      for (let step = 0; step < command; step++) {
        const nextX = currentX + stepDeltaX;
        const nextY = currentY + stepDeltaY;
        const packedNext = (nextX + COORDINATE_OFFSET) * COORDINATE_RANGE
          + (nextY + COORDINATE_OFFSET);

        if (obstacleSet.has(packedNext)) {
          break;
        }

        currentX = nextX;
        currentY = nextY;

        const squaredDistance = currentX * currentX + currentY * currentY;
        maximumSquaredDistance = squaredDistance > maximumSquaredDistance
          ? squaredDistance
          : maximumSquaredDistance;
      }
    }
  }

  return maximumSquaredDistance;
}
