function countDays(days: number, meetings: number[][]): number {
  if (meetings.length === 0) {
    return days;
  }

  // Sort meetings by their starting day.
  meetings.sort((a, b) => a[0] - b[0]);

  // Count free days before the first meeting.
  let freeDays = meetings[0][0] - 1;

  // Initialize maxEnd with the end day of the first meeting.
  let maxEnd = meetings[0][1];

  // Iterate over the remaining meetings.
  for (let i = 1; i < meetings.length; i++) {
    const [start, end] = meetings[i];

    // Calculate the gap (difference) between the current meeting's start and the current maxEnd.
    // If there is a gap, add it to freeDays.
    freeDays += Math.max(0, start - maxEnd - 1);

    // Update maxEnd to the maximum of the current meeting's end and the current maxEnd.
    maxEnd = Math.max(maxEnd, end);
  }

  // Add free days after the last meeting.
  freeDays += days - maxEnd;

  return freeDays;
}
