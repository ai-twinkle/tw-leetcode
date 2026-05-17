function canReach(arr: number[], start: number): boolean {
  // Immediate check for trivial case
  if (arr[start] === 0) {
    return true;
  }

  const arrayLength = arr.length;
  // Use a typed array as a manual stack for speed
  const stack = new Int32Array(arrayLength);
  let stackTop = 0;
  stack[stackTop++] = start;

  // Track visited nodes that need restoration after completion
  const visitedIndices = new Int32Array(arrayLength);
  let visitedCount = 0;

  // Mark start as visited by negating its value
  arr[start] = -arr[start];
  visitedIndices[visitedCount++] = start;

  let result = false;

  while (stackTop > 0) {
    const currentIndex = stack[--stackTop];
    // Recover the original jump distance from the negated value
    const jumpDistance = -arr[currentIndex];

    // Try jumping forward
    const forwardIndex = currentIndex + jumpDistance;
    if (forwardIndex < arrayLength) {
      const forwardValue = arr[forwardIndex];
      if (forwardValue === 0) {
        result = true;
        break;
      }
      // Only push if not visited (positive value means unvisited)
      if (forwardValue > 0) {
        arr[forwardIndex] = -forwardValue;
        visitedIndices[visitedCount++] = forwardIndex;
        stack[stackTop++] = forwardIndex;
      }
    }

    // Try jumping backward
    const backwardIndex = currentIndex - jumpDistance;
    if (backwardIndex >= 0) {
      const backwardValue = arr[backwardIndex];
      if (backwardValue === 0) {
        result = true;
        break;
      }
      if (backwardValue > 0) {
        arr[backwardIndex] = -backwardValue;
        visitedIndices[visitedCount++] = backwardIndex;
        stack[stackTop++] = backwardIndex;
      }
    }
  }

  // Restore the input array to its original state
  for (let i = 0; i < visitedCount; i++) {
    const idx = visitedIndices[i];
    arr[idx] = -arr[idx];
  }

  return result;
}
