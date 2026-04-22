function twoEditWords(queries: string[], dictionary: string[]): string[] {
  const result: string[] = [];
  const wordLength = queries[0].length;
  const dictionaryLength = dictionary.length;

  for (const query of queries) {
    let matched = false;

    for (let dictionaryIndex = 0; dictionaryIndex < dictionaryLength; dictionaryIndex++) {
      const dictionaryWord = dictionary[dictionaryIndex];

      // Fast path: identical strings need zero edits
      if (query === dictionaryWord) {
        matched = true;
        break;
      }

      // Count differences, tracking first and second mismatch positions
      let firstMismatch = -1;
      let secondMismatch = -1;
      let tooMany = false;

      for (let charIndex = 0; charIndex < wordLength; charIndex++) {
        if (query.charCodeAt(charIndex) === dictionaryWord.charCodeAt(charIndex)) {
          continue;
        }
        if (firstMismatch === -1) {
          // Record first mismatch
          firstMismatch = charIndex;
        } else if (secondMismatch === -1) {
          // Record second mismatch
          secondMismatch = charIndex;
        } else {
          // Third mismatch found, no need to continue
          tooMany = true;
          break;
        }
      }

      if (!tooMany) {
        matched = true;
        break;
      }
    }

    if (matched) {
      result.push(query);
    }
  }

  return result;
}
