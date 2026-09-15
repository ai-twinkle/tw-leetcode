/**
 * Fills the maximal palindromic radii for every centre using Manacher's algorithm.
 * oddRadius[i] covers s[i - r + 1 .. i + r - 1]; evenRadius[i] covers s[i - r .. i + r - 1].
 * @param characterCodes - Character codes of the source string.
 * @param oddRadius - Output buffer for odd-length palindromic radii.
 * @param evenRadius - Output buffer for even-length palindromic radii.
 */
function buildPalindromicRadii(
  characterCodes: Uint8Array,
  oddRadius: Int32Array,
  evenRadius: Int32Array,
): void {
  const length = characterCodes.length;

  // Odd-length pass: mirror the radius of the already known palindrome when inside it.
  let windowLeft = 0;
  let windowRight = -1;
  for (let center = 0; center < length; center++) {
    let radius: number;
    if (center > windowRight) {
      radius = 1;
    } else {
      const mirrored = oddRadius[windowLeft + windowRight - center];
      const bound = windowRight - center + 1;
      radius = mirrored < bound ? mirrored : bound;
    }
    while (
      center + radius < length &&
      center - radius >= 0 &&
      characterCodes[center + radius] === characterCodes[center - radius]
      ) {
      radius++;
    }
    oddRadius[center] = radius;
    radius--;
    if (center + radius > windowRight) {
      windowLeft = center - radius;
      windowRight = center + radius;
    }
  }

  // Even-length pass: the centre sits between index center - 1 and center.
  windowLeft = 0;
  windowRight = -1;
  for (let center = 0; center < length; center++) {
    let radius: number;
    if (center > windowRight) {
      radius = 0;
    } else {
      const mirrored = evenRadius[windowLeft + windowRight - center + 1];
      const bound = windowRight - center + 1;
      radius = mirrored < bound ? mirrored : bound;
    }
    while (
      center + radius < length &&
      center - radius - 1 >= 0 &&
      characterCodes[center + radius] === characterCodes[center - radius - 1]
      ) {
      radius++;
    }
    evenRadius[center] = radius;
    radius--;
    if (center + radius > windowRight) {
      windowLeft = center - radius - 1;
      windowRight = center + radius;
    }
  }
}

/**
 * Counts the maximum number of non-overlapping palindromic substrings of length >= k.
 * @param s - The source string.
 * @param k - Minimum length of every selected palindrome.
 * @returns The maximum number of selectable substrings.
 */
function maxPalindromes(s: string, k: number): number {
  const length = s.length;

  // Every single character is a palindrome, so the whole string can be split.
  if (k === 1) {
    return length;
  }
  if (k > length) {
    return 0;
  }

  const characterCodes = new Uint8Array(length);
  for (let index = 0; index < length; index++) {
    characterCodes[index] = s.charCodeAt(index);
  }

  const oddRadius = new Int32Array(length);
  const evenRadius = new Int32Array(length);
  buildPalindromicRadii(characterCodes, oddRadius, evenRadius);

  let selectedCount = 0;
  let nextAllowedStart = 0;

  if ((k & 1) === 1) {
    // Odd k: length k and length k + 1 windows share the very same centre index.
    const requiredRadius = (k + 1) >> 1;
    const centerOffset = (k - 1) >> 1;
    for (let right = k - 1; right < length; right++) {
      const center = right - centerOffset;
      // Prefer the shortest window ending here so later positions stay free.
      if (right - k + 1 >= nextAllowedStart && oddRadius[center] >= requiredRadius) {
        selectedCount++;
        nextAllowedStart = right + 1;
        continue;
      }
      if (right - k >= nextAllowedStart && evenRadius[center] >= requiredRadius) {
        selectedCount++;
        nextAllowedStart = right + 1;
      }
    }
  } else {
    // Even k: the length k window is even, the length k + 1 fallback is odd.
    const halfLength = k >> 1;
    for (let right = k - 1; right < length; right++) {
      if (right - k + 1 >= nextAllowedStart && evenRadius[right - halfLength + 1] >= halfLength) {
        selectedCount++;
        nextAllowedStart = right + 1;
        continue;
      }
      if (right - k >= nextAllowedStart && oddRadius[right - halfLength] >= halfLength + 1) {
        selectedCount++;
        nextAllowedStart = right + 1;
      }
    }
  }

  return selectedCount;
}
