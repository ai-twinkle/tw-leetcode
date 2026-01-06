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

function maxLevelSum(root: TreeNode | null): number {
  // Fast-path: constraints say at least 1 node, but keep safe for signature
  if (root === null) {
    return 0;
  }

  // Use a pre-allocated queue (size <= number of nodes) to avoid push/shift overhead
  // 1e4 nodes fits easily and keeps memory predictable.
  const nodeQueue = new Array<TreeNode>(10000);
  let head = 0;
  let tail = 0;

  nodeQueue[tail++] = root;

  let currentLevel = 0;
  let bestLevel = 1;
  let bestSum = -Infinity;

  while (head < tail) {
    currentLevel++;

    // Capture the current level boundary once (no queue.length reads inside the loop)
    const levelEnd = tail;
    let levelSum = 0;

    while (head < levelEnd) {
      const node = nodeQueue[head++];

      levelSum += node.val;

      const leftNode = node.left;
      if (leftNode !== null) {
        nodeQueue[tail++] = leftNode;
      }

      const rightNode = node.right;
      if (rightNode !== null) {
        nodeQueue[tail++] = rightNode;
      }
    }

    // Single comparison per level to track the earliest level with maximal sum
    if (levelSum > bestSum) {
      bestSum = levelSum;
      bestLevel = currentLevel;
    }
  }

  return bestLevel;
}
