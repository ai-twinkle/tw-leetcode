class Int32HashSet {
  private readonly table: Int32Array;
  private readonly mask: number;

  /**
   * Creates a new Int32HashSet using open addressing with linear probing.
   * Note: value 0 is reserved as the empty-slot marker, so only positive integers can be stored.
   * @param expectedItems - Expected number of unique positive integers to store.
   */
  public constructor(expectedItems: number) {
    // Choose capacity to keep load factor <= 0.5 to minimize probing cost
    let capacity = expectedItems * 2 + 1;

    // Round up to power-of-two capacity to replace modulo with bitmask
    capacity--;
    capacity |= capacity >>> 1;
    capacity |= capacity >>> 2;
    capacity |= capacity >>> 4;
    capacity |= capacity >>> 8;
    capacity |= capacity >>> 16;
    capacity++;

    this.table = new Int32Array(capacity);
    this.mask = capacity - 1;
  }

  /**
   * Adds a positive integer value into the set.
   * @param value - Positive integer to add (must be > 0).
   */
  public add(value: number): void {
    // Multiplicative hashing spreads sequential integers well in power-of-two tables
    let slot = (Math.imul(value, 0x9e3779b1) >>> 0) & this.mask;

    while (true) {
      const stored = this.table[slot];

      if (stored === 0) {
        // Empty slot means the value is not present and can be inserted here
        this.table[slot] = value;
        return;
      }

      if (stored === value) {
        // Found the existing value, so no work is needed
        return;
      }

      // Linear probing to resolve collisions
      slot = (slot + 1) & this.mask;
    }
  }

  /**
   * Checks whether a positive integer value exists in the set.
   * @param value - Positive integer to check (must be > 0).
   * @returns True if present, false otherwise.
   */
  public has(value: number): boolean {
    // Use the same hashing and probing sequence as add()
    let slot = (Math.imul(value, 0x9e3779b1) >>> 0) & this.mask;

    while (true) {
      const stored = this.table[slot];

      if (stored === 0) {
        // Empty slot means the value was never inserted
        return false;
      }

      if (stored === value) {
        // Exact match means the value exists
        return true;
      }

      // Continue probing until an empty slot is found
      slot = (slot + 1) & this.mask;
    }
  }
}

/**
 * Builds sorted fence coordinates including the two fixed borders (1 and border).
 * @param fences - Removable fence coordinates.
 * @param border - Fixed outer border (m for horizontal, n for vertical).
 * @returns Sorted positions including borders.
 */
function buildSortedPositions(fences: number[], border: number): Int32Array {
  const positions = new Int32Array(fences.length + 2);

  // Insert the two non-removable borders
  positions[0] = 1;
  positions[positions.length - 1] = border;

  // Fill removable fences into the middle
  for (let index = 0; index < fences.length; index++) {
    positions[index + 1] = fences[index];
  }

  // Sorting allows O(k^2) distance generation with cache-friendly sequential access
  positions.sort();
  return positions;
}

/**
 * @param m - Field height border.
 * @param n - Field width border.
 * @param hFences - Horizontal removable fence coordinates.
 * @param vFences - Vertical removable fence coordinates.
 * @returns Maximum square area modulo 1e9+7, or -1 if impossible.
 */
function maximizeSquareArea(m: number, n: number, hFences: number[], vFences: number[]): number {
  const horizontalPositions = buildSortedPositions(hFences, m);
  const verticalPositions = buildSortedPositions(vFences, n);

  const horizontalCount = horizontalPositions.length;
  const verticalCount = verticalPositions.length;

  // Compute pair counts to decide which side builds the distance hash set
  const horizontalPairs = (horizontalCount * (horizontalCount - 1)) / 2;
  const verticalPairs = (verticalCount * (verticalCount - 1)) / 2;

  let basePositions: Int32Array;
  let scanPositions: Int32Array;

  // Build distances from the smaller side to reduce memory and build time
  if (horizontalPairs <= verticalPairs) {
    basePositions = horizontalPositions;
    scanPositions = verticalPositions;
  } else {
    basePositions = verticalPositions;
    scanPositions = horizontalPositions;
  }

  const baseCount = basePositions.length;
  const expectedDistanceItems = (baseCount * (baseCount - 1)) / 2;
  const distanceSet = new Int32HashSet(expectedDistanceItems);

  // Precompute all possible segment lengths on the chosen (smaller) side
  for (let leftIndex = 0; leftIndex < baseCount - 1; leftIndex++) {
    const leftValue = basePositions[leftIndex];

    for (let rightIndex = leftIndex + 1; rightIndex < baseCount; rightIndex++) {
      distanceSet.add(basePositions[rightIndex] - leftValue);
    }
  }

  let maximumSideLength = 0;
  const scanLastIndex = scanPositions.length - 1;

  for (let leftIndex = 0; leftIndex < scanLastIndex; leftIndex++) {
    const leftValue = scanPositions[leftIndex];

    // If even the farthest distance cannot beat current best, remaining leftIndex values will not either
    const maximumPossibleForLeft = scanPositions[scanLastIndex] - leftValue;
    if (maximumPossibleForLeft <= maximumSideLength) {
      break;
    }

    // Check distances in descending order so we can stop as soon as we find the best for this leftIndex
    for (let rightIndex = scanLastIndex; rightIndex > leftIndex; rightIndex--) {
      const distance = scanPositions[rightIndex] - leftValue;

      // Once distance is not improving, smaller rightIndex will only reduce it further
      if (distance <= maximumSideLength) {
        break;
      }

      if (distanceSet.has(distance)) {
        // First match in descending scan is the largest achievable for this leftIndex
        maximumSideLength = distance;
        break;
      }
    }
  }

  if (maximumSideLength === 0) {
    return -1;
  }

  // Use BigInt to avoid overflow when squaring up to 1e9
  const side = BigInt(maximumSideLength);
  return Number((side * side) % 1000000007n);
}
