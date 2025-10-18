function maxDistinctElements(nums: number[], k: number): number {
  const data = Int32Array.from(nums);
  data.sort(); // Ascending numeric; avoids comparator overhead

  // Greedy: track the last placed distinct value
  let countDistinct = 0;
  let previousPlacedValue = 0;
  let hasPreviousPlaced = false;

  const length = data.length;

  for (let index = 0; index < length; index++) {
    // Current base value (32-bit int) promoted to Number for arithmetic with potentially large k
    const base = data[index];

    // Compute feasible interval [leftBound, rightBound] after adjustment
    const leftBound = base - k;
    const rightBound = base + k;

    // Greedily choose the smallest available value ≥ previousPlacedValue + 1 (to keep values distinct)
    let candidateValue = leftBound;

    // If there is a previous placement, ensure strictly increasing by at least 1
    if (hasPreviousPlaced && candidateValue <= previousPlacedValue) {
      candidateValue = previousPlacedValue + 1;
    }

    // If the candidate fits within the allowed adjustment range, accept it
    if (candidateValue <= rightBound) {
      countDistinct += 1;
      previousPlacedValue = candidateValue;
      hasPreviousPlaced = true;
    }
    // Otherwise, skip this element (cannot place a new distinct value)
  }

  return countDistinct;
}
