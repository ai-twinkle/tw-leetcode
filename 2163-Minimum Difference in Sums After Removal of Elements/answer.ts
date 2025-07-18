function minimumDifference(nums: number[]): number {
  const arrayLength = nums.length;
  const oneThirdLength = (arrayLength / 3) | 0;
  const valuesArray = Int32Array.from(nums);

  // 1. Calculate prefix sums for n smallest elements (using max-heap)
  const prefixSmallestSums = new Float64Array(arrayLength);
  const maxHeapSmallest = new Int32Array(oneThirdLength + 1);
  let maxHeapCurrentSize = 0;
  let prefixSumCurrent = 0;

  for (let index = 0; index < arrayLength; ++index) {
    const currentValue = valuesArray[index];

    // Add current value to max-heap
    let heapPosition = maxHeapCurrentSize++;
    maxHeapSmallest[heapPosition] = currentValue;
    while (heapPosition > 0) {
      const parentPosition = (heapPosition - 1) >> 1;
      if (maxHeapSmallest[parentPosition] >= maxHeapSmallest[heapPosition]) {
        break;
      }
      // Restore heap property upward
      const temp = maxHeapSmallest[parentPosition];
      maxHeapSmallest[parentPosition] = maxHeapSmallest[heapPosition];
      maxHeapSmallest[heapPosition] = temp;
      heapPosition = parentPosition;
    }
    prefixSumCurrent += currentValue;

    // Remove largest if heap size exceeds n
    if (maxHeapCurrentSize > oneThirdLength) {
      const removedValue = maxHeapSmallest[0];
      prefixSumCurrent -= removedValue;
      maxHeapCurrentSize--;
      maxHeapSmallest[0] = maxHeapSmallest[maxHeapCurrentSize];

      // Restore heap property downward
      let downPosition = 0;
      while (true) {
        const leftChild = (downPosition << 1) + 1;
        if (leftChild >= maxHeapCurrentSize) {
          break;
        }
        const rightChild = leftChild + 1;
        let swapChild = leftChild;
        if (
          rightChild < maxHeapCurrentSize &&
          maxHeapSmallest[rightChild] > maxHeapSmallest[leftChild]
        ) {
          swapChild = rightChild;
        }
        if (maxHeapSmallest[swapChild] <= maxHeapSmallest[downPosition]) {
          break;
        }
        const temp = maxHeapSmallest[downPosition];
        maxHeapSmallest[downPosition] = maxHeapSmallest[swapChild];
        maxHeapSmallest[swapChild] = temp;
        downPosition = swapChild;
      }
    }

    // Record the current prefix sum once at least n elements
    if (index >= oneThirdLength - 1) {
      prefixSmallestSums[index] = prefixSumCurrent;
    }
  }

  // 2. Calculate the suffix sums for the n largest elements (using min-heap)
  const suffixLargestSums = new Float64Array(arrayLength);
  const minHeapLargest = new Int32Array(oneThirdLength + 1);
  let minHeapCurrentSize = 0;
  let suffixSumCurrent = 0;

  for (let index = arrayLength - 1; index >= 0; --index) {
    const currentValue = valuesArray[index];

    // Add current value to min-heap
    let heapPosition = minHeapCurrentSize++;
    minHeapLargest[heapPosition] = currentValue;
    while (heapPosition > 0) {
      const parentPosition = (heapPosition - 1) >> 1;
      if (minHeapLargest[parentPosition] <= minHeapLargest[heapPosition]) {
        break;
      }
      // Restore heap property upward
      const temp = minHeapLargest[parentPosition];
      minHeapLargest[parentPosition] = minHeapLargest[heapPosition];
      minHeapLargest[heapPosition] = temp;
      heapPosition = parentPosition;
    }
    suffixSumCurrent += currentValue;

    // Remove the smallest if heap size exceeds n
    if (minHeapCurrentSize > oneThirdLength) {
      const removedValue = minHeapLargest[0];
      suffixSumCurrent -= removedValue;
      minHeapCurrentSize--;
      minHeapLargest[0] = minHeapLargest[minHeapCurrentSize];

      // Restore heap property downward
      let downPosition = 0;
      while (true) {
        const leftChild = (downPosition << 1) + 1;
        if (leftChild >= minHeapCurrentSize) {
          break;
        }
        const rightChild = leftChild + 1;
        let swapChild = leftChild;
        if (
          rightChild < minHeapCurrentSize &&
          minHeapLargest[rightChild] < minHeapLargest[leftChild]
        ) {
          swapChild = rightChild;
        }
        if (minHeapLargest[swapChild] >= minHeapLargest[downPosition]) {
          break;
        }
        const temp = minHeapLargest[downPosition];
        minHeapLargest[downPosition] = minHeapLargest[swapChild];
        minHeapLargest[swapChild] = temp;
        downPosition = swapChild;
      }
    }

    // Record current suffix sum when there are at least n elements to the end
    if (index <= 2 * oneThirdLength) {
      suffixLargestSums[index] = suffixSumCurrent;
    }
  }

  // 3. Find the minimum difference between two split parts
  let minimumDifferenceResult = Number.POSITIVE_INFINITY;
  for (
    let middleIndex = oneThirdLength - 1;
    middleIndex < 2 * oneThirdLength;
    ++middleIndex
  ) {
    const difference =
      prefixSmallestSums[middleIndex] -
      suffixLargestSums[middleIndex + 1];
    if (difference < minimumDifferenceResult) {
      minimumDifferenceResult = difference;
    }
  }
  return minimumDifferenceResult;
}
