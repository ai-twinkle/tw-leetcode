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


function isBalanced(root: TreeNode | null): boolean {
  /**
   * Returns subtree height if balanced; otherwise returns -1.
   * @param node Current tree node.
   */
  function computeHeight(node: TreeNode | null): number {
    if (node === null) {
      return 0;
    }

    const leftHeight = computeHeight(node.left);
    if (leftHeight === -1) {
      return -1;
    }

    const rightHeight = computeHeight(node.right);
    if (rightHeight === -1) {
      return -1;
    }

    // Inline absolute difference to avoid Math.abs call overhead
    const heightDifference = leftHeight - rightHeight;
    if (heightDifference > 1 || heightDifference < -1) {
      return -1;
    }

    // Return current subtree height
    return (leftHeight > rightHeight ? leftHeight : rightHeight) + 1;
  }

  return computeHeight(root) !== -1;
}
