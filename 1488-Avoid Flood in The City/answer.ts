function avoidFlood(rains: number[]): number[] {
  const totalDays = rains.length;

  // Pre-fill result with 1 (for unused zero days) as required by the problem statement.
  const result: number[] = new Array(totalDays).fill(1);

  // Store indices of all zero days in order of appearance.
  const availableZeroDayIndices: number[] = [];

  // Map to track each lake’s most recent rain day.
  const lastRainDayByLake = new Map<number, number>();

  // Pointer to the start of unused zero days in the availableZeroDayIndices array.
  let usedZeroDayPrefixLength = 0;

  for (let currentDay = 0; currentDay < totalDays; currentDay++) {
    const lakeId = rains[currentDay];

    if (lakeId === 0) {
      // Record this as a potential dry day for future use.
      availableZeroDayIndices.push(currentDay);
      continue;
    }

    // Mark this day as a rain day in the result.
    result[currentDay] = -1;

    // If the lake is already full, we need to dry it before today's rain.
    const previousRainDay = lastRainDayByLake.get(lakeId);
    if (previousRainDay !== undefined) {
      // Find the earliest zero day after previousRainDay but before currentDay.
      let searchIndex = usedZeroDayPrefixLength;
      const totalZeroDays = availableZeroDayIndices.length;

      while (
        searchIndex < totalZeroDays &&
        availableZeroDayIndices[searchIndex] <= previousRainDay
        ) {
        searchIndex++;
      }

      // No valid dry day found before this rain day → flooding is unavoidable.
      if (
        searchIndex === totalZeroDays ||
        availableZeroDayIndices[searchIndex] >= currentDay
      ) {
        return [];
      }

      const chosenZeroDayIndex = availableZeroDayIndices[searchIndex];
      result[chosenZeroDayIndex] = lakeId; // Assign that zero day to dry this lake.

      // Swap used zero day to the front of the unused window, and advance the pointer.
      if (searchIndex !== usedZeroDayPrefixLength) {
        const temporaryIndexValue = availableZeroDayIndices[usedZeroDayPrefixLength];
        availableZeroDayIndices[usedZeroDayPrefixLength] = chosenZeroDayIndex;
        availableZeroDayIndices[searchIndex] = temporaryIndexValue;
      }
      usedZeroDayPrefixLength++;
    }

    // Update the lake’s most recent fill day.
    lastRainDayByLake.set(lakeId, currentDay);
  }

  return result;
}
