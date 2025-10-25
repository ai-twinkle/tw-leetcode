function totalMoney(n: number): number {
  const totalMoney = new Int32Array(1001);

  // Compute how many full weeks (each with 7 days) are completed
  const weekCount = (n / 7) | 0;           // Equivalent to Math.floor(n / 7)
  const remainingDays = n - weekCount * 7; // Remainder days beyond full weeks

  // Compute total from all complete weeks using arithmetic series sum formula
  const completeWeeksSum =
    28 * weekCount + ((7 * weekCount * (weekCount - 1)) >> 1);

  // Compute total from leftover days after the last complete week
  const remainingSum =
    remainingDays * (weekCount + 1) + ((remainingDays * (remainingDays - 1)) >> 1);

  // Combine both parts to get the total saved amount
  const total = completeWeeksSum + remainingSum;

  // Store in memo table for reuse if function is called again with same n
  totalMoney[n] = total;

  return total;
}
