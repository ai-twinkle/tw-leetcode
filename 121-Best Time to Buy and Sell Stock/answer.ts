function maxProfit(prices: number[]): number {
  // If there is only one price, no transaction can be made
  const length = prices.length;
  if (length <= 1) {
    return 0;
  }

  // Track the minimum price seen so far as a candidate buy price
  let minimumPriceSoFar = prices[0];

  // Track the best profit that can be achieved
  let maximumProfit = 0;

  // Scan through the price array once
  for (let index = 1; index < length; index++) {
    const currentPrice = prices[index];

    // Calculate potential profit if we sell at the current price
    const potentialProfit = currentPrice - minimumPriceSoFar;

    // Update the maximum profit if this potential profit is better
    if (potentialProfit > maximumProfit) {
      maximumProfit = potentialProfit;
    }

    // Update the minimum price so far if the current price is lower
    if (currentPrice < minimumPriceSoFar) {
      minimumPriceSoFar = currentPrice;
    }
  }

  // Return the best achievable profit (0 if no profitable transaction)
  return maximumProfit;
}
