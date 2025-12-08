const MAX_LIMIT = 250;

/**
 * Compute the greatest common divisor of two positive integers
 * using the iterative Euclidean algorithm.
 *
 * @param firstValue First integer value.
 * @param secondValue Second integer value.
 * @returns Greatest common divisor of the two input values.
 */
function greatestCommonDivisor(firstValue: number, secondValue: number): number {
  // Iterate until the remainder becomes zero
  while (secondValue !== 0) {
    const remainder = firstValue % secondValue;
    firstValue = secondValue;
    secondValue = remainder;
  }

  return firstValue;
}

/**
 * Count square triples (a, b, c) where 1 <= a, b, c <= n and a^2 + b^2 = c^2.
 * Uses Euclid's formula to generate all Pythagorean triples efficiently
 * instead of scanning all (a, b) pairs.
 *
 * Each valid (a, b, c) with a != b contributes two ordered triples:
 * (a, b, c) and (b, a, c).
 *
 * @param n Upper bound for side length (1 <= n <= 250).
 * @returns Number of ordered square triples within [1, n].
 */
function countTriples(n: number): number {
  // Guard against invalid input beyond the supported constraint
  if (n > MAX_LIMIT) {
    throw new Error("Input n exceeds supported limit.");
  }

  let tripleCount = 0;

  // Outer parameter in Euclid's formula (commonly denoted as m)
  for (let euclidOuter = 2; ; euclidOuter++) {
    const outerSquare = euclidOuter * euclidOuter;

    // With inner = 1 and scaling factor = 1, the smallest possible c is outerSquare + 1
    // Once this exceeds n, no larger euclidOuter will work
    if (outerSquare + 1 > n) {
      break;
    }

    // Inner parameter in Euclid's formula (commonly denoted as n)
    for (let euclidInner = 1; euclidInner < euclidOuter; euclidInner++) {
      // Euclid's formula requires euclidOuter and euclidInner to have opposite parity
      if (((euclidOuter - euclidInner) & 1) === 0) {
        continue;
      }

      // Skip if not coprime to ensure we generate primitive triples only
      if (greatestCommonDivisor(euclidOuter, euclidInner) !== 1) {
        continue;
      }

      const innerSquare = euclidInner * euclidInner;
      const baseSideC = outerSquare + innerSquare;

      // For this (euclidOuter, euclidInner), side c increases with euclidInner
      // If baseSideC already exceeds n, larger euclidInner will also exceed n
      if (baseSideC > n) {
        break;
      }

      // Compute the primitive triple sides
      const baseSideA = outerSquare - innerSquare;
      const baseSideB = 2 * euclidOuter * euclidInner;

      // Scale the primitive triple by k = 1, 2, 3, ...
      let scaledSideA = baseSideA;
      let scaledSideB = baseSideB;
      let scaledSideC = baseSideC;

      // Only keep scaled triples where all sides remain within [1, n]
      while (scaledSideC <= n && scaledSideA <= n && scaledSideB <= n) {
        // Count both (a, b, c) and (b, a, c) as ordered triples
        tripleCount += 2;

        // Move to the next scaled triple
        scaledSideA += baseSideA;
        scaledSideB += baseSideB;
        scaledSideC += baseSideC;
      }
    }
  }

  return tripleCount;
}
