function minCost(colors: string, neededTime: number[]): number {
  const length = colors.length;

  // Fast path for tiny inputs
  if (length <= 1) {
    return 0;
  }

  // Running state for the current same-color group
  let previousColorCode = colors.charCodeAt(0);
  let currentGroupSum = neededTime[0];
  let currentGroupMax = neededTime[0];

  // Final answer accumulator
  let totalRemovalTime = 0;

  // Classic for-loop (best JITed in TS/JS engines) with cached length
  for (let index = 1; index < length; index++) {
    // Read once to avoid repeated property lookups
    const currentColorCode = colors.charCodeAt(index);
    const currentTime = neededTime[index];

    if (currentColorCode === previousColorCode) {
      // Continue the same-color run
      currentGroupSum += currentTime;

      // Maintain the maximum removal time in the current run
      if (currentTime > currentGroupMax) {
        currentGroupMax = currentTime;
      }
    } else {
      // Run ended: add cost = sum - max (zero when run size is 1)
      totalRemovalTime += (currentGroupSum - currentGroupMax);

      // Start a new run
      previousColorCode = currentColorCode;
      currentGroupSum = currentTime;
      currentGroupMax = currentTime;
    }
  }

  // Account for the final run
  totalRemovalTime += (currentGroupSum - currentGroupMax);

  return totalRemovalTime;
}
