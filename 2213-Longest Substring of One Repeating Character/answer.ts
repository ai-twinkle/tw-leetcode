function longestRepeating(s: string, queryCharacters: string, queryIndices: number[]): number[] {
  const length = s.length;
  const queryCount = queryIndices.length;

  // Round the leaf count up to a power of two so the tree is perfect and index math stays branch free.
  const leafCount = 1 << (32 - Math.clz32(length - 1));
  const nodeCount = leafCount << 1;

  // Flat typed-array segment tree: node i has children (i << 1) and (i << 1 | 1), root is 1.
  const maxRun = new Int32Array(nodeCount);
  const prefixRun = new Int32Array(nodeCount);
  const suffixRun = new Int32Array(nodeCount);
  const prefixChar = new Int32Array(nodeCount);
  const suffixChar = new Int32Array(nodeCount);

  // Current character of every position, kept to skip queries that write the same letter back.
  const currentChar = new Int32Array(length);

  // Seed the real leaves straight from the char codes, avoiding any string split.
  for (let index = 0; index < length; index++) {
    const characterCode = s.charCodeAt(index);
    const leaf = leafCount + index;
    currentChar[index] = characterCode;
    maxRun[leaf] = 1;
    prefixRun[leaf] = 1;
    suffixRun[leaf] = 1;
    prefixChar[leaf] = characterCode;
    suffixChar[leaf] = characterCode;
  }

  // Padding leaves get pairwise distinct negative characters so they never merge with anything.
  for (let index = length; index < leafCount; index++) {
    const leaf = leafCount + index;
    const fillerCharacter = -1 - index;
    maxRun[leaf] = 1;
    prefixRun[leaf] = 1;
    suffixRun[leaf] = 1;
    prefixChar[leaf] = fillerCharacter;
    suffixChar[leaf] = fillerCharacter;
  }

  // Build level by level: every node on one level has children of the same known span.
  let childSpan = 1;
  let levelStart = leafCount >> 1;
  while (levelStart >= 1) {
    const levelEnd = levelStart << 1;
    for (let node = levelStart; node < levelEnd; node++) {
      const left = node << 1;
      const right = left | 1;
      const leftPrefixChar = prefixChar[left];
      const leftSuffixChar = suffixChar[left];
      const leftSuffixRun = suffixRun[left];
      const rightPrefixChar = prefixChar[right];
      const rightPrefixRun = prefixRun[right];

      // The prefix crosses into the right child only when the left child is one full run.
      let mergedPrefix = prefixRun[left];
      if (mergedPrefix === childSpan && leftPrefixChar === rightPrefixChar) {
        mergedPrefix += rightPrefixRun;
      }

      // Symmetrically, the suffix crosses into the left child only when the right child is one full run.
      let mergedSuffix = suffixRun[right];
      if (mergedSuffix === childSpan && suffixChar[right] === leftSuffixChar) {
        mergedSuffix += leftSuffixRun;
      }

      const leftMax = maxRun[left];
      const rightMax = maxRun[right];
      let bestRun = leftMax > rightMax ? leftMax : rightMax;

      // The only extra candidate is the run straddling the boundary between the two children.
      if (leftSuffixChar === rightPrefixChar) {
        const joinedRun = leftSuffixRun + rightPrefixRun;
        if (joinedRun > bestRun) {
          bestRun = joinedRun;
        }
      }

      maxRun[node] = bestRun;
      prefixRun[node] = mergedPrefix;
      suffixRun[node] = mergedSuffix;
      prefixChar[node] = leftPrefixChar;
      suffixChar[node] = suffixChar[right];
    }
    childSpan <<= 1;
    levelStart >>= 1;
  }

  const lengths: number[] = new Array(queryCount);
  for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
    const position = queryIndices[queryIndex];
    const characterCode = queryCharacters.charCodeAt(queryIndex);

    // A query that rewrites the same letter cannot change anything, so the whole climb is skipped.
    if (currentChar[position] !== characterCode) {
      currentChar[position] = characterCode;
      const leaf = leafCount + position;
      prefixChar[leaf] = characterCode;
      suffixChar[leaf] = characterCode;

      // Walk the single path from the touched leaf up to the root, recomputing each ancestor.
      let node = leaf >> 1;
      let span = 1;
      while (node >= 1) {
        const left = node << 1;
        const right = left | 1;
        const leftPrefixChar = prefixChar[left];
        const leftSuffixChar = suffixChar[left];
        const leftSuffixRun = suffixRun[left];
        const rightPrefixChar = prefixChar[right];
        const rightPrefixRun = prefixRun[right];
        const rightSuffixChar = suffixChar[right];

        let mergedPrefix = prefixRun[left];
        if (mergedPrefix === span && leftPrefixChar === rightPrefixChar) {
          mergedPrefix += rightPrefixRun;
        }

        let mergedSuffix = suffixRun[right];
        if (mergedSuffix === span && rightSuffixChar === leftSuffixChar) {
          mergedSuffix += leftSuffixRun;
        }

        const leftMax = maxRun[left];
        const rightMax = maxRun[right];
        let bestRun = leftMax > rightMax ? leftMax : rightMax;
        if (leftSuffixChar === rightPrefixChar) {
          const joinedRun = leftSuffixRun + rightPrefixRun;
          if (joinedRun > bestRun) {
            bestRun = joinedRun;
          }
        }

        // If this node is unchanged, every ancestor is unchanged too, so the climb can stop.
        if (maxRun[node] === bestRun && prefixRun[node] === mergedPrefix && suffixRun[node] === mergedSuffix
          && prefixChar[node] === leftPrefixChar && suffixChar[node] === rightSuffixChar) {
          break;
        }

        maxRun[node] = bestRun;
        prefixRun[node] = mergedPrefix;
        suffixRun[node] = mergedSuffix;
        prefixChar[node] = leftPrefixChar;
        suffixChar[node] = rightSuffixChar;

        node >>= 1;
        span <<= 1;
      }
    }

    // The root always holds the answer for the whole string.
    lengths[queryIndex] = maxRun[1];
  }

  return lengths;
}
