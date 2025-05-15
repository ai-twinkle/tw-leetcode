function getLongestSubsequence(words: string[], groups: number[]): string[] {
  const n = words.length;
  const result: string[] = [];
  let lastGroup = -1;

  for (let i = 0; i < n; i++) {
    if (groups[i] !== lastGroup) {
      result.push(words[i]);
      lastGroup = groups[i];
    }
  }

  return result;
}
