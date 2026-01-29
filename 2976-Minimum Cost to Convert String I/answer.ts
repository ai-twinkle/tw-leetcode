function minimumCost(source: string, target: string, original: string[], changed: string[], cost: number[]): number {
  const ALPHABET_SIZE = 26;
  const INF = 1e18;

  // Flattened 26x26 distance matrix to minimize allocation and access overhead
  const distance = new Float64Array(ALPHABET_SIZE * ALPHABET_SIZE);

  // Initialize all transformation costs to infinity
  for (let index = 0; index < distance.length; index++) {
    distance[index] = INF;
  }

  // Zero cost to convert a character to itself
  for (let characterIndex = 0; characterIndex < ALPHABET_SIZE; characterIndex++) {
    distance[characterIndex * ALPHABET_SIZE + characterIndex] = 0;
  }

  // Store the minimum direct transformation cost for each (from → to) pair
  for (let ruleIndex = 0; ruleIndex < cost.length; ruleIndex++) {
    const fromCharacterIndex = original[ruleIndex].charCodeAt(0) - 97;
    const toCharacterIndex = changed[ruleIndex].charCodeAt(0) - 97;
    const ruleCost = cost[ruleIndex];

    const flatIndex = fromCharacterIndex * ALPHABET_SIZE + toCharacterIndex;
    const existingCost = distance[flatIndex];

    // Keep only the cheapest direct transformation
    if (ruleCost < existingCost) {
      distance[flatIndex] = ruleCost;
    }
  }

  // Precompute all-pairs minimum costs using Floyd–Warshall on 26 nodes
  for (let middle = 0; middle < ALPHABET_SIZE; middle++) {
    const middleRowBase = middle * ALPHABET_SIZE;

    for (let from = 0; from < ALPHABET_SIZE; from++) {
      const fromRowBase = from * ALPHABET_SIZE;
      const fromToMiddle = distance[fromRowBase + middle];

      // Skip unreachable intermediate paths early
      if (fromToMiddle === INF) {
        continue;
      }

      for (let to = 0; to < ALPHABET_SIZE; to++) {
        const middleToTo = distance[middleRowBase + to];

        // Skip unreachable destination paths
        if (middleToTo === INF) {
          continue;
        }

        const candidateCost = fromToMiddle + middleToTo;
        const flatIndex = fromRowBase + to;

        // Relax edge if a cheaper path is found
        if (candidateCost < distance[flatIndex]) {
          distance[flatIndex] = candidateCost;
        }
      }
    }
  }

  let totalCost = 0;
  const stringLength = source.length;

  // Accumulate cost for each character position independently
  for (let position = 0; position < stringLength; position++) {
    const sourceCharacterIndex = source.charCodeAt(position) - 97;
    const targetCharacterIndex = target.charCodeAt(position) - 97;

    // No cost if characters already match
    if (sourceCharacterIndex === targetCharacterIndex) {
      continue;
    }

    const stepCost =
      distance[sourceCharacterIndex * ALPHABET_SIZE + targetCharacterIndex];

    // Abort early if any required transformation is impossible
    if (stepCost === INF) {
      return -1;
    }

    totalCost += stepCost;
  }

  return totalCost;
}
