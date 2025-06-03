function maxCandies(
  status: number[],
  candies: number[],
  keys: number[][],
  containedBoxes: number[][],
  initialBoxes: number[]
): number {
  const boxCount = status.length;

  // 1. Flag arrays, each index 0..boxCount-1
  const hasKey = new Uint8Array(boxCount);     // 1 if we own a key for box i
  const visited = new Uint8Array(boxCount);    // 1 if we've already opened box i
  const discovered = new Uint8Array(boxCount); // 1 if box i is in our possession
  const blocked = new Uint8Array(boxCount);    // 1 if box i was discovered but closed and no key yet

  // 2. Preallocate a fixed‐size circular queue. Each box can be enqueued at most twice:
  //    - When first discovered
  //    - When unblocked by obtaining its key.
  const queueCapacity = boxCount * 2;
  const queue = new Int32Array(queueCapacity);
  let head = 0;
  let tail = 0;

  // 3. Enqueue all initial boxes (mark as discovered)
  for (let i = 0; i < initialBoxes.length; ++i) {
    const boxIndex = initialBoxes[i];
    if (discovered[boxIndex] === 0) {
      discovered[boxIndex] = 1;
      queue[tail++] = boxIndex;
    }
  }

  let totalCandies = 0;

  // 4. Main loop: process until head catches up to tail
  while (head < tail) {
    const currentBoxIndex = queue[head++];

    // Skip if already opened
    if (visited[currentBoxIndex] === 1) {
      continue;
    }

    // If box is closed and we don't have its key, mark as blocked and defer
    if (status[currentBoxIndex] === 0 && hasKey[currentBoxIndex] === 0) {
      blocked[currentBoxIndex] = 1;
      continue;
    }

    // Open the box
    visited[currentBoxIndex] = 1;
    totalCandies += candies[currentBoxIndex];

    // Collect all keys inside and potentially re‐enqueue newly unblocked boxes
    const containedKeys = keys[currentBoxIndex];
    for (let ki = 0; ki < containedKeys.length; ++ki) {
      const targetBox = containedKeys[ki];
      if (hasKey[targetBox] === 0) {
        hasKey[targetBox] = 1;
        if (blocked[targetBox] === 1) {
          // If that box was waiting in blocked state, we can now enqueue it again
          queue[tail++] = targetBox;
        }
      }
    }

    // Collect all contained boxes and enqueue each one if not yet discovered
    const innerBoxes = containedBoxes[currentBoxIndex];
    for (let bi = 0; bi < innerBoxes.length; ++bi) {
      const newBox = innerBoxes[bi];
      if (discovered[newBox] === 0) {
        discovered[newBox] = 1;
        queue[tail++] = newBox;
      }
    }
  }

  return totalCandies;
}
