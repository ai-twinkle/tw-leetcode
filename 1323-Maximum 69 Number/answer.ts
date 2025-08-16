// Reused across calls: Avoids recomputing powers and reduces GC pressure.
const PRECOMPUTED_POWER_OF_TEN: Int32Array = new Int32Array([
  1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000
]);

function maximum69Number (num: number): number {
  const originalNumber = num;

  // Find highest place value ≤ num using the precomputed typed array.
  let index = PRECOMPUTED_POWER_OF_TEN.length - 1;
  while (index > 0 && PRECOMPUTED_POWER_OF_TEN[index] > num) {
    index--;
  }

  // Scan digits from most significant to least significant.
  let currentPlace = PRECOMPUTED_POWER_OF_TEN[index];
  while (currentPlace > 0) {
    const quotient = Math.trunc(num / currentPlace);
    const digit = quotient % 10; // safe integer arithmetic under problem constraints

    if (digit === 6) {
      // Turn this 6 into 9 -> add 3 * place once and return.
      return originalNumber + 3 * currentPlace;
    }
    currentPlace = Math.trunc(currentPlace / 10);
  }

  // Already maximal.
  return originalNumber;
}
