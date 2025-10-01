function numWaterBottles(numBottles: number, numExchange: number): number {
  const numerator = numBottles - 1;
  const denominator = numExchange - 1;

  // Use bitwise OR with 0 to perform `Math.floor` operation
  const extraFromExchange = (numerator / denominator) | 0;

  return numBottles + extraFromExchange;
}
