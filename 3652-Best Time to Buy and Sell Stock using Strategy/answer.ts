function maxProfit(prices: number[], strategy: number[], k: number): number {
  const dayCount = prices.length;
  const halfWindowSize = k >>> 1;

  let baseProfit = 0;
  let windowValueSum = 0;
  let secondHalfPriceSum = 0;

  // Compute base profit and initialize the first window sums in one pass
  for (let dayIndex = 0; dayIndex < dayCount; dayIndex++) {
    const price = prices[dayIndex];
    const action = strategy[dayIndex];
    const currentValue = action * price;

    baseProfit += currentValue;

    if (dayIndex < k) {
      windowValueSum += currentValue;

      if (dayIndex >= halfWindowSize) {
        secondHalfPriceSum += price;
      }
    }
  }

  let bestProfit = baseProfit;
  const lastStartIndex = dayCount - k;

  for (let startIndex = 0; startIndex <= lastStartIndex; startIndex++) {
    // Replace the window contribution with: 0 for first half, +prices for second half
    const modifiedProfit = baseProfit + (secondHalfPriceSum - windowValueSum);
    if (modifiedProfit > bestProfit) {
      bestProfit = modifiedProfit;
    }

    if (startIndex === lastStartIndex) {
      break;
    }

    // Slide window by 1: update windowValueSum and secondHalfPriceSum in O(1)
    const removeIndex = startIndex;
    const addIndex = startIndex + k;

    windowValueSum -= strategy[removeIndex] * prices[removeIndex];
    windowValueSum += strategy[addIndex] * prices[addIndex];

    const secondHalfRemoveIndex = startIndex + halfWindowSize;
    secondHalfPriceSum -= prices[secondHalfRemoveIndex];
    secondHalfPriceSum += prices[addIndex];
  }

  return bestProfit;
}
