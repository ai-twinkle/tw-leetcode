// Precompute once at module load
const MODULUS = 1_000_000_007;
const MAX_INPUT_LENGTH = 100_000;

// A global cache of 2^i % MODULUS for 0 ≤ i < MAX_INPUT_LENGTH.
// This lets every call to numSubseq do O(1) lookups instead of O(n) recomputation.
const powerOfTwoCache = new Uint32Array(MAX_INPUT_LENGTH);
powerOfTwoCache[0] = 1;
for (let i = 1; i < MAX_INPUT_LENGTH; i++) {
  // Double previous, then subtract MODULUS if we overflow it (avoiding the costly % operator)
  const doubled = powerOfTwoCache[i - 1] << 1;
  powerOfTwoCache[i] = doubled >= MODULUS ? doubled - MODULUS : doubled;
}

function numSubseq(nums: number[], target: number): number {
  // 1. Copy & numeric-sort via a typed array (no JS comparator overhead)
  const sortedNumbers = new Int32Array(nums);
  sortedNumbers.sort();

  // 2. Two-pointer sweep counting all valid subsequences
  let leftIndex = 0;
  let rightIndex = sortedNumbers.length - 1;
  let resultCount = 0;

  while (leftIndex <= rightIndex) {
    const currentSum = sortedNumbers[leftIndex] + sortedNumbers[rightIndex];

    if (currentSum > target) {
      // If the sum is too high, we need to move the right pointer left
      rightIndex--;
      continue;
    }

    // All subsequences where sortedNumbers[leftIndex] is the min
    // and any subset of the elements between leftIndex+1 and rightIndex:
    const span = rightIndex - leftIndex;
    resultCount += powerOfTwoCache[span];

    // Fast mod-reduce (resultCount < 2*MODULUS here)
    if (resultCount >= MODULUS) {
      resultCount -= MODULUS;
    }
    leftIndex++;
  }

  return resultCount;
}
