function maxIceCream(costs: number[], coins: number): number {
  // Bars costing more than available coins can never be purchased
  const maxAffordable = Math.min(coins, 100000);

  const frequencyTable = new Int32Array(maxAffordable + 1);

  // Populate frequency table, skipping bars that exceed budget
  for (let index = 0; index < costs.length; index++) {
    const cost = costs[index];
    if (cost <= maxAffordable) {
      frequencyTable[cost]++;
    }
  }

  let remainingCoins = coins;
  let iceCreamCount = 0;

  // Greedily buy cheapest bars first using the sorted frequency table
  for (let price = 1; price <= maxAffordable; price++) {
    const affordable = Math.min(frequencyTable[price], Math.floor(remainingCoins / price));
    iceCreamCount += affordable;
    remainingCoins -= affordable * price;

    // No bar at this price or higher can be afforded
    if (remainingCoins < price) {
      break;
    }
  }

  return iceCreamCount;
}
