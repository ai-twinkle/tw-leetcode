function lengthAfterTransformations(s: string, t: number, nums: number[]): number {
  const MOD = 1_000_000_007;
  const ALPHABET_SIZE = 26;

  // 1. Count initial frequencies of each character in `s`
  const initialFrequencies = new Uint32Array(ALPHABET_SIZE);
  for (let i = 0; i < s.length; i++) {
    initialFrequencies[s.charCodeAt(i) - 97]++;
  }

  // 2. For small `t`, simulate transformation using dynamic programming
  if (t <= 10_000) {
    let currentFrequencies = new Uint32Array(initialFrequencies);
    let nextFrequencies = new Uint32Array(ALPHABET_SIZE);

    for (let step = 0; step < t; step++) {
      nextFrequencies.fill(0); // reset for next round

      // Process each letter and distribute its count
      for (let letterIndex = 0; letterIndex < ALPHABET_SIZE; letterIndex++) {
        const count = currentFrequencies[letterIndex];
        if (count !== 0) {
          const reachSpan = nums[letterIndex]; // how many next letters this letter expands into
          for (let offset = 1; offset <= reachSpan; offset++) {
            const targetIndex = (letterIndex + offset) % ALPHABET_SIZE;
            nextFrequencies[targetIndex] = (nextFrequencies[targetIndex] + count) % MOD;
          }
        }
      }

      // Move to the next iteration
      [currentFrequencies, nextFrequencies] = [nextFrequencies, currentFrequencies];
    }

    // Sum the final frequencies to get the result
    let totalLength = 0;
    for (let frequency of currentFrequencies) {
      totalLength = (totalLength + frequency) % MOD;
    }
    return totalLength;
  }

  // 3. For large `t`, use matrix exponentiation for performance
  const MOD_BIGINT = BigInt(MOD);
  const MATRIX_SIZE = ALPHABET_SIZE * ALPHABET_SIZE;

  // 4. Construct base transition matrix as 1D row-major array
  const baseMatrix = Array<bigint>(MATRIX_SIZE).fill(0n);
  for (let source = 0; source < ALPHABET_SIZE; source++) {
    for (let offset = 1; offset <= nums[source]; offset++) {
      const target = (source + offset) % ALPHABET_SIZE;
      baseMatrix[target * ALPHABET_SIZE + source] += 1n;
    }
  }

  // 5. Setup for matrix exponentiation
  let transitionMatrix = baseMatrix.slice(); // base^1
  let frequencyVector = Array.from(initialFrequencies, (count) => BigInt(count)); // initial state

  const intermediateMatrix = Array<bigint>(MATRIX_SIZE).fill(0n);   // reusable buffer for matrix multiplication
  const intermediateVector = Array<bigint>(ALPHABET_SIZE).fill(0n); // reusable buffer for vector multiplication

  let exponent = BigInt(t); // exponent in binary
  while (exponent > 0n) {
    // Apply matrix to vector if current bit is 1
    if (exponent & 1n) {
      for (let row = 0; row < ALPHABET_SIZE; row++) {
        let accumulator = 0n;
        const rowStart = row * ALPHABET_SIZE;

        for (let col = 0; col < ALPHABET_SIZE; col++) {
          const value = transitionMatrix[rowStart + col];
          if (value !== 0n) {
            accumulator += value * frequencyVector[col];
          }
        }
        intermediateVector[row] = accumulator % MOD_BIGINT;
      }
      frequencyVector = intermediateVector.slice(); // update state
    }

    // Square the transition matrix (matrix^2, matrix^4, etc.)
    intermediateMatrix.fill(0n);
    for (let row = 0; row < ALPHABET_SIZE; row++) {
      const rowStart = row * ALPHABET_SIZE;

      for (let mid = 0; mid < ALPHABET_SIZE; mid++) {
        const multiplier = transitionMatrix[rowStart + mid];
        if (multiplier !== 0n) {
          const midStart = mid * ALPHABET_SIZE;
          for (let col = 0; col < ALPHABET_SIZE; col++) {
            intermediateMatrix[rowStart + col] += multiplier * transitionMatrix[midStart + col];
          }
        }
      }

      // Modulo the entire row to avoid overflow
      for (let col = 0; col < ALPHABET_SIZE; col++) {
        intermediateMatrix[rowStart + col] %= MOD_BIGINT;
      }
    }

    // Move to the next matrix power
    transitionMatrix = intermediateMatrix.slice();
    exponent >>= 1n; // shift exponent
  }

  // 6. Final result: sum the transformed frequency vector
  let finalSum = 0n;
  for (let value of frequencyVector) {
    finalSum += value;
  }
  return Number(finalSum % MOD_BIGINT);
}
