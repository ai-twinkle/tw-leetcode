function minimumPairRemoval(nums: number[]): number {
  const length = nums.length;
  if (length <= 1) {
    return 0;
  }

  // Linked-list representation using indices to avoid array mutation
  const nextIndex = new Int32Array(length);
  const previousIndex = new Int32Array(length);

  for (let index = 0; index < length; index++) {
    nextIndex[index] = index + 1;
    previousIndex[index] = index - 1;
  }
  nextIndex[length - 1] = -1;

  // Count adjacent inversions to know when the array becomes non-decreasing
  let inversionCount = 0;
  for (let index = 0; index + 1 < length; index++) {
    if (nums[index] > nums[index + 1]) {
      inversionCount++;
    }
  }

  let operationCount = 0;
  let aliveCount = length;

  while (inversionCount > 0 && aliveCount > 1) {
    // Scan all adjacent alive pairs to find the leftmost minimum sum
    let current = 0;
    let bestLeft = 0;
    let bestRight = nextIndex[0];
    let bestSum = nums[bestLeft] + nums[bestRight];

    while (true) {
      const left = current;
      const right = nextIndex[left];
      if (right === -1) {
        break;
      }

      const currentSum = nums[left] + nums[right];
      if (currentSum < bestSum) {
        bestSum = currentSum;
        bestLeft = left;
        bestRight = right;
      }

      current = right;
    }

    const leftIndex = bestLeft;
    const rightIndex = bestRight;

    const previousOfLeft = previousIndex[leftIndex];
    const nextOfRight = nextIndex[rightIndex];

    // Remove inversion contributions that will disappear after merging
    if (previousOfLeft !== -1) {
      if (nums[previousOfLeft] > nums[leftIndex]) {
        inversionCount--;
      }
    }
    if (nums[leftIndex] > nums[rightIndex]) {
      inversionCount--;
    }
    if (nextOfRight !== -1) {
      if (nums[rightIndex] > nums[nextOfRight]) {
        inversionCount--;
      }
    }

    // Merge the chosen adjacent pair into the left position
    nums[leftIndex] = bestSum;

    // Remove the right node from the linked list
    nextIndex[leftIndex] = nextOfRight;
    if (nextOfRight !== -1) {
      previousIndex[nextOfRight] = leftIndex;
    }

    aliveCount--;
    operationCount++;

    // Add new inversion contributions created by the merged value
    if (previousOfLeft !== -1) {
      if (nums[previousOfLeft] > nums[leftIndex]) {
        inversionCount++;
      }
    }
    if (nextOfRight !== -1) {
      if (nums[leftIndex] > nums[nextOfRight]) {
        inversionCount++;
      }
    }
  }

  return operationCount;
}
