function solveQueries(nums: number[], queries: number[]): number[] {
  const length = nums.length;

  // Find max value to size the position lookup array
  let maxValue = 0;
  for (let i = 0; i < length; i++) {
    if (nums[i] > maxValue) {
      maxValue = nums[i];
    }
  }

  // Direct-index position lookup, faster than Map
  const EMPTY_SENTINEL = -1000001;
  const positionLookup = new Int32Array(maxValue + 1).fill(EMPTY_SENTINEL);

  // Nearest same-value neighbor index from the left (circular)
  const nearestLeft = new Int32Array(length);
  // Nearest same-value neighbor index from the right (circular)
  const nearestRight = new Int32Array(length);

  // Forward pass: scan from -length to length-1 to handle circular wrap
  for (let i = -length; i < length; i++) {
    const circularIndex = (i + length) % length;
    const value = nums[circularIndex];
    if (i >= 0) {
      nearestLeft[i] = positionLookup[value] !== EMPTY_SENTINEL ? positionLookup[value] : -length;
    }
    positionLookup[value] = i;
  }

  // Reset lookup for backward pass
  positionLookup.fill(EMPTY_SENTINEL);

  // Backward pass: scan from 2*length-1 to 0 to handle circular wrap
  for (let i = 2 * length - 1; i >= 0; i--) {
    const circularIndex = i % length;
    const value = nums[circularIndex];
    if (i < length) {
      nearestRight[i] = positionLookup[value] !== EMPTY_SENTINEL ? positionLookup[value] : 2 * length;
    }
    positionLookup[value] = i;
  }

  // Compute minimum circular distance for each query
  const minimumDistances = new Array<number>(queries.length);
  for (let i = 0; i < queries.length; i++) {
    const queryIndex = queries[i];
    const distanceLeft = queryIndex - nearestLeft[queryIndex];
    if (distanceLeft === length) {
      // No other element with same value exists
      minimumDistances[i] = -1;
    } else {
      const distanceRight = nearestRight[queryIndex] - queryIndex;
      minimumDistances[i] = distanceLeft < distanceRight ? distanceLeft : distanceRight;
    }
  }

  return minimumDistances;
}
