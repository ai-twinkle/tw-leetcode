function getWordsInLongestSubsequence(
  words: string[],
  groups: number[]
): string[] {
  const itemCount = words.length;

  // 1. Convert groups to a typed array
  const groupIndices = new Uint16Array(groups);

  // 2. Precompute each word's character codes
  const wordCharCodes: Uint8Array[] = new Array(itemCount);
  for (let idx = 0; idx < itemCount; idx++) {
    const w = words[idx];
    const codes = new Uint8Array(w.length);
    for (let pos = 0; pos < w.length; pos++) {
      codes[pos] = w.charCodeAt(pos);
    }
    wordCharCodes[idx] = codes;
  }

  // 3. DP arrays: dpLength[i] = max subseq length ending at i; previousIndex[i] = prior index
  const dpLength = new Uint16Array(itemCount);
  dpLength.fill(1);                     // every index alone is length=1
  const previousIndex = new Int16Array(itemCount);
  previousIndex.fill(-1);               // -1 means “no predecessor”

  // 4. Map word‐length → list of indices (so we only compare same‐length words)
  const lengthToIndices = new Map<number, number[]>();

  // 5. Main DP loop
  for (let currentIndex = 0; currentIndex < itemCount; currentIndex++) {
    const currentCodes = wordCharCodes[currentIndex];
    const currentLength = currentCodes.length;
    const currentGroup = groupIndices[currentIndex];

    const bucket = lengthToIndices.get(currentLength);
    if (bucket) {
      for (const candidateIndex of bucket) {
        const candidateDp = dpLength[candidateIndex];
        // only consider if it would improve dpLength[currentIndex]
        if (
          candidateDp + 1 > dpLength[currentIndex] &&
          groupIndices[candidateIndex] !== currentGroup
        ) {
          // check Hamming distance = 1 with early exit
          let differences = 0;
          const candidateCodes = wordCharCodes[candidateIndex];
          for (let p = 0; p < currentLength; p++) {
            if (candidateCodes[p] !== currentCodes[p] && ++differences > 1) {
              break;
            }
          }
          if (differences === 1) {
            dpLength[currentIndex] = candidateDp + 1;
            previousIndex[currentIndex] = candidateIndex;
          }
        }
      }
      bucket.push(currentIndex);
    } else {
      lengthToIndices.set(currentLength, [currentIndex]);
    }
  }

  // 6. Find the index with the maximum dpLength
  let bestIndex = 0;
  let bestValue = dpLength[0];
  for (let i = 1; i < itemCount; i++) {
    const v = dpLength[i];
    if (v > bestValue) {
      bestValue = v;
      bestIndex = i;
    }
  }

  // 7. Reconstruct the subsequence by backtracking
  const resultIndices: number[] = [];
  for (let i = bestIndex; i >= 0; i = previousIndex[i]) {
    resultIndices.push(i);
    if (previousIndex[i] < 0) {
      break;
    }
  }
  resultIndices.reverse();

  // 8. Map indices back to words
  return resultIndices.map(i => words[i]);
}
