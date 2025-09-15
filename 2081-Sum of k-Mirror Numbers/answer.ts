const kMirrorPrefixSums: Record<number, number[]> = {};

/**
 * Build a decimal palindrome from its prefix.
 * @param {number} prefix - The starting number for the first half of the palindrome.
 * @param {boolean} oddLength - Whether the total length should be odd.
 * @returns {number} The constructed decimal palindrome.
 */
function buildPalindrome(prefix: number, oddLength: boolean): number {
  let pal = prefix;
  let remainder = oddLength ? Math.floor(prefix / 10) : prefix;
  while (remainder > 0) {
    pal = pal * 10 + (remainder % 10);
    remainder = Math.floor(remainder / 10);
  }
  return pal;
}

/**
 * Check if a value is a palindrome in the given radix (base).
 * @param {number} value - The decimal number to check.
 * @param {number} radix - The target base.
 * @param {Uint8Array} digitBuffer - A reusable buffer for digit extraction.
 * @returns {boolean} Whether the value is a palindrome in the given base.
 */
function isPalindromeInBase(value: number, radix: number, digitBuffer: Uint8Array): boolean {
  if (radix === 2) {
    // Bit-reverse trick for base-2
    let original = value;
    let reversed = 0;
    while (original > 0) {
      reversed = (reversed << 1) | (original & 1);
      original >>>= 1;
    }
    return reversed === value;
  } else {
    let length = 0, t = value;
    while (t > 0) {
      digitBuffer[length++] = t % radix;
      t = Math.floor(t / radix);
    }
    for (let i = 0, j = length - 1; i < j; i++, j--) {
      if (digitBuffer[i] !== digitBuffer[j]) return false;
    }
    return true;
  }
}

/**
 * Compute and cache prefix sums of the first 30 k-mirror numbers for a given radix.
 * @param {number} radix - The base in which to compute k-mirror numbers (2, 3, 4, etc.).
 * @returns {number[]} An array of prefix sums of k-mirror numbers in the specified base.
 */
function getKMirrorPrefixSums(radix: number): number[] {
  if (kMirrorPrefixSums[radix]) {
    return kMirrorPrefixSums[radix];
  }

  const digitBuffer = new Uint8Array(64);
  const mirrorNumbers: number[] = [];
  const maxNeeded = 30;

  // Generate palindromes in increasing decimal order
  for (let decimalLength = 1; mirrorNumbers.length < maxNeeded; decimalLength++) {
    const halfLen = (decimalLength + 1) >> 1;
    const start = halfLen === 1 ? 1 : 10 ** (halfLen - 1);
    const end = 10 ** halfLen;
    const odd = (decimalLength & 1) !== 0;

    for (
      let prefix = start;
      prefix < end && mirrorNumbers.length < maxNeeded;
      prefix++
    ) {
      const candidate = buildPalindrome(prefix, odd);
      if (isPalindromeInBase(candidate, radix, digitBuffer)) {
        mirrorNumbers.push(candidate);
      }
    }
  }

  // Build and cache prefix sums
  const prefixSums = new Array<number>(mirrorNumbers.length);
  let runningTotal = 0;
  for (let i = 0; i < mirrorNumbers.length; i++) {
    runningTotal += mirrorNumbers[i];
    prefixSums[i] = runningTotal;
  }

  kMirrorPrefixSums[radix] = prefixSums;
  return prefixSums;
}

/**
 * Return the sum of the first `n` k-mirror numbers in base `k`.
 * @param {number} k - The base in which to compute k-mirror numbers.
 * @param {number} n - The number of k-mirror numbers to sum.
 * @returns {number} The sum of the first `n` k-mirror numbers in base `k`.
 */
function kMirror(k: number, n: number): number {
  const sums = getKMirrorPrefixSums(k);
  return sums[n - 1];
}
