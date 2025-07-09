function maxFreeTime(
  eventTime: number,
  k: number,
  startTime: number[],
  endTime: number[],
): number {
  const meetingCount = startTime.length;
  let windowDurationSum = 0;

  // Calculate the sum of durations for the first window of k meetings
  for (let i = 0; i < k; ++i) {
    windowDurationSum += endTime[i] - startTime[i];
  }

  // Calculate free time for the first window
  let maximumFreeTime = (k === meetingCount ? eventTime : startTime[k]) - windowDurationSum;

  // Slide the window across all possible positions
  for (let i = 1; i <= meetingCount - k; ++i) {
    // Update the window sum: remove the meeting leaving, add the meeting entering
    windowDurationSum += (endTime[i + k - 1] - startTime[i + k - 1]) - (endTime[i - 1] - startTime[i - 1]);

    const leftBoundary = endTime[i - 1];
    const rightBoundary = (i + k === meetingCount) ? eventTime : startTime[i + k];
    const freeTime = rightBoundary - leftBoundary - windowDurationSum;

    if (freeTime > maximumFreeTime) {
      maximumFreeTime = freeTime;
    }
  }

  return maximumFreeTime;
}
