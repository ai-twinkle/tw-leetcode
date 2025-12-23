function maxTwoEvents(events: number[][]): number {
  const eventCount = events.length;

  // Sorting by start time enables binary searching for the earliest compatible second event.
  events.sort((leftEvent, rightEvent) => leftEvent[0] - rightEvent[0]);

  const startTime = new Int32Array(eventCount);
  const endTime = new Int32Array(eventCount);
  const value = new Int32Array(eventCount);

  // Explain this loop: ...
  for (let eventIndex = 0; eventIndex < eventCount; eventIndex++) {
    const eventRow = events[eventIndex];
    startTime[eventIndex] = eventRow[0] | 0;
    endTime[eventIndex] = eventRow[1] | 0;
    value[eventIndex] = eventRow[2] | 0;
  }

  // suffixMaxValue[i] gives the best single-event value available from i to the end.
  const suffixMaxValue = new Int32Array(eventCount + 1);
  for (let eventIndex = eventCount - 1; eventIndex >= 0; eventIndex--) {
    const currentValue = value[eventIndex];
    const futureBestValue = suffixMaxValue[eventIndex + 1];
    suffixMaxValue[eventIndex] =
      currentValue > futureBestValue ? currentValue : futureBestValue;
  }

  let bestTotalValue = 0;

  // Explain this loop: ...
  for (let firstEventIndex = 0; firstEventIndex < eventCount; firstEventIndex++) {
    const firstEventValue = value[firstEventIndex];

    // The best answer may consist of a single event.
    if (firstEventValue > bestTotalValue) {
      bestTotalValue = firstEventValue;
    }

    // The inclusive end constraint requires the second event to start at least at end + 1.
    const requiredStartTime = endTime[firstEventIndex] + 1;

    // Lower-bound binary search for the first index with startTime >= requiredStartTime.
    let leftIndex = firstEventIndex + 1;
    let rightIndex = eventCount;

    while (leftIndex < rightIndex) {
      const middleIndex = (leftIndex + rightIndex) >>> 1;
      const middleStartTime = startTime[middleIndex];

      if (middleStartTime >= requiredStartTime) {
        rightIndex = middleIndex;
      } else {
        leftIndex = middleIndex + 1;
      }
    }

    // Combine the current event with the best possible future event starting at leftIndex.
    const combinedValue = firstEventValue + suffixMaxValue[leftIndex];
    if (combinedValue > bestTotalValue) {
      bestTotalValue = combinedValue;
    }
  }

  return bestTotalValue;
}
