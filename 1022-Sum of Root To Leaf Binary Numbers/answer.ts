/**
 * Definition for a binary tree node.
 * class TreeNode {
 *     val: number
 *     left: TreeNode | null
 *     right: TreeNode | null
 *     constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
 *         this.val = (val===undefined ? 0 : val)
 *         this.left = (left===undefined ? null : left)
 *         this.right = (right===undefined ? null : right)
 *     }
 * }
 */

function sumRootToLeaf(root: TreeNode | null): number {
  if (root === null) {
    return 0;
  }

  // Fixed-capacity stacks (constraints: <= 1000 nodes) to avoid dynamic growth overhead.
  const maxStackSize = 1024;
  const nodeStack = new Array<TreeNode>(maxStackSize);
  const pathValueStack = new Int32Array(maxStackSize);

  let stackSize = 0;

  // Store the path value including the node bit at push time.
  nodeStack[stackSize] = root;
  pathValueStack[stackSize] = root.val;
  stackSize++;

  let totalSum = 0;

  while (stackSize > 0) {
    stackSize--;

    const currentNode = nodeStack[stackSize];
    const currentPathValue = pathValueStack[stackSize];

    const leftNode = currentNode.left;
    const rightNode = currentNode.right;

    // Leaf node: accumulate result.
    if (leftNode === null && rightNode === null) {
      totalSum += currentPathValue;
      continue;
    }

    // Push left child if exists (precompute next path value once).
    if (leftNode !== null) {
      nodeStack[stackSize] = leftNode;
      pathValueStack[stackSize] = (currentPathValue << 1) | leftNode.val;
      stackSize++;
    }

    // Push right child if exists (precompute next path value once).
    if (rightNode !== null) {
      nodeStack[stackSize] = rightNode;
      pathValueStack[stackSize] = (currentPathValue << 1) | rightNode.val;
      stackSize++;
    }
  }

  return totalSum;
}
