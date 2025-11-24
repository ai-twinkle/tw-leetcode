function pivotInteger(n: number): number {
  // Compute the total sum from 1 to n using the arithmetic series formula
  const totalSumFromOneToN = (n * (n + 1)) / 2;

  // Compute the integer square root candidate for the total sum
  const candidatePivot = Math.floor(Math.sqrt(totalSumFromOneToN));

  // Verify if the candidatePivot squared equals the total sum (perfect square check)
  if (candidatePivot * candidatePivot === totalSumFromOneToN) {
    return candidatePivot;
  }

  // If no integer pivot satisfies the condition, return -1
  return -1;
}
