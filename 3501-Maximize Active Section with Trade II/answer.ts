/**
 * Sparse table for static range-maximum queries answered in O(1) time.
 * Built a single time so that every later query stays cheap.
 */
class SparseTable {
  private readonly logTable: Int32Array;
  private readonly levels: Int32Array[];

  constructor(source: Int32Array) {
    const length = source.length;

    // Precompute floor(log2) for every span length up to the array size.
    this.logTable = new Int32Array(length + 1);
    for (let index = 2; index <= length; index++) {
      this.logTable[index] = this.logTable[index >> 1] + 1;
    }

    const maxLevel = length > 0 ? this.logTable[length] + 1 : 1;
    this.levels = new Array(maxLevel);
    this.levels[0] = source;

    // Each level doubles the covered span using the previous level.
    for (let level = 1; level < maxLevel; level++) {
      const span = 1 << level;
      const half = span >> 1;
      const previous = this.levels[level - 1];
      const current = new Int32Array(length);
      const limit = length - span;
      for (let start = 0; start <= limit; start++) {
        const leftValue = previous[start];
        const rightValue = previous[start + half];
        current[start] = leftValue >= rightValue ? leftValue : rightValue;
      }
      this.levels[level] = current;
    }
  }

  /**
   * @param leftIndex inclusive left bound
   * @param rightIndex inclusive right bound
   * @return maximum value in the range, or 0 if the range is empty
   */
  public query(leftIndex: number, rightIndex: number): number {
    if (leftIndex > rightIndex) {
      return 0;
    }
    const level = this.logTable[rightIndex - leftIndex + 1];
    const row = this.levels[level];
    const leftValue = row[leftIndex];
    const rightValue = row[rightIndex - (1 << level) + 1];
    return leftValue >= rightValue ? leftValue : rightValue;
  }
}

function maxActiveSectionsAfterTrade(s: string, queries: number[][]): number[] {
  const n = s.length;
  const queryCount = queries.length;

  // Count active sections and record every maximal block of zeros in one pass.
  let activeCount = 0;
  const blockLengthBuffer = new Int32Array(n);
  const blockLeftBuffer = new Int32Array(n);
  const blockRightBuffer = new Int32Array(n);
  let blockCount = 0;

  let index = 0;
  while (index < n) {
    if (s.charCodeAt(index) === 49) {
      activeCount++;
      index++;
      continue;
    }
    // Extend the current run of zeros to its full length.
    const start = index;
    index++;
    while (index < n && s.charCodeAt(index) === 48) {
      index++;
    }
    blockLengthBuffer[blockCount] = index - start;
    blockLeftBuffer[blockCount] = start;
    blockRightBuffer[blockCount] = index - 1;
    blockCount++;
  }

  // With fewer than two zero blocks no trade can ever happen.
  if (blockCount < 2) {
    return new Array(queryCount).fill(activeCount);
  }

  const zeroBlocks = blockLengthBuffer.subarray(0, blockCount);
  const blockLeft = blockLeftBuffer.subarray(0, blockCount);
  const blockRight = blockRightBuffer.subarray(0, blockCount);

  // Map each position to the first zero block starting at or after it (for the left endpoint),
  // and the last zero block ending at or before it (for the right endpoint), in O(1) per query.
  const firstBlockAtOrAfter = new Int32Array(n + 1);
  const lastBlockAtOrBefore = new Int32Array(n + 1);
  let cursor = blockCount;
  // Walking positions right-to-left gives the first block whose right end is >= position.
  for (let position = n; position >= 0; position--) {
    while (cursor > 0 && blockRight[cursor - 1] >= position) {
      cursor--;
    }
    firstBlockAtOrAfter[position] = cursor;
  }
  cursor = -1;
  // Walking positions left-to-right gives the last block whose left end is <= position.
  for (let position = 0; position <= n; position++) {
    while (cursor + 1 < blockCount && blockLeft[cursor + 1] <= position) {
      cursor++;
    }
    lastBlockAtOrBefore[position] = cursor;
  }

  // Precompute adjacent zero-block pair sums for interior range-max lookups.
  const pairCount = blockCount - 1;
  const pairSums = new Int32Array(pairCount);
  for (let k = 0; k < pairCount; k++) {
    pairSums[k] = zeroBlocks[k] + zeroBlocks[k + 1];
  }
  const sparseTable = new SparseTable(pairSums);

  const activeSectionCounts: number[] = new Array(queryCount);
  const lastBlockIndex = blockCount - 1;

  for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
    const query = queries[queryIndex];
    const left = query[0];
    const right = query[1];

    // First and last zero blocks that intersect the queried substring, in O(1).
    const firstBlock = firstBlockAtOrAfter[left];
    const lastBlock = lastBlockAtOrBefore[right];

    // Need at least two distinct zero blocks inside the window to trade.
    if (firstBlock > lastBlockIndex || lastBlock < 0 || firstBlock >= lastBlock) {
      activeSectionCounts[queryIndex] = activeCount;
      continue;
    }

    // Clip the two boundary blocks to the substring window.
    const leftBlockStart = blockLeft[firstBlock];
    const boundaryLeft = leftBlockStart > left ? leftBlockStart : left;
    const firstLength = blockRight[firstBlock] - boundaryLeft + 1;

    const rightBlockEnd = blockRight[lastBlock];
    const boundaryRight = rightBlockEnd < right ? rightBlockEnd : right;
    const lastLength = boundaryRight - blockLeft[lastBlock] + 1;

    let bestGain: number;
    if (firstBlock + 1 === lastBlock) {
      // Only the two clipped boundary blocks are available.
      bestGain = firstLength + lastLength;
    } else {
      const gainFromFirst = firstLength + zeroBlocks[firstBlock + 1];
      const gainFromLast = zeroBlocks[lastBlock - 1] + lastLength;
      bestGain = gainFromFirst > gainFromLast ? gainFromFirst : gainFromLast;
      // Fully interior adjacent pairs are unclipped, so use the sparse table.
      const gainInterior = sparseTable.query(firstBlock + 1, lastBlock - 2);
      if (gainInterior > bestGain) {
        bestGain = gainInterior;
      }
    }
    activeSectionCounts[queryIndex] = activeCount + bestGain;
  }

  return activeSectionCounts;
}
