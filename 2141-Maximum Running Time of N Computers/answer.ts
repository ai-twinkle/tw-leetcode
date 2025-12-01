function maxRunTime(n: number, batteries: number[]): number {
  const computerCount = n;
  const batteryCount = batteries.length;

  // Store batteries into a typed array for tighter memory layout and faster indexed access
  const batteryTimes = new Float64Array(batteryCount);

  // Accumulate total battery time while copying into typed array
  let totalBatteryTime = 0;
  for (let index = 0; index < batteryCount; index++) {
    const batteryTime = batteries[index];
    batteryTimes[index] = batteryTime;
    totalBatteryTime += batteryTime;
  }

  // Edge case: if there is only one computer, we can use all battery time directly
  if (computerCount === 1) {
    return totalBatteryTime;
  }

  // Maximum possible running time if distributed perfectly
  let leftTime = 0;
  let rightTime = Math.floor(totalBatteryTime / computerCount);

  /**
   * Check if all computers can run for targetMinutes simultaneously.
   *
   * Each battery can contribute at most min(batteryTime, targetMinutes).
   * If the sum of contributions is at least targetMinutes * computerCount,
   * then the targetMinutes is feasible.
   *
   * @param {number} targetMinutes - Target running time in minutes for each computer.
   * @return {boolean} - Whether it is feasible to run all computers for targetMinutes.
   */
  function canPowerAllComputers(targetMinutes: number): boolean {
    const requiredTotalTime = targetMinutes * computerCount;
    let accumulatedTime = 0;

    // Early exit if targetMinutes is zero
    if (targetMinutes === 0) {
      return true;
    }

    // Accumulate contributions from each battery, capped at targetMinutes
    for (let index = 0; index < batteryCount; index++) {
      const batteryTime = batteryTimes[index];

      // Each battery can contribute at most targetMinutes
      if (batteryTime >= targetMinutes) {
        accumulatedTime += targetMinutes;
      } else {
        accumulatedTime += batteryTime;
      }

      // Early exit once we have enough total contribution
      if (accumulatedTime >= requiredTotalTime) {
        return true;
      }
    }

    return false;
  }

  // Binary search for the maximum feasible running time
  while (leftTime < rightTime) {
    // Use upper mid to avoid infinite loop when narrowing from above
    const middleTime = Math.floor((leftTime + rightTime + 1) / 2);

    if (canPowerAllComputers(middleTime)) {
      // middleTime is feasible; try a longer time
      leftTime = middleTime;
    } else {
      // middleTime is not feasible; reduce the upper bound
      rightTime = middleTime - 1;
    }
  }

  return leftTime;
}
