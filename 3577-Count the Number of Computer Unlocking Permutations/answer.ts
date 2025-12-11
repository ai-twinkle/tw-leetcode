const MODULO = 1_000_000_007;

// Based on the constraints: 2 <= complexity.length <= 1e5
const MAXIMUM_LENGTH = 100_000;

// Precomputed factorials of (0...MAXIMUM_LENGTH-1) modulo MODULO.
// factorialValues[k] = k! % MODULO
const factorialValues = new Uint32Array(MAXIMUM_LENGTH);

// Immediately invoked initializer to fill factorial table once
(function initializeFactorials(): void {
  // 0! = 1
  factorialValues[0] = 1;

  for (let index = 1; index < MAXIMUM_LENGTH; index++) {
    // Use number arithmetic, then assign to typed array
    const previousFactorial = factorialValues[index - 1];
    factorialValues[index] = (previousFactorial * index) % MODULO;
  }
})();


function countPermutations(complexity: number[]): number {
  const complexityLength = complexity.length;
  const rootComplexity = complexity[0];

  // Check if computer 0 is the unique global minimum complexity
  let isRootStrictMinimum = true;

  for (let index = 1; index < complexityLength; index++) {
    if (rootComplexity >= complexity[index]) {
      // If any other computer has complexity <= root,
      // some computer with minimum complexity cannot be unlocked
      isRootStrictMinimum = false;
      break;
    }
  }

  if (!isRootStrictMinimum) {
    return 0;
  }

  // We need (n - 1)! modulo MODULO
  const factorialIndex = complexityLength - 1;

  // Safety guard if someone ever calls with length > MAXIMUM_LENGTH
  if (factorialIndex < 0 || factorialIndex >= MAXIMUM_LENGTH) {
    // Fallback: compute factorial on the fly (still fast enough for single call)
    let factorialValue = 1;

    for (let value = 2; value <= factorialIndex; value++) {
      factorialValue = (factorialValue * value) % MODULO;
    }

    return factorialValue;
  }

  return factorialValues[factorialIndex];
}
