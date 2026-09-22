function resultArray(nums: number[], k: number, queries: number[][]): number[] {
  const length = nums.length;
  let size = 1;
  while (size < length) {
    size <<= 1;
  }

  // Precomputed multiplication table modulo k
  const multiply = new Uint8Array(k * k);
  for (let first = 0; first < k; first++) {
    for (let second = 0; second < k; second++) {
      multiply[first * k + second] = (first * second) % k;
    }
  }

  // Product of each node's range modulo k; padding leaves hold the identity 1 % k
  const product = new Uint8Array(2 * size).fill(1 % k);
  // Prefix-residue counts of each node, flattened as node * k + residue
  const count = new Int32Array(2 * size * k);

  // Initialize leaves: a single element has exactly one prefix
  for (let index = 0; index < length; index++) {
    const residue = nums[index] % k;
    const leaf = size + index;
    product[leaf] = residue;
    count[leaf * k + residue] = 1;
  }

  /**
   * Recomputes a node's product and prefix counts from its two children.
   * @param node - The internal node index to rebuild.
   */
  const pull = (node: number): void => {
    const left = node << 1;
    const right = left | 1;
    const base = node * k;
    const leftBase = left * k;
    const rightBase = right * k;
    const rowOffset = product[left] * k;

    // Left prefixes are kept unchanged
    for (let residue = 0; residue < k; residue++) {
      count[base + residue] = count[leftBase + residue];
    }
    // Right prefixes are shifted by the left product
    for (let residue = 0; residue < k; residue++) {
      count[base + multiply[rowOffset + residue]] += count[rightBase + residue];
    }
    product[node] = multiply[rowOffset + product[right]];
  };

  // Build all internal nodes bottom-up
  for (let node = size - 1; node >= 1; node--) {
    pull(node);
  }

  const queryCount = queries.length;
  const result: number[] = new Array(queryCount);
  const accumulator = new Int32Array(k);
  const identity = 1 % k;

  for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
    const query = queries[queryIndex];
    const updateIndex = query[0];
    const residue = query[1] % k;
    const start = query[2];
    const target = query[3];

    // Point update: reset the leaf, then rebuild its ancestors
    let node = size + updateIndex;
    const leafBase = node * k;
    for (let offset = 0; offset < k; offset++) {
      count[leafBase + offset] = 0;
    }
    count[leafBase + residue] = 1;
    product[node] = residue;
    node >>= 1;
    while (node >= 1) {
      pull(node);
      node >>= 1;
    }

    // Fold the suffix range [start, size) from left to right
    accumulator.fill(0);
    let accumulatedProduct = identity;
    let left = start + size;
    let right = size << 1;
    while (left < right) {
      if (left & 1) {
        const nodeBase = left * k;
        const rowOffset = accumulatedProduct * k;
        for (let offset = 0; offset < k; offset++) {
          accumulator[multiply[rowOffset + offset]] += count[nodeBase + offset];
        }
        accumulatedProduct = multiply[rowOffset + product[left]];
        left++;
      }
      left >>= 1;
      right >>= 1;
    }

    result[queryIndex] = accumulator[target];
  }

  return result;
}
