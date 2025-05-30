function numTilePossibilities(tiles: string): number {
  // Step 1: Build frequency table.
  const freq: { [letter: string]: number } = {};
  for (const tile of tiles) {
    freq[tile] = (freq[tile] || 0) + 1;
  }
  const letters = Object.keys(freq);

  // The poly[k] will hold the coefficient for x^k.
  // Start with polynomial 1,in other words [1].
  let poly: number[] = [1];

  // For each letter, build its series and convolve with the current poly.
  for (const letter of letters) {
    const f = freq[letter];
    // Build series: series[j] = 1/j! for j=0...f.
    const series: number[] = [];
    let fact = 1;
    for (let j = 0; j <= f; j++) {
      // For j=0, fact = 1 while the 0! = 1. For j>=1, update fact.
      series.push(1 / fact);
      fact *= (j + 1);
    }

    // Convolve poly and series.
    const newPoly: number[] = new Array(poly.length + f).fill(0);
    for (let i = 0; i < poly.length; i++) {
      for (let j = 0; j < series.length; j++) {
        newPoly[i + j] += poly[i] * series[j];
      }
    }
    poly = newPoly;
  }

  // Now, poly[k] = a_k = sum (1/(c1!*...*cm!)) over selections with total k.
  // Multiply each coefficient by k! To get the number of permutations for length k.
  let result = 0;
  let factorial = 1;
  for (let k = 1; k < poly.length; k++) {
    factorial *= k; // k! (since k starts at 1)
    result += poly[k] * factorial;
  }

  // The result should be an integer for rounding handles any floating-point imprecision.
  return Math.round(result);
}
