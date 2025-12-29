// Precompute bit -> index for 6-bit masks (1,2,4,8,16,32) to avoid Math/clz overhead.
const BIT_INDEX_BY_VALUE = (() => {
  const table = new Int8Array(64);
  table.fill(-1);
  for (let bitIndex = 0; bitIndex < 6; bitIndex++) {
    table[1 << bitIndex] = bitIndex;
  }
  return table;
})();

function pyramidTransition(bottom: string, allowed: string[]): boolean {
  const letterCount = 6; // 'A'..'F'
  const pairCount = letterCount * letterCount; // 36

  // allowedTopMask[pairIndex] is a 6-bit mask of possible top letters for that bottom pair.
  const allowedTopMask = new Uint8Array(pairCount);

  for (let ruleIndex = 0; ruleIndex < allowed.length; ruleIndex++) {
    const rule = allowed[ruleIndex];
    const leftCode = rule.charCodeAt(0) - 65;
    const rightCode = rule.charCodeAt(1) - 65;
    const topCode = rule.charCodeAt(2) - 65;

    const pairIndex = leftCode * letterCount + rightCode;
    allowedTopMask[pairIndex] |= 1 << topCode;
  }

  const maximumLength = bottom.length;

  // memoByLength[length][rowBits] -> 0 unknown, 1 false, 2 true
  const memoByLength: Uint8Array[] = new Array(maximumLength + 1);
  for (let rowLength = 2; rowLength <= maximumLength; rowLength++) {
    memoByLength[rowLength] = new Uint8Array(1 << (rowLength * 3));
  }

  // Reuse per-length buffers safely (length strictly decreases in recursion).
  const pairTopMasksByLength: Uint8Array[] = new Array(maximumLength + 1);
  for (let rowLength = 2; rowLength <= maximumLength; rowLength++) {
    pairTopMasksByLength[rowLength] = new Uint8Array(rowLength - 1);
  }

  let bottomRowBits = 0;
  for (let index = 0; index < maximumLength; index++) {
    const letterCode = bottom.charCodeAt(index) - 65;
    bottomRowBits |= letterCode << (index * 3);
  }

  /**
   * @param currentRowBits Packed 3-bit codes per position (least significant position is index 0)
   * @param rowLength Current row length
   * @returns Whether this row can reach the top
   */
  function depthFirstSearch(currentRowBits: number, rowLength: number): boolean {
    if (rowLength === 1) {
      return true;
    }

    const memoArray = memoByLength[rowLength];
    const memoState = memoArray[currentRowBits];
    if (memoState !== 0) {
      return memoState === 2;
    }

    const pairTopMasks = pairTopMasksByLength[rowLength];

    // Build top-option masks for each adjacent pair; fail fast if any pair has no allowed top.
    let slidingBits = currentRowBits;
    for (let positionIndex = 0; positionIndex < rowLength - 1; positionIndex++) {
      const leftCode = slidingBits & 7;
      const rightCode = (slidingBits >> 3) & 7;
      const pairIndex = leftCode * letterCount + rightCode;

      const topOptionsMask = allowedTopMask[pairIndex];
      if (topOptionsMask === 0) {
        memoArray[currentRowBits] = 1;
        return false;
      }

      pairTopMasks[positionIndex] = topOptionsMask;
      slidingBits >>= 3;
    }

    const nextRowLength = rowLength - 1;

    /**
     * @param positionIndex Next position to fill in the next row
     * @param nextRowBits Packed bits for next row constructed so far
     * @returns Whether any completion of the next row can reach the top
     */
    function buildNextRow(positionIndex: number, nextRowBits: number): boolean {
      if (positionIndex === nextRowLength) {
        return depthFirstSearch(nextRowBits, nextRowLength);
      }

      let optionsMask = pairTopMasks[positionIndex];
      const bitShift = positionIndex * 3;

      while (optionsMask !== 0) {
        const leastBit = optionsMask & -optionsMask;
        const topCode = BIT_INDEX_BY_VALUE[leastBit];

        const updatedNextRowBits = nextRowBits | (topCode << bitShift);
        if (buildNextRow(positionIndex + 1, updatedNextRowBits)) {
          return true;
        }

        optionsMask ^= leastBit;
      }

      return false;
    }

    const canBuild = buildNextRow(0, 0);
    memoArray[currentRowBits] = canBuild ? 2 : 1;
    return canBuild;
  }

  return depthFirstSearch(bottomRowBits, maximumLength);
}
