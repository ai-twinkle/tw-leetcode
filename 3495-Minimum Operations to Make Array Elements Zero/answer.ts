/**
 * Precomputed lookup tables used for fast log-base-4 calculations.
 */
interface Tables {
  powerOfFourTable: Uint32Array;        // Powers of four (4^k) up to the maximum range needed.
  weightedPrefixSumTable: Float64Array; // Prefix sums of k * 3 * 4^k for fast range summation.
}

function minOperations(queries: number[][]): number {
  /**
   * Initialize and cache the power-of-four table and weighted prefix sums.
   * Ensures the precomputation is performed only once.
   *
   * @returns The lookup tables for powers of four and prefix sums.
   */
  function getTables(): Tables {
    if (getTables.cache !== null) {
      return getTables.cache;
    }

    const powerOfFourList: number[] = [];
    let currentValue = 1;
    while (currentValue <= 1_073_741_824) { // 4^15 just above 1e9
      powerOfFourList.push(currentValue);
      currentValue *= 4;
    }
    const powerOfFourTable = new Uint32Array(powerOfFourList);

    const weightedPrefixSumTable = new Float64Array(powerOfFourTable.length + 1);
    let runningSum = 0;
    for (let k = 0; k < powerOfFourTable.length; k++) {
      weightedPrefixSumTable[k] = runningSum;
      runningSum += k * 3 * powerOfFourTable[k];
    }
    weightedPrefixSumTable[powerOfFourTable.length] = runningSum;

    getTables.cache = { powerOfFourTable, weightedPrefixSumTable };
    return getTables.cache;
  }
  getTables.cache = null as Tables | null;

  /**
   * Compute floor(log4(n)) efficiently using bit tricks and precomputed powers of four.
   *
   * @param n - Input integer (n >= 1).
   * @param powerOfFourTable - Precomputed powers of four.
   * @returns Index k such that 4^k <= n < 4^(k+1).
   */
  function floorLogBaseFourIndex(n: number, powerOfFourTable: Uint32Array): number {
    const logBaseTwoFloor = 31 - Math.clz32(n | 0);
    let k = logBaseTwoFloor >>> 1;

    if (n < powerOfFourTable[k]) {
      k -= 1;
    } else if (k + 1 < powerOfFourTable.length && n >= powerOfFourTable[k + 1]) {
      k += 1;
    }
    return k;
  }

  /**
   * Compute prefix sum of floor(log4(x)) for all x in [1, n].
   *
   * @param n - Upper bound of the range.
   * @param powerOfFourTable - Precomputed powers of four.
   * @param weightedPrefixSumTable - Precomputed weighted prefix sums.
   * @returns Sum_{x=1..n} floor(log4(x)), or 0 if n <= 0.
   */
  function prefixSumFloorLogBaseFour(
    n: number,
    powerOfFourTable: Uint32Array,
    weightedPrefixSumTable: Float64Array
  ): number {
    if (n <= 0) {
      return 0;
    }

    const k = floorLogBaseFourIndex(n, powerOfFourTable);
    return weightedPrefixSumTable[k] + k * (n - powerOfFourTable[k] + 1);
  }

  const { powerOfFourTable, weightedPrefixSumTable } = getTables();
  let totalOperationsSum = 0;

  for (let i = 0; i < queries.length; i++) {
    const left = queries[i][0] | 0;
    const right = queries[i][1] | 0;

    const lengthOfInterval = right - left + 1;
    const sumFloorLogBaseFour =
      prefixSumFloorLogBaseFour(right, powerOfFourTable, weightedPrefixSumTable) -
      prefixSumFloorLogBaseFour(left - 1, powerOfFourTable, weightedPrefixSumTable);

    const totalRequiredSelections = lengthOfInterval + sumFloorLogBaseFour;

    const loadBound = Math.ceil(totalRequiredSelections * 0.5);
    const largestIndividualSteps = floorLogBaseFourIndex(right, powerOfFourTable) + 1;

    let minimalOperationsForQuery = 0;
    if (loadBound > largestIndividualSteps) {
      minimalOperationsForQuery = loadBound;
    } else {
      minimalOperationsForQuery = largestIndividualSteps;
    }

    totalOperationsSum += minimalOperationsForQuery;
  }

  return totalOperationsSum;
}
