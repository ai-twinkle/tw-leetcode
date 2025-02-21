class FindElements {
  /**
   * A set to store the recovered values.
   * @private
   */
  private readonly recoveredSet: Set<number>;

  /**
   * Recovers the binary tree from the root node.
   * @param root {TreeNode | null} The root node of the binary tree.
   */
  constructor(root: TreeNode | null) {
    this.recoveredSet = new Set();
    // Start recovering the tree from the root node.
    this.recover(root, 0);
  }

  /**
   * Recovers the binary tree from the given node.
   * @param node {TreeNode | null} The node to recover.
   * @param val {number} The value to recover the node with.
   */
  private recover(node: TreeNode | null, val: number): void {
    if (!node) {
      // If the node is null, we don't need to recover it.
      return;
    }

    // Recover the node.
    node.val = val;

    // Add the recovered value to the set for later searching.
    this.recoveredSet.add(val);

    // Recover the left and right child nodes.
    this.recover(node.left, 2 * val + 1);
    this.recover(node.right, 2 * val + 2);
  }

  /**
   * Finds if the target value is in the binary tree.
   * @param target {number} The target value to find.
   * @returns {boolean} True if the target value is in the binary tree.
   */
  find(target: number): boolean {
    // Check if the target value is in the recovered set.
    // This indicates that the target value is in the tree.
    return this.recoveredSet.has(target);
  }
}

/**
 * Your FindElements object will be instantiated and called as such:
 * var obj = new FindElements(root)
 * var param_1 = obj.find(target)
 */
