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

// Node count is at most 1000, so 10 bits (max 1023) are enough to hold it
const COUNT_BITS = 10;
const COUNT_MASK = (1 << COUNT_BITS) - 1;

// Shared counter so the recursion doesn't need a closure or an extra return value
let matchingNodeCount = 0;

/**
 * Post-order traversal that returns the subtree sum and node count packed into one integer.
 * Max sum is 1000 * 1000 = 1e6, and (1e6 << 10) | 1023 stays below 2^30, so the value remains a V8 small integer.
 * @param node - The current non-null tree node.
 * @returns The subtree sum shifted left by COUNT_BITS, bitwise-OR'd with the subtree node count.
 */
function collectSubtree(node: TreeNode): number {
  const nodeValue = node.val;
  let subtreeSum = nodeValue;
  let subtreeCount = 1;

  // Skip the call entirely for null children to save function-call overhead
  if (node.left !== null) {
    const packedLeft = collectSubtree(node.left);
    subtreeSum += packedLeft >> COUNT_BITS;
    subtreeCount += packedLeft & COUNT_MASK;
  }

  if (node.right !== null) {
    const packedRight = collectSubtree(node.right);
    subtreeSum += packedRight >> COUNT_BITS;
    subtreeCount += packedRight & COUNT_MASK;
  }

  // floor(sum / count) === value  <=>  0 <= sum - value * count < count (integer-only check, no division)
  const remainder = subtreeSum - nodeValue * subtreeCount;
  if (remainder >= 0 && remainder < subtreeCount) {
    matchingNodeCount++;
  }

  return (subtreeSum << COUNT_BITS) | subtreeCount;
}

/**
 * Counts nodes whose value equals the floored average of their subtree.
 * @param root - The root of the binary tree.
 * @returns The number of nodes matching their subtree average.
 */
function averageOfSubtree(root: TreeNode | null): number {
  if (root === null) {
    return 0;
  }

  // Reset the shared counter for each independent invocation
  matchingNodeCount = 0;
  collectSubtree(root);

  return matchingNodeCount;
}
