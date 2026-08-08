interface TextEncoderLike {
  encodeInto(source: string, destination: Uint8Array): { read: number; written: number };
}

interface GlobalScopeWithTextEncoder {
  TextEncoder?: new () => TextEncoderLike;
}

const globalScope = globalThis as unknown as GlobalScopeWithTextEncoder;
const textEncoderConstructor = globalScope.TextEncoder;
const sharedTextEncoder: TextEncoderLike | null =
  typeof textEncoderConstructor === "function" ? new textEncoderConstructor() : null;

/**
 * Converts a lowercase ASCII string into a byte buffer carrying one trailing
 * zero sentinel, so that reading a single position past the end stays in bounds.
 * @param value The lowercase ASCII string to convert.
 * @returns A Uint8Array of length value.length + 1 holding every character code.
 */
function toCharacterCodes(value: string): Uint8Array {
  const length = value.length;
  const characterCodes = new Uint8Array(length + 1);
  if (sharedTextEncoder !== null) {
    // Native encoding copies the whole ASCII payload in one pass
    sharedTextEncoder.encodeInto(value, characterCodes);
    return characterCodes;
  }
  for (let index = 0; index < length; index++) {
    characterCodes[index] = value.charCodeAt(index);
  }
  return characterCodes;
}

/**
 * Finds the lexicographically smallest ascending index sequence of word1 whose
 * concatenation is almost equal to word2 (at most one differing character).
 * @param word1 The source string the indices are picked from.
 * @param word2 The target string that must be matched with at most one change.
 * @returns The smallest valid index sequence, or an empty array when none exists.
 */
function validSequence(word1: string, word2: string): number[] {
  const sourceLength = word1.length;
  const targetLength = word2.length;
  const sourceCodes = toCharacterCodes(word1);
  const targetCodes = toCharacterCodes(word2);

  // latestStart[j] = greatest index i such that word2[j..] is a subsequence of word1[i..]
  const latestStart = new Int32Array(targetLength + 1);
  latestStart[targetLength] = sourceLength;

  let targetCursor = targetLength - 1;
  let sourceCursor = sourceLength - 1;
  while (targetCursor >= 0 && sourceCursor >= 0) {
    if (sourceCodes[sourceCursor] === targetCodes[targetCursor]) {
      // Matching greedily from the right keeps every suffix start as late as possible
      latestStart[targetCursor] = sourceCursor;
      targetCursor--;
    }
    sourceCursor--;
  }

  // Suffixes that never finished matching can never be placed anywhere
  if (targetCursor >= 0) {
    latestStart.fill(-1, 0, targetCursor + 1);
  }

  const result: number[] = new Array(targetLength);
  let matchedCount = 0;
  let sourceIndex = 0;
  let mismatchSpent = false;

  // Phase 1: the single allowed change is still available
  while (sourceIndex < sourceLength && matchedCount < targetLength) {
    if (sourceCodes[sourceIndex] === targetCodes[matchedCount]) {
      result[matchedCount] = sourceIndex;
      matchedCount++;
    } else if (sourceIndex < latestStart[matchedCount + 1]) {
      // Spending the change at the earliest feasible index keeps the answer smallest
      result[matchedCount] = sourceIndex;
      matchedCount++;
      mismatchSpent = true;
      sourceIndex++;
      break;
    }
    sourceIndex++;
  }

  // Phase 2: the change is used up, so the remainder is a plain subsequence scan
  if (mismatchSpent) {
    while (sourceIndex < sourceLength && matchedCount < targetLength) {
      if (sourceCodes[sourceIndex] === targetCodes[matchedCount]) {
        result[matchedCount] = sourceIndex;
        matchedCount++;
      }
      sourceIndex++;
    }
  }

  if (matchedCount < targetLength) {
    return [];
  }
  return result;
}
