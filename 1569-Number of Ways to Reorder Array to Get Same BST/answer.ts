const MODULUS = 1000000007;
const MAXIMUM_LENGTH = 1001;

/**
 * Multiplies two residues below the modulus without losing double precision.
 * @param left - First factor, already reduced modulo MODULUS.
 * @param right - Second factor, already reduced modulo MODULUS.
 * @returns The product modulo MODULUS.
 */
function multiplyModulo(left: number, right: number): number {
  // Split the left factor into 16-bit halves so every partial product stays exact.
  const highPart = Math.floor(left / 65536);
  const lowPart = left - highPart * 65536;

  return ((highPart * right % MODULUS) * 65536 + lowPart * right) % MODULUS;
}

const FACTORIAL = new Int32Array(MAXIMUM_LENGTH);
const INVERSE_FACTORIAL = new Int32Array(MAXIMUM_LENGTH);

FACTORIAL[0] = 1;
for (let index = 1; index < MAXIMUM_LENGTH; index++) {
  FACTORIAL[index] = multiplyModulo(FACTORIAL[index - 1], index);
}

// Invert only the largest factorial by Fermat's little theorem, then walk back down.
let remainingExponent = MODULUS - 2;
let powerBase = FACTORIAL[MAXIMUM_LENGTH - 1];
let inverseAccumulator = 1;
while (remainingExponent > 0) {
  if ((remainingExponent & 1) === 1) {
    inverseAccumulator = multiplyModulo(inverseAccumulator, powerBase);
  }
  powerBase = multiplyModulo(powerBase, powerBase);
  remainingExponent = Math.floor(remainingExponent / 2);
}
INVERSE_FACTORIAL[MAXIMUM_LENGTH - 1] = inverseAccumulator;
for (let index = MAXIMUM_LENGTH - 1; index > 0; index--) {
  INVERSE_FACTORIAL[index - 1] = multiplyModulo(INVERSE_FACTORIAL[index], index);
}

/**
 * Counts the reorderings of nums that rebuild the very same binary search tree.
 * @param nums - A permutation of the integers from 1 to n.
 * @returns The number of other valid orderings, modulo 10^9 + 7.
 */
function numOfWays(nums: number[]): number {
  const length = nums.length;

  // One or two elements admit no alternative insertion order.
  if (length <= 2) {
    return 0;
  }

  // The insertion position acts as the treap priority of each value.
  const insertionIndex = new Int32Array(length + 1);
  for (let index = 0; index < length; index++) {
    insertionIndex[nums[index]] = index;
  }

  const leftChild = new Int32Array(length + 1);
  const rightChild = new Int32Array(length + 1);
  const rightSpine = new Int32Array(length + 1);
  let spineSize = 0;

  // Values 1..n are the in-order walk, so a monotonic stack rebuilds the BST in O(n).
  for (let value = 1; value <= length; value++) {
    const priority = insertionIndex[value];
    let detachedSubtree = 0;

    // Pop every node inserted later than this value; the last one becomes its left child.
    while (spineSize > 0 && insertionIndex[rightSpine[spineSize - 1]] > priority) {
      spineSize--;
      detachedSubtree = rightSpine[spineSize];
    }

    leftChild[value] = detachedSubtree;
    if (spineSize > 0) {
      rightChild[rightSpine[spineSize - 1]] = value;
    }

    rightSpine[spineSize++] = value;
  }

  const subtreeSize = new Int32Array(length + 1);
  let ways = 1;

  // A child always has a larger insertion index, so reverse insertion order is a valid bottom-up sweep.
  for (let index = length - 1; index >= 0; index--) {
    const value = nums[index];
    const leftSize = subtreeSize[leftChild[value]];
    const rightSize = subtreeSize[rightChild[value]];
    const childTotal = leftSize + rightSize;
    subtreeSize[value] = childTotal + 1;

    // Interleave the two child orderings: C(leftSize + rightSize, leftSize) choices.
    if (childTotal > 1) {
      const interleavings = multiplyModulo(
        FACTORIAL[childTotal],
        multiplyModulo(INVERSE_FACTORIAL[leftSize], INVERSE_FACTORIAL[rightSize]),
      );
      ways = multiplyModulo(ways, interleavings);
    }
  }

  // Exclude the original ordering itself.
  return (ways + MODULUS - 1) % MODULUS;
}
