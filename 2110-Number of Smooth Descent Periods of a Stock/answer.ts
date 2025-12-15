function getDescentPeriods(prices: number[]): number {
  const pricesLength = prices.length;

  // Every single day is itself a valid descent period
  let totalPeriods = 1;

  // Length of the current continuous smooth descent segment
  let currentDescentLength = 1;

  let previousPrice = prices[0];

  for (let index = 1; index < pricesLength; index++) {
    const currentPrice = prices[index];

    // Extend the current smooth descent segment if the drop is exactly 1
    if (currentPrice === previousPrice - 1) {
      currentDescentLength += 1;
    } else {
      // Restart counting when the smooth descent condition breaks
      currentDescentLength = 1;
    }

    // Add all sub-periods ending at the current day
    totalPeriods += currentDescentLength;
    previousPrice = currentPrice;
  }

  return totalPeriods;
}
