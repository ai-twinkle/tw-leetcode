function maxEvents(events: number[][]): number {
  const totalEventCount = events.length;

  // 1. Find the maximum day we need to consider
  let maximumEndDay = 0;
  for (let eventIndex = 0; eventIndex < totalEventCount; eventIndex++) {
    const eventEndDay = events[eventIndex][1];
    if (eventEndDay > maximumEndDay) {
      maximumEndDay = eventEndDay;
    }
  }

  // 2. Sort all events by their end day (earliest first)
  events.sort(
    (firstEvent, secondEvent) => firstEvent[1] - secondEvent[1]
  );

  // 3. Prepare a union‐find array over days [0 .. maximumEndDay+1]
  //    dayParent[d] = the first free day >= d
  const dayParent = new Int32Array(maximumEndDay + 2);
  for (let dayIndex = 0; dayIndex < dayParent.length; dayIndex++) {
    dayParent[dayIndex] = dayIndex;
  }

  // 4. Find with path‐compression: returns the first free day >= queriedDay
  function findNextAvailableDay(queriedDay: number): number {
    let rootDay = queriedDay;
    // Climb up to the root
    while (dayParent[rootDay] !== rootDay) {
      rootDay = dayParent[rootDay];
    }
    // Compress the path for all nodes along the way
    let compressIndex = queriedDay;
    while (dayParent[compressIndex] !== rootDay) {
      const nextIndex = dayParent[compressIndex];
      dayParent[compressIndex] = rootDay;
      compressIndex = nextIndex;
    }
    return rootDay;
  }

  // 5. Greedily attend as many events as possible
  let attendedCount = 0;
  for (let eventIndex = 0; eventIndex < totalEventCount; eventIndex++) {
    const eventStartDay = events[eventIndex][0];
    const eventEndDay = events[eventIndex][1];

    // Find the earliest free day we can attend this event
    const chosenDay = findNextAvailableDay(eventStartDay);
    if (chosenDay <= eventEndDay) {
      attendedCount++;
      // Mark that day as occupied by unioning it with day+1
      dayParent[chosenDay] = findNextAvailableDay(chosenDay + 1);
    }
  }

  return attendedCount;
}
