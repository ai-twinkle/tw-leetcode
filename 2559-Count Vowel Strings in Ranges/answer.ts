const VOWELS = ['a', 'e', 'i', 'o', 'u'];

function isVowel(char: string): boolean {
  return VOWELS.includes(char);
}

function vowelStrings(words: string[], queries: number[][]): number[] {
  const isStartAndEndVowel: number[] = new Array(words.length).fill(0);
  const prefixSum: number[] = new Array(words.length + 1).fill(0);

  words.forEach((word, i) => {
    const startChar = isVowel(word[0]);
    const endChar = isVowel(word[word.length - 1]);
    isStartAndEndVowel[i] = startChar && endChar ? 1 : 0;
    prefixSum[i + 1] = prefixSum[i] + isStartAndEndVowel[i];
  });

  return queries.map((query) => {
    const [start, end] = query;
    return prefixSum[end + 1] - prefixSum[start];
  });
}
