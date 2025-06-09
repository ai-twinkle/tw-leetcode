function clearStars(s: string): string {
  const stringLength = s.length;
  const deletionFlags = new Uint8Array(stringLength);

  // For each letter ’a’..’z’, store the head of a linked-list of positions
  const letterBucketHeads = new Int32Array(26).fill(-1);
  // nextIndexInBucket[i] = next node after i in its letter’s bucket
  const nextIndexInBucket = new Int32Array(stringLength);

  // Bit k of nonEmptyBucketMask is set iff bucket k has at least one element
  let nonEmptyBucketMask = 0;
  let totalStarCount = 0;

  const ASTERISK_CHAR_CODE = '*'.charCodeAt(0);
  const LOWERCASE_A_CHAR_CODE = 'a'.charCodeAt(0);

  // Single pass: assign deletions as we go
  for (let currentPosition = 0; currentPosition < stringLength; currentPosition++) {
    const charCode = s.charCodeAt(currentPosition);

    if (charCode === ASTERISK_CHAR_CODE) {
      // Mark this ’*’ for deletion
      deletionFlags[currentPosition] = 1;
      totalStarCount++;

      // Find the smallest non-empty bucket in O(1)
      const lowestSetBit = nonEmptyBucketMask & -nonEmptyBucketMask;
      const smallestNonEmptyBucketIndex = 31 - Math.clz32(lowestSetBit);

      // Pop one letter from that bucket and mark it deleted
      const removedLetterPosition = letterBucketHeads[smallestNonEmptyBucketIndex];
      deletionFlags[removedLetterPosition] = 1;
      letterBucketHeads[smallestNonEmptyBucketIndex] =
        nextIndexInBucket[removedLetterPosition];

      // If that bucket is now empty, clear its bit
      if (letterBucketHeads[smallestNonEmptyBucketIndex] === -1) {
        nonEmptyBucketMask ^= lowestSetBit;
      }

    } else {
      // Push this letter’s index onto its bucket
      const bucketIndex = charCode - LOWERCASE_A_CHAR_CODE;
      nextIndexInBucket[currentPosition] = letterBucketHeads[bucketIndex];
      letterBucketHeads[bucketIndex] = currentPosition;
      // Mark this bucket as non-empty
      nonEmptyBucketMask |= (1 << bucketIndex);
    }
  }

  // Build the result in one more pass
  const resultLength = stringLength - 2 * totalStarCount;
  const resultCharacters: string[] = new Array(resultLength);
  let writeIndex = 0;

  for (let currentPosition = 0; currentPosition < stringLength; currentPosition++) {
    if (deletionFlags[currentPosition] === 0) {
      resultCharacters[writeIndex++] = s[currentPosition];
    }
  }

  return resultCharacters.join('');
}
