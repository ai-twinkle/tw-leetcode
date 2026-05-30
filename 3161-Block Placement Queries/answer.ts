function getResults(queries: number[][]): boolean[] {
  const queryCount = queries.length;

  // Single pass: detect max coordinate, flatten queries to a typed array, and count type-2 queries
  let maxCoordinate = 1;
  let type2Count = 0;
  const flatQueries = new Int32Array(queryCount * 3);
  for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
    const currentQuery = queries[queryIndex];
    const queryType = currentQuery[0];
    const xValue = currentQuery[1];
    const baseIndex = queryIndex * 3;
    flatQueries[baseIndex] = queryType;
    flatQueries[baseIndex + 1] = xValue;
    if (queryType === 2) {
      flatQueries[baseIndex + 2] = currentQuery[2];
      type2Count++;
    }
    if (xValue > maxCoordinate) {
      maxCoordinate = xValue;
    }
  }

  // Compute segment tree leaf-count as the next power of 2 strictly greater than maxCoordinate
  let treeSize = 1;
  while (treeSize <= maxCoordinate) {
    treeSize <<= 1;
  }

  // Segment tree storage: maxGap stores max obstacle-gap among descendants, hasObstacle marks presence
  const maxGap = new Int32Array(treeSize * 2);
  const hasObstacle = new Uint8Array(treeSize * 2);

  // Mark position 0 as a virtual obstacle so predecessor lookup is always defined
  hasObstacle[treeSize] = 1;
  let initNode = treeSize >> 1;
  while (initNode > 0) {
    hasObstacle[initNode] = 1;
    initNode >>= 1;
  }

  // Pre-allocate the result array based on the counted number of type-2 queries
  const results: boolean[] = new Array(type2Count).fill(false);
  let resultIndex = 0;

  for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
    const baseIndex = queryIndex * 3;
    const queryType = flatQueries[baseIndex];
    const xValue = flatQueries[baseIndex + 1];

    if (queryType === 1) {
      // Locate strict predecessor of xValue (always exists due to virtual obstacle at 0)
      let predecessor = 0;
      let walkUpIndex = treeSize + xValue;
      while (walkUpIndex > 1) {
        if ((walkUpIndex & 1) === 1) {
          const leftSibling = walkUpIndex - 1;
          if (hasObstacle[leftSibling] === 1) {
            // Descend left subtree to the rightmost obstacle
            let descentNode = leftSibling;
            while (descentNode < treeSize) {
              const rightChild = (descentNode << 1) | 1;
              if (hasObstacle[rightChild] === 1) {
                descentNode = rightChild;
              } else {
                descentNode = descentNode << 1;
              }
            }
            predecessor = descentNode - treeSize;
            break;
          }
        }
        walkUpIndex >>= 1;
      }

      // Locate strict successor of xValue (may not exist if xValue exceeds every obstacle)
      let successor = -1;
      walkUpIndex = treeSize + xValue;
      while (walkUpIndex > 1) {
        if ((walkUpIndex & 1) === 0) {
          const rightSibling = walkUpIndex + 1;
          if (hasObstacle[rightSibling] === 1) {
            // Descend right subtree to the leftmost obstacle
            let descentNode = rightSibling;
            while (descentNode < treeSize) {
              const leftChild = descentNode << 1;
              if (hasObstacle[leftChild] === 1) {
                descentNode = leftChild;
              } else {
                descentNode = leftChild | 1;
              }
            }
            successor = descentNode - treeSize;
            break;
          }
        }
        walkUpIndex >>= 1;
      }

      // Insert obstacle at xValue: leaf gap = xValue - predecessor, then propagate upward
      let updateIndex = treeSize + xValue;
      maxGap[updateIndex] = xValue - predecessor;
      hasObstacle[updateIndex] = 1;
      updateIndex >>= 1;
      while (updateIndex > 0) {
        const leftChild = updateIndex << 1;
        const rightChild = leftChild | 1;
        const leftGap = maxGap[leftChild];
        const rightGap = maxGap[rightChild];
        maxGap[updateIndex] = leftGap > rightGap ? leftGap : rightGap;
        hasObstacle[updateIndex] = hasObstacle[leftChild] | hasObstacle[rightChild];
        updateIndex >>= 1;
      }

      // Shrink the successor's gap to (successor - xValue) because xValue now lies between them
      if (successor !== -1) {
        updateIndex = treeSize + successor;
        maxGap[updateIndex] = successor - xValue;
        updateIndex >>= 1;
        while (updateIndex > 0) {
          const leftChild = updateIndex << 1;
          const rightChild = leftChild | 1;
          const leftGap = maxGap[leftChild];
          const rightGap = maxGap[rightChild];
          maxGap[updateIndex] = leftGap > rightGap ? leftGap : rightGap;
          updateIndex >>= 1;
        }
      }
    } else {
      // Type 2: locate the largest obstacle ≤ xValue (inclusive predecessor lookup)
      const blockSize = flatQueries[baseIndex + 2];

      let predecessor = 0;
      const directLeafIndex = treeSize + xValue;
      if (hasObstacle[directLeafIndex] === 1) {
        predecessor = xValue;
      } else {
        let walkUpIndex = directLeafIndex;
        while (walkUpIndex > 1) {
          if ((walkUpIndex & 1) === 1) {
            const leftSibling = walkUpIndex - 1;
            if (hasObstacle[leftSibling] === 1) {
              let descentNode = leftSibling;
              while (descentNode < treeSize) {
                const rightChild = (descentNode << 1) | 1;
                if (hasObstacle[rightChild] === 1) {
                  descentNode = rightChild;
                } else {
                  descentNode = descentNode << 1;
                }
              }
              predecessor = descentNode - treeSize;
              break;
            }
          }
          walkUpIndex >>= 1;
        }
      }

      // Aggregate the maximum existing obstacle-gap over leaves [1, predecessor]
      let maxGapInRange = 0;
      if (predecessor >= 1) {
        let leftBound = treeSize + 1;
        let rightBound = treeSize + predecessor + 1;
        while (leftBound < rightBound) {
          if ((leftBound & 1) === 1) {
            const gap = maxGap[leftBound];
            if (gap > maxGapInRange) {
              maxGapInRange = gap;
            }
            leftBound++;
          }
          if ((rightBound & 1) === 1) {
            rightBound--;
            const gap = maxGap[rightBound];
            if (gap > maxGapInRange) {
              maxGapInRange = gap;
            }
          }
          leftBound >>= 1;
          rightBound >>= 1;
        }
      }

      // Block fits if some prior gap is wide enough OR the trailing space [predecessor, xValue] suffices
      results[resultIndex++] = maxGapInRange >= blockSize || (xValue - predecessor) >= blockSize;
    }
  }

  return results;
}
