function findMaxForm(strs: string[], m: number, n: number): number {
  // Cache width once to avoid repeated (n + 1) computation
  const dynamicTableWidth = n + 1;

  // Flattened DP table: dp[zeroBudget * width + oneBudget] = best subset size
  const dynamicTable = new Uint16Array((m + 1) * dynamicTableWidth);

  // Iterate over each binary string and treat it as an item in the knapsack
  for (let stringIndex = 0; stringIndex < strs.length; stringIndex++) {
    const binaryString = strs[stringIndex];

    // Count the number of ones in the string
    let oneCountInString = 0;
    for (let characterIndex = 0; characterIndex < binaryString.length; characterIndex++) {
      if (binaryString.charCodeAt(characterIndex) === 49) {
        oneCountInString++;
      }
    }
    // Count of the zeros is total length minus count of ones
    const zeroCountInString = binaryString.length - oneCountInString;

    // Skip items that alone exceed the budgets
    if (zeroCountInString > m || oneCountInString > n) {
      continue;
    }

    // Reverse iterate zero and one budgets to enforce 0/1 usage
    for (let zeroBudget = m; zeroBudget >= zeroCountInString; zeroBudget--) {
      const currentRowBaseIndex = zeroBudget * dynamicTableWidth;
      const previousRowBaseIndex = (zeroBudget - zeroCountInString) * dynamicTableWidth;

      for (let oneBudget = n; oneBudget >= oneCountInString; oneBudget--) {
        const currentIndex = currentRowBaseIndex + oneBudget;
        const previousIndex = previousRowBaseIndex + (oneBudget - oneCountInString);

        // Candidate if we include this string
        const candidateSubsetSize = (dynamicTable[previousIndex] + 1);

        // Manual max avoids Math.max overhead in the innermost loop
        if (candidateSubsetSize > dynamicTable[currentIndex]) {
          dynamicTable[currentIndex] = candidateSubsetSize;
        }
      }
    }
  }

  // Answer is the best value achievable with budgets (m, n)
  return dynamicTable[m * dynamicTableWidth + n];
}
