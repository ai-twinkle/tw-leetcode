function lexicalOrder(n: number): number[] {
  // Pre-allocate once, and cache n in a local for faster access
  const resultList: number[] = new Array(n);
  const maxValue = n;

  let currentNumber = 1;

  // Position goes from 0 to n-1
  for (let position = 0; position < maxValue; position++) {
    resultList[position] = currentNumber;

    // Try to descend by multiplying by 10
    if (currentNumber * 10 <= maxValue) {
      currentNumber *= 10;
      continue;
    }

    // If we're at the end (>= max), climb up one level
    if (currentNumber >= maxValue) {
      // Use bitwise OR to do a fast truncating divide by 10,
      // which is equivalent to Math.floor(currentNumber / 10)
      currentNumber = (currentNumber / 10) | 0;
    }

    // Move to the next sibling
    currentNumber += 1;

    // Strip any trailing zeros we climbed past
    while (currentNumber % 10 === 0) {
      currentNumber = (currentNumber / 10) | 0;
    }
  }

  return resultList;
}
