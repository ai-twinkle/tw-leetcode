function maxPartitionsAfterOperations(s: string, k: number): number {
  // Early exit conditions (identical to original)
  if (k === 26 || k > new Set(s).size) {
    return 1;
  }

  // Special case when k === 1
  if (k === 1) {
    let maxRunLength = 0;
    let currentRunLength = 0;
    let partitionCountMinusOne = -1;
    let previousCharacter = '';

    for (const currentCharacter of s) {
      if (currentCharacter === previousCharacter) {
        currentRunLength += 1;
      } else {
        maxRunLength = Math.max(maxRunLength, currentRunLength);
        currentRunLength = 1;
        previousCharacter = currentCharacter;
        partitionCountMinusOne += 1;
      }
    }

    maxRunLength = Math.max(maxRunLength, currentRunLength);

    return partitionCountMinusOne + Math.min(maxRunLength, 3);
  }

  const stringLength = s.length;

  // Convert string to array of bitmasks representing each character
  const characterBitMaskArray = new Uint32Array(stringLength);
  for (let i = 0; i < stringLength; i++) {
    characterBitMaskArray[i] = 1 << (s.charCodeAt(i) - 97);
  }

  // Typed arrays for suffix computation
  const suffixPartitionFull = new Int32Array(stringLength);
  const suffixPartitionPartial = new Int32Array(stringLength);
  const prefixSetSnapshot = new Uint32Array(stringLength);

  // Map each character bit to its most recent index (initialized to stringLength)
  const latestIndexByBit = Object.fromEntries(
    Array.from({ length: 26 }, (_: unknown, index: number) =>
      [(1 << index), stringLength]
    )
  );

  // Backward traversal state variables
  let currentSetFullMask = 0;
  let currentDistinctFullCount = 0;
  let currentPartitionFull = 1;
  let pointerFull = stringLength - 1;

  let currentSetPartialMask = 0;
  let currentDistinctPartialCount = 0;
  let currentPartitionPartial = 1;
  let pointerPartial = stringLength - 1;

  // Build suffix partitions from right to left
  for (let index = stringLength - 1; index >= 0; index--) {
    suffixPartitionPartial[index] = currentPartitionPartial;
    prefixSetSnapshot[index] = currentSetFullMask;

    // Update partial set (tracks k - 1 distinct characters)
    if ((currentSetPartialMask & characterBitMaskArray[index]) === 0) {
      if (currentDistinctPartialCount === k - 1) {
        while (pointerPartial > latestIndexByBit[characterBitMaskArray[pointerPartial]]) {
          pointerPartial -= 1;
        }
        currentPartitionPartial = suffixPartitionFull[pointerPartial] + 1;
        currentSetPartialMask ^= characterBitMaskArray[pointerPartial];
        pointerPartial -= 1;
        currentDistinctPartialCount -= 1;
      }
      currentSetPartialMask |= characterBitMaskArray[index];
      currentDistinctPartialCount += 1;
    }

    // Update full set (tracks k distinct characters)
    if ((currentSetFullMask & characterBitMaskArray[index]) === 0) {
      if (currentDistinctFullCount === k) {
        while (pointerFull > latestIndexByBit[characterBitMaskArray[pointerFull]]) {
          pointerFull -= 1;
        }
        currentPartitionFull = suffixPartitionFull[pointerFull] + 1;
        currentSetFullMask ^= characterBitMaskArray[pointerFull];
        pointerFull -= 1;
        currentDistinctFullCount -= 1;
      }
      currentSetFullMask |= characterBitMaskArray[index];
      currentDistinctFullCount += 1;
    }

    suffixPartitionFull[index] = currentPartitionFull;
    latestIndexByBit[characterBitMaskArray[index]] = index;
  }

  // Forward traversal phase
  let bestResult = suffixPartitionFull[0];
  let seenDuplicateInBlock = false;
  let hasPendingSecondChance = false;

  let currentSetForwardMask = 0;
  let currentDistinctForwardCount = 0;
  let currentPartitionForward = 1;
  const allLetterMask = (1 << 26) - 1;

  for (let index = 0; index < stringLength; index++) {
    if ((currentSetForwardMask & characterBitMaskArray[index]) === 0) {
      // New distinct character in current prefix
      if (currentDistinctForwardCount === k - 1) {
        if (seenDuplicateInBlock) {
          bestResult = Math.max(bestResult, currentPartitionForward + suffixPartitionFull[index]);
        }
        hasPendingSecondChance = true;
      } else if (currentDistinctForwardCount === k) {
        seenDuplicateInBlock = false;
        hasPendingSecondChance = false;
        currentSetForwardMask = 0;
        currentDistinctForwardCount = 0;
        currentPartitionForward += 1;
      }

      currentSetForwardMask |= characterBitMaskArray[index];
      currentDistinctForwardCount += 1;
    } else if (hasPendingSecondChance) {
      if ((currentSetForwardMask | prefixSetSnapshot[index]) < allLetterMask) {
        bestResult = Math.max(bestResult, currentPartitionForward + suffixPartitionPartial[index]);
      } else {
        bestResult = Math.max(bestResult, currentPartitionForward + suffixPartitionFull[index]);
      }
      hasPendingSecondChance = false;
    } else if (!seenDuplicateInBlock) {
      seenDuplicateInBlock = true;
    }
  }

  return bestResult;
}
