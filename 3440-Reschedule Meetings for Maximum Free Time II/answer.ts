function maxFreeTime(
  eventTime: number,
  startTime: number[],
  endTime: number[]
): number {
  const meetingCount = startTime.length;
  const startTimes = new Uint32Array(startTime);
  const endTimes = new Uint32Array(endTime);

  // 1. Build the array of free time gaps before, between, and after meetings
  const totalGapCount = meetingCount + 1;
  const freeTimeGaps = new Uint32Array(totalGapCount);
  freeTimeGaps[0] = startTimes[0]; // Before the first meeting
  for (let meetingIndex = 1; meetingIndex < meetingCount; ++meetingIndex) {
    freeTimeGaps[meetingIndex] = startTimes[meetingIndex] - endTimes[meetingIndex - 1];
  }
  freeTimeGaps[meetingCount] = eventTime - endTimes[meetingCount - 1]; // After the last meeting

  // 2. Find the largest original free gap (without moving any meeting)
  let largestOriginalFreeTime = 0;
  for (let gapIndex = 0; gapIndex < totalGapCount; ++gapIndex) {
    if (freeTimeGaps[gapIndex] > largestOriginalFreeTime) {
      largestOriginalFreeTime = freeTimeGaps[gapIndex];
    }
  }

  // 3. Identify the top 3 largest free time gaps and their indices for efficient queries
  let largestGapValue1 = 0, largestGapIndex1 = -1;
  let largestGapValue2 = 0, largestGapIndex2 = -1;
  let largestGapValue3 = 0;
  for (let gapIndex = 0; gapIndex < totalGapCount; ++gapIndex) {
    const currentGap = freeTimeGaps[gapIndex];
    if (currentGap > largestGapValue1) {
      largestGapValue3 = largestGapValue2;
      largestGapValue2 = largestGapValue1;
      largestGapIndex2 = largestGapIndex1;
      largestGapValue1 = currentGap;
      largestGapIndex1 = gapIndex;
    } else if (currentGap > largestGapValue2) {
      largestGapValue3 = largestGapValue2;
      largestGapValue2 = currentGap;
      largestGapIndex2 = gapIndex;
    } else if (currentGap > largestGapValue3) {
      largestGapValue3 = currentGap;
    }
  }

  // 4. Precompute the duration of each meeting
  const meetingDurations = new Uint32Array(meetingCount);
  for (let meetingIndex = 0; meetingIndex < meetingCount; ++meetingIndex) {
    meetingDurations[meetingIndex] = endTimes[meetingIndex] - startTimes[meetingIndex];
  }

  let maximumPossibleFreeTime = largestOriginalFreeTime;

  // 5. For each meeting, try moving it to maximize the largest free gap
  for (let meetingIndex = 0; meetingIndex < meetingCount; ++meetingIndex) {
    // Find the largest original gap that is not adjacent to the moved meeting
    let largestFixedGap: number;
    if (largestGapIndex1 !== meetingIndex && largestGapIndex1 !== meetingIndex + 1) {
      largestFixedGap = largestGapValue1;
    } else if (largestGapIndex2 !== meetingIndex && largestGapIndex2 !== meetingIndex + 1) {
      largestFixedGap = largestGapValue2;
    } else {
      largestFixedGap = largestGapValue3;
    }

    // The new free gap formed by removing and relocating the meeting
    const mergedFreeTimeGap = freeTimeGaps[meetingIndex] + meetingDurations[meetingIndex] + freeTimeGaps[meetingIndex + 1];
    const meetingDuration = meetingDurations[meetingIndex];

    // Place the meeting in the best available gap, or split the merged gap if necessary
    let candidateFreeTime: number;
    if (largestFixedGap >= meetingDuration) {
      candidateFreeTime = Math.max(mergedFreeTimeGap, largestFixedGap);
    } else {
      candidateFreeTime = mergedFreeTimeGap - meetingDuration;
    }

    if (candidateFreeTime > maximumPossibleFreeTime) {
      maximumPossibleFreeTime = candidateFreeTime;
    }
  }

  return maximumPossibleFreeTime;
}
