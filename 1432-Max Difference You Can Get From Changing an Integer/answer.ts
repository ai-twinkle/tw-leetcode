function maxDiff(num: number): number {
  const digitPlaceValueSums = new Uint32Array(10);

  // 1. Identify the most significant digit and build place-value sums
  let placeValue = 1;
  let mostSignificantDigit = 0;
  while (num > 0) {
    const digit = num % 10;
    digitPlaceValueSums[digit] += placeValue;
    mostSignificantDigit = digit; // Will end up as the last (i.e. most significant) digit
    num = (num / 10) | 0;         // Fast floor
    placeValue *= 10;
  }

  // 2 In one loop, find both:
  //    - The best increase by mapping x -> 9
  //    - The best decrease by mapping x -> 0 (or 1 if x is the leading digit)
  let bestIncrease = 0;
  let bestDecrease = 0;

  for (let digit = 0; digit < 10; digit++) {
    const sumOfPlaces = digitPlaceValueSums[digit];
    if (sumOfPlaces === 0) {
      continue;
    }

    // Maximize by replacing digit -> 9
    const increaseDelta = (9 - digit) * sumOfPlaces;
    if (increaseDelta > bestIncrease) bestIncrease = increaseDelta;

    // Minimize by replacing digit -> 0 (or 1 if it’s the leading digit)
    let replacement = 0;
    if (digit === mostSignificantDigit) {
      replacement = 1;
      // if replacement === digit, no effective change
      if (replacement === digit) {
        continue;
      }
    }
    const decreaseDelta = (replacement - digit) * sumOfPlaces;
    if (decreaseDelta < bestDecrease) {
      bestDecrease = decreaseDelta;
    }
  }

  // 3. Difference between the best "up" and the best "down"
  return bestIncrease - bestDecrease;
}
