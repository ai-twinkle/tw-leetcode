// Maximum possible value of nums[i] per constraints
const MAX_VALUE = 1_000_001;

// Smallest Prime Factor sieve, pre-computed once and reused across all calls
// spf[v] = smallest prime that divides v (spf[v] === v means v is prime)
const smallestPrimeFactor = new Int32Array(MAX_VALUE);
for (let i = 2; i < MAX_VALUE; i++) {
  // Only fill if not yet set, so the smallest prime stays
  if (smallestPrimeFactor[i] === 0) {
    for (let j = i; j < MAX_VALUE; j += i) {
      if (smallestPrimeFactor[j] === 0) {
        smallestPrimeFactor[j] = i;
      }
    }
  }
}

/**
 * Compute the minimum number of jumps from index 0 to n-1
 * Uses BFS with prime-group teleportation, consuming each prime group at most once
 * @param nums input array of integers
 * @return minimum number of jumps to reach the last index
 */
function minJumps(nums: number[]): number {
  const n = nums.length;
  // Trivial case: already at the goal
  if (n <= 1) {
    return 0;
  }

  // Group indices by each distinct prime factor of nums[i]
  // primeToIndices maps a prime p -> list of indices i such that p | nums[i]
  const primeToIndices = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    let value = nums[i];
    // Extract distinct prime factors using the SPF sieve
    while (value > 1) {
      const prime = smallestPrimeFactor[value];
      let bucket = primeToIndices.get(prime);
      if (bucket === undefined) {
        bucket = [];
        primeToIndices.set(prime, bucket);
      }
      bucket.push(i);
      // Strip all occurrences of this prime to keep factors distinct
      while (value % prime === 0) {
        value = (value / prime) | 0;
      }
    }
  }

  // BFS state: typed-array queue avoids the overhead of generic array push/shift
  const visitedIndex = new Uint8Array(n);
  const queue = new Int32Array(n);
  let head = 0;
  let tail = 0;

  queue[tail++] = 0;
  visitedIndex[0] = 1;
  let jumps = 0;

  while (head < tail) {
    // Process the current BFS layer in one go
    const layerEnd = tail;
    while (head < layerEnd) {
      const current = queue[head++];
      // Reached the destination at the current jump count
      if (current === n - 1) {
        return jumps;
      }

      // Adjacent step forward
      const next = current + 1;
      if (next < n && visitedIndex[next] === 0) {
        visitedIndex[next] = 1;
        queue[tail++] = next;
      }

      // Adjacent step backward
      const previous = current - 1;
      if (previous >= 0 && visitedIndex[previous] === 0) {
        visitedIndex[previous] = 1;
        queue[tail++] = previous;
      }

      // Prime teleportation: only valid when nums[current] is itself prime
      const valueAtCurrent = nums[current];
      if (valueAtCurrent > 1 && smallestPrimeFactor[valueAtCurrent] === valueAtCurrent) {
        const bucket = primeToIndices.get(valueAtCurrent);
        if (bucket !== undefined) {
          // Add every index sharing this prime factor, then drop the bucket
          // Each prime group is consumed once, keeping total work linear
          for (let k = 0, len = bucket.length; k < len; k++) {
            const target = bucket[k];
            if (visitedIndex[target] === 0) {
              visitedIndex[target] = 1;
              queue[tail++] = target;
            }
          }
          primeToIndices.delete(valueAtCurrent);
        }
      }
    }
    jumps++;
  }

  // Unreachable per problem guarantees, but return -1 defensively
  return -1;
}
