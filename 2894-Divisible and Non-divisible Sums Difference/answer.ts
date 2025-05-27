function differenceOfSums(n: number, m: number): number {
  // The total sum is n * (n + 1) / 2
  // We use `>> 1` to perform integer division by 2
  const totalSum = (n * (n + 1)) >> 1;

  // The divisible count is floor(n / m)
  // We use `| 0` to perform floor division
  const divisibleCount = (n / m) | 0;

  // The divisible sum is m * (divisibleCount * (divisibleCount + 1) / 2)
  const divisibleSum = m * ((divisibleCount * (divisibleCount + 1)) >> 1);

  // num1 - num2
  //  = (totalSum - divisibleSum) - divisibleSum
  //  = totalSum - 2 * divisibleSum
  // We use `<< 1` to perform multiplication by 2
  return totalSum - (divisibleSum << 1);
}
