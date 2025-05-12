function findEvenNumbers(digits: number[]): number[] {
  // Build a frequency count of each digit (0–9)
  const digitFrequencies = new Uint8Array(10);
  for (const digit of digits) {
    digitFrequencies[digit]++;
  }

  const result: number[] = [];

  // Hundreds place: 1–9 (no leading zero)
  for (let hundredsPlace = 1; hundredsPlace <= 9; hundredsPlace++) {
    const countHundred = digitFrequencies[hundredsPlace];
    if (countHundred === 0) {
      continue;
    }

    // Tens place: 0–9
    for (let tensPlace = 0; tensPlace <= 9; tensPlace++) {
      // If tensPlace equals hundredsPlace, we've already used one of that digit
      const countTen = digitFrequencies[tensPlace] - (tensPlace === hundredsPlace ? 1 : 0);
      if (countTen <= 0) {
        continue;
      }

      // Units place: even digits only (0, 2, 4, 6, 8)
      for (let unitsPlace = 0; unitsPlace <= 8; unitsPlace += 2) {
        // Subtract any usage from hundreds and tens
        const countUnit =
          digitFrequencies[unitsPlace] -
          (unitsPlace === hundredsPlace ? 1 : 0) -
          (unitsPlace === tensPlace ? 1 : 0);
        if (countUnit <= 0) {
          continue;
        }

        result.push(hundredsPlace * 100 + tensPlace * 10 + unitsPlace);
      }
    }
  }

  // The triple‐nested loops already generate numbers in ascending order
  return result;
}
