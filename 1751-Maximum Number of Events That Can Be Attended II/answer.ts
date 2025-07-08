function maxValue(events: number[][], k: number): number {
  const numberOfEvents = events.length;
  if (numberOfEvents === 0 || k === 0) {
    return 0;
  }

  // 1. If you can only attend one event, just find the event with the highest value.
  if (k === 1) {
    let maximumSingleValue = 0;
    for (let eventIndex = 0; eventIndex < numberOfEvents; ++eventIndex) {
      const valueOfEvent = events[eventIndex][2];
      if (valueOfEvent > maximumSingleValue) {
        maximumSingleValue = valueOfEvent;
      }
    }
    return maximumSingleValue;
  }

  // 2. Sort the events by their start day so we can efficiently process them in order.
  events.sort((a, b) => a[0] - b[0]);

  // 3. Store start days, end days, and values in separate typed arrays for fast access and low overhead.
  const startDays = new Int32Array(numberOfEvents);
  const endDays = new Int32Array(numberOfEvents);
  const valuesOfEvents = new Int32Array(numberOfEvents);
  for (let eventIndex = 0; eventIndex < numberOfEvents; ++eventIndex) {
    const [start, end, value] = events[eventIndex];
    startDays[eventIndex] = start;
    endDays[eventIndex] = end;
    valuesOfEvents[eventIndex] = value;
  }

  // 4. Precompute for each event, which is the next event we can attend after it.
  //    We find this by searching for the first event that starts after the current event ends.
  const nextEventIndex = new Int32Array(numberOfEvents);
  for (let eventIndex = 0; eventIndex < numberOfEvents; ++eventIndex) {
    const nextPossibleStart = endDays[eventIndex] + 1;
    let low = eventIndex + 1;
    let high = numberOfEvents;
    while (low < high) {
      const mid = (low + high) >>> 1;
      if (startDays[mid] < nextPossibleStart) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    nextEventIndex[eventIndex] = low;
  }

  // 5. Use dynamic programming with only two rows to keep memory usage low.
  //    previousDPRow: stores results for attending (attendCount - 1) events
  //    currentDPRow:  stores results for attending attendCount events
  let previousDPRow = new Int32Array(numberOfEvents + 1);
  let currentDPRow = new Int32Array(numberOfEvents + 1);
  let maximumTotalValue = 0;

  // 6. For each possible number of events to attend (from 1 to k), fill the DP row.
  for (let attendCount = 1; attendCount <= k; ++attendCount) {
    // Process events backwards so we can always use up-to-date values for the "skip" option.
    for (let eventIndex = numberOfEvents - 1; eventIndex >= 0; --eventIndex) {
      // Option 1: Skip this event and keep the result from the next event in the list.
      const skipValue = currentDPRow[eventIndex + 1];
      // Option 2: Attend this event and add its value to the best possible value from the next possible event.
      const takeValue = valuesOfEvents[eventIndex] + previousDPRow[nextEventIndex[eventIndex]];

      // Store the better of skipping or attending this event.
      currentDPRow[eventIndex] = skipValue > takeValue ? skipValue : takeValue;
    }
    // Track the best total value seen so far.
    maximumTotalValue = currentDPRow[0];

    // Swap current and previous rows for the next round. No need to clear the array.
    const tempRow = previousDPRow;
    previousDPRow = currentDPRow;
    currentDPRow = tempRow;
  }

  return maximumTotalValue;
}
