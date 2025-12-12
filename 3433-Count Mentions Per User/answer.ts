function countMentions(numberOfUsers: number, events: string[][]): number[] {
  const mentions = new Uint32Array(numberOfUsers);
  const offlineUntil = new Uint32Array(numberOfUsers);

  const charCode_O = 79; // 'O'
  const charCode_A = 65; // 'A'
  const charCode_H = 72; // 'H'
  const charCode_SPACE = 32; // ' '
  const charCode_D = 100; // 'd'
  const charCode_ZERO = 48; // '0'

  let allMentionsCount = 0;

  // Sort by timestamp, and ensure OFFLINE is processed before MESSAGE at the same timestamp
  events.sort((leftEvent, rightEvent) => {
    const leftTime = +leftEvent[1];
    const rightTime = +rightEvent[1];

    if (leftTime !== rightTime) {
      return leftTime - rightTime;
    }

    const leftTypeFirstChar = leftEvent[0].charCodeAt(0);
    const rightTypeFirstChar = rightEvent[0].charCodeAt(0);

    if (leftTypeFirstChar === rightTypeFirstChar) {
      return 0;
    }

    if (leftTypeFirstChar === charCode_O) {
      return -1;
    }

    return 1;
  });

  for (let eventIndex = 0; eventIndex < events.length; eventIndex += 1) {
    const event = events[eventIndex];
    const eventTypeFirstChar = event[0].charCodeAt(0);
    const timestamp = +event[1];

    if (eventTypeFirstChar === charCode_O) {
      const userId = +event[2];

      // Record the time when the user becomes online again
      offlineUntil[userId] = timestamp + 60;
      continue;
    }

    const mentionText = event[2];
    const mentionTypeFirstChar = mentionText.charCodeAt(0);

    if (mentionTypeFirstChar === charCode_A) {
      // Defer ALL application to one final pass
      allMentionsCount += 1;
      continue;
    }

    if (mentionTypeFirstChar === charCode_H) {
      // Scan online users only; offlineUntil[userId] is 0 when never offline
      for (let userId = 0; userId < numberOfUsers; userId += 1) {
        if (timestamp >= offlineUntil[userId]) {
          mentions[userId] += 1;
        }
      }
      continue;
    }

    // Fast parse for "id<number>" tokens under constraints (0..99), duplicates count multiple times
    const textLength = mentionText.length;

    for (let textIndex = 2; textIndex < textLength - 1; textIndex += 4) {
      let userId = mentionText.charCodeAt(textIndex) - charCode_ZERO;

      if (mentionText.charCodeAt(textIndex + 1) !== charCode_SPACE) {
        textIndex += 1;
        userId = userId * 10 + (mentionText.charCodeAt(textIndex) - charCode_ZERO);
      }

      mentions[userId] += 1;
    }

    // Handle the last token when it ends with "... id<digit>"
    if (mentionText.charCodeAt(textLength - 2) === charCode_D) {
      mentions[mentionText.charCodeAt(textLength - 1) - charCode_ZERO] += 1;
    }
  }

  const result = new Array<number>(numberOfUsers);

  // Apply ALL mentions to each user once
  for (let userId = 0; userId < numberOfUsers; userId += 1) {
    result[userId] = mentions[userId] + allMentionsCount;
  }

  return result;
}
