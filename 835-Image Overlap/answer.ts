/**
 * Builds a lookup table holding the number of set bits of every 16-bit value.
 * @returns A table where each index maps to its own population count.
 */
function buildPopulationCountTable(): Uint8Array {
  const table = new Uint8Array(65536);
  for (let value = 1; value < 65536; value++) {
    table[value] = table[value >>> 1] + (value & 1);
  }
  return table;
}

// Precomputed once so every popcount inside the search costs two lookups.
const POPULATION_COUNT_TABLE = buildPopulationCountTable();

/**
 * Packs every row of a binary square matrix into a single integer bitmask.
 * @param image The binary matrix to pack.
 * @param size The side length of the matrix.
 * @returns One bitmask per row, where bit c is set when column c holds a 1.
 */
function packRowsIntoBitmasks(image: number[][], size: number): Int32Array {
  const masks = new Int32Array(size);
  for (let row = 0; row < size; row++) {
    const currentRow = image[row];
    let mask = 0;
    for (let column = 0; column < size; column++) {
      mask |= currentRow[column] << column;
    }
    masks[row] = mask;
  }
  return masks;
}

/**
 * Scans every translation that moves the first image right or straight down/up.
 * @param masksA Row bitmasks of the image being translated.
 * @param masksB Row bitmasks of the image kept static.
 * @param onesA Set-bit count of each row of the translated image.
 * @param onesB Set-bit count of each row of the static image.
 * @param size The side length of both matrices.
 * @param cap Overlap that can never be exceeded, used for an early exit.
 * @param bestSoFar Best overlap already known from previous scans.
 * @returns The best overlap found, never smaller than bestSoFar.
 */
function scanNonNegativeColumnShifts(
  masksA: Int32Array,
  masksB: Int32Array,
  onesA: Int32Array,
  onesB: Int32Array,
  size: number,
  cap: number,
  bestSoFar: number
): number {
  let best = bestSoFar;
  const pairedA = new Int32Array(size);
  const pairedB = new Int32Array(size);

  for (let deltaRow = 1 - size; deltaRow < size; deltaRow++) {
    const firstRow = deltaRow < 0 ? -deltaRow : 0;
    const lastRow = deltaRow < 0 ? size : size - deltaRow;
    let pairCount = 0;
    let upperBound = 0;

    // Keep only the row pairs that can contribute, and bound their best case.
    for (let row = firstRow; row < lastRow; row++) {
      const maskA = masksA[row];
      const maskB = masksB[row + deltaRow];
      if (maskA === 0 || maskB === 0) {
        continue;
      }
      pairedA[pairCount] = maskA;
      pairedB[pairCount] = maskB;
      pairCount++;
      const countA = onesA[row];
      const countB = onesB[row + deltaRow];
      upperBound += countA < countB ? countA : countB;
    }

    // No horizontal shift of this vertical offset can beat the current best.
    if (upperBound <= best) {
      continue;
    }

    for (let deltaColumn = 0; deltaColumn < size; deltaColumn++) {
      let overlap = 0;
      for (let index = 0; index < pairCount; index++) {
        // One shift plus one AND replaces a whole column-by-column comparison.
        const combined = (pairedA[index] << deltaColumn) & pairedB[index];
        overlap +=
          POPULATION_COUNT_TABLE[combined & 0xffff] +
          POPULATION_COUNT_TABLE[combined >>> 16];
      }
      if (overlap > best) {
        best = overlap;
        if (best >= cap) {
          return best;
        }
      }
    }
  }
  return best;
}

/**
 * Finds the largest overlap obtainable by translating one image over the other.
 * @param img1 First binary square matrix.
 * @param img2 Second binary square matrix.
 * @returns The maximum number of positions holding a 1 in both images.
 */
function largestOverlap(img1: number[][], img2: number[][]): number {
  const size = img1.length;
  const masks1 = packRowsIntoBitmasks(img1, size);
  const masks2 = packRowsIntoBitmasks(img2, size);
  const ones1 = new Int32Array(size);
  const ones2 = new Int32Array(size);
  let total1 = 0;
  let total2 = 0;

  // Cache per-row populations; they drive both the pruning bound and the cap.
  for (let row = 0; row < size; row++) {
    const mask1 = masks1[row];
    const mask2 = masks2[row];
    const count1 =
      POPULATION_COUNT_TABLE[mask1 & 0xffff] + POPULATION_COUNT_TABLE[mask1 >>> 16];
    const count2 =
      POPULATION_COUNT_TABLE[mask2 & 0xffff] + POPULATION_COUNT_TABLE[mask2 >>> 16];
    ones1[row] = count1;
    ones2[row] = count2;
    total1 += count1;
    total2 += count2;
  }

  // An overlap can never exceed the scarcer image's number of set bits.
  const cap = total1 < total2 ? total1 : total2;
  if (cap === 0) {
    return 0;
  }

  let best = scanNonNegativeColumnShifts(masks1, masks2, ones1, ones2, size, cap, 0);
  // Negative column shifts are the same problem with the two images swapped.
  if (best < cap) {
    best = scanNonNegativeColumnShifts(masks2, masks1, ones2, ones1, size, cap, best);
  }
  return best;
}
