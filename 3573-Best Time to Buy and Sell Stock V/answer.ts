function maximumProfit(prices: number[], k: number): number {
  const dayCount = prices.length;

  // Each transaction needs at least two days, so cap k to floor(dayCount / 2)
  const effectiveTransactionLimit = (k < (dayCount >> 1)) ? k : (dayCount >> 1);
  if (effectiveTransactionLimit === 0) {
    return 0;
  }

  // DP state size: number of completed transactions from 0 to effectiveTransactionLimit
  const stateSize = effectiveTransactionLimit + 1;
  const NEGATIVE_INFINITY = -1e30;

  // longHolding[t]: max profit after opening a long position with t completed transactions
  const longHolding = new Float64Array(stateSize);

  // shortHolding[t]: max profit after opening a short position with t completed transactions
  const shortHolding = new Float64Array(stateSize);

  // cash[t]: max profit with t completed transactions and no open position
  const cash = new Float64Array(stateSize);

  // Initialize all states as unreachable
  longHolding.fill(NEGATIVE_INFINITY);
  shortHolding.fill(NEGATIVE_INFINITY);
  cash.fill(NEGATIVE_INFINITY);

  // Base state: no transaction, no position, zero profit
  cash[0] = 0;

  for (let dayIndex = 0; dayIndex < dayCount; dayIndex++) {
    const price = prices[dayIndex];

    // Maximum index where opening a position is allowed today
    const halfDay = dayIndex >> 1;
    const maxOpenTransactionIndex =
      (halfDay < effectiveTransactionLimit) ? halfDay : effectiveTransactionLimit;

    // Maximum index where closing a transaction is allowed today
    const halfDayRoundedUp = (dayIndex + 1) >> 1;
    const maxCompletedTransactionIndex =
      (halfDayRoundedUp < effectiveTransactionLimit) ? halfDayRoundedUp : effectiveTransactionLimit;

    // Handle the highest cash state: only closing is allowed to avoid same-day chaining
    if (maxCompletedTransactionIndex > maxOpenTransactionIndex) {
      const transactionIndex = maxCompletedTransactionIndex;

      let bestCash = cash[transactionIndex];

      // Close a long position from previous transaction count
      const previousLong = longHolding[transactionIndex - 1];
      const closeLongCandidate = previousLong + price;
      if (closeLongCandidate > bestCash) {
        bestCash = closeLongCandidate;
      }

      // Close a short position from previous transaction count
      const previousShort = shortHolding[transactionIndex - 1];
      const closeShortCandidate = previousShort - price;
      if (closeShortCandidate > bestCash) {
        bestCash = closeShortCandidate;
      }

      cash[transactionIndex] = bestCash;
    }

    // Iterate backwards to prevent same-day open-after-close transitions
    for (let transactionIndex = maxOpenTransactionIndex; transactionIndex >= 1; transactionIndex--) {
      const cashBefore = cash[transactionIndex];

      // Try opening or keeping a long position
      let bestLongHolding = longHolding[transactionIndex];
      const openLongCandidate = cashBefore - price;
      if (openLongCandidate > bestLongHolding) {
        bestLongHolding = openLongCandidate;
      }
      longHolding[transactionIndex] = bestLongHolding;

      // Try opening or keeping a short position
      let bestShortHolding = shortHolding[transactionIndex];
      const openShortCandidate = cashBefore + price;
      if (openShortCandidate > bestShortHolding) {
        bestShortHolding = openShortCandidate;
      }
      shortHolding[transactionIndex] = bestShortHolding;

      // Try closing one position to complete a transaction
      let bestCash = cashBefore;

      const closeLongCandidate = longHolding[transactionIndex - 1] + price;
      if (closeLongCandidate > bestCash) {
        bestCash = closeLongCandidate;
      }

      const closeShortCandidate = shortHolding[transactionIndex - 1] - price;
      if (closeShortCandidate > bestCash) {
        bestCash = closeShortCandidate;
      }

      cash[transactionIndex] = bestCash;
    }

    // Handle opening positions when zero transactions are completed
    const negativePrice = -price;

    let bestLongHolding0 = longHolding[0];
    if (negativePrice > bestLongHolding0) {
      bestLongHolding0 = negativePrice;
    }
    longHolding[0] = bestLongHolding0;

    let bestShortHolding0 = shortHolding[0];
    if (price > bestShortHolding0) {
      bestShortHolding0 = price;
    }
    shortHolding[0] = bestShortHolding0;
  }

  // Final answer is the maximum cash state with any completed transaction count
  let maxProfit = cash[0];
  for (let transactionIndex = 1; transactionIndex <= effectiveTransactionLimit; transactionIndex++) {
    const candidate = cash[transactionIndex];
    if (candidate > maxProfit) {
      maxProfit = candidate;
    }
  }

  return maxProfit;
}
