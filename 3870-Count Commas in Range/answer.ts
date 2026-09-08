function countCommas(n: number): number {
  // Numbers below 1,000 are written without any comma
  if (n < 1000) {
    return 0;
  }

  // Under the constraint n <= 10^5, each number in [1000, n] contains exactly one comma
  return n - 999;
}
