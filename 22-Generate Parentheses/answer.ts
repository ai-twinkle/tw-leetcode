const MAXIMUM_PAIR_COUNT = 8;

// Answers are cached outside the function, so each pair count is generated at most once per run
const COMBINATION_CACHE: string[][] = new Array(MAXIMUM_PAIR_COUNT + 1);

/**
 * Enumerates every well-formed combination for one specific pair count.
 *
 * @param pairCount Number of parenthesis pairs to place.
 * @returns All well-formed combinations built from exactly `pairCount` pairs.
 */
function buildCombinationsForPairCount(pairCount: number): string[] {
  const totalLength = pairCount << 1;
  const combinations: string[] = [];

  /**
   * Grows a valid prefix by one character until a full combination is formed.
   *
   * @param prefix Valid prefix built so far.
   * @param placedLength Number of characters already in the prefix.
   * @param openCount Number of '(' already placed.
   * @param unclosedCount Number of '(' still waiting for its match.
   */
  function extendPrefix(
    prefix: string,
    placedLength: number,
    openCount: number,
    unclosedCount: number,
  ): void {
    // Counting placed characters avoids re-reading the string length on every leaf
    if (placedLength === totalLength) {
      combinations.push(prefix);
      return;
    }

    // An opening bracket is legal while the pair budget is not exhausted
    if (openCount < pairCount) {
      extendPrefix(prefix + '(', placedLength + 1, openCount + 1, unclosedCount + 1);
    }

    // A closing bracket is legal only while some opening bracket is still unmatched
    if (unclosedCount > 0) {
      extendPrefix(prefix + ')', placedLength + 1, openCount, unclosedCount - 1);
    }
  }

  extendPrefix('', 0, 0, 0);

  return combinations;
}

function generateParenthesis(n: number): string[] {
  const cachedCombinations = COMBINATION_CACHE[n];

  // Repeated queries for the same pair count resolve to a single array lookup
  if (cachedCombinations !== undefined) {
    return cachedCombinations;
  }

  const combinations = buildCombinationsForPairCount(n);
  COMBINATION_CACHE[n] = combinations;

  return combinations;
}
