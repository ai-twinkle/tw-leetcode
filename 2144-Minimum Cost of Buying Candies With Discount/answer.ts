function minimumCost(cost: number[]): number {
  const length = cost.length;

  // Bucket each cost value; Uint8Array suffices since length <= 100 fits in 8 bits
  const valueCounts = new Uint8Array(101);
  for (let index = 0; index < length; index++) {
    valueCounts[cost[index]]++;
  }

  let totalCost = 0;
  let position = 0;

  // Walk values from highest to lowest; every third candy in sorted-desc order is free
  for (let value = 100; value >= 1; value--) {
    const count = valueCounts[value];
    if (count === 0) {
      continue;
    }
    // This value occupies sorted-desc positions [position, position + count - 1]
    const nextPosition = position + count;
    // Count free slots (positions where index % 3 === 2) in that range via prefix arithmetic
    const freeCount = ((nextPosition / 3) | 0) - ((position / 3) | 0);
    // Only paid positions in this bucket contribute to total cost
    totalCost += value * (count - freeCount);
    position = nextPosition;
  }

  return totalCost;
}
