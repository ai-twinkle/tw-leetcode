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

function subtreeWithAllDeepest(root: TreeNode | null): TreeNode | null {
  /**
   * Performs a post-order traversal to compute:
   * 1. Maximum depth of the subtree
   * 2. The smallest subtree containing all the deepest nodes
   *
   * @param node Current tree node
   * @param depth Current depth from root
   * @returns Tuple of [maximum depth, subtree root]
   */
  function traverse(
    node: TreeNode | null,
    depth: number
  ): [number, TreeNode | null] {
    if (node === null) {
      return [depth - 1, null];
    }

    const leftResult = traverse(node.left, depth + 1);
    const rightResult = traverse(node.right, depth + 1);

    const leftDepth = leftResult[0];
    const rightDepth = rightResult[0];

    // If both sides have the same maximum depth, the current node is the answer
    if (leftDepth === rightDepth) {
      return [leftDepth, node];
    }

    // Otherwise, propagate the deeper subtree result
    if (leftDepth > rightDepth) {
      return leftResult;
    }

    return rightResult;
  }

  return traverse(root, 0)[1];
}
