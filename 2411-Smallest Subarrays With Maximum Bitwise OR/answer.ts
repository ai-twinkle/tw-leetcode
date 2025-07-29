function smallestSubarrays(nums: number[]): number[] {
  const length = nums.length;
  const resultArray = new Uint32Array(length);
  const nextSetBitIndices = new Int32Array(31);
  nextSetBitIndices.fill(-1);

  // Traverse the array backwards
  for (let index = length - 1; index >= 0; index--) {
    let currentValue = nums[index] >>> 0;
    let bitPosition = 0;

    // Update nextSetBitIndices for all bits set in currentValue
    while (currentValue !== 0) {
      if ((currentValue & 1) !== 0) {
        nextSetBitIndices[bitPosition] = index;
      }
      currentValue >>>= 1;
      bitPosition++;
    }

    // Find the farthest index needed to cover all set bits so far
    let farthestIndex = index;
    for (let bit = 0; bit < 31; bit++) {
      const nextIndex = nextSetBitIndices[bit];
      if (nextIndex > farthestIndex) {
        farthestIndex = nextIndex;
      }
    }

    resultArray[index] = farthestIndex - index + 1;
  }

  return Array.from(resultArray);
}
