function numOfStrings(patterns: string[], word: string): number {
  let count = 0;

  // Native includes uses a fast underlying search, optimal for these small constraints
  for (let index = 0; index < patterns.length; index++) {
    if (word.includes(patterns[index])) {
      count++;
    }
  }

  return count;
}
