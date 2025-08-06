function numOfUnplacedFruits(fruits: number[], baskets: number[],): number {
  const fruitTypesCount = fruits.length;
  if (fruitTypesCount === 0) {
    return 0;
  }

  // 1. Compute the smallest power of two ≥ fruitTypesCount
  let treeLeafCount = 1;
  while (treeLeafCount < fruitTypesCount) {
    treeLeafCount <<= 1;
  }

  const totalTreeSize = treeLeafCount << 1;
  const segmentTree = new Uint32Array(totalTreeSize);
  const leafStartIndex = treeLeafCount;

  // 2. Fast‐copy all basket capacities into the leaves
  segmentTree.set(baskets, leafStartIndex);

  // 3. Build internal nodes bottom‐up: each node stores the max of its two children
  for (let nodeIndex = leafStartIndex - 1; nodeIndex > 0; --nodeIndex) {
    const leftVal = segmentTree[nodeIndex << 1];
    const rightVal = segmentTree[(nodeIndex << 1) + 1];
    segmentTree[nodeIndex] = leftVal > rightVal ? leftVal : rightVal;
  }

  // 4. Process fruits in order, descending down the tree to find the leftmost fit
  let unplacedFruitCount = 0;
  for (let fruitIndex = 0; fruitIndex < fruitTypesCount; ++fruitIndex) {
    const requiredQuantity = fruits[fruitIndex];

    // Quick‐fail if even the global max is too small
    if (segmentTree[1] < requiredQuantity) {
      unplacedFruitCount++;
      continue;
    }

    // Descend from root (1) to a leaf
    let currentNodeIndex = 1;
    while (currentNodeIndex < leafStartIndex) {
      const leftChildIndex = currentNodeIndex << 1;
      // Pick the left child if it can hold this fruit, otherwise go right
      currentNodeIndex =
        segmentTree[leftChildIndex] >= requiredQuantity
          ? leftChildIndex
          : leftChildIndex + 1;
    }

    // Mark that basket used
    segmentTree[currentNodeIndex] = 0;

    // Update the path back up to the root
    let parentIndex = currentNodeIndex >> 1;
    while (parentIndex > 0) {
      const leftVal = segmentTree[parentIndex << 1];
      const rightVal = segmentTree[(parentIndex << 1) + 1];
      segmentTree[parentIndex] = leftVal > rightVal ? leftVal : rightVal;
      parentIndex >>= 1;
    }
  }

  return unplacedFruitCount;
}
