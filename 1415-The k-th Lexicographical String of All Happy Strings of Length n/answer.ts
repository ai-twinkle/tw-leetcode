function getHappyString(n: number, k: number): string {
  // Precompute powers of 2 up to n.
  const powerOf2: number[] = Array(n + 1).fill(0);
  for (let i = 0; i <= n; i++) {
    powerOf2[i] = 1 << i; // equivalent to 2^i
  }

  const total = 3 * powerOf2[n - 1];

  if (k > total) {
    // When k is larger than the total number of happy strings of length n.
    return "";
  }

  let result = "";
  let prev = "";

  for (let i = 0; i < n; i++) {
    // Determine candidates:
    let candidates: string[];
    if (i === 0) {
      // The First letter can be any of the 3 letters.
      candidates = ['a', 'b', 'c'];
    } else {
      // Otherwise, we can only choose from the 2 letters that are different from the previous one.
      candidates = prev === 'a' ?
        ['b', 'c'] : prev === 'b' ?
          ['a', 'c'] : ['a', 'b'];
    }

    // Number of completions for each candidate.
    // Using precomputed powers: groupSize = 2^(n - i - 1)
    const groupSize = powerOf2[n - i - 1];

    for (let letter of candidates) {
      if (k <= groupSize) {
        // If k is within the group of these candidates.
        // We can append this letter to the result.
        result += letter;
        prev = letter;
        break;
      }

      k -= groupSize;
    }
  }

  return result;
}
