function recoverFromPreorder(traversal: string): TreeNode | null {
  let i = 0;
  const n = traversal.length;

  function parseNode(expectedDepth: number): TreeNode | null {
    let start = i;
    // Count dashes to determine the current depth.
    let depth = 0;
    while (i < n && traversal[i] === '-') {
      depth++;
      i++;
    }
    // If the depth doesn’t match, this node isn’t part of the current subtree.
    if (depth !== expectedDepth) {
      // backtrack: reset i to start
      i = start;
      return null;
    }

    // Parse the numeric value.
    let num = 0;
    while (i < n && traversal[i] >= '0' && traversal[i] <= '9') {
      // The subtraction by 48 is the same as charCodeAt(0).
      num = num * 10 + (traversal[i].charCodeAt(0) - 48);
      i++;
    }

    // Create the current node.
    const node = new TreeNode(num);

    // Recursively parse the left and right subtrees.
    node.left = parseNode(expectedDepth + 1);
    node.right = parseNode(expectedDepth + 1);

    return node;
  }

  return parseNode(0);
}
