function getNoZeroIntegers(n: number): number[] {
  for (let firstCandidate = 1; firstCandidate < n; firstCandidate++) {
    const secondCandidate = n - firstCandidate;
    if (!firstCandidate.toString().includes("0") && !secondCandidate.toString().includes("0")) {
      return [firstCandidate, secondCandidate];
    }
  }
  return [];
}
