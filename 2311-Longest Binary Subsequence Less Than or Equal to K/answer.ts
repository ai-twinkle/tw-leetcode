function longestSubsequence(s: string, k: number): number {
  const n = s.length;

  // 1. Count all zeros — they become leading zeroes
  let zeroCount = 0;
  for (let i = 0; i < n; i++) {
    if (s.charCodeAt(i) === 48) { // Ascii code for '0'
      zeroCount++;
    }
  }

  // 2. Greedy from the least significant bit:
  let oneCount = 0;
  let value = 0;
  let power = 1;

  for (let i = n - 1; i >= 0 && value + power <= k; i--) {
    // If it's a '1', "take" it at cost = power
    if (s.charCodeAt(i) === 49) { // Ascii code for '1'
      value += power;
      oneCount++;
    }
    // Every processed bit shifts the weight
    power <<= 1;
  }

  return zeroCount + oneCount;
}
