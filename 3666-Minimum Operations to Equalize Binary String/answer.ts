function minOperations(s: string, k: number): number {
  const length = s.length;

  // Count initial zeros.
  let zeroCount = 0;
  for (let i = 0; i < length; i++) {
    if (s.charCodeAt(i) === 48) {
      zeroCount++;
    }
  }

  if (zeroCount === 0) {
    return 0;
  }

  // Sentinel values used by parity DSU (step size = 2).
  const dsuArraySize = length + 6;
  const evenSentinel = (((length + 2) & 1) === 0) ? (length + 2) : (length + 3);
  const oddSentinel = evenSentinel ^ 1;

  // Parent arrays store the "next available value" in the same parity class.
  const nextEvenParent = new Int32Array(dsuArraySize);
  const nextOddParent = new Int32Array(dsuArraySize);

  for (let i = 0; i < dsuArraySize; i++) {
    nextEvenParent[i] = i;
    nextOddParent[i] = i;
  }

  // BFS distance for each possible zero count (0..length).
  const minSteps = new Int32Array(length + 1);
  minSteps.fill(-1);

  const queue = new Int32Array(length + 1);
  let queueHead = 0;
  let queueTail = 0;

  // Mark starting state.
  minSteps[zeroCount] = 0;
  queue[queueTail++] = zeroCount;

  // Remove the starting value from its parity DSU to mark visited.
  if ((zeroCount & 1) === 0) {
    nextEvenParent[zeroCount] = (zeroCount + 2 <= evenSentinel) ? (zeroCount + 2) : evenSentinel;
  } else {
    nextOddParent[zeroCount] = (zeroCount + 2 <= oddSentinel) ? (zeroCount + 2) : oddSentinel;
  }

  /**
   * Find the smallest available value >= x (same parity) using path compression.
   * @param parent - DSU parent array for one parity
   * @param x - query value
   * @param sentinel - sentinel index (end marker)
   */
  function findNextAvailable(parent: Int32Array, x: number, sentinel: number): number {
    if (x > sentinel) {
      return sentinel;
    }

    let node = x;
    while (parent[node] !== node) {
      parent[node] = parent[parent[node]];
      node = parent[node];
    }
    return node;
  }

  /**
   * Remove value x from the DSU by linking it to the next value of the same parity (x + 2).
   * @param parent - DSU parent array for one parity
   * @param x - value to remove
   * @param sentinel - sentinel index (end marker)
   */
  function removeAvailableValue(parent: Int32Array, x: number, sentinel: number): void {
    const nextValue = x + 2;
    if (nextValue <= sentinel) {
      parent[x] = findNextAvailable(parent, nextValue, sentinel);
    } else {
      parent[x] = sentinel;
    }
  }

  while (queueHead < queueTail) {
    const currentZeroCount = queue[queueHead++];
    const currentSteps = minSteps[currentZeroCount];

    if (currentZeroCount === 0) {
      return currentSteps;
    }

    // Feasible number of zeros flipped among the chosen k indices:
    // x <= min(currentZeroCount, k)
    // x >= max(0, k - (length - currentZeroCount))
    const minFlippedZeros = (k > (length - currentZeroCount)) ? (k - (length - currentZeroCount)) : 0;
    const maxFlippedZeros = (currentZeroCount < k) ? currentZeroCount : k;

    // nextZeros = currentZeroCount + k - 2*x
    const nextZeroMin = currentZeroCount + k - (maxFlippedZeros << 1);
    const nextZeroMax = currentZeroCount + k - (minFlippedZeros << 1);

    // Enumerate unvisited nextZero in [nextZeroMin, nextZeroMax] stepping by 2 using parity DSU.
    if ((nextZeroMin & 1) === 0) {
      let start = nextZeroMin;
      if ((start & 1) !== 0) {
        start++;
      }

      let candidate = findNextAvailable(nextEvenParent, start, evenSentinel);
      while (candidate <= nextZeroMax) {
        if (candidate >= 0 && candidate <= length) {
          minSteps[candidate] = currentSteps + 1;
          queue[queueTail++] = candidate;
        }

        removeAvailableValue(nextEvenParent, candidate, evenSentinel);
        candidate = findNextAvailable(nextEvenParent, candidate, evenSentinel);
      }
    } else {
      let start = nextZeroMin;
      if ((start & 1) === 0) {
        start++;
      }

      let candidate = findNextAvailable(nextOddParent, start, oddSentinel);
      while (candidate <= nextZeroMax) {
        if (candidate >= 0 && candidate <= length) {
          minSteps[candidate] = currentSteps + 1;
          queue[queueTail++] = candidate;
        }

        removeAvailableValue(nextOddParent, candidate, oddSentinel);
        candidate = findNextAvailable(nextOddParent, candidate, oddSentinel);
      }
    }
  }

  return -1;
}
