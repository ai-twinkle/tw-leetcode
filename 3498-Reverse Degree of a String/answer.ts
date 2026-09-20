function reverseDegree(s: string): number {
  const length = s.length;

  // Accumulate the position-weighted sum of raw character codes
  let weightedCodeSum = 0;
  for (let index = 0; index < length; index++) {
    weightedCodeSum += (index + 1) * s.charCodeAt(index);
  }

  // Reversed value is (123 - code), so factor 123 out using the triangular number n(n + 1) / 2
  return 123 * ((length * (length + 1)) >> 1) - weightedCodeSum;
}
