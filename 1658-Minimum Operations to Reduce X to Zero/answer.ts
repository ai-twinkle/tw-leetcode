function minOperations(nums: number[], x: number): number {
  const length = nums.length;

  // Accumulate the total in one pass; it defines the target window sum.
  let totalSum = 0;
  for (let index = 0; index < length; index++) {
    totalSum += nums[index];
  }

  // Every element is positive, so a target below zero can never be reached.
  const targetSum = totalSum - x;
  if (targetSum < 0) {
    return -1;
  }

  // The whole array sums to x exactly, so all elements must be removed.
  if (targetSum === 0) {
    return length;
  }

  // A sum of zero is only reachable by an empty window, encoded as length -1 (unfound).
  let maxWindowLength = -1;
  let windowSum = 0;
  let left = 0;

  for (let right = 0; right < length; right++) {
    windowSum += nums[right];

    // All values are positive, so shrinking from the left is monotonic and safe.
    while (windowSum > targetSum) {
      windowSum -= nums[left];
      left++;
    }

    // Record the widest window that hits the target exactly.
    if (windowSum === targetSum) {
      const currentLength = right - left + 1;
      if (currentLength > maxWindowLength) {
        maxWindowLength = currentLength;
      }
    }
  }

  if (maxWindowLength < 0) {
    return -1;
  }

  // Everything outside the kept window is removed, one element per operation.
  return length - maxWindowLength;
}
