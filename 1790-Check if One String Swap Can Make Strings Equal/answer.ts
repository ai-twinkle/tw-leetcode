function areAlmostEqual(s1: string, s2: string): boolean {
  // While the two strings are the same, they are already equal.
  if (s1 === s2) {
    return true;
  }

  // We calculate the number of different characters and their indexes.
  let differentCount = 0;
  const swapIndexes: number[] =  new Array(2);

  // Iterate through the strings and find the different characters.
  for (let i = 0; i < s1.length; i++) {
    // Skip the same characters.
    if (s1[i] === s2[i]) {
      continue;
    }

    // If there already have more than two different characters,
    // the strings can't be equal after a swap.
    if (differentCount === 2) {
      return false;
    }

    // Store the indexes of the different characters.
    swapIndexes[differentCount] = i;

    // Increase the different character count.
    differentCount++;
  }

  // We ensure that there are only two different characters.
  // And able to swap them to make the strings equal.
  return s1[swapIndexes[0]] === s2[swapIndexes[1]] && s1[swapIndexes[1]] === s2[swapIndexes[0]];
}
