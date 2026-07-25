function maxProduct(n: number): number {
  // Track the two largest digits seen so far.
  let largest = 0;
  let secondLargest = 0;

  // Extract digits from least significant to most significant.
  while (n > 0) {
    const digit = n % 10;

    if (digit > largest) {
      secondLargest = largest;
      largest = digit;
    } else if (digit > secondLargest) {
      secondLargest = digit;
    }

    n = (n / 10) | 0;
  }

  return largest * secondLargest;
}
