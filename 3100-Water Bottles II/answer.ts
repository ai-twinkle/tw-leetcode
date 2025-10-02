function maxBottlesDrunk(numBottles: number, numExchange: number): number {
  // Quadratic coefficients for inequality: t^2 + (2E - 3)t + (2 - 2B) <= 0
  const linearCoefficient = 2 * numExchange - 3;
  const constantTerm = 2 - 2 * numBottles;

  // Discriminant (non-negative within constraints)
  const discriminant = linearCoefficient * linearCoefficient - 4 * constantTerm;

  // Estimate root using quadratic formula
  let numberOfExchanges = Math.floor(
    (-linearCoefficient + Math.sqrt(discriminant)) / 2
  );

  // Guard: ensure feasibility (if rounding overshot, adjust once)
  while (
    numBottles <
    numExchange * numberOfExchanges +
    ((numberOfExchanges - 1) * (numberOfExchanges - 2)) / 2
    ) {
    numberOfExchanges -= 1;
  }

  // Guard: if still feasible for one more, adjust once
  while (
    numBottles >=
    numExchange * (numberOfExchanges + 1) +
    (numberOfExchanges * (numberOfExchanges - 1)) / 2
    ) {
    numberOfExchanges += 1;
  }

  // Total drunk = initial full bottles + bottles obtained via exchanges
  return numBottles + numberOfExchanges;
}
