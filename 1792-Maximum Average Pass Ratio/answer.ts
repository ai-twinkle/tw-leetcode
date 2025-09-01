function maxAverageRatio(classes: number[][], extraStudents: number): number {
  const numberOfClasses = classes.length;

  const passedCount = new Int32Array(numberOfClasses);
  const totalCount = new Int32Array(numberOfClasses);
  const gainArray = new Float64Array(numberOfClasses); // Gain for adding exactly 1 student to a class
  const heapIndices = new Int32Array(numberOfClasses); // Max-heap over indices keyed by gainArray[index]

  // Initialize arrays and the running sum of current pass ratios
  let sumOfRatios = 0.0;
  for (let i = 0; i < numberOfClasses; i++) {
    const classRow = classes[i];
    const passed = classRow[0];
    const total = classRow[1];

    passedCount[i] = passed;
    totalCount[i] = total;
    sumOfRatios += passed / total;

    // Closed-form gain: ( (p+1)/(t+1) - p/t ) = (t - p) / (t * (t + 1))
    gainArray[i] = (total - passed) / (total * (total + 1));
    heapIndices[i] = i;
  }

  // Build max-heap in O(n)
  for (let i = (numberOfClasses >> 1) - 1; i >= 0; i--) {
    siftDown(heapIndices, i, numberOfClasses, gainArray);
  }

  // Assign each extra student to the class with the largest current gain
  let remaining = extraStudents;
  while (remaining > 0) {
    const topIndex = heapIndices[0];
    const bestGain = gainArray[topIndex];

    if (bestGain <= 0) {
      break;
    }

    // Apply the gain to the running sum
    sumOfRatios += bestGain;

    // Update that class counts
    const newPassed = passedCount[topIndex] + 1;
    const newTotal = totalCount[topIndex] + 1;
    passedCount[topIndex] = newPassed;
    totalCount[topIndex] = newTotal;

    // Recompute its gain after the assignment
    gainArray[topIndex] = (newTotal - newPassed) / (newTotal * (newTotal + 1));

    // Restore heap property
    siftDown(heapIndices, 0, numberOfClasses, gainArray);

    remaining--;
  }

  // Return the average ratio
  return sumOfRatios / numberOfClasses;

  /**
   * Restores the max-heap property starting from a given index.
   * The function ensures that the element at positionIndex sinks down
   * until the max-heap property is satisfied: each parent has a gain
   * greater than or equal to its children.
   *
   * @param heap - The heap represented as an array of class indices.
   * @param positionIndex - The index in the heap where the sift down begins.
   * @param heapSize - The current number of elements in the heap.
   * @param keyArray - Array of gain values, where keyArray[classIndex] gives the current gain.
   */
  function siftDown(
    heap: Int32Array,
    positionIndex: number,
    heapSize: number,
    keyArray: Float64Array
  ): void {
    let current = positionIndex;

    while (true) {
      const leftChild = (current << 1) + 1;
      const rightChild = leftChild + 1;
      let largest = current;

      if (leftChild < heapSize) {
        if (keyArray[heap[leftChild]] > keyArray[heap[largest]]) {
          largest = leftChild;
        }
      }

      if (rightChild < heapSize) {
        if (keyArray[heap[rightChild]] > keyArray[heap[largest]]) {
          largest = rightChild;
        }
      }

      if (largest === current) {
        break;
      }

      const swapTemp = heap[current];
      heap[current] = heap[largest];
      heap[largest] = swapTemp;

      current = largest;
    }
  }
}
