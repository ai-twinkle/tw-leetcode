function maximumLength(nums: number[], k: number): number {
  const totalElements = nums.length;

  // 1. Precompute remainders and frequency for each residue
  const remainderArray = new Uint16Array(totalElements);
  const residueFrequency = new Uint16Array(k);
  for (let index = 0; index < totalElements; index++) {
    const currentResidue = nums[index] % k;
    remainderArray[index] = currentResidue;
    residueFrequency[currentResidue]++;
  }

  // 2. Collect all residues that appear and initialize answer
  const existingResidueList: number[] = [];
  let longestValidSubsequence = 1;
  for (let residueValue = 0; residueValue < k; residueValue++) {
    const frequency = residueFrequency[residueValue];
    if (frequency <= 0) {
      continue;
    }
    existingResidueList.push(residueValue);
    if (frequency > longestValidSubsequence) {
      longestValidSubsequence = frequency;
    }
  }

  const totalResidues = existingResidueList.length;

  // 3. Map each residue to its index in the compacted residue list
  const residueToIndexMapping = new Int16Array(k);
  residueToIndexMapping.fill(-1);
  for (let i = 0; i < totalResidues; i++) {
    residueToIndexMapping[existingResidueList[i]] = i;
  }

  // 4. DP table for storing the max length ending with (current, previous) residue
  const dpTable = new Uint16Array(totalResidues * totalResidues);

  // 5. DP update: For each element, try to extend subsequence with different last residue
  for (let currentElementIndex = 0; currentElementIndex < totalElements; currentElementIndex++) {
    const currentResidue = remainderArray[currentElementIndex];
    const currentResidueIndex = residueToIndexMapping[currentResidue];

    for (let previousResidueIndex = 0; previousResidueIndex < totalResidues; previousResidueIndex++) {
      if (previousResidueIndex === currentResidueIndex) {
        continue;
      }
      const previousLength = dpTable[previousResidueIndex * totalResidues + currentResidueIndex];
      const newLength = previousLength + 1;
      dpTable[currentResidueIndex * totalResidues + previousResidueIndex] = newLength;
      if (newLength > longestValidSubsequence) {
        longestValidSubsequence = newLength;
      }
    }
  }

  return longestValidSubsequence;
}
