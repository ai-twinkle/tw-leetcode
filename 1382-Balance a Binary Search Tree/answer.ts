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

function balanceBST(root: TreeNode | null): TreeNode | null {
  const nodes: TreeNode[] = [];

  // Iterative inorder traversal (faster than recursion in TS/JS, and avoids deep recursion up to 1e4).
  const stack: TreeNode[] = [];
  let current = root;

  while (current !== null || stack.length !== 0) {
    while (current !== null) {
      stack.push(current);
      current = current.left;
    }

    const node = stack.pop()!;
    nodes.push(node);
    current = node.right;
  }

  /**
   * Builds a balanced BST from the sorted node list (reuses nodes in-place).
   *
   * @param leftIndex - Inclusive left bound
   * @param rightIndex - Inclusive right bound
   * @return Root of the balanced subtree
   */
  function build(leftIndex: number, rightIndex: number): TreeNode | null {
    if (leftIndex > rightIndex) {
      return null;
    }

    const middleIndex = (leftIndex + rightIndex) >> 1;
    const middleNode = nodes[middleIndex];

    // Important: overwrite pointers to detach any old shape and form the new balanced structure.
    middleNode.left = build(leftIndex, middleIndex - 1);
    middleNode.right = build(middleIndex + 1, rightIndex);

    return middleNode;
  }

  return build(0, nodes.length - 1);
}
