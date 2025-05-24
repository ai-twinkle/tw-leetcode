function findWordsContaining(words: string[], x: string): number[] {
  const wordsCount = words.length;
  const resultIndices: number[] = [];

  for (let wordIndex = 0; wordIndex < wordsCount; wordIndex++) {
    if (words[wordIndex].indexOf(x) !== -1) {
      resultIndices.push(wordIndex);
    }
  }

  return resultIndices;
}
