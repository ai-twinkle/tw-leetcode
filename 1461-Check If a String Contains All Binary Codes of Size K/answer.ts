// Precompute bit masks and total code counts for k in [1..20] (k <= 20 by constraint).
const totalBinaryCodesByLength = new Int32Array(21);
const rollingMaskByLength = new Int32Array(21);

/**
 * Precompute 2^k and rolling window masks (2^k - 1) once,
 * so each function call avoids repeated bit shift computation.
 */
(function precomputeCache() {
  for (let codeLength = 1; codeLength <= 20; codeLength++) {
    const totalCodes = 1 << codeLength;
    totalBinaryCodesByLength[codeLength] = totalCodes;
    rollingMaskByLength[codeLength] = totalCodes - 1;
  }
})();

function hasAllCodes(s: string, k: number): boolean {
  const stringLength = s.length;

  // No substring of length k can exist.
  if (k > stringLength) {
    return false;
  }

  const totalCodes = totalBinaryCodesByLength[k];
  const numberOfWindows = stringLength - k + 1;

  // Not enough windows to cover all possible k-bit codes.
  if (totalCodes > numberOfWindows) {
    return false;
  }

  // Bitset reduces memory footprint for large k (max 2^20 states).
  const bitsetWordCount = (totalCodes + 31) >>> 5;
  const seenCodesBitset = new Uint32Array(bitsetWordCount);
  let remainingCodes = totalCodes;

  // Build initial k-bit rolling value.
  let rollingValue = 0;
  let index = 0;

  // Use charCodeAt & 1 to convert '0'/'1' to 0/1 with minimal overhead.
  while (index < k) {
    rollingValue = (rollingValue << 1) | (s.charCodeAt(index) & 1);
    index++;
  }

  // Mark first window.
  let bitsetWordIndex = rollingValue >>> 5;
  let bitsetBitMask = 1 << (rollingValue & 31);
  seenCodesBitset[bitsetWordIndex] |= bitsetBitMask;
  remainingCodes--;

  if (remainingCodes === 0) {
    return true;
  }

  const rollingMask = rollingMaskByLength[k];

  // Slide window in O(1) per step using rolling hash.
  for (let rightIndex = k; rightIndex < stringLength; rightIndex++) {
    rollingValue = ((rollingValue << 1) & rollingMask) | (s.charCodeAt(rightIndex) & 1);

    bitsetWordIndex = rollingValue >>> 5;
    bitsetBitMask = 1 << (rollingValue & 31);

    if ((seenCodesBitset[bitsetWordIndex] & bitsetBitMask) === 0) {
      // Only count newly discovered codes.
      seenCodesBitset[bitsetWordIndex] |= bitsetBitMask;
      remainingCodes--;

      if (remainingCodes === 0) {
        return true;
      }
    }
  }

  return false;
}
