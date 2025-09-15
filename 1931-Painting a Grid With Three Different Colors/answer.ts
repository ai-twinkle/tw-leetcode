// The cache[rows] = adjacency list of compatible column-patterns
const compatibilityListCache: { [rows: number]: number[][] } = {};

/**
 * Build (and cache) all valid column-patterns of height `rows`
 * plus, for each pattern index, the list of all compatible pattern indices.
 * @param rows {number} - height of the column-patterns
 * @returns {number[][]} - adjacency list of compatible column-patterns
 */
function ensureCompatibilityList(rows: number): number[][] {
  // Return cached adjacency list if already computed for this `rows`
  if (compatibilityListCache[rows]) {
    return compatibilityListCache[rows];
  }

  // 1. Generate all valid patterns (column colorings) with no adjacent cells the same color
  const validColumnPatterns: number[][] = [];
  const currentPattern: number[] = new Array(rows);

  function generatePatterns(position: number): void {
    // Save a valid pattern when filled
    if (position === rows) {
      validColumnPatterns.push(currentPattern.slice());
      return;
    }

    for (let colorIndex = 0; colorIndex < 3; colorIndex++) {
      // Skip if same color as previous row (adjacent)
      if (position > 0 && currentPattern[position - 1] === colorIndex) {
        continue;
      }

      currentPattern[position] = colorIndex;
      generatePatterns(position + 1);
    }
  }

  generatePatterns(0);

  // 2. For each pattern, find all compatible patterns (next column)
  //    Patterns are compatible if no row in the same position has the same color
  const patternCount = validColumnPatterns.length;
  const compatibilityAdjacencyList: number[][] = Array.from(
    { length: patternCount },
    () => [],
  );

  for (let firstPatternIndex = 0; firstPatternIndex < patternCount; firstPatternIndex++) {
    const firstPattern = validColumnPatterns[firstPatternIndex];

    for (let secondPatternIndex = 0; secondPatternIndex < patternCount; secondPatternIndex++) {
      const secondPattern = validColumnPatterns[secondPatternIndex];
      let isCompatible = true;

      for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
        // Not compatible if any row has the same color in adjacent columns
        if (firstPattern[rowIndex] === secondPattern[rowIndex]) {
          isCompatible = false;
          break;
        }
      }

      // If compatible, add to the adjacency list
      if (isCompatible) {
        compatibilityAdjacencyList[firstPatternIndex].push(secondPatternIndex);
      }
    }
  }

  // Cache and return result
  compatibilityListCache[rows] = compatibilityAdjacencyList;
  return compatibilityAdjacencyList;
}

/**
 * Count the number of valid ways to color an m x n grid
 * - No two adjacent cells in a row or column have the same color (3 colors)
 * @param m {number} - number of rows in the grid
 * @param n {number} - number of columns in the grid
 * @return {number} - number of valid colorings (modulo 1_000_000_007)
 */
function colorTheGrid(m: number, n: number): number {
  const MODULO = 1_000_000_007;

  // 1. Precompute compatibility for all patterns of one column (height = m)
  const compatibilityAdjacencyList = ensureCompatibilityList(m);
  const patternCount = compatibilityAdjacencyList.length;

  // 2. DP buffer: waysForPreviousColumn[i] = #ways to paint up to previous column with the ending pattern i
  let waysForPreviousColumn = new Int32Array(patternCount).fill(1); // Base case: first column, all patterns valid
  let waysForCurrentColumn = new Int32Array(patternCount);          // Temp buffer for new column

  // 3. Process each column left-to-right (skip first column, which is the base-case)
  for (let columnIndex = 1; columnIndex < n; columnIndex++) {
    waysForCurrentColumn.fill(0);

    for (let previousPatternIndex = 0; previousPatternIndex < patternCount; previousPatternIndex++) {
      const waysCount = waysForPreviousColumn[previousPatternIndex];
      // Skip if no ways
      if (waysCount === 0) {
        continue;
      }

      // For each compatible next pattern, add count to the next column state
      const compatibleNextPatterns = compatibilityAdjacencyList[previousPatternIndex];
      for (let neighborIndex = 0; neighborIndex < compatibleNextPatterns.length; neighborIndex++) {
        const nextPatternIndex = compatibleNextPatterns[neighborIndex];
        let updatedWays = waysForCurrentColumn[nextPatternIndex] + waysCount;

        // Keep result within modulo constraint
        if (updatedWays >= MODULO) {
          updatedWays -= MODULO;
        }

        waysForCurrentColumn[nextPatternIndex] = updatedWays;
      }
    }

    // Swap buffers for next column (no reallocation, just swap roles)
    const swapTemporary = waysForPreviousColumn;
    waysForPreviousColumn = waysForCurrentColumn;
    waysForCurrentColumn = swapTemporary;
  }

  // 4. Final answer: Sum ways for all patterns in the last column
  let totalWays = 0;
  for (let patternIndex = 0; patternIndex < patternCount; patternIndex++) {
    totalWays += waysForPreviousColumn[patternIndex];
    if (totalWays >= MODULO) {
      totalWays -= MODULO;
    }
  }

  return totalWays;
}
