function maximumGain(s: string, x: number, y: number): number {
  const stringLength = s.length;
  const charCodeA = 'a'.charCodeAt(0);
  const charCodeB = 'b'.charCodeAt(0);

  // 1. Map input string to a typed array of char codes
  const inputBuffer = new Uint8Array(stringLength);
  for (let i = 0; i < stringLength; i++) {
    inputBuffer[i] = s.charCodeAt(i);
  }

  let totalScore = 0;

  // 2. Determine which substring to remove first (the one with the higher score)
  let firstRemoveFirstCode, firstRemoveSecondCode, firstRemoveScore;
  let secondRemoveFirstCode, secondRemoveSecondCode, secondRemoveScore;

  if (x >= y) {
    firstRemoveFirstCode = charCodeA;
    firstRemoveSecondCode = charCodeB;
    firstRemoveScore = x;
    secondRemoveFirstCode = charCodeB;
    secondRemoveSecondCode = charCodeA;
    secondRemoveScore = y;
  } else {
    firstRemoveFirstCode = charCodeB;
    firstRemoveSecondCode = charCodeA;
    firstRemoveScore = y;
    secondRemoveFirstCode = charCodeA;
    secondRemoveSecondCode = charCodeB;
    secondRemoveScore = x;
  }

  // 3. First pass: remove all occurrences of the higher-value substring
  let writePointer = 0;
  for (let readPointer = 0; readPointer < stringLength; readPointer++) {
    const currentCode = inputBuffer[readPointer];
    if (
      writePointer > 0 &&
      currentCode === firstRemoveSecondCode &&
      inputBuffer[writePointer - 1] === firstRemoveFirstCode
    ) {
      writePointer--;
      totalScore += firstRemoveScore;
    } else {
      inputBuffer[writePointer++] = currentCode;
    }
  }

  // 4. Second pass: remove all occurrences of the lower-value substring
  let newWritePointer = 0;
  for (let readPointer = 0; readPointer < writePointer; readPointer++) {
    const currentCode = inputBuffer[readPointer];
    if (
      newWritePointer > 0 &&
      currentCode === secondRemoveSecondCode &&
      inputBuffer[newWritePointer - 1] === secondRemoveFirstCode
    ) {
      newWritePointer--;
      totalScore += secondRemoveScore;
    } else {
      inputBuffer[newWritePointer++] = currentCode;
    }
  }

  return totalScore;
}
