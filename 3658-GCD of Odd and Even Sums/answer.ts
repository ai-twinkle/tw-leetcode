function gcdOfOddEvenSums(n: number): number {
  // sumOdd = n^2, sumEven = n*(n+1)
  // gcd(n^2, n*(n+1)) = n * gcd(n, n+1) = n * 1 = n
  return n;
}
