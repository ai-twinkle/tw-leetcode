function findMissingElements(nums: number[]): number[] {
  const length = nums.length;

  // Presence bitset for the values 1..128, held in registers instead of an allocated buffer
  let presenceWord0 = 0;
  let presenceWord1 = 0;
  let presenceWord2 = 0;
  let presenceWord3 = 0;
  let minimumValue = 101;
  let maximumValue = 0;

  // Single pass: mark each value and track both range endpoints at the same time
  for (let index = 0; index < length; index++) {
    const value = nums[index];

    if (value < minimumValue) {
      minimumValue = value;
    }

    if (value > maximumValue) {
      maximumValue = value;
    }

    const bitIndex = value - 1;
    const bitMask = 1 << (bitIndex & 31);

    if (bitIndex < 32) {
      presenceWord0 |= bitMask;
    } else if (bitIndex < 64) {
      presenceWord1 |= bitMask;
    } else if (bitIndex < 96) {
      presenceWord2 |= bitMask;
    } else {
      presenceWord3 |= bitMask;
    }
  }

  // Range width minus the amount of stored values is exactly the answer size
  const missingCount = maximumValue - minimumValue + 1 - length;

  if (missingCount <= 0) {
    return [];
  }

  // Exact capacity, so the result array never has to grow or rehash its backing store
  const missingValues: number[] = new Array(missingCount);
  const startBitIndex = minimumValue - 1;
  const endBitIndex = maximumValue - 1;
  const startWordIndex = startBitIndex >>> 5;
  const endWordIndex = endBitIndex >>> 5;
  let writeIndex = 0;

  for (let wordIndex = startWordIndex; wordIndex <= endWordIndex; wordIndex++) {
    let presenceWord = 0;

    if (wordIndex === 0) {
      presenceWord = presenceWord0;
    } else if (wordIndex === 1) {
      presenceWord = presenceWord1;
    } else if (wordIndex === 2) {
      presenceWord = presenceWord2;
    } else {
      presenceWord = presenceWord3;
    }

    // Absent values of this word, before the two range borders are trimmed away
    let missingWord = ~presenceWord;

    if (wordIndex === startWordIndex) {
      missingWord &= -1 << (startBitIndex & 31);
    }

    if (wordIndex === endWordIndex) {
      const endOffset = endBitIndex & 31;

      // A shift by 32 wraps around in JavaScript, so the full word needs no mask at all
      if (endOffset !== 31) {
        missingWord &= (1 << (endOffset + 1)) - 1;
      }
    }

    const wordBaseValue = (wordIndex << 5) + 1;

    // Jump directly from one missing bit to the next instead of scanning the whole range
    while (missingWord !== 0) {
      const lowestSetBit = missingWord & -missingWord;

      missingValues[writeIndex] = wordBaseValue + 31 - Math.clz32(lowestSetBit);
      writeIndex++;
      missingWord ^= lowestSetBit;
    }
  }

  return missingValues;
}
