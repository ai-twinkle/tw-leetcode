/**
 * Returns the lowest common ancestor (LCA) of the deepest leaves in a binary tree.
 *
 * A node is considered a leaf if and only if it has no children. The root has depth 0,
 * and each level down increases the depth by 1. The LCA of a set of nodes is the node with
 * the greatest depth that is an ancestor of all nodes in the set.
 *
 * @param root {TreeNode | null} - The root of the binary tree.
 * @returns {TreeNode | null} The lowest common ancestor of the deepest leaves, or null if the tree is empty.
 */
function lcaDeepestLeaves(root: TreeNode | null): TreeNode | null {
  let maxDepth = 0;
  let lca: TreeNode | null = null;

  /**
   * Performs a depth-first search (DFS) on the binary tree.
   * This function returns the maximum depth reached in the subtree rooted at the given node.
   * When both left and right subtrees have the same maximum depth, the current node becomes
   * a candidate for the lowest common ancestor of the deepest leaves.
   *
   * @param node {TreeNode | null} - The current node in the DFS.
   * @param depth {number} - The current depth of the node.
   * @returns {number} The maximum depth reached in the subtree rooted at this node.
   */
  function dfs(node: TreeNode | null, depth: number): number {
    if (!node) {
      return depth;
    }

    const leftDepth = dfs(node.left, depth + 1);
    const rightDepth = dfs(node.right, depth + 1);
    const currentMax = Math.max(leftDepth, rightDepth);

    // If both subtrees reach the same depth and that depth is at least the maximum seen so far,
    // update the global maxDepth and mark the current node as the LCA.
    if (leftDepth === rightDepth && currentMax >= maxDepth) {
      maxDepth = currentMax;
      lca = node;
    }

    return currentMax;
  }

  dfs(root, 0);
  return lca;
}
