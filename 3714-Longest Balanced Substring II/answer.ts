function longestBalanced(s: string): number {
  const length = s.length;

  // Handle tiny input where the full string is always balanced.
  if (length <= 1) {
    return length;
  }

  // Allocate pair-difference tables using offset indexing so differences in [-length, length] map to valid array indices.
  const differenceIndexOffset = length;
  const differenceArraySize = (length << 1) + 1;

  // AB pair tracker (segments without 'c') using stamp-based clearing to avoid O(n) resets.
  const earliestPrefixIndexForAB = new Int32Array(differenceArraySize);
  const seenStampForAB = new Uint32Array(differenceArraySize);
  let currentStampForAB = 1;
  let differenceAB = 0;
  seenStampForAB[differenceIndexOffset] = currentStampForAB;
  earliestPrefixIndexForAB[differenceIndexOffset] = 0;

  // AC pair tracker (segments without 'b') using stamp-based clearing to avoid O(n) resets.
  const earliestPrefixIndexForAC = new Int32Array(differenceArraySize);
  const seenStampForAC = new Uint32Array(differenceArraySize);
  let currentStampForAC = 1;
  let differenceAC = 0;
  seenStampForAC[differenceIndexOffset] = currentStampForAC;
  earliestPrefixIndexForAC[differenceIndexOffset] = 0;

  // BC pair tracker (segments without 'a') using stamp-based clearing to avoid O(n) resets.
  const earliestPrefixIndexForBC = new Int32Array(differenceArraySize);
  const seenStampForBC = new Uint32Array(differenceArraySize);
  let currentStampForBC = 1;
  let differenceBC = 0;
  seenStampForBC[differenceIndexOffset] = currentStampForBC;
  earliestPrefixIndexForBC[differenceIndexOffset] = 0;

  /**
   * @param value
   * @returns The next power of two >= value (minimum 1).
   */
  function nextPowerOfTwo(value: number): number {
    // Handle small inputs directly to avoid undefined shifts.
    if (value <= 1) {
      return 1;
    }
    // Compute next power of two via leading-zero count.
    return 1 << (32 - Math.clz32((value - 1) | 0));
  }

  // Create an open-addressing hash table for triple balance states (countA-countB, countA-countC).
  const expectedPrefixStates = length + 1;
  const hashCapacity = nextPowerOfTwo((((expectedPrefixStates << 2) / 3) + 8) | 0);
  const hashMask = hashCapacity - 1;

  const deltaAminusBKeyTable = new Int32Array(hashCapacity);
  const deltaAminusCKeyTable = new Int32Array(hashCapacity);
  const earliestPrefixIndexPlusOneTable = new Int32Array(hashCapacity); // 0 = empty, otherwise earliestPrefixIndex + 1

  // Seed the initial prefix state so balanced substrings that start at index 0 are detectable.
  let initialHashIndex = 0;
  while (true) {
    const storedEarliestPlusOne = earliestPrefixIndexPlusOneTable[initialHashIndex];
    if (storedEarliestPlusOne === 0) {
      deltaAminusBKeyTable[initialHashIndex] = 0;
      deltaAminusCKeyTable[initialHashIndex] = 0;
      earliestPrefixIndexPlusOneTable[initialHashIndex] = 1;
      break;
    }
    if (deltaAminusBKeyTable[initialHashIndex] === 0 && deltaAminusCKeyTable[initialHashIndex] === 0) {
      break;
    }
    initialHashIndex = (initialHashIndex + 1) & hashMask;
  }

  // Track the longest single-character run to cover the one-distinct-letter balanced case.
  let bestLength = 1;
  let previousCharacterCode = (s.charCodeAt(0) - 97) | 0;
  let currentRunLength = 1;

  // Maintain prefix deltas used for triple-balance matching.
  let deltaAminusB = 0;
  let deltaAminusC = 0;

  // Single left-to-right scan that updates run-length, triple-balance, and three pair-balance trackers.
  for (let position = 0; position < length; position += 1) {
    const currentCharacterCode = (s.charCodeAt(position) - 97) | 0;
    const currentPrefixIndex = position + 1;

    // Update run-length tracker for one-letter balanced substrings.
    if (position !== 0) {
      if (currentCharacterCode === previousCharacterCode) {
        currentRunLength += 1;
      } else {
        if (currentRunLength > bestLength) {
          bestLength = currentRunLength;
        }
        currentRunLength = 1;
        previousCharacterCode = currentCharacterCode;
      }
    }

    // Update (countA-countB) and (countA-countC) deltas for the current prefix.
    if (currentCharacterCode === 0) {
      deltaAminusB += 1;
      deltaAminusC += 1;
    } else if (currentCharacterCode === 1) {
      deltaAminusB -= 1;
    } else {
      deltaAminusC -= 1;
    }

    // Triple-balance probe: find earliest matching prefix state or insert the current one.
    let hashValue = (Math.imul(deltaAminusB, 73856093) ^ Math.imul(deltaAminusC, 19349663)) | 0;
    hashValue ^= hashValue >>> 16;
    let hashIndex = hashValue & hashMask;

    while (true) {
      const storedEarliestPlusOne = earliestPrefixIndexPlusOneTable[hashIndex];

      // Insert the state when the probing finds an empty slot.
      if (storedEarliestPlusOne === 0) {
        deltaAminusBKeyTable[hashIndex] = deltaAminusB;
        deltaAminusCKeyTable[hashIndex] = deltaAminusC;
        earliestPrefixIndexPlusOneTable[hashIndex] = currentPrefixIndex + 1;
        break;
      }

      // Compute candidate length when the same delta state reappears.
      if (deltaAminusBKeyTable[hashIndex] === deltaAminusB && deltaAminusCKeyTable[hashIndex] === deltaAminusC) {
        const earliestPrefixIndex = storedEarliestPlusOne - 1;
        const candidateLength = currentPrefixIndex - earliestPrefixIndex;
        if (candidateLength > bestLength) {
          bestLength = candidateLength;
        }
        break;
      }

      // Linear probe to resolve collisions.
      hashIndex = (hashIndex + 1) & hashMask;
    }

    // AB-only segment tracker: reset on 'c', otherwise update differenceAB and query the earliest occurrence.
    if (currentCharacterCode === 2) {
      currentStampForAB += 1;
      differenceAB = 0;
      seenStampForAB[differenceIndexOffset] = currentStampForAB;
      earliestPrefixIndexForAB[differenceIndexOffset] = currentPrefixIndex;
    } else {
      if (currentCharacterCode === 0) {
        differenceAB += 1;
      } else {
        differenceAB -= 1;
      }
      const differenceTableIndexAB = differenceAB + differenceIndexOffset;
      if (seenStampForAB[differenceTableIndexAB] === currentStampForAB) {
        const candidateLength = currentPrefixIndex - earliestPrefixIndexForAB[differenceTableIndexAB];
        if (candidateLength > bestLength) {
          bestLength = candidateLength;
        }
      } else {
        seenStampForAB[differenceTableIndexAB] = currentStampForAB;
        earliestPrefixIndexForAB[differenceTableIndexAB] = currentPrefixIndex;
      }
    }

    // AC-only segment tracker: reset on 'b', otherwise update differenceAC and query earliest occurrence.
    if (currentCharacterCode === 1) {
      currentStampForAC += 1;
      differenceAC = 0;
      seenStampForAC[differenceIndexOffset] = currentStampForAC;
      earliestPrefixIndexForAC[differenceIndexOffset] = currentPrefixIndex;
    } else {
      if (currentCharacterCode === 0) {
        differenceAC += 1;
      } else {
        differenceAC -= 1;
      }
      const differenceTableIndexAC = differenceAC + differenceIndexOffset;
      if (seenStampForAC[differenceTableIndexAC] === currentStampForAC) {
        const candidateLength = currentPrefixIndex - earliestPrefixIndexForAC[differenceTableIndexAC];
        if (candidateLength > bestLength) {
          bestLength = candidateLength;
        }
      } else {
        seenStampForAC[differenceTableIndexAC] = currentStampForAC;
        earliestPrefixIndexForAC[differenceTableIndexAC] = currentPrefixIndex;
      }
    }

    // BC-only segment tracker: reset on 'a', otherwise update differenceBC and query earliest occurrence.
    if (currentCharacterCode === 0) {
      currentStampForBC += 1;
      differenceBC = 0;
      seenStampForBC[differenceIndexOffset] = currentStampForBC;
      earliestPrefixIndexForBC[differenceIndexOffset] = currentPrefixIndex;
    } else {
      if (currentCharacterCode === 1) {
        differenceBC += 1;
      } else {
        differenceBC -= 1;
      }
      const differenceTableIndexBC = differenceBC + differenceIndexOffset;
      if (seenStampForBC[differenceTableIndexBC] === currentStampForBC) {
        const candidateLength = currentPrefixIndex - earliestPrefixIndexForBC[differenceTableIndexBC];
        if (candidateLength > bestLength) {
          bestLength = candidateLength;
        }
      } else {
        seenStampForBC[differenceTableIndexBC] = currentStampForBC;
        earliestPrefixIndexForBC[differenceTableIndexBC] = currentPrefixIndex;
      }
    }
  }

  // Merge the final run-length into the answer after the scan completes.
  if (currentRunLength > bestLength) {
    bestLength = currentRunLength;
  }

  return bestLength;
}
