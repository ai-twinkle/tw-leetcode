function minimumDeletions(word: string, k: number): number {
  const length = word.length;
  // Trivial cases
  if (length === 0 || k >= length) {
    return 0;
  }

  // 1. Count each character (typed array for speed)
  const characterCounts = new Uint32Array(26);
  const asciiOffset = 97;
  for (let i = 0; i < length; i++) {
    characterCounts[word.charCodeAt(i) - asciiOffset]++;
  }

  // 2. Extract only non-zero counts, track min/max for an early exit
  const frequencies = new Uint32Array(26);
  let distinctCount = 0;
  let maxFrequency = 0;
  let minFrequency = length + 1;
  for (let c = 0; c < 26; c++) {
    const freq = characterCounts[c];
    if (freq <= 0) {
      continue;
    }

    frequencies[distinctCount++] = freq;
    if (freq > maxFrequency) {
      maxFrequency = freq;
    }
    if (freq < minFrequency) {
      minFrequency = freq;
    }
  }
  if (distinctCount <= 1 || maxFrequency - minFrequency <= k) {
    return 0;
  }

  // 3. Insertion-sort only the first `distinctCount` slots (cheap for ≤26 elements)
  for (let i = 1; i < distinctCount; i++) {
    const key = frequencies[i];
    let j = i - 1;
    while (j >= 0 && frequencies[j] > key) {
      frequencies[j + 1] = frequencies[j];
      j--;
    }
    frequencies[j + 1] = key;
  }

  // 4. Build a typed prefix-sum array
  const prefixSum = new Uint32Array(distinctCount + 1);
  for (let i = 0; i < distinctCount; i++) {
    prefixSum[i + 1] = prefixSum[i] + frequencies[i];
  }
  const totalSum = prefixSum[distinctCount];

  // 5. One sliding window over [low, low + k], including low=0 as left = -1
  let minimumDeletionsNeeded = length;
  let rightPointer = 0;
  for (let leftPointer = -1; leftPointer < distinctCount; leftPointer++) {
    const lowFreq = leftPointer >= 0 ? frequencies[leftPointer] : 0;
    const highFreq = lowFreq + k;

    // Advance rightPointer until frequencies[rightPointer] > highFreq
    while (rightPointer < distinctCount && frequencies[rightPointer] <= highFreq) {
      rightPointer++;
    }

    // Delete everything below lowFreq
    const deletionsFromLower = leftPointer >= 0
      ? prefixSum[leftPointer]
      : 0;

    // Delete everything above highFreq
    const sumAbove = totalSum - prefixSum[rightPointer];
    const countAbove = distinctCount - rightPointer;
    const deletionsFromUpper = sumAbove - countAbove * highFreq;

    const totalDeletions = deletionsFromLower + deletionsFromUpper;
    if (totalDeletions < minimumDeletionsNeeded) {
      minimumDeletionsNeeded = totalDeletions;
    }
  }

  return minimumDeletionsNeeded;
}
