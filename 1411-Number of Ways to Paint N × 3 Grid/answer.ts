const MODULUS = 1_000_000_007;
const MAXIMUM_ROW_COUNT = 5000;

/**
 * totalWaysByRow[row] = number of valid paintings for an n x 3 grid with n = row.
 */
const totalWaysByRow = new Int32Array(MAXIMUM_ROW_COUNT + 1);

let computedRowCount = 0;
let computedTwoColorPatternCount = 0;   // "ABA" type: first == third, middle different
let computedThreeColorPatternCount = 0; // "ABC" type: all three different

/**
 * @param n The number of rows in the 3-column grid.
 * @returns The number of valid colorings modulo 1e9+7.
 */
function numOfWays(n: number): number {
  if (computedRowCount === 0) {
    // Initialize row 1: 6 "ABA" patterns + 6 "ABC" patterns
    computedRowCount = 1;
    computedTwoColorPatternCount = 6;
    computedThreeColorPatternCount = 6;
    totalWaysByRow[1] = 12;
  }

  if (n <= computedRowCount) {
    return totalWaysByRow[n];
  }

  const modulus = MODULUS;
  let twoColorPatternCount = computedTwoColorPatternCount;
  let threeColorPatternCount = computedThreeColorPatternCount;

  for (let rowIndex = computedRowCount + 1; rowIndex <= n; rowIndex++) {
    // Use derived transitions to avoid expensive % operations in the hot loop
    let sumOfPatterns = twoColorPatternCount + threeColorPatternCount;
    if (sumOfPatterns >= modulus) {
      sumOfPatterns -= modulus;
    }

    let nextThreeColorPatternCount = sumOfPatterns + sumOfPatterns; // 2 * (A + B)
    if (nextThreeColorPatternCount >= modulus) {
      nextThreeColorPatternCount -= modulus;
    }

    let nextTwoColorPatternCount = twoColorPatternCount + nextThreeColorPatternCount; // A + 2*(A+B)
    if (nextTwoColorPatternCount >= modulus) {
      nextTwoColorPatternCount -= modulus;
    }

    twoColorPatternCount = nextTwoColorPatternCount;
    threeColorPatternCount = nextThreeColorPatternCount;

    let totalWays = nextTwoColorPatternCount + nextThreeColorPatternCount;
    if (totalWays >= modulus) {
      totalWays -= modulus;
    }

    totalWaysByRow[rowIndex] = totalWays;
  }

  computedRowCount = n;
  computedTwoColorPatternCount = twoColorPatternCount;
  computedThreeColorPatternCount = threeColorPatternCount;

  return totalWaysByRow[n];
}
