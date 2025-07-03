function kthCharacter(k: number): string {
  let increment = 0;
  let left = 1;

  // Find the "generation" (step) large enough to cover k
  while (left < k) {
    left *= 2;
  }

  // Simulate backwards to root, counting how many times we land in the right half
  while (left > 1) {
    let half = left / 2;
    if (k > half) {
      // In the right half: this means increment by 1
      increment += 1;
      k -= half;
    }
    // Go up one level (halve the string)
    left = half;
  }

  // Starting from 'a' (char code 97), apply all increments modulo 26
  let code = increment % 26;
  return String.fromCharCode(97 + code);
}
