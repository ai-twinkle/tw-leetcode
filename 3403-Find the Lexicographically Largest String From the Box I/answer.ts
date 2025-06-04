function answerString(word: string, numFriends: number): string {
  if (numFriends === 1) {
    return word;
  }

  const length = word.length;
  const maxPieceLength = length - numFriends + 1;

  let best = "";

  for (let startIndex = 0; startIndex < length; ++startIndex) {
    // Determine the end index for this slice
    const endIndex = Math.min(startIndex + maxPieceLength, length);
    const candidate = word.substring(startIndex, endIndex);

    if (candidate > best) {
      best = candidate;
    }
  }

  return best;
}
