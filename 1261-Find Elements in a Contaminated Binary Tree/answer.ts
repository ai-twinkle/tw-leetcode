class FindElements {
  private readonly recoveredSet: Set<number>;

  constructor(root: TreeNode | null) {
    this.recoveredSet = new Set();
    this.recover(root, 0);
  }

  private recover(node: TreeNode | null, val: number): void {
    if (!node) return;
    node.val = val;
    this.recoveredSet.add(val);
    this.recover(node.left, 2 * val + 1);
    this.recover(node.right, 2 * val + 2);
  }

  find(target: number): boolean {
    return this.recoveredSet.has(target);
  }
}

/**
 * Your FindElements object will be instantiated and called as such:
 * var obj = new FindElements(root)
 * var param_1 = obj.find(target)
 */
