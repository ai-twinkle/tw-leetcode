function mostBooked(n: number, meetings: number[][]): number {
  // 1. Sort meetings by their start time in ascending order.
  meetings.sort((a, b) => a[0] - b[0]);

  // 2. Initialize arrays to track each room's next available time and meeting count.
  const roomNextAvailableTime = new Uint32Array(n);
  const roomMeetingCount = new Uint32Array(n);

  const totalMeetings = meetings.length;

  // 3. Process each meeting and assign it to the appropriate room.
  for (let i = 0; i < totalMeetings; i++) {
    const meetingStart = meetings[i][0];
    const meetingEnd = meetings[i][1];

    // Track the room with the earliest next available time in case all rooms are busy.
    let earliestAvailableRoom = 0;
    let earliestAvailableTime = roomNextAvailableTime[0];

    // Attempt to find a room that is free at the meeting's start time.
    let assignedRoom = -1;
    for (let roomIndex = 0; roomIndex < n; roomIndex++) {
      const availableTime = roomNextAvailableTime[roomIndex];
      if (availableTime <= meetingStart) {
        assignedRoom = roomIndex;
        break;
      }
      // Update the room with the earliest next available time if found.
      if (availableTime < earliestAvailableTime) {
        earliestAvailableTime = availableTime;
        earliestAvailableRoom = roomIndex;
      }
    }

    if (assignedRoom >= 0) {
      // Assign the meeting to a free room immediately.
      roomNextAvailableTime[assignedRoom] = meetingEnd;
      roomMeetingCount[assignedRoom] += 1;
    } else {
      // If all rooms are busy, delay the meeting and assign it to the earliest available room.
      roomNextAvailableTime[earliestAvailableRoom] = earliestAvailableTime + (meetingEnd - meetingStart);
      roomMeetingCount[earliestAvailableRoom] += 1;
    }
  }

  // 4. Find the room that held the most meetings. If there is a tie, return the lowest room index.
  let mostUsedRoom = 0;
  let highestMeetingCount = roomMeetingCount[0];
  for (let roomIndex = 1; roomIndex < n; roomIndex++) {
    const currentMeetingCount = roomMeetingCount[roomIndex];
    if (currentMeetingCount > highestMeetingCount) {
      highestMeetingCount = currentMeetingCount;
      mostUsedRoom = roomIndex;
    }
  }

  return mostUsedRoom;
}
