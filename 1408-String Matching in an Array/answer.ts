function stringMatching(words: string[]): string[] {
  // String operation is enough!
  return words.filter((word, i) => words.some((w, j) => i !== j && w.includes(word)));
}