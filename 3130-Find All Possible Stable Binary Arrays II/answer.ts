function numberOfStableArrays(zero: number, one: number, limit: number): number {
  const MODULO = 1000000007;

  // Ensure the inner loop iterates over the smaller dimension for better cache locality.
  if (zero > one) {
    const temp = zero;
    zero = one;
    one = temp;
  }

  // Number of columns in the flattened DP table (zero count dimension).
  const zeroDimensionSize = zero + 1;

  // Total number of DP states stored in the flattened array.
  const totalStateSize = (one + 1) * zeroDimensionSize;

  // DP arrays:
  // stableEndingWithZero[state] = number of arrays using (onesUsed, zerosUsed) ending with 0
  // stableEndingWithOne[state]  = number of arrays using (onesUsed, zerosUsed) ending with 1
  const stableEndingWithZero = new Int32Array(totalStateSize);
  const stableEndingWithOne = new Int32Array(totalStateSize);

  const maxInitialZeros = zero < limit ? zero : limit;
  const maxInitialOnes = one < limit ? one : limit;

  // Initialize sequences consisting only of zeros.
  for (let zerosUsed = 0; zerosUsed <= maxInitialZeros; zerosUsed++) {
    stableEndingWithZero[zerosUsed] = 1;
  }

  // Initialize sequences consisting only of ones.
  for (
    let onesUsed = 0, rowStartIndex = 0;
    onesUsed <= maxInitialOnes;
    onesUsed++, rowStartIndex += zeroDimensionSize
  ) {
    stableEndingWithOne[rowStartIndex] = 1;
  }

  stableEndingWithZero[0] = 0;
  stableEndingWithOne[0] = 0;

  const forbiddenRunLength = limit + 1;
  const forbiddenRowOffset = forbiddenRunLength * zeroDimensionSize;

  // Fill DP states.
  for (
    let onesUsed = 1, rowStartIndex = zeroDimensionSize;
    onesUsed <= one;
    onesUsed++, rowStartIndex += zeroDimensionSize
  ) {
    const previousRowStartIndex = rowStartIndex - zeroDimensionSize;

    // Row that violates the maximum consecutive ones constraint.
    const forbiddenOnesRowStartIndex =
      onesUsed > limit ? rowStartIndex - forbiddenRowOffset : -1;

    for (
      let zerosUsed = 1, stateIndex = rowStartIndex + 1;
      zerosUsed <= zero;
      zerosUsed++, stateIndex++
    ) {
      // Transition: append 0
      let countEndingWithZero =
        stableEndingWithZero[stateIndex - 1] +
        stableEndingWithOne[stateIndex - 1];

      if (countEndingWithZero >= MODULO) {
        countEndingWithZero -= MODULO;
      }

      // Remove invalid states where zeros exceed the allowed consecutive limit.
      if (zerosUsed > limit) {
        countEndingWithZero -=
          stableEndingWithOne[stateIndex - forbiddenRunLength];

        if (countEndingWithZero < 0) {
          countEndingWithZero += MODULO;
        }
      }

      stableEndingWithZero[stateIndex] = countEndingWithZero;

      // Transition: append 1
      let countEndingWithOne =
        stableEndingWithZero[previousRowStartIndex + zerosUsed] +
        stableEndingWithOne[previousRowStartIndex + zerosUsed];

      if (countEndingWithOne >= MODULO) {
        countEndingWithOne -= MODULO;
      }

      // Remove invalid states where ones exceed the allowed consecutive limit.
      if (forbiddenOnesRowStartIndex >= 0) {
        countEndingWithOne -=
          stableEndingWithZero[forbiddenOnesRowStartIndex + zerosUsed];

        if (countEndingWithOne < 0) {
          countEndingWithOne += MODULO;
        }
      }

      stableEndingWithOne[stateIndex] = countEndingWithOne;
    }
  }

  const finalStateIndex = one * zeroDimensionSize + zero;

  let totalStableArrays =
    stableEndingWithZero[finalStateIndex] +
    stableEndingWithOne[finalStateIndex];

  if (totalStableArrays >= MODULO) {
    totalStableArrays -= MODULO;
  }

  return totalStableArrays;
}
