function countBalancedPermutations(numberString: string): number {
  const MODULUS = 1000000007n;
  const MAX_DIGITS = 80;

  // Step 1: Build factorial and inverse factorial tables for nCr calculations
  //         factorials[k] = k! mod MODULUS
  //         inverseFactorials[k] = (k!)^{-1} mod MODULUS, to compute combinations efficiently
  const factorials = Array<bigint>(MAX_DIGITS + 1).fill(0n);
  const inverseFactorials = Array<bigint>(MAX_DIGITS + 1).fill(0n);
  factorials[0] = 1n;

  for (let index = 1; index <= MAX_DIGITS; index++) {
    // multiply previous factorial by current index and apply modulus to keep values in range
    factorials[index] = (factorials[index - 1] * BigInt(index)) % MODULUS;
  }

  /**
   * Fast exponentiation (binary exponentiation) to compute modular inverses
   * Uses exponentiation by squaring in O(log exponentValue) time.
   *
   * @param baseValue {bigint} - the base to raise
   * @param exponentValue {bigint} - the exponent power
   * @returns baseValue ^ exponentValue mod MODULUS
   */
  const computeModularPower = (baseValue: bigint, exponentValue: bigint): bigint => {
    let resultValue = 1n;
    let currentBase = baseValue % MODULUS;
    let currentExponent = exponentValue;

    while (currentExponent > 0n) {
      if (currentExponent & 1n) {
        // Include this bit's contribution
        resultValue = (resultValue * currentBase) % MODULUS;
      }
      // Square base for next bit and reduce modulo
      currentBase = (currentBase * currentBase) % MODULUS;

      // Shift exponent right to process next bit
      currentExponent >>= 1n;
    }
    return resultValue;
  };

  // Step 2: Compute inverse factorials using Fermat's little theorem
  //         Fermat: a^(p-1) ≡ 1 mod p => a^(p-2) ≡ a^{-1}
  inverseFactorials[MAX_DIGITS] = computeModularPower(factorials[MAX_DIGITS], MODULUS - 2n);
  for (let index = MAX_DIGITS; index >= 1; index--) {
    // Use relation: invFact[k-1] = invFact[k] * k mod MODULUS
    inverseFactorials[index - 1] = (inverseFactorials[index] * BigInt(index)) % MODULUS;
  }

  const totalDigits = numberString.length;
  const numberOfEvenPositions = Math.ceil(totalDigits / 2); // positions to allocate first half
  const numberOfOddPositions = totalDigits - numberOfEvenPositions;

  // Step 3: Count digit frequencies and compute the total sum
  const digitFrequencies = new Array<number>(10).fill(0);
  let totalSumOfDigits = 0;
  for (const character of numberString) {
    const digitValue = character.charCodeAt(0) - 48;
    digitFrequencies[digitValue]++;
    totalSumOfDigits += digitValue;
  }

  // Early exit: if sum is odd, cannot split equally
  if (totalSumOfDigits % 2 !== 0) {
    return 0;
  }
  const halfSumTarget = totalSumOfDigits / 2;

  // Early exit: target sum too large for available even positions
  if (halfSumTarget > numberOfEvenPositions * 9) {
    return 0;
  }

  // Step 4: Initialize DP tables for bounded-knapsack
  // dpTableCurrent[count][sum] = ways to pick 'count' digits summing to 'sum'
  let dpTableCurrent = Array.from(
    {length: numberOfEvenPositions + 1},
    () => Array<bigint>(halfSumTarget + 1).fill(0n)
  );
  let dpTableNext = Array.from(
    {length: numberOfEvenPositions + 1},
    () => Array<bigint>(halfSumTarget + 1).fill(0n)
  );
  dpTableCurrent[0][0] = 1n; // base case: zero digits sum to zero in one way

  // Step 5: Process each digit value (0 through 9) via bounded knapsack
  for (let digitValue = 0; digitValue <= 9; digitValue++) {
    const frequency = digitFrequencies[digitValue];
    if (frequency === 0) {
      continue;
    }

    // Precompute binomialCoefficients[k] = C(frequency, k)
    // number of ways to choose k copies of this digit from its frequency
    const binomialCoefficients = Array<bigint>(frequency + 1).fill(0n);
    for (let k = 0; k <= frequency; k++) {
      binomialCoefficients[k] =
        (factorials[frequency] * inverseFactorials[k] % MODULUS) *
        inverseFactorials[frequency - k] % MODULUS;
    }

    // Reset dpTableNext before computing transitions
    for (let count = 0; count <= numberOfEvenPositions; count++) {
      dpTableNext[count].fill(0n);
    }

    // Transition: for each current state, try adding 0..maxAdditional copies
    for (let count = 0; count <= numberOfEvenPositions; count++) {
      for (let currentSum = 0; currentSum <= halfSumTarget; currentSum++) {
        const currentWays = dpTableCurrent[count][currentSum];
        if (currentWays === 0n) {
          continue;
        }

        // maximum additional copies of this digit we can add
        const maxAdditional = Math.min(frequency, numberOfEvenPositions - count);

        for (let tryCount = 0; tryCount <= maxAdditional; tryCount++) {
          const newCount = count + tryCount;
          const newSum = currentSum + tryCount * digitValue;

          // No need to proceed further sums
          if (newSum > halfSumTarget) {
            break;
          }

          // Accumulate ways into dpTableNext state
          dpTableNext[newCount][newSum] =
            (dpTableNext[newCount][newSum] + currentWays * binomialCoefficients[tryCount]) % MODULUS;
        }
      }
    }

    // Prepare for next digit: swap tables instead of copying
    [dpTableCurrent, dpTableNext] = [dpTableNext, dpTableCurrent];
  }

  // Step 6: Retrieve number of ways to pick exactly 'numberOfEvenPositions' digits summing to target
  const waysToPickTarget = dpTableCurrent[numberOfEvenPositions][halfSumTarget];
  if (waysToPickTarget === 0n) {
    return 0;
  }

  // Step 7: Combine halves arrangements and correct for repeated digits
  //         Multiply by factorials of even and odd positions to count permutations
  let totalArrangements =
    (waysToPickTarget * factorials[numberOfEvenPositions] % MODULUS) *
    factorials[numberOfOddPositions] % MODULUS;

  // Divide by factorial of each digit frequency to correct overcount of identical items
  for (let d = 0; d <= 9; d++) {
    totalArrangements = (totalArrangements * inverseFactorials[digitFrequencies[d]]) % MODULUS;
  }

  // Convert BigInt result back to Number before returning
  return Number(totalArrangements);
}
