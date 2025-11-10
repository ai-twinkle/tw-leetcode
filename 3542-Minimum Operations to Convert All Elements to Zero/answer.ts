function minOperations(nums: number[]): number {
  const length = nums.length;
  if (length === 0) {
    return 0;
  }

  // Monotone increasing stack implemented with a typed array
  const stack = new Int32Array(length);
  let top = -1; // -1 means empty

  let operationCount = 0;

  for (let index = 0; index < length; index++) {
    const value = nums[index];

    // Zeros split valid subarrays; clear all active levels
    if (value === 0) {
      top = -1; // Clear stack
      continue;
    }

    // Maintain increasing stack
    while (top >= 0 && stack[top] > value) {
      top--;
    }

    // New positive level encountered
    if (top < 0 || stack[top] < value) {
      operationCount++;
      stack[++top] = value;
    }
    // Equal to top => same level, nothing to do
  }

  return operationCount;
}
