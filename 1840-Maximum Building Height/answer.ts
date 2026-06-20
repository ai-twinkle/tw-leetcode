/**
 * Sorts paired key/value typed arrays into ascending key order using an
 * LSD radix sort. Each value keeps following its original key, so the pairs
 * stay intact. Both arrays are reordered in place.
 *
 * @param keys - The 32-bit integer keys to sort by (sorted in place).
 * @param values - The companion values reordered to match the sorted keys.
 * @param length - Number of valid elements at the front of the arrays.
 */
function radixSortKeyValue(
  keys: Int32Array,
  values: Int32Array,
  length: number,
): void {
  const temporaryKeys = new Int32Array(length);
  const temporaryValues = new Int32Array(length);
  const bucketCount = new Int32Array(256);

  // Explicit annotations keep the ping-pong buffers buffer-kind agnostic so
  // the source/destination swap type-checks under the generic Int32Array lib.
  let sourceKeys: Int32Array = keys;
  let sourceValues: Int32Array = values;
  let destinationKeys: Int32Array = temporaryKeys;
  let destinationValues: Int32Array = temporaryValues;

  // Process the 32-bit keys one byte at a time, least significant byte first.
  for (let shift = 0; shift < 32; shift += 8) {
    bucketCount.fill(0);

    // Count how many keys land in each of the 256 byte buckets.
    for (let index = 0; index < length; index++) {
      const bucket = (sourceKeys[index] >>> shift) & 0xff;
      bucketCount[bucket]++;
    }

    // Convert the counts into start offsets via an exclusive prefix sum.
    let runningOffset = 0;
    for (let bucket = 0; bucket < 256; bucket++) {
      const currentCount = bucketCount[bucket];
      bucketCount[bucket] = runningOffset;
      runningOffset += currentCount;
    }

    // Scatter every key/value pair into its sorted slot for this byte.
    for (let index = 0; index < length; index++) {
      const bucket = (sourceKeys[index] >>> shift) & 0xff;
      const position = bucketCount[bucket]++;
      destinationKeys[position] = sourceKeys[index];
      destinationValues[position] = sourceValues[index];
    }

    // Swap the source and destination buffers for the next byte pass.
    const swappedKeys = sourceKeys;
    sourceKeys = destinationKeys;
    destinationKeys = swappedKeys;

    const swappedValues = sourceValues;
    sourceValues = destinationValues;
    destinationValues = swappedValues;
  }

  // Four byte passes is an even number of swaps, so the sorted data already
  // sits back in the original keys/values arrays — no extra copy is needed.
}

/**
 * Computes the maximum possible height of the tallest building given the
 * adjacency and per-building height restrictions.
 *
 * @param n - The number of buildings, labeled 1 to n.
 * @param restrictions - Pairs of [buildingId, maxHeight].
 * @returns The maximum achievable height of the tallest building.
 */
function maxBuilding(n: number, restrictions: number[][]): number {
  const restrictionCount = restrictions.length;

  // With no height caps the heights climb by one from building 1 up to n.
  if (restrictionCount === 0) {
    return n - 1;
  }

  // Slot 0 is reserved for the mandatory "building 1 has height 0" rule.
  const pointCount = restrictionCount + 1;
  const buildingIds = new Int32Array(pointCount);
  const maxHeights = new Int32Array(pointCount);

  buildingIds[0] = 1;
  maxHeights[0] = 0;

  for (let index = 0; index < restrictionCount; index++) {
    const restriction = restrictions[index];
    buildingIds[index + 1] = restriction[0];
    maxHeights[index + 1] = restriction[1];
  }

  // Order the constrained buildings left to right by their position.
  radixSortKeyValue(buildingIds, maxHeights, pointCount);

  // Forward pass: a building is capped by its left neighbour plus the gap.
  for (let index = 1; index < pointCount; index++) {
    const reachableFromLeft =
      maxHeights[index - 1] + (buildingIds[index] - buildingIds[index - 1]);
    if (reachableFromLeft < maxHeights[index]) {
      maxHeights[index] = reachableFromLeft;
    }
  }

  // Backward pass: symmetric tightening using the right neighbour.
  for (let index = pointCount - 2; index >= 0; index--) {
    const reachableFromRight =
      maxHeights[index + 1] + (buildingIds[index + 1] - buildingIds[index]);
    if (reachableFromRight < maxHeights[index]) {
      maxHeights[index] = reachableFromRight;
    }
  }

  // Between two fixed points the peak is where the two upward slopes meet:
  // floor((leftHeight + rightHeight + distance) / 2).
  let tallest = 0;
  for (let index = 1; index < pointCount; index++) {
    const leftHeight = maxHeights[index - 1];
    const rightHeight = maxHeights[index];
    const distance = buildingIds[index] - buildingIds[index - 1];
    const peak = Math.floor((leftHeight + rightHeight + distance) / 2);
    if (peak > tallest) {
      tallest = peak;
    }
  }

  // Past the last restriction the heights are free to climb up to building n.
  const tailPeak =
    maxHeights[pointCount - 1] + (n - buildingIds[pointCount - 1]);
  if (tailPeak > tallest) {
    tallest = tailPeak;
  }

  return tallest;
}
