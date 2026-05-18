function minJumps(arr: number[]): number {
  const length = arr.length;

  // Trivial case: already at the last index
  if (length <= 1) {
    return 0;
  }

  const lastIndex = length - 1;

  // Group indices by their value
  // Using a Map keyed by the numeric value — values fit in int32 range per constraints
  const valueToIndices: Map<number, number[]> = new Map();
  for (let index = 0; index < length; index++) {
    const value = arr[index];
    const bucket = valueToIndices.get(value);
    if (bucket === undefined) {
      valueToIndices.set(value, [index]);
      continue;
    }
    bucket.push(index);
  }

  // Typed array for visited flags — far faster than a regular boolean array
  const visited = new Uint8Array(length);
  visited[0] = 1;

  // Array-backed queue with head/tail pointers avoids the O(n) cost of Array.shift
  // Worst case every index is enqueued once, so size = length is sufficient
  const queue = new Int32Array(length);
  let queueHead = 0;
  let queueTail = 0;
  queue[queueTail++] = 0;

  let steps = 0;

  // Standard BFS by levels — each level represents one additional jump
  while (queueHead < queueTail) {
    const levelSize = queueTail - queueHead;

    for (let counter = 0; counter < levelSize; counter++) {
      const currentIndex = queue[queueHead++];

      // Reached the goal — return current step count
      if (currentIndex === lastIndex) {
        return steps;
      }

      const currentValue = arr[currentIndex];

      // Neighbor 1: jump to i + 1
      // Fast exit when the next index is the goal (nextIndex < length is guaranteed here)
      const nextIndex = currentIndex + 1;
      if (nextIndex === lastIndex) {
        return steps + 1;
      }
      if (nextIndex < length && visited[nextIndex] === 0) {
        visited[nextIndex] = 1;
        queue[queueTail++] = nextIndex;
      }

      // Neighbor 2: jump to i - 1
      const previousIndex = currentIndex - 1;
      if (previousIndex >= 0 && visited[previousIndex] === 0) {
        visited[previousIndex] = 1;
        queue[queueTail++] = previousIndex;
      }

      // Neighbor 3: jump to any index sharing the same value
      // Critical optimization: process each value group only once across the whole BFS
      const sameValueIndices = valueToIndices.get(currentValue);
      if (sameValueIndices === undefined) {
        continue;
      }

      for (let pointer = 0; pointer < sameValueIndices.length; pointer++) {
        const peerIndex = sameValueIndices[pointer];
        if (visited[peerIndex] === 1) {
          continue;
        }
        // Fast exit when a peer is the goal
        if (peerIndex === lastIndex) {
          return steps + 1;
        }
        visited[peerIndex] = 1;
        queue[queueTail++] = peerIndex;
      }
      // Mark the group consumed so no later node revisits these edges
      valueToIndices.delete(currentValue);
    }

    steps++;
  }

  // Per problem constraints the last index is always reachable, but return -1 defensively
  return -1;
}
