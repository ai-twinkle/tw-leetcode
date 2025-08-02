function minCost(basket1: number[], basket2: number[]): number {
  // 1. Prepare a map to count the differences between the two baskets
  const count = new Map<number, number>();
  let globalMinimum = Infinity;
  const n = basket1.length;

  // 2. Traverse both arrays and update the count map
  for (let i = 0; i < n; i++) {
    const value1 = basket1[i];
    count.set(value1, (count.get(value1) ?? 0) + 1);
    if (value1 < globalMinimum) {
      globalMinimum = value1;
    }
    const value2 = basket2[i];
    count.set(value2, (count.get(value2) ?? 0) - 1);
    if (value2 < globalMinimum) {
      globalMinimum = value2;
    }
  }

  // 3. Check if it is possible to make the baskets equal
  let totalImbalance = 0;
  for (const frequency of count.values()) {
    if (frequency % 2 !== 0) {
      // If there is any odd frequency, it is impossible
      return -1;
    }
    totalImbalance += Math.abs(frequency) >> 1;
  }
  if (totalImbalance === 0) {
    // The baskets are already equal
    return 0;
  }

  // 4. Prepare the array of values that need to be swapped
  const toSwap = new Array<number>(totalImbalance);
  let index = 0;
  for (const [value, frequency] of count) {
    const times = Math.abs(frequency) >> 1;
    for (let j = 0; j < times; j++) {
      toSwap[index++] = value;
    }
  }

  // 5. Sort the array for minimum swap cost calculation
  toSwap.sort((a, b) => a - b);

  // 6. Calculate the minimum total cost
  const swapCount = totalImbalance >> 1;
  let totalCost = 0;
  const doubleMinimum = globalMinimum * 2;
  for (let i = 0; i < swapCount; i++) {
    if (toSwap[i] < doubleMinimum) {
      totalCost += toSwap[i];
    } else {
      totalCost += doubleMinimum;
    }
  }

  // 7. Return the minimum cost to make both baskets equal
  return totalCost;
}
