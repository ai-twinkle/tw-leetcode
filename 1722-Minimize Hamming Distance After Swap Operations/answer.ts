// Pre-allocated Union-Find typed arrays (avoid per-call allocation)
const MAX_SIZE = 100001;
const parent = new Int32Array(MAX_SIZE);
const rank = new Int32Array(MAX_SIZE);

// Reusable counting array for value matching within components
const valueCounts = new Int32Array(MAX_SIZE);
// Track which entries in valueCounts were set, for fast targeted reset
const touchedValues = new Int32Array(MAX_SIZE);

/**
 * Find the root representative of the set containing index x, with path compression.
 * @param x - The index to find the root for
 * @returns The root representative of the set
 */
function findRoot(x: number): number {
  let root = x;
  while (parent[root] !== root) {
    root = parent[root];
  }
  // Compress path: point all traversed nodes directly to root
  while (parent[x] !== root) {
    const next = parent[x];
    parent[x] = root;
    x = next;
  }
  return root;
}

/**
 * Union two sets by rank, attaching smaller tree under larger tree's root.
 * @param x - First index
 * @param y - Second index
 */
function unionSets(x: number, y: number): void {
  const rootX = findRoot(x);
  const rootY = findRoot(y);
  if (rootX === rootY) {
    return;
  }
  // Attach smaller-rank tree under higher-rank tree
  if (rank[rootX] < rank[rootY]) {
    parent[rootX] = rootY;
  } else if (rank[rootX] > rank[rootY]) {
    parent[rootY] = rootX;
  } else {
    parent[rootY] = rootX;
    rank[rootX]++;
  }
}

/**
 * Computes the minimum Hamming distance between source and target
 * after performing any allowed swaps on source.
 * Uses Union-Find to group indices, then bucket-sorts indices by root
 * and counts matchable elements per component using flat typed arrays.
 * @param source - The source array of integers
 * @param target - The target array of integers
 * @param allowedSwaps - Array of index pairs that can be swapped
 * @returns The minimum Hamming distance achievable
 */
function minimumHammingDistance(source: number[], target: number[], allowedSwaps: number[][]): number {
  const length = source.length;

  // Initialize Union-Find for current problem size
  for (let i = 0; i < length; i++) {
    parent[i] = i;
    rank[i] = 0;
  }

  // Build connected components from allowed swaps
  const swapCount = allowedSwaps.length;
  for (let i = 0; i < swapCount; i++) {
    const swap = allowedSwaps[i];
    unionSets(swap[0], swap[1]);
  }

  // Finalize all roots via findRoot (ensures full path compression)
  const roots = new Int32Array(length);
  // Reuse rank as component size counter (UF ranking no longer needed)
  for (let i = 0; i < length; i++) {
    rank[i] = 0;
  }
  for (let i = 0; i < length; i++) {
    roots[i] = findRoot(i);
    rank[roots[i]]++;
  }

  // Build bucket-sorted index array: compute prefix-sum start positions
  const bucketStart = new Int32Array(length);
  let offset = 0;
  for (let i = 0; i < length; i++) {
    if (rank[i] > 0) {
      bucketStart[i] = offset;
      offset += rank[i];
    }
  }

  // Write pointer per root (reuse rank as write offset within each bucket)
  const writeOffset = new Int32Array(length);
  const sortedIndices = new Int32Array(length);
  for (let i = 0; i < length; i++) {
    const root = roots[i];
    sortedIndices[bucketStart[root] + writeOffset[root]] = i;
    writeOffset[root]++;
  }

  // Process each component: count source values, subtract target matches
  let hammingDistance = 0;

  for (let i = 0; i < length; i++) {
    // Only process each component once, from its root
    if (roots[i] !== i) {
      continue;
    }

    const start = bucketStart[i];
    const size = writeOffset[i];
    let touchedCount = 0;
    let componentMismatches = size;

    // Tally source values in this component
    for (let j = start, end = start + size; j < end; j++) {
      const sourceValue = source[sortedIndices[j]];
      if (valueCounts[sourceValue] === 0) {
        touchedValues[touchedCount++] = sourceValue;
      }
      valueCounts[sourceValue]++;
    }

    // Match target values against available source values
    for (let j = start, end = start + size; j < end; j++) {
      const targetValue = target[sortedIndices[j]];
      if (valueCounts[targetValue] > 0) {
        valueCounts[targetValue]--;
        componentMismatches--;
      }
    }

    hammingDistance += componentMismatches;

    // Reset only the touched entries for next component
    for (let j = 0; j < touchedCount; j++) {
      valueCounts[touchedValues[j]] = 0;
    }
  }

  return hammingDistance;
}
