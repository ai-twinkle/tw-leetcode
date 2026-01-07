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

function maxProduct(root: TreeNode | null): number {
  if (root === null) {
    return 0;
  }

  const MODULO_BIGINT = 1000000007n;

  const traversalStack: TreeNode[] = [root];
  let traversalStackSize = 1;

  const postorderNodes: TreeNode[] = [];
  let postorderNodesSize = 0;

  let totalSum = 0;

  // Collect nodes in reverse-postorder (root-right-left) and compute total sum in one pass
  while (traversalStackSize !== 0) {
    const currentNode = traversalStack[--traversalStackSize];

    postorderNodes[postorderNodesSize++] = currentNode;
    totalSum += currentNode.val;

    const leftChild = currentNode.left;
    if (leftChild !== null) {
      traversalStack[traversalStackSize++] = leftChild;
    }

    const rightChild = currentNode.right;
    if (rightChild !== null) {
      traversalStack[traversalStackSize++] = rightChild;
    }
  }

  const subtreeSumStack = new Int32Array(postorderNodesSize);
  let subtreeSumStackSize = 0;

  let bestSubtreeSum = 0;
  let bestAbsoluteDifference = 2147483647;

  // Evaluate subtree sums in true postorder by scanning the reverse-postorder list backwards
  for (let index = postorderNodesSize - 1; index >= 0; index--) {
    const currentNode = postorderNodes[index];

    // Pop the right subtree sum first because it was computed later and sits on the stack top
    let rightSubtreeSum = 0;
    if (currentNode.right !== null) {
      rightSubtreeSum = subtreeSumStack[--subtreeSumStackSize];
    }

    // Pop left subtree sum next, matching the left-right-root postorder consumption order
    let leftSubtreeSum = 0;
    if (currentNode.left !== null) {
      leftSubtreeSum = subtreeSumStack[--subtreeSumStackSize];
    }

    const subtreeSum = currentNode.val + leftSubtreeSum + rightSubtreeSum;
    subtreeSumStack[subtreeSumStackSize++] = subtreeSum;

    // Maximize s * (T - s) by selecting a subtree sum s closest to T / 2
    if (currentNode !== root) {
      let difference = totalSum - (subtreeSum * 2);
      if (difference < 0) {
        difference = -difference;
      }

      if (difference < bestAbsoluteDifference) {
        bestAbsoluteDifference = difference;
        bestSubtreeSum = subtreeSum;
      }
    }
  }

  // Compute the exact product once using BigInt and apply modulo at the end
  const totalSumBigInt = BigInt(totalSum);
  const bestSubtreeSumBigInt = BigInt(bestSubtreeSum);

  const maximumProductBigInt =
    bestSubtreeSumBigInt * (totalSumBigInt - bestSubtreeSumBigInt);

  return Number(maximumProductBigInt % MODULO_BIGINT);
}
