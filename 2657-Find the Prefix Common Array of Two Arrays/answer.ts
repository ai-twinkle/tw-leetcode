function findThePrefixCommonArray(A: number[], B: number[]): number[] {
  const arrayLength = A.length;
  const prefixCommonCount = new Array(arrayLength).fill(0);

  // Count the appearance of common elements in index i (While prefix common we take the largest index)
  for (let currentIndex = 0; currentIndex < arrayLength; currentIndex++) {
    const indexInArrayB = B.indexOf(A[currentIndex]);

    if (indexInArrayB === -1) {
      continue;
    }

    const maxIndex = Math.max(currentIndex, indexInArrayB);
    prefixCommonCount[maxIndex]++;
  }

  // Calculate the prefix sum
  for (let currentIndex = 1; currentIndex < arrayLength; currentIndex++) {
    prefixCommonCount[currentIndex] += prefixCommonCount[currentIndex - 1];
  }

  return prefixCommonCount;
}
