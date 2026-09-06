// English letters fit in the first 128 ASCII slots.
const ALPHABET_SIZE = 128;

/**
 * Counts how many distinct subsequences of s are equal to t.
 * @param s - The source string that subsequences are taken from.
 * @param t - The target string every subsequence must match.
 * @returns The number of distinct subsequences of s equal to t.
 */
function numDistinct(s: string, t: string): number {
  const sourceLength = s.length;
  const targetLength = t.length;

  if (targetLength > sourceLength) {
    return 0;
  }

  // Cache the character codes of t once and count each letter.
  const targetCodes = new Uint8Array(targetLength);
  const targetCounts = new Int32Array(ALPHABET_SIZE);
  for (let index = 0; index < targetLength; index++) {
    const code = t.charCodeAt(index);
    targetCodes[index] = code;
    targetCounts[code]++;
  }

  // Drop every character of s that can never match a character of t.
  const filteredSource = new Uint8Array(sourceLength);
  const sourceCounts = new Int32Array(ALPHABET_SIZE);
  let filteredLength = 0;
  for (let index = 0; index < sourceLength; index++) {
    const code = s.charCodeAt(index);
    if (targetCounts[code] !== 0) {
      filteredSource[filteredLength++] = code;
      sourceCounts[code]++;
    }
  }

  if (filteredLength < targetLength) {
    return 0;
  }

  // If t needs a letter more often than s supplies it, no match can exist.
  for (let code = 0; code < ALPHABET_SIZE; code++) {
    if (sourceCounts[code] < targetCounts[code]) {
      return 0;
    }
  }

  // Bucket layout: bucketStart[code] .. bucketStart[code + 1] holds the positions of that letter in t.
  const bucketStart = new Int32Array(ALPHABET_SIZE + 1);
  for (let code = 0; code < ALPHABET_SIZE; code++) {
    bucketStart[code + 1] = bucketStart[code] + targetCounts[code];
  }

  // Fill each bucket while walking t backwards, so positions end up in descending order.
  const bucketCursor = bucketStart.slice(0, ALPHABET_SIZE);
  const targetPositions = new Int32Array(targetLength);
  for (let index = targetLength - 1; index >= 0; index--) {
    const code = targetCodes[index];
    targetPositions[bucketCursor[code]++] = index;
  }

  // ways[prefix] = number of ways to build t[0 .. prefix - 1] from the scanned part of s.
  const ways = new Int32Array(targetLength + 1);
  ways[0] = 1;

  // Int32Array stores wrap modulo 2^32, which still yields the exact answer because it fits in a signed 32-bit integer.
  const positionOffset = targetLength - filteredLength;
  for (let index = 0; index < filteredLength; index++) {
    const code = filteredSource[index];
    const bucketEnd = bucketStart[code + 1];
    // Positions above this index are unreachable; positions below it can no longer finish t.
    const maxPosition = index;
    const minPosition = positionOffset + index;
    for (let bucketIndex = bucketStart[code]; bucketIndex < bucketEnd; bucketIndex++) {
      const position = targetPositions[bucketIndex];
      if (position > maxPosition) {
        continue;
      }
      if (position < minPosition) {
        break;
      }
      // Descending order guarantees ways[position] is still the previous-row value.
      ways[position + 1] += ways[position];
    }
  }

  return ways[targetLength];
}
