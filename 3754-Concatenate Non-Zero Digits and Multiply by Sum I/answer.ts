function sumAndMultiply(n: number): number {
  let concatenatedValue = 0;
  let digitSum = 0;
  let placeMultiplier = 1;

  // Process digits from least significant to most significant
  while (n > 0) {
    const currentDigit = n % 10;

    // Skip zero digits so they are not concatenated into x
    if (currentDigit !== 0) {
      concatenatedValue += currentDigit * placeMultiplier;
      digitSum += currentDigit;
      placeMultiplier *= 10;
    }

    n = (n - currentDigit) / 10;
  }

  return concatenatedValue * digitSum;
}
