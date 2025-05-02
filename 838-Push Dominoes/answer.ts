function pushDominoes(dominoes: string): string {
  const length = dominoes.length;
  // Convert string to mutable array of chars
  const resultChars = dominoes.split('');

  // The previousForceIndex points to the last seen 'L' or 'R'
  let previousForceIndex = -1;

  // The previousForce holds that character ('L' or 'R'); we treat the virtual
  // domino at index -1 as 'L' so that leading dots before an 'L' all fall left
  let previousForce = 'L';

  // We scan one extra step (currentIndex == length) with a virtual 'R' to handle trailing dots
  for (let currentIndex = 0; currentIndex <= length; currentIndex++) {
    const currentForce = currentIndex < length ? resultChars[currentIndex] : 'R';
    if (currentForce === '.') {
      continue;
    }

    if (previousForce === currentForce) {
      // Same direction: fill everything between previousForceIndex and currentIndex
      for (let k = previousForceIndex + 1; k < currentIndex; k++) {
        resultChars[k] = currentForce;
      }
    } else if (previousForce === 'R' && currentForce === 'L') {
      // Opposing forces: fill inwards from both ends
      let leftPointer = previousForceIndex + 1;
      let rightPointer = currentIndex - 1;

      while (leftPointer < rightPointer) {
        resultChars[leftPointer++] = 'R';
        resultChars[rightPointer--] = 'L';
      }
      // If they meet exactly in the middle, it stays '.'
    }
    // If previousForce === 'L' and currentForce === 'R', we leave the in-between as '.'

    // Advance previous force
    previousForce = currentForce;
    previousForceIndex = currentIndex;
  }

  return resultChars.join('');
}
