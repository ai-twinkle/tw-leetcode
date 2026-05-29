function stringIndices(wordsContainer: string[], wordsQuery: string[]): number[] {
  const containerCount = wordsContainer.length;
  const queryCount = wordsQuery.length;

  // Sum of container lengths bounds the maximum number of trie nodes
  let totalCharacterCount = 0;
  for (let containerIndex = 0; containerIndex < containerCount; containerIndex++) {
    totalCharacterCount += wordsContainer[containerIndex].length;
  }

  // Reserve one extra slot for the root node
  const maxNodeCount = totalCharacterCount + 1;

  // Flat trie: child of node n on character c lives at index n * 26 + c (0 means no child)
  const trieChildren = new Int32Array(maxNodeCount * 26);
  // Best container index recorded at each trie node
  const bestIndexAtNode = new Int32Array(maxNodeCount);
  // Length of that best container word, cached to avoid double lookups during comparison
  const bestLengthAtNode = new Int32Array(maxNodeCount);

  // Seed the root with the very first container word as a starting best
  bestIndexAtNode[0] = 0;
  bestLengthAtNode[0] = wordsContainer[0].length;

  // Next free node identifier (node 0 is reserved for the root)
  let nodeCounter = 1;

  // Insert every container word into the trie in reversed character order
  for (let containerIndex = 0; containerIndex < containerCount; containerIndex++) {
    const currentWord = wordsContainer[containerIndex];
    const currentLength = currentWord.length;

    // Update root for the empty-common-suffix fallback when this word is strictly shorter
    if (currentLength < bestLengthAtNode[0]) {
      bestLengthAtNode[0] = currentLength;
      bestIndexAtNode[0] = containerIndex;
    }

    let currentNode = 0;

    // Walk from the last character toward the first to build the suffix path
    for (let charPosition = currentLength - 1; charPosition >= 0; charPosition--) {
      const charCode = currentWord.charCodeAt(charPosition) - 97;
      const childOffset = currentNode * 26 + charCode;
      let childNode = trieChildren[childOffset];

      if (childNode === 0) {
        // Create a fresh node and seed its best with the current word
        childNode = nodeCounter;
        nodeCounter++;
        trieChildren[childOffset] = childNode;
        bestIndexAtNode[childNode] = containerIndex;
        bestLengthAtNode[childNode] = currentLength;
      } else if (currentLength < bestLengthAtNode[childNode]) {
        // Strict-less keeps the earliest occurrence on length ties
        bestLengthAtNode[childNode] = currentLength;
        bestIndexAtNode[childNode] = containerIndex;
      }

      currentNode = childNode;
    }
  }

  // Allocate the result array once with the exact size to keep elements packed
  const resultIndices: number[] = new Array(queryCount);

  // Resolve each query by descending the trie as far as the reversed query allows
  for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
    const queryWord = wordsQuery[queryIndex];
    const queryLength = queryWord.length;

    let currentNode = 0;

    for (let charPosition = queryLength - 1; charPosition >= 0; charPosition--) {
      const charCode = queryWord.charCodeAt(charPosition) - 97;
      const childNode = trieChildren[currentNode * 26 + charCode];
      // Stop the descent when no further suffix match exists
      if (childNode === 0) {
        break;
      }
      currentNode = childNode;
    }

    // Deepest reached node already stores the optimal container index
    resultIndices[queryIndex] = bestIndexAtNode[currentNode];
  }

  return resultIndices;
}
