function hasSameDigits(s: string): boolean {
  const length = s.length;

  // Convert the input string to numeric digits for faster arithmetic operations
  let current = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    current[i] = s.charCodeAt(i) - 48;
  }

  // Reduce the sequence until only two digits remain
  let effectiveLength = length;
  while (effectiveLength > 2) {
    const next = new Uint8Array(effectiveLength - 1);

    // Each new digit is the sum of two adjacent digits modulo 10
    for (let i = 0; i < effectiveLength - 1; i++) {
      next[i] = (current[i] + current[i + 1]) % 10;
    }

    // Move to the next reduced sequence
    current = next;
    effectiveLength--;
  }

  // Return true if the final two digits are the same
  return current[0] === current[1];
}
