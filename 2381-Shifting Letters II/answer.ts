function shiftingLetters(s: string, shifts: number[][]): string {
  const n = s.length;
  const diff = Array(n + 1).fill(0);

  // Calculate the total shift for each character
  for (const [start, end, direction] of shifts) {
    const increment = direction === 1 ? 1 : -1;
    diff[start] += increment;
    diff[end + 1] -= increment;
  }

  // Compute prefix sum to accumulate shifts
  let shift = 0;
  const result = s.split('');

  for (let i = 0; i < n; i++) {
    shift += diff[i];
    result[i] = String.fromCharCode(
      // Ensure the shifted character is within the range of 'a' to 'z'
      // Which use the (x % range + range) % range formula to achieve
      ((result[i].charCodeAt(0) - 97 + shift) % 26 + 26) % 26 + 97
    );
  }

  return result.join('');
}
