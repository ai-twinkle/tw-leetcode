function findSubtreeSizes(parent: number[], s: string): number[] {
  const nodeCount = parent.length;
  const characterOfNode = new Uint8Array(nodeCount);
  const firstChild = new Int32Array(nodeCount).fill(-1);
  const nextSibling = new Int32Array(nodeCount);

  // Single pass: cache character indices and build child linked lists by prepending
  characterOfNode[0] = s.charCodeAt(0) - 97;
  for (let node = nodeCount - 1; node > 0; node--) {
    characterOfNode[node] = s.charCodeAt(node) - 97;
    const parentNode = parent[node];
    nextSibling[node] = firstChild[parentNode];
    firstChild[parentNode] = node;
  }

  const newParent = new Int32Array(nodeCount);
  const previousLatest = new Int32Array(nodeCount);
  const depthStack = new Int32Array(nodeCount);

  // Deepest node on the current root path holding each character
  const latestNodeOfCharacter = new Int32Array(26).fill(-1);

  // Subtree size of each node in the final tree, built bottom-up and returned directly
  const subtreeSize: number[] = new Array(nodeCount).fill(1);

  // Enter the root
  latestNodeOfCharacter[characterOfNode[0]] = 0;
  previousLatest[0] = -1;
  newParent[0] = -1;
  let stackSize = 1;

  while (stackSize > 0) {
    const currentNode = depthStack[stackSize - 1];
    const childNode = firstChild[currentNode];

    if (childNode !== -1) {
      // Consume this child so the next visit continues with its sibling
      firstChild[currentNode] = nextSibling[childNode];

      const character = characterOfNode[childNode];
      const sameCharacterAncestor = latestNodeOfCharacter[character];

      // Re-parent to the closest same-character ancestor, otherwise keep the original parent
      if (sameCharacterAncestor !== -1) {
        newParent[childNode] = sameCharacterAncestor;
      } else {
        newParent[childNode] = currentNode;
      }

      // Save and overwrite the latest holder of this character for the descendants
      previousLatest[childNode] = sameCharacterAncestor;
      latestNodeOfCharacter[character] = childNode;
      depthStack[stackSize++] = childNode;
    } else {
      // Leaving the node: restore its character holder and add its finished size to the new parent
      latestNodeOfCharacter[characterOfNode[currentNode]] = previousLatest[currentNode];
      stackSize--;
      if (stackSize > 0) {
        subtreeSize[newParent[currentNode]] += subtreeSize[currentNode];
      }
    }
  }

  return subtreeSize;
}
