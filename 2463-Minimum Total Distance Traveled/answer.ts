function minimumTotalDistance(robot: number[], factory: number[][]): number {
  robot.sort((a, b) => a - b);

  // Add sentinel factories and filter zero-capacity ones
  factory.push([1e18, 1], [-1e18, 1]);
  const filtered = factory.filter(f => f[1] > 0);
  filtered.sort((a, b) => a[0] - b[0]);

  const factoryCount = filtered.length;

  // Store factory data in parallel typed arrays for cache-friendly access
  const position = new Float64Array(factoryCount);
  const capacity = new Int32Array(factoryCount);
  const used = new Int32Array(factoryCount);
  const first = new Int32Array(factoryCount);
  const cost = new Float64Array(factoryCount);

  for (let i = 0; i < factoryCount; i++) {
    position[i] = filtered[i][0];
    capacity[i] = filtered[i][1];
    first[i] = -1;
  }

  // Precompute robot positions into typed array
  const robotCount = robot.length;
  const robotPosition = new Float64Array(robotCount);
  for (let i = 0; i < robotCount; i++) {
    robotPosition[i] = robot[i];
  }

  /**
   * @param robotIndex - Index of the robot being assigned
   * @param factoryIndex - Index of the factory to assign the robot to
   */
  function use(robotIndex: number, factoryIndex: number): void {
    while (used[factoryIndex] === capacity[factoryIndex]) {
      robotIndex = first[factoryIndex]++;
      // Recompute cost after shifting first pointer
      const currentRobotPosition = robotPosition[first[factoryIndex]];
      const previousFactoryPosition = position[factoryIndex - 1];
      const currentFactoryPosition = position[factoryIndex];
      const distanceToPrevious = currentRobotPosition - previousFactoryPosition;
      const distanceToCurrent = currentRobotPosition - currentFactoryPosition;
      cost[factoryIndex] = (distanceToPrevious < 0 ? -distanceToPrevious : distanceToPrevious)
        - (distanceToCurrent < 0 ? -distanceToCurrent : distanceToCurrent);
      factoryIndex--;
    }
    if (used[factoryIndex] === 0) {
      first[factoryIndex] = robotIndex;
      // Compute initial cost for this factory's first robot
      const currentRobotPosition = robotPosition[first[factoryIndex]];
      const previousFactoryPosition = position[factoryIndex - 1];
      const currentFactoryPosition = position[factoryIndex];
      const distanceToPrevious = currentRobotPosition - previousFactoryPosition;
      const distanceToCurrent = currentRobotPosition - currentFactoryPosition;
      cost[factoryIndex] = (distanceToPrevious < 0 ? -distanceToPrevious : distanceToPrevious)
        - (distanceToCurrent < 0 ? -distanceToCurrent : distanceToCurrent);
    }
    used[factoryIndex]++;
  }

  let totalDistance = 0;
  let currentFactory = 1;

  for (let robotIndex = 0; robotIndex < robotCount; robotIndex++) {
    const currentPosition = robotPosition[robotIndex];

    // Advance to the first factory to the right of this robot
    let rightCost = -1;
    while (rightCost < 0) {
      currentFactory++;
      rightCost = position[currentFactory] - currentPosition;
    }
    currentFactory--;

    // Compute left cost including cascading displacement costs
    const distanceToLeft = position[currentFactory] - currentPosition;
    let leftCost = distanceToLeft < 0 ? -distanceToLeft : distanceToLeft;
    for (let i = currentFactory; ; i--) {
      if (used[i] === capacity[i]) {
        leftCost += cost[i];
      } else {
        break;
      }
    }

    // Assign to the cheaper side
    totalDistance += leftCost < rightCost ? leftCost : rightCost;
    if (leftCost <= rightCost) {
      use(robotIndex, currentFactory);
    } else {
      currentFactory++;
      use(robotIndex, currentFactory);
    }
  }

  return totalDistance;
}
